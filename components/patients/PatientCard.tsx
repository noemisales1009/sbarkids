import React from 'react';
import { Patient } from '../../types';
import { PATIENT_STATUS_COLORS } from '../../utils/constants';

interface PatientCardProps {
    patient: Patient;
    onSelectPatient: (patient: Patient) => void;
    onSelectHistory: (patient: Patient) => void;
}

const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob); // YYYY-MM-DD format
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const calculateDaysAdmitted = (dt_internacao: string | null): number => {
    if (!dt_internacao) return 0;
    const admissionDate = new Date(dt_internacao);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - admissionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
};

const PatientCard: React.FC<PatientCardProps> = ({ patient, onSelectPatient, onSelectHistory }) => {
    const age = calculateAge(patient.dob);
    const daysAdmitted = calculateDaysAdmitted(patient.dt_internacao);

    // Determinar cor da borda baseada no status
    const getBorderColor = () => {
        switch (patient.status) {
            case 'estavel':
                return 'border-emerald-400 dark:border-emerald-500';
            case 'instavel':
                return 'border-amber-400 dark:border-amber-500';
            case 'em_risco':
                return 'border-red-400 dark:border-red-500';
            default:
                return 'border-slate-300 dark:border-slate-700';
        }
    };

    const getStatusColor = () => {
        switch (patient.status) {
            case 'estavel':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40';
            case 'instavel':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-600/20 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40';
            case 'em_risco':
                return 'bg-red-100 text-red-700 dark:bg-red-600/20 dark:text-red-400 border border-red-300 dark:border-red-500/40';
            default:
                return 'bg-slate-100 text-slate-700 dark:bg-zinc-700/50 dark:text-zinc-400 border border-slate-300 dark:border-zinc-600';
        }
    };

    return (
        <div className={`flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 rounded-xl border-2 bg-white dark:bg-slate-800 ${getBorderColor()} hover:shadow-lg transition-all hover:scale-[1.01]`}>
            {/* Linha 1: Nome e DN | Status */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex flex-col gap-1 flex-1">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold wrap-break-word text-blue-600 dark:text-blue-400">{patient.name}</p>
                    <div className="flex gap-3 flex-wrap text-sm sm:text-base font-medium">
                        <p className="text-slate-600 dark:text-slate-400">DN: {formatDate(patient.dob)}</p>
                        <p className="text-slate-600 dark:text-slate-400">Leito {patient.bed_number}</p>
                    </div>
                </div>
                
                <div className={`inline-flex items-center rounded-full px-4 py-2 text-sm sm:text-base font-bold shrink-0 ${getStatusColor()}`}>
                    {patient.status === 'estavel' && '✓ Estável'}
                    {patient.status === 'instavel' && '⚠ Instável'}
                    {patient.status === 'em_risco' && '⚡ Em Risco'}
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button 
                    className="flex-1 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    onClick={() => onSelectPatient(patient)}
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>Novo SBAR</span>
                </button>
                <button 
                    className="flex-1 h-10 px-4 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-100 text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    onClick={() => onSelectHistory(patient)}
                >
                    <span className="material-symbols-outlined text-base">history</span>
                    <span>Histórico</span>
                </button>
            </div>
        </div>
    );
};

export default PatientCard;