
import React, { useState, useEffect } from 'react';
import { CurrentPage } from '../App';
import BottomNavBar from '../components/patients/BottomNavBar';
import DesktopLayout from '../components/layout/DesktopLayout';
import { Patient } from '../components/patients/PatientCard';
import { supabase } from '../lib/supabase';
import { historyService } from '../services/historyService';

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
    const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
    const [reports, setReports] = useState<GlobalReportItem[]>([]);
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
            
            // Buscar direto da VIEW patient_reports_view com limite e filtro de data
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            
            const { data: viewData, error } = await supabase
                .from('patient_reports_view')
                .select('*')
                .gte('report_date', threeDaysAgo.toISOString().split('T')[0])
                .order('report_date', { ascending: false })
                .limit(100); // Limitar a 100 registros mais recentes

            if (error) throw error;
            if (!viewData || viewData.length === 0) {
                setReports([]);
                setLoading(false);
                return;
            }

            // Mapear os dados da VIEW para o formato GlobalReportItem
            const allReports: GlobalReportItem[] = viewData.map((row: any) => {
                // Determinar autor (priorizar o mais recente)
                const author = row.recommendation_night_author || 
                             row.recommendation_afternoon_author || 
                             row.recommendation_morning_author ||
                             row.assessment_night_author || 
                             row.assessment_afternoon_author || 
                             row.assessment_morning_author || 
                             'Não informado';

                // Formatar data
                const date = new Date(row.report_date);
                const datetime = date.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                // Formatar recommendation (concatenar campos do JSONB)
                const formatRecommendation = (data: any): string => {
                    if (!data) return '';
                    const parts = [];
                    if (data.respiratorio) parts.push(`Respiratório: ${data.respiratorio}`);
                    if (data.hemodinamico) parts.push(`Hemodinâmico: ${data.hemodinamico}`);
                    if (data.neurologico) parts.push(`Neurológico: ${data.neurologico}`);
                    if (data.metabolico_renal) parts.push(`Metabólico/Renal: ${data.metabolico_renal}`);
                    if (data.pendencias) parts.push(`Pendências: ${data.pendencias}`);
                    return parts.join('\n');
                };

                return {
                    id: `${row.patient_id}-${row.round_id}`,
                    patient: {
                        id: row.patient_id,
                        name: row.patient_name,
                        bed_number: row.bed_number,
                        dob: row.dob,
                        mother_name: row.mother_name,
                        status: row.patient_status || 'estavel'
                    },
                    datetime,
                    status: mapStatusToDisplay(row.patient_status || 'estavel'),
                    author,
                    assessment: {
                        morning: row.assessment_morning || '',
                        afternoon: row.assessment_afternoon || '',
                        night: row.assessment_night || ''
                    },
                    recommendation: {
                        morning: formatRecommendation(row.recommendation_morning),
                        afternoon: formatRecommendation(row.recommendation_afternoon),
                        night: formatRecommendation(row.recommendation_night)
                    }
                };
            });

            setReports(allReports);
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
        } finally {
            setLoading(false);
        }
    };

    const mapStatusToDisplay = (status: string): string => {
        const statusMap: Record<string, string> = {
            'estavel': 'Normal',
            'instavel': 'Urgente',
            'em_risco': 'Atenção'
        };
        return statusMap[status] || 'Normal';
    };

    const filteredReports = reports.filter(item => {
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        const matchesDate = dateFilter ? item.datetime.includes(dateFilter.split('-').reverse().join('/')) : true;
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
                        <option value="Normal">Estável</option>
                        <option value="Urgente">Instável</option>
                        <option value="Atenção">Em risco</option>
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
