import React from 'react';
import { Patient } from '../../types';

interface PatientInfoHeaderProps {
    patient: Patient;
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

const PatientInfoHeader: React.FC<PatientInfoHeaderProps> = ({ patient }) => {
    const age = calculateAge(patient.dob);
    const daysAdmitted = calculateDaysAdmitted(patient.dt_internacao);

    return (
        <section className="sticky top-16 z-40 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800 px-4 py-6 border-b border-blue-500 dark:border-blue-700">
            <div className="max-w-6xl mx-auto">
                {/* Nome e Leito em destaque */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                        <h1 className="text-white text-3xl sm:text-4xl font-bold leading-tight">{patient.name}</h1>
                        <p className="text-blue-100 text-sm mt-1">Paciente internado</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg px-6 py-3 ml-4">
                        <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase">Leito</p>
                        <p className="text-blue-600 dark:text-blue-400 text-3xl font-bold">{patient.bed_number}</p>
                    </div>
                </div>

                {/* Grid de informações */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Idade */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                        <p className="text-blue-100 text-xs font-semibold uppercase mb-1">Idade</p>
                        <p className="text-white text-xl font-bold">{age} <span className="text-sm font-normal">anos</span></p>
                    </div>

                    {/* Dias de Internação */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                        <p className="text-blue-100 text-xs font-semibold uppercase mb-1">Dias Int.</p>
                        <p className="text-white text-xl font-bold">{daysAdmitted} <span className="text-sm font-normal">dias</span></p>
                    </div>

                    {/* Data de Nascimento */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                        <p className="text-blue-100 text-xs font-semibold uppercase mb-1">Nasc.</p>
                        <p className="text-white text-sm font-bold truncate">{formatDate(patient.dob)}</p>
                    </div>

                    {/* Data de Admissão */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                        <p className="text-blue-100 text-xs font-semibold uppercase mb-1">Admissão</p>
                        <p className="text-white text-sm font-bold truncate">{formatDate(patient.dt_internacao)}</p>
                    </div>
                </div>

                {/* Mãe - Full width */}
                {patient.mother_name && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20 mt-3">
                        <p className="text-blue-100 text-xs font-semibold uppercase mb-1">Mãe</p>
                        <p className="text-white text-base font-semibold">{patient.mother_name}</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PatientInfoHeader;