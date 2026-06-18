
import React, { useState } from 'react';
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

    const isAdmin = user?.access_level === 'adm' || user?.access_level === 'super';

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

                    {/* Botão Histórico de Passagens — apenas admin/super */}
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
                            <button
                                onClick={() => setShowHistorico(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Lista */}
                        <div className="overflow-y-auto flex-1 p-4 space-y-3">
                            {loadingHistorico ? (
                                <p className="text-sm text-slate-400 text-center py-8">Carregando...</p>
                            ) : historico.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-8">Nenhuma passagem registrada.</p>
                            ) : historico.map(h => {
                                const patientNames = Array.isArray(h.patient_ids)
                                    ? h.patient_ids.map(id => patients.find(p => p.id === id)).filter(Boolean)
                                    : [];
                                return (
                                    <div key={h.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-2">
                                        {/* De → Para + turno + data */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="material-symbols-outlined text-sm text-emerald-500">check_circle</span>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{h.profissional?.name || '—'}</span>
                                            <span className="material-symbols-outlined text-base text-blue-400">transfer_within_a_station</span>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{h.medico?.name || '—'}</span>
                                            {h.turno && (
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{h.turno}</span>
                                            )}
                                            <span className="ml-auto text-xs text-slate-400 shrink-0">{formatDateTime(h.created_at)}</span>
                                        </div>

                                        {/* Pacientes */}
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
