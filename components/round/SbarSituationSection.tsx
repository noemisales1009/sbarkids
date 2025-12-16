import React, { useState } from 'react';
import { SbarSituation, PatientStatus, SupportType } from '../../types';

interface SbarSituationSectionProps {
  value: SbarSituation;
  onValueChange: (value: SbarSituation) => void;
  isReadOnly?: boolean;
}

const statusOptions: PatientStatus[] = ['estavel', 'instavel', 'em_risco'];
const statusLabels: Record<PatientStatus, string> = {
  estavel: 'Estável',
  instavel: 'Instável',
  em_risco: 'Em Risco',
};

const statusColors: Record<PatientStatus, string> = {
  estavel: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  instavel: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
  em_risco: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
};

const supportOptions: SupportType[] = ['VM', 'VNI', 'O2'];

const SbarSituationSection: React.FC<SbarSituationSectionProps> = ({
  value,
  onValueChange,
  isReadOnly = false,
}) => {
  const [secondaryDiagnosis, setSecondaryDiagnosis] = useState(value.diagnosis_secundarios.join(', '));

  const handleStatusChange = (newStatus: PatientStatus) => {
    onValueChange({
      ...value,
      status_atual: newStatus,
    });
  };

  const handleSupportToggle = (support: SupportType) => {
    const newSupports = value.suportes_vigentes.includes(support)
      ? value.suportes_vigentes.filter((s) => s !== support)
      : [...value.suportes_vigentes, support];

    onValueChange({
      ...value,
      suportes_vigentes: newSupports,
    });
  };

  const handleSecondaryDiagnosisChange = (text: string) => {
    setSecondaryDiagnosis(text);
    onValueChange({
      ...value,
      diagnosis_secundarios: text.split(',').map((d) => d.trim()).filter((d) => d),
    });
  };

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800">
        <p className="text-gray-900 dark:text-white text-base sm:text-lg font-semibold">
          S - Situação Atual
        </p>
      </div>

      <div className="p-3 sm:p-4 space-y-4">
        {/* Diagnóstico Principal */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Diagnóstico Principal
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            placeholder="Ex: Pneumonia bacteriana"
            value={value.diagnosis_principal}
            onChange={(e) =>
              onValueChange({
                ...value,
                diagnosis_principal: e.target.value,
              })
            }
            disabled={isReadOnly}
          />
        </div>

        {/* Diagnósticos Secundários */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Diagnósticos Secundários (separados por vírgula)
          </label>
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none min-h-20"
            placeholder="Ex: Sepse, Insuficiência renal"
            value={secondaryDiagnosis}
            onChange={(e) => handleSecondaryDiagnosisChange(e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        {/* Status Atual */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Status Atual
          </label>
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  value.status_atual === status
                    ? statusColors[status]
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                disabled={isReadOnly}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Suportes Vigentes */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Suportes Vigentes
          </label>
          <div className="flex gap-2 flex-wrap">
            {supportOptions.map((support) => (
              <label
                key={support}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors"
                style={{
                  borderColor: value.suportes_vigentes.includes(support) ? '#3b82f6' : '#d1d5db',
                  backgroundColor: value.suportes_vigentes.includes(support)
                    ? 'rgba(59, 130, 246, 0.1)'
                    : 'transparent',
                }}
              >
                <input
                  type="checkbox"
                  checked={value.suportes_vigentes.includes(support)}
                  onChange={() => handleSupportToggle(support)}
                  disabled={isReadOnly}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{support}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Drogas Vasoativas */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Drogas Vasoativas
          </label>
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none min-h-24"
            placeholder="Ex: Dobutamina 5mcg/kg/min, Noradrenalina 0,1mcg/kg/min"
            value={value.drogas_vasoativas}
            onChange={(e) =>
              onValueChange({
                ...value,
                drogas_vasoativas: e.target.value,
              })
            }
            disabled={isReadOnly}
          />
        </div>

        {/* Sedoanalgesia */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Sedoanalgesia
          </label>
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none min-h-24"
            placeholder="Ex: Midazolam 0,1mg/kg/h, Fentanil 2mcg/kg/h"
            value={value.sedoanalgesia}
            onChange={(e) =>
              onValueChange({
                ...value,
                sedoanalgesia: e.target.value,
              })
            }
            disabled={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
};

export default SbarSituationSection;
