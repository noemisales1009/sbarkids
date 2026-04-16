
import React, { useState, useEffect, useMemo } from 'react';
import { Patient, CurrentPage, HistoryItemData } from '../types';
import HistoryHeader from '../components/history/HistoryHeader';
import BottomNavBar from '../components/patients/BottomNavBar';
import DesktopLayout from '../components/layout/DesktopLayout';
import DesktopHistoryHeader from '../components/history/DesktopHistoryHeader';
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

    const getStatusBadge = (liveStatus: string) => {
        const s = (liveStatus || '').toLowerCase();
        if (s === 'concluido' || s.includes('concluí')) {
            return { label: 'Concluído', bg: '#10b981', color: '#fff' };
        }
        if (s === 'fora_do_prazo' || s.includes('fora')) {
            return { label: 'Fora do prazo', bg: '#ef4444', color: '#fff' };
        }
        if (s.includes('arquivado') || s.includes('resolvido')) {
            return { label: 'Arquivado', bg: '#6b7280', color: '#fff' };
        }
        return { label: 'No prazo', bg: '#f59e0b', color: '#fff' };
    };

    const handleGeneratePDF = () => {
        const htmlContent = `
            <html>
            <head>
                <meta charset="UTF-8">
                <title>SBAR Kids - ${patient.name}</title>
                <style>
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; }
                    body {
                        font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
                        margin: 0;
                        padding: 24px 28px 40px;
                        color: #1f2937;
                        background: #fff;
                        font-size: 13px;
                        line-height: 1.55;
                    }

                    /* Cabeçalho principal */
                    .brand-bar {
                        background: linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%);
                        color: #fff;
                        padding: 14px 20px;
                        border-radius: 10px 10px 0 0;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .brand-bar h1 { margin: 0; font-size: 24px; letter-spacing: 0.5px; }
                    .brand-bar .subtitle { font-size: 12px; opacity: 0.85; }
                    .brand-bar .meta { font-size: 11px; text-align: right; opacity: 0.9; }

                    /* Card do paciente */
                    .patient-card {
                        border: 1px solid #e5e7eb;
                        border-top: none;
                        border-radius: 0 0 10px 10px;
                        padding: 14px 20px;
                        margin-bottom: 20px;
                        background: #f9fafb;
                    }
                    .patient-name {
                        font-size: 20px;
                        font-weight: 700;
                        color: #111827;
                        margin: 0 0 10px;
                    }
                    .patient-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 10px;
                        font-size: 12px;
                    }
                    .patient-item { display: flex; flex-direction: column; }
                    .patient-label {
                        font-size: 10px;
                        font-weight: 600;
                        color: #2563eb;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-bottom: 2px;
                    }
                    .patient-value { font-size: 13px; font-weight: 600; color: #111827; }

                    /* Seção de turno */
                    .shift-section {
                        margin-bottom: 18px;
                        border-radius: 10px;
                        overflow: hidden;
                        border: 1px solid #e5e7eb;
                        page-break-inside: avoid;
                    }
                    .shift-header {
                        padding: 10px 16px;
                        font-weight: 700;
                        font-size: 14px;
                        color: #fff;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .shift-morning .shift-header { background: #f97316; }
                    .shift-afternoon .shift-header { background: #eab308; }
                    .shift-night .shift-header { background: #4f46e5; }
                    .shift-morning { border-left: 5px solid #f97316; }
                    .shift-afternoon { border-left: 5px solid #eab308; }
                    .shift-night { border-left: 5px solid #4f46e5; }
                    .shift-content { padding: 14px 16px; background: #fff; }

                    /* Assessment */
                    .assessment-block {
                        padding: 12px;
                        background: #eff6ff;
                        border: 1px solid #bfdbfe;
                        border-radius: 8px;
                        margin-bottom: 14px;
                    }
                    .assessment-title {
                        font-weight: 700;
                        font-size: 12px;
                        color: #1e40af;
                        margin-bottom: 6px;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                    }
                    .assessment-text {
                        font-size: 13px;
                        color: #1f2937;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }

                    /* Alertas */
                    .alerts-title {
                        font-weight: 700;
                        font-size: 12px;
                        color: #374151;
                        margin: 14px 0 8px;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    .alert-item {
                        border: 1px solid #e5e7eb;
                        border-left: 4px solid #2563eb;
                        border-radius: 8px;
                        padding: 10px 12px;
                        margin-bottom: 8px;
                        background: #fff;
                        page-break-inside: avoid;
                    }
                    .alert-top {
                        display: flex;
                        justify-content: space-between;
                        align-items: start;
                        gap: 8px;
                        margin-bottom: 8px;
                    }
                    .alert-description { font-weight: 700; font-size: 13px; color: #111827; flex: 1; }
                    .alert-badge {
                        font-size: 10px;
                        font-weight: 700;
                        padding: 3px 8px;
                        border-radius: 999px;
                        white-space: nowrap;
                    }
                    .alert-meta-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 4px 12px;
                        font-size: 11px;
                        color: #4b5563;
                    }
                    .alert-meta-label { color: #6b7280; font-weight: 600; }
                    .alert-justification {
                        margin-top: 8px;
                        padding: 8px 10px;
                        background: #f3f4f6;
                        border-left: 3px solid #9ca3af;
                        border-radius: 4px;
                        font-size: 11px;
                        color: #374151;
                    }
                    .alert-justification strong { color: #111827; }

                    .empty-shift {
                        font-size: 11px;
                        color: #9ca3af;
                        font-style: italic;
                        text-align: center;
                        padding: 10px;
                    }

                    /* Rodapé */
                    .doc-footer {
                        margin-top: 24px;
                        padding-top: 12px;
                        border-top: 1px solid #e5e7eb;
                        font-size: 9px;
                        color: #9ca3af;
                        text-align: center;
                    }

                    @media print {
                        body { padding: 20px; }
                        .shift-section { page-break-inside: auto; }
                        .alert-item { page-break-inside: auto; }
                    }
                </style>
            </head>
            <body>
                <div class="brand-bar">
                    <div>
                        <h1>SBAR KIDS</h1>
                        <div class="subtitle">Relatório Clínico do Paciente</div>
                    </div>
                    <div class="meta">
                        <div>${new Date().toLocaleString('pt-BR')}</div>
                        <div>Responsável: <strong>${user?.name || 'Médico'}</strong></div>
                    </div>
                </div>

                <div class="patient-card">
                    <h2 class="patient-name">${patient.name}</h2>
                    <div class="patient-grid">
                        <div class="patient-item">
                            <span class="patient-label">Leito</span>
                            <span class="patient-value">${patient.bed_number || '-'}</span>
                        </div>
                        <div class="patient-item">
                            <span class="patient-label">Data Nasc.</span>
                            <span class="patient-value">${patient.dob ? new Date(patient.dob).toLocaleDateString('pt-BR') : '-'}</span>
                        </div>
                        <div class="patient-item">
                            <span class="patient-label">Peso</span>
                            <span class="patient-value">${patient.peso ? patient.peso + ' kg' : '-'}</span>
                        </div>
                        <div class="patient-item">
                            <span class="patient-label">Mãe</span>
                            <span class="patient-value">${patient.mother_name || '-'}</span>
                        </div>
                    </div>
                </div>

                ${generateShiftSections()}

                <div class="doc-footer">
                    Documento gerado automaticamente · SBAR Kids · ${new Date().toLocaleDateString('pt-BR')}
                </div>
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
            morning: { label: '🌅 MANHÃ', hours: '07:00 - 13:00', class: 'shift-morning' },
            afternoon: { label: '☀️ TARDE', hours: '13:00 - 19:00', class: 'shift-afternoon' },
            night: { label: '🌙 NOITE', hours: '19:00 - 07:00', class: 'shift-night' }
        };

        return shifts.map(shift => {
            const info = shiftInfo[shift as keyof typeof shiftInfo];
            const assessment = assessments[0]?.[`assessment_${shift}` as keyof typeof assessments[0]];
            const shiftAlerts = alertas.filter((a: any) => a.shift_criacao === shift);

            // Se não tiver nada no turno, pula
            if (!assessment && shiftAlerts.length === 0) {
                return '';
            }

            return `
                <div class="shift-section ${info.class}">
                    <div class="shift-header">
                        <span>${info.label}</span>
                        <span style="font-size: 11px; opacity: 0.9;">${info.hours}</span>
                    </div>
                    <div class="shift-content">
                        ${assessment ? `
                            <div class="assessment-block">
                                <div class="assessment-title">📝 Assessment (Avaliação Clínica)</div>
                                <div class="assessment-text">${assessment}</div>
                            </div>
                        ` : ''}

                        ${shiftAlerts.length > 0 ? `
                            <div class="alerts-title">🔔 Alertas Clínicos (${shiftAlerts.length})</div>
                            ${shiftAlerts.map((alert: any) => {
                                const badge = getStatusBadge(alert.live_status || alert.status || '');
                                return `
                                <div class="alert-item">
                                    <div class="alert-top">
                                        <div class="alert-description">${alert.alertaclinico}</div>
                                        <span class="alert-badge" style="background:${badge.bg}; color:${badge.color};">${badge.label}</span>
                                    </div>
                                    ${alert.justificativa && alert.justificativa.trim() !== '' ? `
                                        <div class="alert-justification">
                                            <strong>Justificativa:</strong> ${alert.justificativa}
                                        </div>
                                    ` : ''}
                                </div>
                            `}).join('')}
                        ` : ''}
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