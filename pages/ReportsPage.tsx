
import React, { useState, useEffect } from 'react';
import { CurrentPage, Patient } from '../types';
import BottomNavBar from '../components/patients/BottomNavBar';
import DesktopLayout from '../components/layout/DesktopLayout';
import { supabase } from '../lib/supabase';
import { historyService } from '../services/historyService';
import { alertasService, Alerta } from '../services/alertasService';
import { useToast } from '../components/Toast';

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
    assessmentBy: {
        morning: string;
        afternoon: string;
        night: string;
    };
    recommendation: {
        morning: string;
        afternoon: string;
        night: string;
    };
    recommendationBy: {
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
    const { showToast } = useToast();
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [selectedPatientIds, setSelectedPatientIds] = useState<Set<string>>(new Set());
    const [patientSearch, setPatientSearch] = useState<string>('');
    const [patientDropdownOpen, setPatientDropdownOpen] = useState<boolean>(false);
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
            
            
            // Buscar de clinical_rounds_simple
            const { data: roundsData, error } = await supabase
                .from('clinical_rounds_simple')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100); // Limitar a 100 registros mais recentes

            if (error) {
                throw error;
            }

            if (!roundsData || roundsData.length === 0) {
                setReports([]);
                setLoading(false);
                return;
            }


            // Buscar dados dos pacientes (apenas não-arquivados)
            const patientIds = [...new Set(roundsData.map(r => r.patient_id))];
            const { data: patientsData } = await supabase
                .from('patients')
                .select('*')
                .in('id', patientIds)
                .is('archived_at', null);

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
                        assessmentBy: {
                            morning: round.assessment_morning_saved_by_name || '',
                            afternoon: round.assessment_afternoon_saved_by_name || '',
                            night: round.assessment_night_saved_by_name || ''
                        },
                        recommendation: {
                            morning: round.recommendation_morning || '',
                            afternoon: round.recommendation_afternoon || '',
                            night: round.recommendation_night || ''
                        },
                        recommendationBy: {
                            morning: round.recommendation_morning_saved_by_name || '',
                            afternoon: round.recommendation_afternoon_saved_by_name || '',
                            night: round.recommendation_night_saved_by_name || ''
                        }
                    };
                })
                .filter((item): item is GlobalReportItem => item !== null);

            setReports(allReports);

            // Buscar alertas para cada paciente
            const alertasMap: Record<string, Alerta[]> = {};
            for (const report of allReports) {
                try {
                    const alertas = await alertasService.getAlertas(report.patient.id);
                    alertasMap[report.patient.id] = alertas;
                } catch (error) {
                    alertasMap[report.patient.id] = [];
                }
            }
            setAlertasPorPaciente(alertasMap);
            
            setLoading(false);
        } catch (error) {
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

        // Filtro por paciente (multi-select)
        const matchesPatient = selectedPatientIds.size === 0 || selectedPatientIds.has(item.patient.id);

        return matchesStatus && matchesDate && matchesPatient;
    });

    // Lista única de pacientes dos relatórios carregados
    const uniquePatients = React.useMemo(() => {
        const map = new Map<string, Patient>();
        for (const r of reports) {
            if (!map.has(r.patient.id)) map.set(r.patient.id, r.patient);
        }
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [reports]);

    const filteredUniquePatients = React.useMemo(() => {
        const q = patientSearch.trim().toLowerCase();
        if (!q) return uniquePatients;
        return uniquePatients.filter(p => p.name.toLowerCase().includes(q));
    }, [uniquePatients, patientSearch]);

    const togglePatientSelection = (id: string) => {
        const newSet = new Set(selectedPatientIds);
        if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
        setSelectedPatientIds(newSet);
    };

    const toggleAllPatients = () => {
        if (selectedPatientIds.size === filteredUniquePatients.length && filteredUniquePatients.length > 0) {
            setSelectedPatientIds(new Set());
        } else {
            setSelectedPatientIds(new Set(filteredUniquePatients.map(p => p.id)));
        }
    };

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

    const getAlertStatusBadge = (status: string) => {
        const s = (status || '').toLowerCase();
        if (s === 'concluido' || s.includes('concluí')) return { label: 'Concluído', bg: '#10b981', color: '#fff' };
        if (s === 'fora_do_prazo' || s.includes('fora')) return { label: 'Fora do prazo', bg: '#ef4444', color: '#fff' };
        if (s.includes('arquivado') || s.includes('resolvido')) return { label: 'Arquivado', bg: '#6b7280', color: '#fff' };
        return { label: 'No prazo', bg: '#f59e0b', color: '#fff' };
    };

    const buildShiftSection = (
        shiftKey: 'morning' | 'afternoon' | 'night',
        item: GlobalReportItem,
    ): string => {
        const shiftInfo = {
            morning: { label: '🌅 MANHÃ', hours: '07:00 - 13:00', color: '#f97316', class: 'shift-morning' },
            afternoon: { label: '☀️ TARDE', hours: '13:00 - 19:00', color: '#eab308', class: 'shift-afternoon' },
            night: { label: '🌙 NOITE', hours: '19:00 - 07:00', color: '#4f46e5', class: 'shift-night' },
        }[shiftKey];

        const assessment = item.assessment[shiftKey];
        const assessmentBy = item.assessmentBy[shiftKey];
        const recommendation = item.recommendation[shiftKey];
        const recommendationBy = item.recommendationBy[shiftKey];
        const shiftAlerts = (alertasPorPaciente[item.patient.id] || []).filter((a: any) => a.shift_criacao === shiftKey);

        if (!assessment && !recommendation && shiftAlerts.length === 0) return '';

        return `
            <div class="shift-section ${shiftInfo.class}">
                <div class="shift-header" style="background:${shiftInfo.color};">
                    <span>${shiftInfo.label}</span>
                    <span style="font-size: 11px; opacity: 0.9;">${shiftInfo.hours}</span>
                </div>
                <div class="shift-content">
                    ${assessment ? `
                        <div class="sbar-block" style="background:#eff6ff;border-color:#bfdbfe;">
                            <div class="sbar-label" style="color:#1e40af;"><span class="sbar-chip" style="background:#1e40af;">A</span> ASSESSMENT (Avaliação)</div>
                            <div class="sbar-text">${assessment}</div>
                            ${assessmentBy ? `<div class="sbar-author">✍️ Registrado por: <strong>${assessmentBy}</strong></div>` : ''}
                        </div>
                    ` : ''}

                    ${recommendation ? `
                        <div class="sbar-block" style="background:#f0fdf4;border-color:#bbf7d0;">
                            <div class="sbar-label" style="color:#166534;"><span class="sbar-chip" style="background:#166534;">R</span> RECOMENDAÇÃO / PLANO</div>
                            <div class="sbar-text">${recommendation}</div>
                            ${recommendationBy ? `<div class="sbar-author">✍️ Registrado por: <strong>${recommendationBy}</strong></div>` : ''}
                        </div>
                    ` : ''}

                    ${shiftAlerts.length > 0 ? `
                        <div class="alerts-title">🔔 Alertas Clínicos (${shiftAlerts.length})</div>
                        ${shiftAlerts.map((alert: any) => {
                            const badge = getAlertStatusBadge(alert.live_status || alert.status || '');
                            return `
                                <div class="alert-item">
                                    <div class="alert-top">
                                        <div class="alert-description">${alert.alertaclinico}</div>
                                        <span class="alert-badge" style="background:${badge.bg};color:${badge.color};">${badge.label}</span>
                                    </div>
                                    ${alert.justificativa && alert.justificativa.trim() !== '' ? `
                                        <div class="alert-justification"><strong>Justificativa:</strong> ${alert.justificativa}</div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    ` : ''}
                </div>
            </div>
        `;
    };

    const buildReportHtml = (item: GlobalReportItem, isLast: boolean): string => {
        const patient = item.patient;
        return `
            <section class="report-page" ${isLast ? '' : 'style="page-break-after: always;"'}>
                <div class="brand-bar">
                    <div>
                        <h1>SBAR KIDS</h1>
                        <div class="subtitle">Relatório Clínico do Paciente</div>
                    </div>
                    <div class="meta">
                        <div>${item.datetime}</div>
                        <div>Responsável: <strong>${item.author}</strong></div>
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
                            <span class="patient-label">Status</span>
                            <span class="patient-value">${item.status}</span>
                        </div>
                        <div class="patient-item">
                            <span class="patient-label">Mãe</span>
                            <span class="patient-value">${patient.mother_name || '-'}</span>
                        </div>
                    </div>
                </div>

                ${['morning', 'afternoon', 'night'].map(s => buildShiftSection(s as any, item)).join('')}

                <div class="doc-footer">
                    Documento gerado automaticamente · SBAR Kids · ${new Date().toLocaleString('pt-BR')}
                </div>
            </section>
        `;
    };

    const handlePrint = () => {
        if (selectedReports.size === 0) {
            showToast("Selecione pelo menos um relatório para imprimir.", "warning");
            return;
        }

        const itemsToPrint = filteredReports.filter(r => selectedReports.has(r.id));
        const body = itemsToPrint.map((item, idx) => buildReportHtml(item, idx === itemsToPrint.length - 1)).join('');

        const html = `
            <html>
            <head>
                <meta charset="UTF-8">
                <title>SBAR Kids - Relatórios</title>
                <style>
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; }
                    body {
                        font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
                        padding: 24px 28px 32px;
                        color: #1f2937;
                        background: #fff;
                        font-size: 13px;
                        line-height: 1.55;
                    }
                    .report-page { padding-bottom: 20px; }

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

                    .patient-card {
                        border: 1px solid #e5e7eb;
                        border-top: none;
                        border-radius: 0 0 10px 10px;
                        padding: 14px 20px;
                        margin-bottom: 20px;
                        background: #f9fafb;
                    }
                    .patient-name { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 10px; }
                    .patient-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 12px; }
                    .patient-item { display: flex; flex-direction: column; }
                    .patient-label { font-size: 10px; font-weight: 600; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
                    .patient-value { font-size: 13px; font-weight: 600; color: #111827; }

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
                    .shift-morning { border-left: 5px solid #f97316; }
                    .shift-afternoon { border-left: 5px solid #eab308; }
                    .shift-night { border-left: 5px solid #4f46e5; }
                    .shift-content { padding: 14px 16px; background: #fff; }

                    .sbar-block {
                        padding: 12px;
                        border: 1px solid;
                        border-radius: 8px;
                        margin-bottom: 12px;
                    }
                    .sbar-label {
                        font-weight: 700;
                        font-size: 12px;
                        margin-bottom: 6px;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .sbar-chip {
                        display: inline-block;
                        width: 22px;
                        height: 22px;
                        line-height: 22px;
                        text-align: center;
                        color: #fff;
                        border-radius: 4px;
                        font-weight: 700;
                    }
                    .sbar-text {
                        font-size: 13px;
                        color: #1f2937;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                    .sbar-author {
                        margin-top: 6px;
                        padding-top: 6px;
                        border-top: 1px dashed #d1d5db;
                        font-size: 11px;
                        color: #6b7280;
                    }
                    .sbar-author strong { color: #111827; }

                    .alerts-title {
                        font-weight: 700;
                        font-size: 12px;
                        color: #374151;
                        margin: 14px 0 8px;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
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
                    .alert-top { display: flex; justify-content: space-between; align-items: start; gap: 8px; margin-bottom: 8px; }
                    .alert-description { font-weight: 700; font-size: 13px; color: #111827; flex: 1; }
                    .alert-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
                    .alert-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; font-size: 11px; color: #4b5563; }
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

                    .signature-block {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 40px;
                        margin-top: 40px;
                        padding: 0 40px;
                    }
                    .signature { text-align: center; }
                    .sig-line { border-top: 1px solid #1f2937; margin-bottom: 6px; }
                    .sig-name { margin: 0; font-size: 11px; font-weight: 700; color: #111827; }
                    .sig-role { margin: 2px 0 0; font-size: 9px; color: #6b7280; }

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
            <body>${body}</body>
            </html>
        `;

        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            setTimeout(() => { printWindow.print(); }, 300);
        }
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
            <div className="flex flex-col gap-3 bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row gap-3">
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

                {/* Filtro por paciente (multi-select) */}
                <div className="relative">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        Filtrar por Paciente
                    </label>
                    <button
                        type="button"
                        onClick={() => setPatientDropdownOpen(v => !v)}
                        className="w-full h-11 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-left text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <span>
                            {selectedPatientIds.size === 0
                                ? 'Todos os pacientes'
                                : `${selectedPatientIds.size} paciente(s) selecionado(s)`}
                        </span>
                        <span className="text-gray-400">{patientDropdownOpen ? '▲' : '▼'}</span>
                    </button>

                    {patientDropdownOpen && (
                        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl max-h-72 overflow-hidden flex flex-col">
                            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                                <input
                                    type="text"
                                    placeholder="Buscar paciente por nome..."
                                    value={patientSearch}
                                    onChange={(e) => setPatientSearch(e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div className="overflow-y-auto flex-1">
                                {uniquePatients.length === 0 ? (
                                    <div className="p-3 text-sm text-gray-500 text-center">Nenhum paciente disponível</div>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={toggleAllPatients}
                                            className="w-full px-3 py-2 text-left text-xs font-semibold text-primary hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
                                        >
                                            {selectedPatientIds.size === filteredUniquePatients.length && filteredUniquePatients.length > 0
                                                ? 'Desmarcar todos'
                                                : 'Selecionar todos'}
                                        </button>
                                        {filteredUniquePatients.length === 0 ? (
                                            <div className="p-3 text-sm text-gray-500 text-center">Nenhum paciente encontrado</div>
                                        ) : (
                                            filteredUniquePatients.map(p => (
                                                <label
                                                    key={p.id}
                                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPatientIds.has(p.id)}
                                                        onChange={() => togglePatientSelection(p.id)}
                                                        className="h-4 w-4 appearance-auto accent-primary"
                                                    />
                                                    <span className="text-gray-900 dark:text-white flex-1">{p.name}</span>
                                                    {p.bed_number != null && (
                                                        <span className="text-xs text-gray-500">Leito {p.bed_number}</span>
                                                    )}
                                                </label>
                                            ))
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
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

                                {/* Alertas clínicos do paciente */}
                                {alertasPorPaciente[item.patient.id] && alertasPorPaciente[item.patient.id].length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                                            🔔 Alertas Clínicos ({alertasPorPaciente[item.patient.id].length})
                                        </p>
                                        <div className="space-y-2">
                                            {alertasPorPaciente[item.patient.id].slice(0, 5).map((alerta: any) => {
                                                const status = (alerta.live_status || alerta.status || '').toLowerCase();
                                                const borderColor = status === 'fora_do_prazo' ? 'border-l-red-500'
                                                    : (status === 'concluido' || status === 'resolvido') ? 'border-l-green-500'
                                                    : 'border-l-yellow-500';
                                                const badgeStyle = status === 'fora_do_prazo' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                    : (status === 'concluido' || status === 'resolvido') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
                                                return (
                                                    <div
                                                        key={alerta.id_alerta}
                                                        className={`p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 border-l-4 ${borderColor}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="text-xs font-semibold text-gray-900 dark:text-white flex-1">{alerta.alertaclinico}</p>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${badgeStyle}`}>
                                                                {(alerta.status || '').replace('_', ' ') || 'ativo'}
                                                            </span>
                                                        </div>
                                                        {alerta.justificativa && alerta.justificativa.trim() !== '' && (
                                                            <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 italic">
                                                                <strong>Justificativa:</strong> {alerta.justificativa}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {alertasPorPaciente[item.patient.id].length > 5 && (
                                                <p className="text-[11px] text-gray-500 italic text-center pt-1">
                                                    + {alertasPorPaciente[item.patient.id].length - 5} outros alerta(s)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
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
