
import React, { useState } from 'react';
import { CurrentPage } from '../App';
import BottomNavBar from '../components/patients/BottomNavBar';
import DesktopLayout from '../components/layout/DesktopLayout';
import HistoryItem, { HistoryItemData } from '../components/history/HistoryItem';
import { Patient } from '../components/patients/PatientCard';

// Dados Mockados Globais
interface GlobalReportItem {
    patient: Patient;
    report: HistoryItemData;
    id: string; // Identificador único para seleção
}

const mockGlobalReports: GlobalReportItem[] = [
    {
        id: '1',
        patient: {
            name: 'Juliana Silva',
            id: '785412-D',
            status: 'Crítico',
            dob: '05/10/2021',
            bed: 'Leito 102',
            motherName: 'Maria Silva',
            evolution: 'Paciente em D3 de tratamento para pneumonia bacteriana grave.'
        },
        report: {
            datetime: '25/07/2024 - 08:15',
            status: 'Urgente',
            description: 'Piora no padrão respiratório e queda de saturação para 88% em ar ambiente.',
            author: 'Dr. Carlos Andrade',
            patientName: 'Juliana Silva',
            sbar: {
                situation: 'Paciente com piora súbita no padrão respiratório, apresentando dispneia intensa e uso de musculatura acessória.',
                background: 'Paciente asmático, internado por pneumonia comunitária há 3 dias. Sem histórico de intubação prévia.',
                assessment: { morning: 'Saturação caiu para 88% em ar ambiente, frequência respiratória de 28 irpm. Ausculta pulmonar com sibilos difusos.', afternoon: '', night: '' },
                recommendation: { morning: 'Administrar oxigênio suplementar para manter SatO2 > 92%, iniciar broncodilatador de curta ação e contatar fisioterapia respiratória.', afternoon: '', night: '' }
            }
        }
    },
    {
        id: '2',
        patient: {
            name: 'Juliana Silva',
            id: '785412-D',
            status: 'Crítico',
            dob: '05/10/2021',
            bed: 'Leito 102',
            motherName: 'Maria Silva',
            evolution: 'Paciente em D3 de tratamento para pneumonia.'
        },
        report: {
            datetime: '24/07/2024 - 19:30',
            status: 'Atenção',
            description: 'Paciente apresentou febre de 38.5°C.',
            author: 'Enf. Juliana Oliveira',
            patientName: 'Juliana Silva',
            sbar: {
                situation: 'Pico febril de 38.5°C aferido às 19:15. Paciente refere calafrios e cefaleia.',
                background: 'Em antibioticoterapia para pneumonia. Última dose administrada há 6 horas.',
                assessment: { morning: '', afternoon: 'Paciente consciente, orientado, hidratado. Hemodinamicamente estável, apesar da febre.', night: '' },
                recommendation: { morning: '', afternoon: 'Administrado antitérmico prescrito. Coletar nova cultura de sangue se a febre persistir.', night: '' }
            }
        }
    },
    {
        id: '3',
        patient: {
            name: 'Gabriel F. Martins',
            id: '554387-C',
            status: 'Estável',
            dob: '15/03/1989',
            bed: 'Leito 205',
            motherName: 'Ana Martins',
            evolution: 'Pós-operatório de apendicectomia.'
        },
        report: {
            datetime: '23/07/2024 - 10:05',
            status: 'Informativo',
            description: 'Admissão na unidade vindo do centro cirúrgico. Estável.',
            author: 'Enf. Ricardo Souza',
            patientName: 'Gabriel F. Martins',
            sbar: {
                situation: 'Paciente admitido na unidade de internação, vindo do centro cirúrgico após apendicectomia.',
                background: 'Sem comorbidades prévias. Procedimento cirúrgico ocorreu sem intercorrências.',
                assessment: { morning: 'Consciente, orientado, estável hemodinamicamente. Saturação 98% com cateter nasal 2L/min.', afternoon: '', night: '' },
                recommendation: { morning: 'Administrar analgesia prescrita se necessário. Manter monitoramento de sinais vitais.', afternoon: '', night: '' }
            }
        }
    },
    {
        id: '4',
        patient: {
            name: 'Beatriz Costa',
            id: '671234-A',
            status: 'Observação',
            dob: '22/08/1967',
            bed: 'Leito 310',
            motherName: 'Cláudia Costa',
            evolution: 'Investigação de síncope.'
        },
        report: {
            datetime: '22/07/2024 - 14:00',
            status: 'Normal',
            description: 'Aguardando exames cardiológicos.',
            author: 'Dra. Ana Paula',
            patientName: 'Beatriz Costa',
            sbar: {
                situation: 'Paciente aguardando realização de Holter e Ecocardiograma para investigação de síncope.',
                background: 'Hipertensa em uso regular de losartana.',
                assessment: { morning: '', afternoon: 'Assintomática no momento. PA 130/80mmHg.', night: '' },
                recommendation: { morning: '', afternoon: 'Manter monitorização e aguardar exames agendados para amanhã.', night: '' }
            }
        }
    }
];

