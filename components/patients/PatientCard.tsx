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
                return 'border-green-500 bg-green-50 dark:bg-green-950/20';
            case 'instavel':
                return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
            case 'em_risco':
                return 'border-red-500 bg-red-50 dark:bg-red-950/20';
            default:
                return 'border-zinc-200 dark:border-zinc-700';
        }
    };

    const getStatusColor = () => {
        switch (patient.status) {
            case 'estavel':
                return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 border border-green-300 dark:border-green-600';
            case 'instavel':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-600';
            case 'em_risco':
                return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 border border-red-300 dark:border-red-600';
            default:
                return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100';
        }
    };

    return (
        <div className={`flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 rounded-xl border-2 bg-gray-800/50 dark:bg-gray-900/80 ${getBorderColor()} hover:shadow-md transition-shadow`}>
            {/* Linha 1: Nome e DN | Status */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex flex-col gap-1 flex-1">
                    <p className="text-zinc-900 dark:text-white text-lg sm:text-xl lg:text-2xl font-bold wrap-break-word">{patient.name}</p>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base font-medium">DN: {formatDate(patient.dob)}</p>
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
                    className="flex-1 flex items-center justify-center gap-2 h-9 sm:h-10 lg:h-11 px-3 sm:px-4 rounded-lg text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#13A4EC' }}
                    onClick={() => onSelectPatient(patient)}
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span className="hidden sm:inline">Novo SBAR</span>
                </button>
                <button 
                    className="flex-1 flex items-center justify-center gap-2 h-9 sm:h-10 lg:h-11 px-3 sm:px-4 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs sm:text-sm font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                    onClick={() => onSelectHistory(patient)}
                >
                    <span className="material-symbols-outlined text-lg">history</span>
                    <span className="hidden sm:inline">Histórico</span>
                </button>
            </div>
        </div>
    );
};

export default PatientCard;