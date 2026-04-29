import React from 'react';
import { Patient } from '../../types';

interface PatientHeaderCardProps {
  patient: Patient;
  onBack: () => void;
}

const calcAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const calcAdmissionDays = (dtInternacao: string | null | undefined): string => {
  if (!dtInternacao) return '0 dias';
  const admissionDate = new Date(dtInternacao + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24));
  const days = diff >= 0 ? diff : 0;
  return `${days} ${days === 1 ? 'dia' : 'dias'}`;
};

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
    <p className="text-blue-400 text-xs mb-1">{label}</p>
    <p className="text-gray-900 dark:text-white text-sm font-semibold truncate">{value}</p>
  </div>
);

const PatientHeaderCard: React.FC<PatientHeaderCardProps> = ({ patient, onBack }) => (
  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h1 className="text-gray-900 dark:text-white text-2xl font-bold">{patient.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Leito {patient.bed_number}</p>
      </div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 text-sm transition-colors"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Voltar
      </button>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <Field label="Idade" value={`${calcAge(patient.dob)} anos`} />
      <Field label="Dias Int." value={calcAdmissionDays(patient.dt_internacao)} />
      <Field label="Nascimento" value={new Date(patient.dob).toLocaleDateString('pt-BR')} />
      <Field
        label="Admissão"
        value={patient.dt_internacao ? new Date(patient.dt_internacao).toLocaleDateString('pt-BR') : '-'}
      />
      <Field label="Peso" value={patient.peso ? `${patient.peso} kg` : '-'} />
      <Field label="Mãe" value={patient.mother_name || '-'} />
    </div>
  </div>
);

export default PatientHeaderCard;
