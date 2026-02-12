
import React, { useState, useEffect, useMemo } from 'react';
import { Patient } from '../components/patients/PatientCard';
import HistoryHeader from '../components/history/HistoryHeader';
import BottomNavBar from '../components/patients/BottomNavBar';
import { CurrentPage } from '../App';
import DesktopLayout from '../components/layout/DesktopLayout';
import DesktopHistoryHeader from '../components/history/DesktopHistoryHeader';
import { HistoryItemData } from '../components/history/HistoryItem';
import HistoryFilter from '../components/history/HistoryFilter';
import HistoryTimeline from '../components/history/HistoryTimeline';
import { Alerta, alertasService } from '../services/alertasService';
import { clinicalRoundsSimpleService, ClinicalRoundsSimple } from '../services/clinicalRoundsSimpleService';
import { useUser } from '../contexts/UserContext';

interface HistoryPageProps {
    patient: Patient;
    onBack: () => void;
    onNavigate: (page: CurrentPage) => void;
    currentPage: CurrentPage;
    onSelectReport: (report: HistoryItemData) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ patient, onBack, onNavigate, currentPage, onSelectReport }) => {
    const { user } = useUser();
    const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({});
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [alertas, setAlertas] = useState<Alerta[]>([]);
    const [assessments, setAssessments] = useState<ClinicalRoundsSimple[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                // Carregar alertas
                const alertasData = await alertasService.getAlertas(patient.id);
                setAlertas(alertasData);

                // Carregar todos os assessments salvos
                const assessmentsData = await clinicalRoundsSimpleService.getAll(patient.id);
                setAssessments(assessmentsData);
            } catch (error) {
                console.error("Erro ao buscar histórico:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [patient.id]);

    const handleDateChange = (field: 'start' | 'end', value: string) => {
        if (field === 'start') setStartDate(value);
        else setEndDate(value);
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedCategories({});
    };

    const handleGeneratePDF = () => {
        // Criar HTML para PDF
        const htmlContent = `
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; }
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px 20px 150px 20px; 
                        color: #333; 
                        min-height: 100%;
                        filter: grayscale(100%);
                    }
                    .header { border: 2px solid #333; padding: 15px; margin-bottom: 20px; }
                    .header h2 { margin: 0 0 10px 0; font-size: 16px; }
                    .header-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 10px; }
                    .header-item { font-size: 13px; }
                    .header-label { font-weight: bold; }
                    .header-value { font-weight: normal; }
                    .patient-info { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; font-size: 12px; margin-top: 10px; }
                    .shift-section { border: 2px solid #333; margin-bottom: 5px; padding: 0; page-break-inside: avoid; }
                    .shift-header { 
                        background-color: #f0f0f0; 
                        padding: 10px 15px; 
                        font-weight: bold; 
                        font-size: 14px;
                        border-bottom: 2px solid #333;
                    }
                    .shift-morning { border-left: 5px solid #444; }
                    .shift-afternoon { border-left: 5px solid #666; }
                    .shift-night { border-left: 5px solid #222; }
                    .shift-content { padding: 15px; }
                    .assessment-block { margin-bottom: 15px; }
                    .assessment-title { font-weight: bold; font-size: 12px; margin-bottom: 8px; }
                    .assessment-text { font-size: 12px; line-height: 1.4; margin-bottom: 10px; white-space: pre-wrap; word-wrap: break-word; }
                    .alerts-title { font-weight: bold; font-size: 12px; margin-top: 15px; margin-bottom: 8px; }
                    .alert-item { 
                        border-left: 3px solid #555; 
                        padding-left: 10px; 
                        margin-bottom: 10px; 
                        font-size: 11px;
                        line-height: 1.4;
                        page-break-inside: avoid;
                    }
                    .alert-description { font-weight: bold; }
                    .alert-detail { margin: 3px 0; }
                    .alert-justification { 
                        background-color: #e8e8e8; 
                        padding: 8px; 
                        margin-top: 5px; 
                        border-radius: 3px;
                        font-style: italic;
                        font-size: 10px;
                    }
                    .page-break { page-break-before: always; }
                    @media print {
                        body { margin: 0; padding: 20px; filter: grayscale(100%); }
                        .shift-section { page-break-inside: auto; }
                        .alert-item { page-break-inside: auto; }
                    }
                </style>
            </head>
            <body>
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="font-size: 24px; font-weight: bold; margin: 0; padding: 10px 0;">SBAR KIDS</h1>
                </div>
                <div class="header">
                    <h2>IDENTIFICAÇÃO DO PACIENTE</h2>
                    <div class="patient-info">
                        <div class="header-item"><span class="header-label">Nome:</span> ${patient.name}</div>
                        <div class="header-item"><span class="header-label">Leito:</span> ${patient.bed_number || 'N/A'}</div>
                        <div class="header-item"><span class="header-label">Data Nasc:</span> ${patient.birth_date || 'N/A'}</div>
                        <div class="header-item"><span class="header-label">Nome da Mãe:</span> ${patient.mother_name || 'N/A'}</div>
                    </div>
                    <div style="margin-top: 10px; font-size: 12px; text-align: right;">
                        <strong>Data:</strong> ${new Date().toLocaleString('pt-BR')} | <strong>Médico:</strong> ${user?.name || 'Médico'}
                    </div>
                </div>
                ${generateShiftSections()}
            </body>
            </html>
        `;

        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.print();
            }, 250);
        }
    };

    const generateShiftSections = () => {
        const shifts = ['morning', 'afternoon', 'night'];
        const shiftInfo = {
            morning: { label: 'MANHÃ', hours: '(7:01 - 13:00)', class: 'shift-morning' },
            afternoon: { label: 'TARDE', hours: '(13:01 - 19:00)', class: 'shift-afternoon' },
            night: { label: 'NOITE', hours: '(19:01 - 07:00)', class: 'shift-night' }
        };

        return shifts.map(shift => {
            const info = shiftInfo[shift as keyof typeof shiftInfo];
            const assessment = assessments[0]?.[`assessment_${shift}` as keyof typeof assessments[0]];
            const shiftAlerts = alertas.filter((a: any) => a.shift_criacao === shift);
            const pageBreak = shift === 'night' ? 'page-break-before: always;' : '';

            return `
                <div class="shift-section ${info.class}" style="${pageBreak}">
                    <div class="shift-header">${info.label} ${info.hours}</div>
                    <div class="shift-content">
                        ${assessment ? `
                            <div class="assessment-block">
                                <div class="assessment-title">A - ASSESSMENT (Avaliação)</div>
                                <div class="assessment-text">${assessment}</div>
                            </div>
                        ` : ''}
                        
                        ${shiftAlerts.length > 0 ? `
                            <div class="alerts-title">ALERTAS CLÍNICOS</div>
                            ${shiftAlerts.map((alert: any) => `
                                <div class="alert-item">
                                    <div class="alert-description">${alert.alertaclinico}</div>
                                    <div class="alert-detail">Responsável: ${alert.responsavel}</div>
                                    <div class="alert-detail">Prazo Limite: ${alert.prazo_limite_formatado || 'Sem prazo'}</div>
                                    <div class="alert-detail">Prazo: ${alert.prazo_formatado || 'Sem prazo'}</div>
                                    <div class="alert-detail">Criado em: ${alert.hora_criacao_formatado || 'Não informado'}</div>
                                    <div class="alert-detail">Criado por: ${alert.created_by_name || 'Não informado'}</div>
                                    <div class="alert-detail">Status: ${alert.status || 'Sem status'}</div>
                                    ${alert.justificativa ? `
                                        <div class="alert-justification">
                                            <strong>Justificativa:</strong> ${alert.justificativa}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        ` : '<p style="font-size: 11px; color: #999;">Nenhum alerta neste turno</p>'}
                    </div>
                </div>
            `;
        }).join('');
    };

    const filteredAlerts = useMemo(() => {
        return alertas.filter(alerta => {
            if (startDate) {
                const alertDate = new Date(alerta.created_at).toISOString().split('T')[0];
                if (alertDate < startDate) return false;
            }
            if (endDate) {
                const alertDate = new Date(alerta.created_at).toISOString().split('T')[0];
                if (alertDate > endDate) return false;
            }
            
            const activeCategories = Object.keys(selectedCategories).filter(k => selectedCategories[k]);
            if (activeCategories.length > 0) {
                return true; 
            }

            return true;
        });
    }, [alertas, startDate, endDate, selectedCategories]);

    const groupedAlerts = useMemo(() => {
        const groups: Record<string, Alerta[]> = {};
        
        filteredAlerts.forEach(alerta => {
            const date = new Date(alerta.created_at);
            const today = new Date();
            const isToday = date.toDateString() === today.toDateString();
            
            let dateString = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
            if (isToday) {
                dateString = `Hoje, ${dateString}`;
            }

            if (!groups[dateString]) {
                groups[dateString] = [];
            }
            groups[dateString].push(alerta);
        });

        return groups;
    }, [filteredAlerts]);

    const renderContent = () => (
        <div className="max-w-6xl mx-auto w-full">
            <HistoryFilter
                startDate={startDate}
                endDate={endDate}
                selectedCategories={selectedCategories}
                onDateChange={handleDateChange}
                onCategoryChange={handleCategoryChange}
                onClearFilters={handleClearFilters}
                onGeneratePDF={handleGeneratePDF}
            />

            {loading ? (
                <div className="text-center py-10 text-gray-400">Carregando histórico...</div>
            ) : (
                <div className="space-y-6">
                    {/* Exibir Assessments */}
                    {assessments.length > 0 && (
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h3 className="text-xl font-bold text-white mb-4">📋 Avaliações Clínicas (Assessment)</h3>
                            <div className="space-y-4">
                                {assessments.map((assessment, idx) => (
                                    <div key={idx} className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                                        {/* Manhã */}
                                        {assessment.assessment_morning && (
                                            <div className="mb-4 pb-4 border-b border-gray-700">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-lg">🌅</span>
                                                    <h4 className="font-semibold text-orange-400">Manhã (7:01 - 13:00)</h4>
                                                </div>
                                                <p className="text-gray-300 text-sm whitespace-pre-wrap mb-2">{assessment.assessment_morning}</p>
                                                {assessment.assessment_morning_saved_by_name && (
                                                    <div className="text-xs text-gray-500">
                                                        💾 Salvo por: <strong>{assessment.assessment_morning_saved_by_name}</strong>
                                                        {assessment.assessment_morning_saved_at && (
                                                            <span> • {new Date(assessment.assessment_morning_saved_at).toLocaleString('pt-BR')}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Tarde */}
                                        {assessment.assessment_afternoon && (
                                            <div className="mb-4 pb-4 border-b border-gray-700">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-lg">☀️</span>
                                                    <h4 className="font-semibold text-yellow-400">Tarde (13:01 - 19:00)</h4>
                                                </div>
                                                <p className="text-gray-300 text-sm whitespace-pre-wrap mb-2">{assessment.assessment_afternoon}</p>
                                                {assessment.assessment_afternoon_saved_by_name && (
                                                    <div className="text-xs text-gray-500">
                                                        💾 Salvo por: <strong>{assessment.assessment_afternoon_saved_by_name}</strong>
                                                        {assessment.assessment_afternoon_saved_at && (
                                                            <span> • {new Date(assessment.assessment_afternoon_saved_at).toLocaleString('pt-BR')}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Noite */}
                                        {assessment.assessment_night && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-lg">🌙</span>
                                                    <h4 className="font-semibold text-indigo-400">Noite (19:01 - 07:00)</h4>
                                                </div>
                                                <p className="text-gray-300 text-sm whitespace-pre-wrap mb-2">{assessment.assessment_night}</p>
                                                {assessment.assessment_night_saved_by_name && (
                                                    <div className="text-xs text-gray-500">
                                                        💾 Salvo por: <strong>{assessment.assessment_night_saved_by_name}</strong>
                                                        {assessment.assessment_night_saved_at && (
                                                            <span> • {new Date(assessment.assessment_night_saved_at).toLocaleString('pt-BR')}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Exibir Alertas */}
                    {Object.keys(groupedAlerts).length === 0 ? (
                        <div className="text-center py-10 text-gray-400">Nenhum evento encontrado para os filtros selecionados.</div>
                    ) : (
                        Object.entries(groupedAlerts).map(([date, items]) => (
                            <HistoryTimeline key={date} date={date} items={items} />
                        ))
                    )}
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Mobile View */}
            <div className="w-full overflow-x-hidden sm:hidden min-h-screen bg-[#131722]">
                <HistoryHeader patientName={patient.name} onBack={onBack} />
                <main className="grow px-4 pt-2 pb-28">
                    {renderContent()}
                </main>
                <BottomNavBar onNavigate={onNavigate} currentPage={currentPage} />
            </div>
            
            {/* Desktop View */}
            <DesktopLayout currentPage={currentPage} onNavigate={onNavigate}>
                <DesktopHistoryHeader patientName={patient.name} onBack={onBack} />
                <main className="grow pt-6 px-6 bg-[#131722]">
                    {renderContent()}
                </main>
            </DesktopLayout>
        </>
    );
};

export default HistoryPage;