interface ReportsPageProps {
    onNavigate: (page: CurrentPage) => void;
    currentPage: CurrentPage;
    onSelectReportContext: (patient: Patient, report: HistoryItemData) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate, currentPage, onSelectReportContext }) => {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());

    const filteredReports = mockGlobalReports.filter(item => {
        const matchesStatus = statusFilter ? item.report.status === statusFilter : true;
        const matchesDate = dateFilter ? item.report.datetime.includes(dateFilter.split('-').reverse().join('/')) : true;
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
            {mockGlobalReports
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
                                <h1 className="text-2xl font-bold uppercase tracking-wide">Hospital Modelo SBAR</h1>
                                <p className="text-sm text-gray-600">Serviço de Enfermagem e Medicina Hospitalar</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-gray-800">RELATÓRIO DE PASSAGEM DE PLANTÃO</h2>
                            <p className="text-sm font-medium">Método SBAR</p>
                        </div>
                    </div>

                    {/* Identificação do Paciente */}
                    <div className="print-border rounded p-4 mb-6 bg-gray-50">
                        <h3 className="text-sm uppercase font-bold text-gray-500 mb-2 border-b border-gray-300 pb-1">Identificação do Paciente</h3>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <div className="col-span-1"><span className="font-semibold">Nome:</span> {item.patient.name}</div>
                            <div className="col-span-1"><span className="font-semibold">Leito:</span> <span className="text-lg font-bold">{item.patient.bed}</span></div>
                            <div className="col-span-1"><span className="font-semibold">Data Nasc.:</span> {item.patient.dob} ({calculateAge(item.patient.dob)} anos)</div>
                            <div className="col-span-1"><span className="font-semibold">Nome da Mãe:</span> {item.patient.motherName}</div>
                            <div className="col-span-2 mt-1"><span className="font-semibold">Status Atual:</span> {item.patient.status}</div>
                        </div>
                    </div>

                    {/* Detalhes do Relatório */}
                    <div className="mb-4 text-sm flex justify-between bg-gray-100 p-2 rounded print-border">
                        <span><strong>Data do Relatório:</strong> {item.report.datetime}</span>
                        <span><strong>Autor:</strong> {item.report.author}</span>
                    </div>

                    {/* Conteúdo SBAR */}
                    <div className="flex-grow space-y-4">
                        <div className="print-border rounded p-4">
                            <div className="flex items-center gap-2 mb-2 border-b border-gray-200 pb-1">
                                <span className="font-bold text-lg bg-gray-200 px-2 rounded">S</span>
                                <strong className="text-base uppercase">Situação</strong>
                            </div>
                            <p className="text-justify leading-relaxed">{item.report.sbar.situation}</p>
                        </div>

                        <div className="print-border rounded p-4">
                            <div className="flex items-center gap-2 mb-2 border-b border-gray-200 pb-1">
                                <span className="font-bold text-lg bg-gray-200 px-2 rounded">B</span>
                                <strong className="text-base uppercase">Breve Histórico</strong>
                            </div>
                            <p className="text-justify leading-relaxed">{item.report.sbar.background}</p>
                        </div>

                        <div className="print-border rounded p-4">
                            <div className="flex items-center gap-2 mb-2 border-b border-gray-200 pb-1">
                                <span className="font-bold text-lg bg-gray-200 px-2 rounded">A</span>
                                <strong className="text-base uppercase">Assessment (Avaliação)</strong>
                            </div>
                            <div className="space-y-2">
                                {item.report.sbar.assessment.morning && <div className="text-sm"><span className="font-bold uppercase text-xs w-16 inline-block">Manhã:</span> {item.report.sbar.assessment.morning}</div>}
                                {item.report.sbar.assessment.afternoon && <div className="text-sm"><span className="font-bold uppercase text-xs w-16 inline-block">Tarde:</span> {item.report.sbar.assessment.afternoon}</div>}
                                {item.report.sbar.assessment.night && <div className="text-sm"><span className="font-bold uppercase text-xs w-16 inline-block">Noite:</span> {item.report.sbar.assessment.night}</div>}
                            </div>
                        </div>

                        <div className="print-border rounded p-4">
                            <div className="flex items-center gap-2 mb-2 border-b border-gray-200 pb-1">
                                <span className="font-bold text-lg bg-gray-200 px-2 rounded">R</span>
                                <strong className="text-base uppercase">Recomendação</strong>
                            </div>
                            <div className="space-y-2">
                                {item.report.sbar.recommendation.morning && <div className="text-sm"><span className="font-bold uppercase text-xs w-16 inline-block">Manhã:</span> {item.report.sbar.recommendation.morning}</div>}
                                {item.report.sbar.recommendation.afternoon && <div className="text-sm"><span className="font-bold uppercase text-xs w-16 inline-block">Tarde:</span> {item.report.sbar.recommendation.afternoon}</div>}
                                {item.report.sbar.recommendation.night && <div className="text-sm"><span className="font-bold uppercase text-xs w-16 inline-block">Noite:</span> {item.report.sbar.recommendation.night}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Assinatura */}
                    <div className="mt-12 mb-4 pt-10">
                        <div className="grid grid-cols-2 gap-10">
                            <div className="text-center">
                                <div className="border-t border-black w-3/4 mx-auto mb-2"></div>
                                <p className="font-bold text-sm">{item.report.author}</p>
                                <p className="text-xs">Responsável</p>
                            </div>
                             <div className="text-center">
                                <div className="border-t border-black w-3/4 mx-auto mb-2"></div>
                                <p className="font-bold text-sm">Carimbo / CRM / COREN</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-[10px] text-gray-400 border-t pt-2">
                        Impresso em {new Date().toLocaleString()} - Sistema SBAR Juju - Página 1/1
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
                        <option value="Urgente">Urgente</option>
                        <option value="Atenção">Atenção</option>
                        <option value="Normal">Normal</option>
                        <option value="Informativo">Informativo</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Filtrar por Data</label>
                    <input 
                        type="date" 
                        className="w-full h-11 rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
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
                {filteredReports.length > 0 ? (
                    filteredReports.map((item) => (
                        <HistoryItem 
                            key={item.id} 
                            item={item.report} 
                            onSelectReport={(report) => onSelectReportContext(item.patient, report)} 
                            selectable={true}
                            selected={selectedReports.has(item.id)}
                            onToggleSelect={() => toggleSelect(item.id)}
                        />
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
                
                <main className="flex-grow px-4 pt-4 pb-28">
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
