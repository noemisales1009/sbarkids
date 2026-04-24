import React from 'react';
import { Alerta } from '../../services/alertasService';

interface AlertaCardProps {
  alerta: Alerta;
  borderColorClass?: string;
  onJustificar: (alertaId: string) => void;
  onConcluir: (alertaId: string) => void;
  onArquivar: (alertaId: string) => void;
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'concluido':
    case 'Concluído':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    case 'fora_do_prazo':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    default:
      return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  }
};

export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'concluido':
    case 'Concluído':
      return 'bg-green-500 text-white';
    case 'fora_do_prazo':
      return 'bg-red-500 text-white';
    default:
      return 'bg-yellow-500 text-white';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'concluido':
      return '✓ Concluído';
    case 'fora_do_prazo':
      return '⚠ Fora do prazo';
    default:
      return '⏳ No prazo';
  }
};

const AlertaCard: React.FC<AlertaCardProps> = ({
  alerta,
  borderColorClass = 'border-l-gray-400',
  onJustificar,
  onConcluir,
  onArquivar,
}) => {
  return (
    <div
      className={`p-3 sm:p-4 rounded-lg border-l-4 ml-2 sm:ml-4 ${getStatusColor(alerta.live_status)} ${borderColorClass}`}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-4 mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-white text-lg">🔔</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white break-word">
              {alerta.alertaclinico}
            </p>
            {alerta.sistemas && alerta.sistemas.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {alerta.sistemas.map((s) => (
                  <span
                    key={s}
                    className="inline-block px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <span
            className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadgeColor(alerta.live_status)}`}
          >
            {getStatusLabel(alerta.live_status)}
          </span>
        </div>
      </div>

      {alerta.justificativa && (
        <div className="mt-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            <strong>Justificativa:</strong> {alerta.justificativa}
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => onJustificar(alerta.id_alerta)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center gap-1 sm:gap-2"
        >
          📝 Justificar
        </button>
        <button
          onClick={() => onConcluir(alerta.id_alerta)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors flex items-center gap-1 sm:gap-2"
        >
          ✓ Concluir
        </button>
        <button
          onClick={() => onArquivar(alerta.id_alerta)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium transition-colors flex items-center gap-1 sm:gap-2"
        >
          📦 Arquivar
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Criado por: <strong>{alerta.created_by_name}</strong>
      </div>
    </div>
  );
};

export default AlertaCard;
