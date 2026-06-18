
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CurrentPage, Patient } from '../../types';
import { useUser } from '../../contexts/UserContext';
import { passagensService, Passagem } from '../../services/passagensService';
import { patientsService } from '../../services/patientsService';

interface MainSidebarProps {
    currentPage: CurrentPage;
    onNavigate: (page: CurrentPage) => void;
}

const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
        ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const MainSidebar: React.FC<MainSidebarProps> = ({ currentPage, onNavigate }) => {
    const { user } = useUser();
    const [showHistorico, setShowHistorico] = useState(false);
    const [historico, setHistorico] = useState<Passagem[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loadingHistorico, setLoadingHistorico] = useState(false);
    const [filtroMes, setFiltroMes] = useState('');
    const [filtroData, setFiltroData] = useState('');

    const isAdmin = user?.access_level === 'adm' || user?.access_level === 'super';

    const [pendentesColega, setPendentesColega] = useState<Passagem[]>([]);
    const [patientsPendentes, setPatientsPendentes] = useState<Patient[]>([]);
    const [showPendentes, setShowPendentes] = useState(true);

    useEffect(() => {
        if (!user) return;
        Promise.all([
            passagensService.getPendentesComoColega(user.id),
            patientsService.listPatients(),
        ]).then(([pendentes, pats]) => {
            setPendentesColega(pendentes);
            setPatientsPendentes(pats);
        });
    }, [user?.id]);

    const handleOpenHistorico = async () => {
        setShowHistorico(true);
        setLoadingHistorico(true);
        const [hist, pats] = await Promise.all([
            passagensService.getAll(),
            patientsService.listPatients(),
        ]);
        setHistorico(hist);
        setPatients(pats);
        setLoadingHistorico(false);
    };

    const handleCloseHistorico = () => {
        setShowHistorico(false);
        setFiltroMes('');
        setFiltroData('');
    };

    const handlePrint = () => {
        const filterLabel = filtroData
            ? `Data: ${new Date(filtroData + 'T12:00').toLocaleDateString('pt-BR')}`
            : filtroMes
                ? `Mês: ${new Date(filtroMes + '-01T12:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
                : 'Todas as passagens';

        const linhas = historicoFiltrado.map(h => {
            const pNames = Array.isArray(h.patient_ids)
                ? h.patient_ids.map(id => patients.find(p => p.id === id)).filter(Boolean)
                : [];
            const pList = pNames.map(p => p ? `<li>${p.name} · Leito ${p.bed_number}</li>` : '').join('');
            return `
                <div style="border:1px solid #ddd;border-radius:8px;padding:12px;margin-bottom:12px;">
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
                        <strong>${h.profissional?.name || '—'}</strong>
                        <span>→</span>
                        <strong>${h.medico?.name || '—'}</strong>
                        ${h.turno ? `<span style="background:#dbeafe;color:#2563eb;padding:2px 8px;border-radius:999px;font-size:12px;">${h.turno}</span>` : ''}
                        <span style="margin-left:auto;color:#999;font-size:12px;">${formatDateTime(h.created_at)}</span>
                    </div>
                    <ul style="margin:0;padding-left:16px;font-size:13px;color:#555;">
                        ${pList || '<li style="list-style:none;color:#aaa;">—</li>'}
                    </ul>
                </div>`;
        }).join('');

        const html = `<html><head><title>Histórico de Passagens</title>
            <style>
                body{font-family:Arial,sans-serif;padding:24px;color:#111;}
                h1{font-size:18px;margin-bottom:4px;}
                p{font-size:13px;color:#666;margin-bottom:16px;}
            </style></head>
            <body>
                <h1>Histórico de Passagens</h1>
                <p>${filterLabel} · ${historicoFiltrado.length} passagem(ns)</p>
                ${linhas}
            </body></html>`;

        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
    };

    const historicoFiltrado = useMemo(() => {
        return historico.filter(h => {
            const data = new Date(h.created_at);
            if (filtroData) {
                const dataISO = data.toLocaleDateString('en-CA');
                return dataISO === filtroData;
            }
            if (filtroMes) {
                const mesISO = data.toISOString().slice(0, 7);
                return mesISO === filtroMes;
            }
            return true;
        });
    }, [historico, filtroMes, filtroData]);

    const handleGoToRound = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token && session?.refresh_token) {
            const url = `https://roundkids.com.br/?access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
            window.open(url, '_blank');
        } else {
            window.open('https://roundkids.com.br', '_blank');
        }
    };

    const navItems: { page: CurrentPage; icon: string; label: string }[] = [
        { page: 'patients', icon: 'groups', label: 'Pacientes' },
        { page: 'reports', icon: 'summarize', label: 'Relatórios' },
        { page: 'settings', icon: 'settings', label: 'Ajustes' },
    ];

    return (
        <>
            <aside className="hidden sm:flex flex-col w-64 bg-background-light dark:bg-background-dark border-r border-slate-700 dark:border-slate-800 p-4 print:hidden">
                <div className="flex items-center gap-3 pb-8 pt-4 px-2">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                        <span className="material-symbols-outlined text-4xl text-primary">
                            waving_hand
                        </span>
                    </div>
                    <h1 className="text-xl font-bold" style={{ color: '#13A4EC' }}>SBAR KIDS</h1>
                </div>
                <nav className="flex flex-col gap-2">
                    {navItems.map(item => (
                        <button
                            key={item.page}
                            onClick={() => onNavigate(item.page)}
                            className={`flex items-center gap-3 p-3 rounded-lg text-base font-semibold transition-colors ${
                                currentPage === item.page
                                    ? 'text-white dark:text-white'
                                    : 'text-slate-400 dark:text-slate-400 hover:text-white hover:bg-slate-700 dark:hover:bg-slate-700'
                            }`}
                            style={currentPage === item.page ? { backgroundColor: '#13A4EC', color: '#FFFFFF' } : {}}
                            aria-current={currentPage === item.page ? 'page' : undefined}
                        >
                            <span className="material-symbols-outlined" style={currentPage === item.page ? { color: '#FFFFFF' } : {}}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}

                    {isAdmin && (
                        <button
                            onClick={handleOpenHistorico}
                            className="flex items-center gap-3 p-3 rounded-lg text-base font-semibold transition-colors text-slate-400 dark:text-slate-400 hover:text-white hover:bg-slate-700 dark:hover:bg-slate-700"
                        >
                            <span className="material-symbols-outlined">history</span>
                            <span>Hist. Passagens</span>
                        </button>
                    )}
                </nav>
                <div className="mt-2 pt-2 border-t border-slate-700 dark:border-slate-800">
                    <button
                        onClick={handleGoToRound}
                        className="flex items-center gap-3 p-3 rounded-lg text-base font-semibold transition-colors text-slate-400 dark:text-slate-400 hover:text-white hover:bg-slate-700 dark:hover:bg-slate-700 w-full"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span>Voltar ao Round</span>
                    </button>
                </div>
            </aside>

            {/* Modal alerta colega de plantão */}
            {showPendentes && pendentesColega.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-yellow-500">warning</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Colega de plantão</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Você recebeu pacientes hoje como colega</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPendentes(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            {pendentesColega.map(p => {
                                const patientList = Array.isArray(p.patient_ids)
                                    ? p.patient_ids.map(id => patientsPendentes.find(pt => pt.id === id)).filter(Boolean)
                                    : [];
                                return patientList.map(pt => pt && (
                                    <div key={`${p.id}-${pt.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700">
                                        <span className="material-symbols-outlined text-yellow-500 shrink-0" style={{ fontSize: '18px' }}>person</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{pt.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Leito {pt.bed_number}</p>
                                        </div>
                                        {p.turno && (
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">{p.turno}</span>
                                        )}
                                    </div>
                                ));
                            })}
                        </div>

                        <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium text-center">
                            Lembre-se de passar para o plantonista do turno.
                        </p>

                        <button
                            onClick={() => setShowPendentes(false)}
                            className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-white font-bold text-sm transition"
                        >
                            Entendi
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Histórico de Passagens */}
            {showHistorico && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[85vh]">

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-base text-slate-400">history</span>
                                Histórico de Passagens
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrint}
                                    title="Imprimir"
                                    className="text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition"
                                >
                                    <span className="material-symbols-outlined">print</span>
                                </button>
                                <button
                                    onClick={handleCloseHistorico}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0 space-y-2">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Filtrar por data</label>
                                    <input
                                        type="date"
                                        value={filtroData}
                                        onChange={e => { setFiltroData(e.target.value); setFiltroMes(''); }}
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Filtrar por mês</label>
                                    <input
                                        type="month"
                                        value={filtroMes}
                                        onChange={e => { setFiltroMes(e.target.value); setFiltroData(''); }}
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            {(filtroData || filtroMes) && (
                                <button
                                    onClick={() => { setFiltroData(''); setFiltroMes(''); }}
                                    className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                                >
                                    Limpar filtro
                                </button>
                            )}
                            <p className="text-xs text-slate-400">{historicoFiltrado.length} passagem(ns) encontrada(s)</p>
                        </div>

                        {/* Lista */}
                        <div className="overflow-y-auto flex-1 p-4 space-y-3">
                            {loadingHistorico ? (
                                <p className="text-sm text-slate-400 text-center py-8">Carregando...</p>
                            ) : historicoFiltrado.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-8">Nenhuma passagem encontrada.</p>
                            ) : historicoFiltrado.map(h => {
                                const patientNames = Array.isArray(h.patient_ids)
                                    ? h.patient_ids.map(id => patients.find(p => p.id === id)).filter(Boolean)
                                    : [];
                                return (
                                    <div key={h.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="material-symbols-outlined text-sm text-emerald-500">check_circle</span>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{h.profissional?.name || '—'}</span>
                                            <span className="material-symbols-outlined text-base text-blue-400">transfer_within_a_station</span>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{h.medico?.name || '—'}</span>
                                            {h.tipo && (
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                    h.tipo === 'Colega de plantão'
                                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                }`}>{h.tipo}</span>
                                            )}
                                            {h.turno && (
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{h.turno}</span>
                                            )}
                                            <span className="ml-auto text-xs text-slate-400 shrink-0">{formatDateTime(h.created_at)}</span>
                                        </div>
                                        <div className="space-y-1 pl-1">
                                            {patientNames.map(p => p && (
                                                <div key={p.id} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '13px' }}>person</span>
                                                    <span className="font-medium">{p.name}</span>
                                                    <span className="text-slate-400">· Leito {p.bed_number}</span>
                                                </div>
                                            ))}
                                            {patientNames.length === 0 && (
                                                <p className="text-xs text-slate-400">{Array.isArray(h.patient_ids) ? h.patient_ids.length : 0} paciente(s)</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MainSidebar;
