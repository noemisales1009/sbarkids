
import React, { useState, useEffect } from 'react';
import { CurrentPage } from '../App';
import BottomNavBar from '../components/patients/BottomNavBar';
import DesktopLayout from '../components/layout/DesktopLayout';
import { Patient } from '../components/patients/PatientCard';
import { supabase } from '../lib/supabase';
import { historyService } from '../services/historyService';
import { alertasService, Alerta } from '../services/alertasService';

interface GlobalReportItem {
    id: string;
    patient: Patient;
    datetime: string;
    status: string;
    author: string;
    assessment: {
        morning: string;
        afternoon: string;
        night: string;
    };
    recommendation: {
        morning: string;
        afternoon: string;
        night: string;
    };
}

interface ReportsPageProps {
    onNavigate: (page: CurrentPage) => void;
    currentPage: CurrentPage;
    onSelectReportContext?: (patient: Patient, report: any) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate, currentPage, onSelectReportContext }) => {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
    const [reports, setReports] = useState<GlobalReportItem[]>([]);
    const [alertasPorPaciente, setAlertasPorPaciente] = useState<Record<string, Alerta[]>>({});
    const [loading, setLoading] = useState(true);
    const [lastFetch, setLastFetch] = useState<number>(0);
    
    // Cache de 2 minutos para relatórios
    const CACHE_TIME = 120000;

    useEffect(() => {
        const now = Date.now();
        // Só carregar se não tem cache ou cache expirou
        if (reports.length === 0 || (now - lastFetch) > CACHE_TIME) {
            loadReports();
        } else {
            setLoading(false);
        }
    }, []);

    const loadReports = async () => {
        try {
            setLoading(true);
            setLastFetch(Date.now());
            
            console.log('📊 Buscando relatórios de clinical_rounds_simple...');
            
            // Buscar de clinical_rounds_simple
            const { data: roundsData, error } = await supabase
                .from('clinical_rounds_simple')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100); // Limitar a 100 registros mais recentes

            if (error) {
                console.error('❌ Erro ao buscar relatórios:', error);
                throw error;
            }

            if (!roundsData || roundsData.length === 0) {
                console.log('ℹ️ Nenhum relatório encontrado');
                setReports([]);
                setLoading(false);
                return;
            }

            console.log(`📊 ${roundsData.length} relatórios encontrados`);

            // Buscar dados dos pacientes
            const patientIds = [...new Set(roundsData.map(r => r.patient_id))];
            const { data: patientsData } = await supabase
                .from('patients')
                .select('*')
                .in('id', patientIds);

            const patientMap = new Map(patientsData?.map(p => [p.id, p]) || []);

            // Mapear os dados de clinical_rounds_simple para GlobalReportItem
            const allReports: GlobalReportItem[] = roundsData
                .map((round: any) => {
                    const patient = patientMap.get(round.patient_id);
                    if (!patient) return null;

                    // Formatar data
                    const date = new Date(round.created_at);
                    const datetime = date.toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    // Determinar autor (qualquer um que tenha preenchido)
                    const author = round.assessment_morning_saved_by_name || 
                                 round.assessment_afternoon_saved_by_name || 
                                 round.assessment_night_saved_by_name ||
                                 round.recommendation_morning_saved_by_name || 
                                 round.recommendation_afternoon_saved_by_name || 
                                 round.recommendation_night_saved_by_name || 
                                 'Não informado';

                    return {
                        id: round.id,
                        patient: patient as Patient,
                        datetime,
                        status: patient.status || 'estavel',
                        author,
                        assessment: {
                            morning: round.assessment_morning || '',
                            afternoon: round.assessment_afternoon || '',
                            night: round.assessment_night || ''
                        },
                        recommendation: {
                            morning: round.recommendation_morning || '',
                            afternoon: round.recommendation_afternoon || '',
                            night: round.recommendation_night || ''
                        }
                    };
                })
                .filter((item): item is GlobalReportItem => item !== null);

            console.log(`📊 ${allReports.length} relatórios processados`);
            setReports(allReports);

            // Buscar alertas para cada paciente
            const alertasMap: Record<string, Alerta[]> = {};
            for (const report of allReports) {
                try {
                    const alertas = await alertasService.getAlertas(report.patient.id);
                    alertasMap[report.patient.id] = alertas;
                } catch (error) {
                    console.error(`Erro ao buscar alertas para paciente ${report.patient.id}:`, error);
                    alertasMap[report.patient.id] = [];
                }
            }
            setAlertasPorPaciente(alertasMap);
            
            setLoading(false);
        } catch (error) {
            console.error('❌ Erro ao carregar relatórios:', error);
            setReports([]);
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(item => {
        // Converter status para lowercase para comparação correta
        const itemStatus = typeof item.status === 'string' ? item.status.toLowerCase() : '';
        const filterStatus = statusFilter.toLowerCase();
        const matchesStatus = filterStatus ? itemStatus === filterStatus : true;
        
        // Extrair apenas a data (DD/MM/YYYY) do datetime para comparação
        // datetime vem como "02/02/2026, 10:52" então pega tudo antes da vírgula
        const itemDate = item.datetime.split(',')[0].trim();
        const filterDate = dateFilter ? dateFilter.split('-').reverse().join('/') : '';
        const matchesDate = filterDate ? itemDate === filterDate : true;
        
        return matchesStatus && matchesDate;
    });

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedReports);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedReports(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedReports.size === filteredReports.length) {
            setSelectedReports(new Set());
        } else {
            setSelectedReports(new Set(filteredReports.map(r => r.id)));
        }
    };

    const handlePrint = () => {
        if (selectedReports.size === 0) {
            alert("Selecione pelo menos um relatório para imprimir.");
            return;
        }
        window.print();
    };

    const calculateAge = (dob: string): number => {
        const [day, month, year] = dob.split('/').map(Number);
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Componente interno para exibir o conteúdo detalhado APENAS na impressão
    const PrintableContent = () => (
        <div className="print-only font-serif">
            {filteredReports
                .filter(item => selectedReports.has(item.id))
                .map((item, index) => (
                <div key={item.id} className="print-page-break flex flex-col h-full relative p-2">
                    
                    {/* Cabeçalho Institucional */}
                    <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="size-16 bg-gray-200 flex items-center justify-center rounded-full border border-gray-400">
                                <span className="material-symbols-outlined text-4xl text-gray-600">local_hospital</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold uppercase tracking-wide">Hospital Infantil Dr. Juvêncio Mattos</h1>
                                <p className="text-sm text-gray-600">Rua São Pantaleão S/N - Centro | São Luís - MA</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-gray-800">RELATÓRIO SBAR</h2>
                            <p className="text-sm font-medium">Sistema SBAR KIDS</p>
                        </div>
                    </div>

                    {/* Identificação do Paciente */}
                    <div className="print-border rounded p-4 mb-6 bg-gray-50">
                        <h3 className="text-sm uppercase font-bold text-gray-500 mb-2 border-b border-gray-300 pb-1">Identificação do Paciente</h3>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <div className="col-span-1"><span className="font-semibold">Nome:</span> {item.patient.name}</div>
                            <div className="col-span-1"><span className="font-semibold">Leito:</span> <span className="text-lg font-bold">{item.patient.bed_number}</span></div>
                            <div className="col-span-1"><span className="font-semibold">Data Nasc.:</span> {item.patient.dob}</div>
                            {item.patient.mother_name && <div className="col-span-1"><span className="font-semibold">Nome da Mãe:</span> {item.patient.mother_name}</div>}
                            <div className="col-span-2 mt-1"><span className="font-semibold">Status:</span> {item.status}</div>
                        </div>
                    </div>

                    {/* Detalhes do Relatório */}
                    <div className="mb-4 text-sm flex justify-between bg-gray-100 p-2 rounded print-border">
                        <span><strong>Data:</strong> {item.datetime}</span>
                        <span><strong>Médico:</strong> {item.author}</span>
                    </div>

                    {/* Conteúdo SBAR - Organizado por Turnos */}
                    <div className="grow space-y-4">
                        {/* MANHÃ */}
                        {(item.assessment.morning || item.recommendation.morning) && (
                            <div className="print-border rounded p-4">
                                <div className="flex items-center gap-2 mb-3 border-b-2 border-orange-400 pb-2">
                                    <span className="text-2xl">🌅</span>
                                    <strong className="text-lg uppercase text-orange-600">MANHÃ</strong>
                                </div>
                                
                                {item.assessment.morning && (
                                    <div className="mb-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold bg-gray-200 px-2 py-1 rounded">A</span>
                                            <span className="font-semibold text-sm">ASSESSMENT (Avaliação)</span>
                                        </div>
                                        <p className="text-sm pl-8 text-justify leading-relaxed">{item.assessment.morning}</p>
                                    </div>
                                )}
                                
                                {item.recommendation.morning && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold bg-gray-200 px-2 py-1 rounded">R</span>
                                            <span className="font-semibold text-sm">RECOMENDAÇÃO / PLANO</span>
                                        </div>
                                        <p className="text-sm pl-8 text-justify leading-relaxed">{item.recommendation.morning}</p>
                                    </div>
                                )}

                                {/* Alertas da Manhã */}
                                {alertasPorPaciente[item.patient.id]?.filter((a: any) => a.shift_criacao === 'morning').length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-gray-300">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold bg-red-100 px-2 py-1 rounded text-red-700">⚠</span>
                                            <span className="font-semibold text-sm text-red-700">ALERTAS CLÍNICOS</span>
                                        </div>
                                        {alertasPorPaciente[item.patient.id]?.filter((a: any) => a.shift_criacao === 'morning').map((alert: any) => (
                                            <div key={alert.id_alerta} className="text-xs mb-2 border-l-2 border-red-300 pl-3">
                                                <p className="font-semibold">{alert.alertaclinico}</p>
                                                <p className="text-gray-600">Responsável: {alert.responsavel}</p>
                                                <p className="text-gray-600">Status: {alert.status}</p>
                                                {alert.justificativa && <p className="italic text-gray-600">Justificativa: {alert.justificativa}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TARDE */}
                        {(item.assessment.afternoon || item.recommendation.afternoon) && (
                            <div className="print-border rounded p-4">
                                <div className="flex items-center gap-2 mb-3 border-b-2 border-yellow-400 pb-2">
                                    <span className="text-2xl">☀️</span>
                                    <strong className="text-lg uppercase text-yellow-600">TARDE</strong>
                                </div>
                                
                                {item.assessment.afternoon && (
                                    <div className="mb-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold bg-gray-200 px-2 py-1 rounded">A</span>
                                            <span className="font-semibold text-sm">ASSESSMENT (Avaliação)</span>
                                        </div>
                                        <p className="text-sm pl-8 text-justify leading-relaxed">{item.assessment.afternoon}</p>
                                    </div>
                                )}
                                
                                {item.recommendation.afternoon && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold bg-gray-200 px-2 py-1 rounded">R</span>
                                            <span className="font-semibold text-sm">RECOMENDAÇÃO / PLANO</span>
                                        </div>
                                        <p className="text-sm pl-8 text-justify leading-relaxed">{item.recommendation.afternoon}</p>
                                    </div>
                                )}

                                {/* Alertas da Tarde */}
                                {alertasPorPaciente[item.patient.id]?.filter((a: any) => a.shift_criacao === 'afternoon').length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-gray-300">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold bg-red-100 px-2 py-1 rounded text-red-700">⚠</span>
                                            <span className="font-semibold text-sm text-red-700">ALERTAS CLÍNICOS</span>
                                        </div>
                                        {alertasPorPaciente[item.patient.id]?.filter((a: any) => a.shift_criacao === 'afternoon').map((alert: any) => (
                                            <div key={alert.id_alerta} className="text-xs mb-2 border-l-2 border-red-300 pl-3">
                                                <p className="font-semibold">{alert.alertaclinico}</p>
                                                <p className="text-gray-600">Responsável: {alert.responsavel}</p>
                                                <p className="text-gray-600">Status: {alert.status}</p>
                                                {alert.justificativa && <p className="italic text-gray-600">Justificativa: {alert.justificativa}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* NOITE */}
                        {(item.assessment.night || item.recommendation.night) && (
                            <div className="print-border rounded p-4">
                                <div className="flex items-center gap-2 mb-3 border-b-2 border-blue-400 pb-2">
                                    <span className="text-2xl">🌙</span>
                                    <strong className="text-lg uppercase text-blue-600">NOITE</strong>
                                </div>
                                
                                {item.assessment.night && (
                                    <div className="mb-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold bg-gray-200 px-2 py-1 rounded">A</span>
                                            <span className="font-semibold text-sm">ASSESSMENT (Avaliação)</span>
                                        </div>
                                        <p className="text-sm pl-8 text-justify leading-relaxed">{item.assessment.night}</p>
                                    </div>
                                )}
                                
                                {item.recommendation.night && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold bg-gray-200 px-2 py-1 rounded">R</span>
                                            <span className="font-semibold text-sm">RECOMENDAÇÃO / PLANO</span>
                                        </div>
                                        <p className="text-sm pl-8 text-justify leading-relaxed">{item.recommendation.night}</p>
                                    </div>
                                )}

                                {/* Alertas da Noite */}
                                {alertasPorPaciente[item.patient.id]?.filter((a: any) => a.shift_criacao === 'night').length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-gray-300">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold bg-red-100 px-2 py-1 rounded text-red-700">⚠</span>
                                            <span className="font-semibold text-sm text-red-700">ALERTAS CLÍNICOS</span>
                                        </div>
                                        {alertasPorPaciente[item.patient.id]?.filter((a: any) => a.shift_criacao === 'night').map((alert: any) => (
                                            <div key={alert.id_alerta} className="text-xs mb-2 border-l-2 border-red-300 pl-3">
                                                <p className="font-semibold">{alert.alertaclinico}</p>
                                                <p className="text-gray-600">Responsável: {alert.responsavel}</p>
                                                <p className="text-gray-600">Status: {alert.status}</p>
                                                {alert.justificativa && <p className="italic text-gray-600">Justificativa: {alert.justificativa}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {!item.assessment.morning && !item.assessment.afternoon && !item.assessment.night && 
                         !item.recommendation.morning && !item.recommendation.afternoon && !item.recommendation.night && (
                            <div className="text-center py-6 text-gray-500 italic">
                                Nenhum registro de avaliação ou recomendação encontrado
                            </div>
                        )}
                    </div>

                    {/* Assinatura */}
                    <div className="mt-12 mb-4 pt-10">
                        <div className="grid grid-cols-2 gap-10">
                            <div className="text-center">
                                <div className="border-t border-black w-3/4 mx-auto mb-2"></div>
                                <p className="font-bold text-sm">{item.author}</p>
                                <p className="text-xs">Médico Responsável</p>
                            </div>
                             <div className="text-center">
                                <div className="border-t border-black w-3/4 mx-auto mb-2"></div>
                                <p className="font-bold text-sm">Carimbo / CRM / COREN</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-[10px] text-gray-400 border-t pt-2">
                        Impresso em {new Date().toLocaleString()} - Sistema SBAR KIDS - Página 1/1
                    </div>
                </div>
            ))}
        </div>
    );

    const ReportsContent = () => (
        <div className="flex flex-col gap-4 screen-only">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Filtrar por Status</label>
                    <select 
                        className="w-full h-11 rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Todos os Status</option>
                        <option value="estavel">Estável</option>
                        <option value="instavel">Instável</option>
                        <option value="em_risco">Em risco</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Filtrar por Data</label>
                    <input 
                        type="date" 
                        className="w-full h-11 rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* Selection Header */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        checked={selectedReports.size === filteredReports.length && filteredReports.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-primary focus:ring-primary size-5"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {selectedReports.size} selecionado(s)
                    </span>
                </div>
                <button 
                    onClick={handlePrint}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow transition-colors ${
                        selectedReports.size > 0 
                        ? 'bg-primary text-white hover:bg-primary/90' 
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                >
                    <span className="material-symbols-outlined text-lg">print</span>
                    Imprimir Seleção
                </button>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3">
                {loading ? (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Carregando relatórios...</p>
                    </div>
                ) : filteredReports.length > 0 ? (
                    filteredReports.map((item) => (
                        <div 
                            key={item.id}
                            className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow"
                        >
                            <input 
                                type="checkbox" 
                                checked={selectedReports.has(item.id)}
                                onChange={() => toggleSelect(item.id)}
                                className="rounded border-gray-300 text-primary focus:ring-primary size-5 mt-1"
                            />
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{item.patient.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Leito: {item.patient.bed_number} | Status: {item.status}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        item.status === 'Urgente' ? 'bg-yellow-100 text-yellow-800' :
                                        item.status === 'Atenção' ? 'bg-red-100 text-red-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {item.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    {item.datetime} | Médico: {item.author}
                                </p>
                                <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                                    {(item.assessment.morning || item.assessment.afternoon || item.assessment.night) && (
                                        <p className="mb-1"><span className="font-semibold">Avaliação:</span> Registros em {[
                                            item.assessment.morning && 'manhã',
                                            item.assessment.afternoon && 'tarde',
                                            item.assessment.night && 'noite'
                                        ].filter(Boolean).join(', ')}</p>
                                    )}
                                    {(item.recommendation.morning || item.recommendation.afternoon || item.recommendation.night) && (
                                        <p><span className="font-semibold">Recomendação:</span> Registros em {[
                                            item.recommendation.morning && 'manhã',
                                            item.recommendation.afternoon && 'tarde',
                                            item.recommendation.night && 'noite'
                                        ].filter(Boolean).join(', ')}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2">filter_list_off</span>
                        <p>Nenhum relatório encontrado com os filtros selecionados.</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            <PrintableContent />

            {/* Mobile View */}
            <div className="w-full overflow-x-hidden sm:hidden bg-background-light dark:bg-background-dark min-h-screen screen-only">
                <header className="sticky top-0 z-10 flex items-center justify-between bg-background-light/80 p-4 pb-3 backdrop-blur-sm dark:bg-background-dark/80 border-b border-gray-200 dark:border-gray-800">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Todos os Relatórios</h1>
                    <div className="size-8"></div> {/* Spacer */}
                </header>
                
                <main className="grow px-4 pt-4 pb-28">
                    <ReportsContent />
                </main>
                <BottomNavBar onNavigate={onNavigate} currentPage={currentPage} />
            </div>

            {/* Desktop View */}
            <div className="screen-only w-full">
                <DesktopLayout currentPage={currentPage} onNavigate={onNavigate}>
                    <div className="screen-only">
                        <header className="pb-5 border-b border-slate-200 dark:border-slate-800 mb-6">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Relatórios Gerais</h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">Visualize, selecione e imprima os SBARs de todos os pacientes.</p>
                        </header>
                        <ReportsContent />
                    </div>
                </DesktopLayout>
            </div>
        </>
    );
};

export default ReportsPage;
