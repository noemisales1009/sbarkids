import React, { useState, useEffect, useCallback } from 'react';
import { CurrentPage, Patient } from '../types';
import { passagensService, Medico, Passagem } from '../services/passagensService';
import { patientsService } from '../services/patientsService';
import { useUser } from '../contexts/UserContext';
import MainSidebar from '../components/layout/MainSidebar';
import DesktopHeader from '../components/patients/DesktopHeader';

interface PassagemPageProps {
    onNavigate: (page: CurrentPage) => void;
    currentPage: CurrentPage;
}

const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
        ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const PassagemPage: React.FC<PassagemPageProps> = ({ onNavigate, currentPage }) => {
    const { user } = useUser();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [medicos, setMedicos] = useState<Medico[]>([]);
    const [historico, setHistorico] = useState<Passagem[]>([]);
    const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());
    const [medicoId, setMedicoId] = useState('');
    const [observacao, setObservacao] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [showHistorico, setShowHistorico] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const [pats, meds, hist] = await Promise.all([
            patientsService.listPatients(),
            passagensService.getMedicos(),
            passagensService.getAll(),
        ]);
        setPatients(pats.filter(p => !p.archived_at));
        setMedicos(meds);
        setHistorico(hist);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const togglePatient = (id: string) => {
        setSelectedPatients(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selectedPatients.size === patients.length) {
            setSelectedPatients(new Set());
        } else {
            setSelectedPatients(new Set(patients.map(p => p.id)));
        }
    };

    const handleSubmit = async () => {
        if (!user || !medicoId || selectedPatients.size === 0) return;
        setSaving(true);
        const ok = await passagensService.criar(user.id, medicoId, Array.from(selectedPatients), observacao);
        if (ok) {
            setSucesso(true);
            setSelectedPatients(new Set());
            setMedicoId('');
            setObservacao('');
            await load();
            setTimeout(() => setSucesso(false), 3000);
        }
        setSaving(false);
    };

    const medicoSelecionado = medicos.find(m => m.id === medicoId);

    const content = (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Registrar Passagem</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Documente a passagem de informações ao médico.</p>
            </div>

            {sucesso && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Passagem registrada com sucesso!
                </div>
            )}

            {/* De → Para */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Passagem de informação</h2>

                <div className="flex items-center gap-3">
                    {/* De: usuário logado */}
                    <div className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5">
                        <p className="text-xs text-slate-400 mb-0.5">De</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {user?.name || '—'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{user?.role || ''}</p>
                    </div>

                    {/* Seta */}
                    <span className="material-symbols-outlined text-2xl text-blue-400 shrink-0">transfer_within_a_station</span>

                    {/* Para: médico selecionado */}
                    <div className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5">
                        <p className="text-xs text-slate-400 mb-0.5">Para</p>
                        {medicoSelecionado ? (
                            <>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{medicoSelecionado.name}</p>
                                <p className="text-xs text-slate-400 truncate">{medicoSelecionado.role}</p>
                            </>
                        ) : (
                            <p className="text-sm text-slate-400 italic">Nenhum selecionado</p>
                        )}
                    </div>
                </div>

                {/* Dropdown médico */}
                <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Selecionar médico</label>
                    <select
                        value={medicoId}
                        onChange={e => setMedicoId(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Selecionar médico que vai receber...</option>
                        {medicos.map(m => (
                            <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                        ))}
                    </select>
                    {medicos.length === 0 && !loading && (
                        <p className="text-xs text-slate-400 mt-1">Nenhum médico cadastrado no sistema.</p>
                    )}
                </div>
            </div>

            {/* Selecionar Pacientes */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-blue-500">groups</span>
                        Pacientes informados
                    </h2>
                    {patients.length > 0 && (
                        <button
                            onClick={toggleAll}
                            className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                        >
                            {selectedPatients.size === patients.length ? 'Desmarcar todos' : 'Selecionar todos'}
                        </button>
                    )}
                </div>

                {loading ? (
                    <p className="text-sm text-slate-400 py-4 text-center">Carregando pacientes...</p>
                ) : patients.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">Nenhum paciente ativo.</p>
                ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {patients.map(p => (
                            <label
                                key={p.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                    selectedPatients.has(p.id)
                                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
                                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedPatients.has(p.id)}
                                    onChange={() => togglePatient(p.id)}
                                    className="w-4 h-4 accent-blue-500 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Leito {p.bed_number}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
                {selectedPatients.size > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {selectedPatients.size} paciente{selectedPatients.size > 1 ? 's' : ''} selecionado{selectedPatients.size > 1 ? 's' : ''}
                    </p>
                )}
            </div>

            {/* Botão */}
            <button
                onClick={handleSubmit}
                disabled={saving || !medicoId || selectedPatients.size === 0}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base transition-colors flex items-center justify-center gap-2"
            >
                {saving ? (
                    <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span> Registrando...</>
                ) : (
                    <><span className="material-symbols-outlined text-base">send</span> Registrar Passagem</>
                )}
            </button>

            {/* Botão histórico */}
            <button
                onClick={() => setShowHistorico(true)}
                className="w-full py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-base transition-colors flex items-center justify-center gap-2"
            >
                <span className="material-symbols-outlined text-base">history</span>
                Ver Histórico de Passagens
                {historico.length > 0 && (
                    <span className="ml-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                        {historico.length}
                    </span>
                )}
            </button>
        </div>
    );

    return (
        <>
            {/* Desktop */}
            <div className="hidden sm:flex h-screen overflow-hidden">
                <MainSidebar currentPage={currentPage} onNavigate={onNavigate} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <DesktopHeader />
                    <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                        {content}
                    </main>
                </div>
            </div>

            {/* Mobile */}
            <div className="sm:hidden">
                <div className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
                    <button onClick={() => onNavigate('patients')} className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-base font-bold text-slate-900 dark:text-white">Passagem</h1>
                </div>
                <main className="bg-slate-50 dark:bg-slate-900 min-h-screen">
                    {content}
                </main>
            </div>

            {/* Modal Histórico */}
            {showHistorico && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh]">

                        {/* Header do modal */}
                        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-base text-slate-400">history</span>
                                Histórico de Passagens
                            </h2>
                            <button onClick={() => setShowHistorico(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Lista */}
                        <div className="overflow-y-auto flex-1 p-4 space-y-3">
                            {historico.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-8">Nenhuma passagem registrada ainda.</p>
                            ) : historico.map(h => {
                                const patientNames = Array.isArray(h.patient_ids)
                                    ? h.patient_ids.map(id => patients.find(p => p.id === id)).filter(Boolean)
                                    : [];
                                return (
                                    <div key={h.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                                        {/* De → Para */}
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-emerald-500">check_circle</span>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{h.profissional?.name || '—'}</span>
                                            <span className="material-symbols-outlined text-base text-blue-400">transfer_within_a_station</span>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{h.medico?.name || '—'}</span>
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

                                        {/* Observação */}
                                        {h.observacao && (
                                            <p className="text-xs text-slate-400 italic pl-1">{h.observacao}</p>
                                        )}
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

export default PassagemPage;
