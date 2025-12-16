import React from 'react';
import { Patient } from '../../types';

interface PatientHeaderProps {
  patient: Patient;
}

/**
 * Calcula a idade baseado na data de nascimento
 */
const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

/**
 * Calcula dias de internação
 */
const calculateDaysAdmitted = (dtInternacao: string | null): number => {
  if (!dtInternacao) return 0;

  const admissionDate = new Date(dtInternacao);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - admissionDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Cabeçalho com identificação rápida do paciente
 */
const PatientRoundHeader: React.FC<PatientHeaderProps> = ({ patient }) => {
  const age = calculateAge(patient.dob);
  const daysAdmitted = calculateDaysAdmitted(patient.dt_internacao);
  const birthDateFormatted = new Date(patient.dob).toLocaleDateString('pt-BR');

  return (
    <div className="bg-white dark:bg-slate-900/70 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Nome */}
        <div className="col-span-2 sm:col-span-2">
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Paciente
          </p>
          <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
            {patient.name}
          </p>
        </div>

        {/* Leito */}
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Leito
          </p>
          <p className="text-lg sm:text-xl font-bold text-primary">
            {patient.bed_number}
          </p>
        </div>

        {/* Idade */}
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Idade
          </p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {age}a
          </p>
        </div>

        {/* Mãe */}
        <div className="col-span-2">
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Mãe
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {patient.mother_name || 'Não informado'}
          </p>
        </div>

        {/* Data de Nascimento */}
        <div className="col-span-2">
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Data Nasc.
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {birthDateFormatted}
          </p>
        </div>

        {/* Dias de Internação */}
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            D.I.
          </p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {daysAdmitted}d
          </p>
        </div>

        {/* Peso */}
        {patient.peso && (
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Peso
            </p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {patient.peso}kg
            </p>
          </div>
        )}
      </div>

      {/* Diagnóstico Principal */}
      {patient.diagnosis && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
            Diagnóstico Principal
          </p>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
            {patient.diagnosis}
          </p>
        </div>
      )}

      {/* Comorbidades */}
      {patient.comorbidade && (
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-900">
          <p className="text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
            Comorbidades
          </p>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-300">
            {patient.comorbidade}
          </p>
        </div>
      )}
    </div>
  );
};

export default PatientRoundHeader;
