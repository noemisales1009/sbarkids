import React from 'react';
import { Patient } from '../../types';
import { Passagem } from '../../services/passagensService';

interface PatientCardProps {
    patient: Patient;
    precaucoes?: string[];
    ultimaPassagem?: Passagem | null;
    onSelectPatient: (patient: Patient) => void;
    onSelectHistory: (patient: Patient) => void;
}


const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
};

const formatPassagemTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
        ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const PatientCard: React.FC<PatientCardProps> = ({ patient, precaucoes = [], ultimaPassagem, onSelectPatient, onSelectHistory }) => {

    // Determinar cor da borda baseada no status
    const getBorderColor = () => {
        switch (patient.status) {
            case 'estavel':
                return 'border-emerald-200 dark:border-emerald-500';
            case 'instavel':
                return 'border-amber-200 dark:border-amber-500';
            case 'em_risco':
                return 'border-red-200 dark:border-red-500';
            default:
                return 'border-slate-200 dark:border-slate-700';
        }
    };

    const getStatusColor = () => {
        switch (patient.status) {
            case 'estavel':
                return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40';
            case 'instavel':
                return 'bg-amber-50 text-amber-700 dark:bg-amber-600/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/40';
            case 'em_risco':
                return 'bg-red-50 text-red-700 dark:bg-red-600/20 dark:text-red-400 border border-red-200 dark:border-red-500/40';
            default:
                return 'bg-slate-50 text-slate-700 dark:bg-zinc-700/50 dark:text-zinc-400 border border-slate-200 dark:border-zinc-600';
        }
    };

    return (
        <div className={`flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 rounded-xl border-2 bg-slate-50 dark:bg-slate-800 ${getBorderColor()} hover:shadow-lg transition-all hover:scale-[1.01]`}>
            {/* Linha 1: Nome e DN | Status */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex flex-col gap-1 flex-1">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold wrap-break-word text-blue-600 dark:text-blue-400">{patient.name}</p>
                    <div className="flex gap-3 flex-wrap text-sm sm:text-base font-medium">
                        <p className="text-slate-600 dark:text-slate-400">DN: {formatDate(patient.dob)}</p>
                        <p className="text-slate-600 dark:text-slate-400">Leito {patient.bed_number}</p>
                    </div>
                    {patient.local_transferencia && (
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full px-2.5 py-0.5">
                                📍 Transferência: {patient.local_transferencia}
                            </span>
                        </div>
                    )}
                    {precaucoes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {precaucoes.map((nome) => (
                                <span
                                    key={nome}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-semibold border border-orange-200 dark:border-orange-700/50"
                                >
                                    {nome}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className={`inline-flex items-center rounded-full px-4 py-2 text-sm sm:text-base font-bold shrink-0 ${getStatusColor()}`}>
                    {patient.status === 'estavel' && 'Estável'}
                    {patient.status === 'instavel' && 'Instável'}
                    {patient.status === 'em_risco' && 'Em Risco'}
                </div>
            </div>

            {/* Passagem */}
            {ultimaPassagem && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex-wrap">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                    <span>{ultimaPassagem.profissional?.name || '—'}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>transfer_within_a_station</span>
                    <span>{ultimaPassagem.medico?.name || '—'}</span>
                    {ultimaPassagem.turno && (
                        <span className="text-emerald-400 dark:text-emerald-500">· {ultimaPassagem.turno}</span>
                    )}
                    {ultimaPassagem.tipo === 'Colega de plantão' && (
                        <span className="px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-semibold">Colega de plantão</span>
                    )}
                    <span className="text-emerald-400 dark:text-emerald-500">— {formatPassagemTime(ultimaPassagem.created_at)}</span>
                </div>
            )}

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button 
                    className="flex-1 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer relative z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectPatient(patient);
                    }}
                    type="button"
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>Novo SBAR</span>
                </button>
                <button 
                    className="flex-1 h-10 px-4 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-100 text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer relative z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectHistory(patient);
                    }}
                    type="button"
                >
                    <span className="material-symbols-outlined text-base">history</span>
                    <span>Histórico</span>
                </button>
            </div>
        </div>
    );
};

export default PatientCard;