import React from 'react';
import { Patient } from '../../types';

interface PatientInfoHeaderProps {
    patient: Patient;
    onBack?: () => void;
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
    
    try {
        const admissionDate = new Date(dt_internacao + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas datas
        
        const diffTime = today.getTime() - admissionDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays >= 0 ? diffDays : 0;
    } catch (error) {
        console.error('Erro ao calcular dias de internação:', error);
        return 0;
    }
};

const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
};

const PatientInfoHeader: React.FC<PatientInfoHeaderProps> = ({ patient, onBack }) => {
    const age = calculateAge(patient.dob);
    const daysAdmitted = calculateDaysAdmitted(patient.dt_internacao);
    
    // Debug: verificar os valores
    console.log('📅 Data de internação:', patient.dt_internacao, '| Dias:', daysAdmitted);

    return (
        <section className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-blue-900 to-blue-800 px-4 py-3 border-b border-blue-700">
            <div className="max-w-6xl mx-auto">
                {/* Botão voltar e nome da página */}
                <div className="flex items-center gap-3 mb-2">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/30 hover:bg-blue-500/50 transition-colors"
                            aria-label="Voltar"
                        >
                            <span className="material-symbols-outlined text-white text-xl">arrow_back</span>
                        </button>
                    )}
                    <h2 className="text-blue-100 text-sm font-semibold uppercase">Novo Relatório SBAR</h2>
                </div>

                {/* Nome e Leito em destaque */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                        <h1 className="text-white text-2xl sm:text-3xl font-bold leading-tight drop-shadow-lg">{patient.name}</h1>
                        <p className="text-blue-100 text-xs mt-1 drop-shadow">Paciente internado</p>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-2 ml-4 shadow-md">
                        <p className="text-gray-700 text-xs font-semibold uppercase">Leito</p>
                        <p className="text-gray-900 text-2xl font-bold">{patient.bed_number}</p>
                    </div>
                </div>

                {/* Grid de informações */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {/* Idade */}
                    <div className="bg-blue-800/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-blue-400/30 shadow-md">
                        <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#14A4EC' }}>Idade</p>
                        <p className="text-sm font-bold" style={{ color: '#14A4EC' }}>{age} <span className="text-xs font-normal">anos</span></p>
                    </div>

                    {/* Dias de Internação */}
                    <div className="bg-blue-800/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-blue-400/30 shadow-md">
                        <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#14A4EC' }}>Dias Int.</p>
                        <p className="text-sm font-bold" style={{ color: '#14A4EC' }}>{daysAdmitted} <span className="text-xs font-normal">dias</span></p>
                    </div>

                    {/* Data de Nascimento */}
                    <div className="bg-blue-800/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-blue-400/30 shadow-md">
                        <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#14A4EC' }}>Nasc.</p>
                        <p className="text-xs font-bold truncate" style={{ color: '#14A4EC' }}>{formatDate(patient.dob)}</p>
                    </div>

                    {/* Data de Admissão */}
                    <div className="bg-blue-800/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-blue-400/30 shadow-md">
                        <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#14A4EC' }}>Admissão</p>
                        <p className="text-xs font-bold truncate" style={{ color: '#14A4EC' }}>{formatDate(patient.dt_internacao)}</p>
                    </div>

                    {/* Peso */}
                    <div className="bg-blue-800/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-blue-400/30 shadow-md">
                        <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#14A4EC' }}>Peso</p>
                        <p className="text-sm font-bold" style={{ color: '#14A4EC' }}>{patient.peso || '-'} <span className="text-xs font-normal">kg</span></p>
                    </div>

                    {/* Mãe */}
                    <div className="bg-blue-800/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-blue-400/30 shadow-md">
                        <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#14A4EC' }}>Mãe</p>
                        <p className="text-xs font-bold truncate" style={{ color: '#14A4EC' }}>{patient.mother_name || '-'}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PatientInfoHeader;