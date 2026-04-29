import React from 'react';
import { Alerta } from '../../services/alertasService';
import { GlobalReportItem } from '../../types/reports';

interface ReportCardProps {
  item: GlobalReportItem;
  isSelected: boolean;
  alertas: Alerta[];
  onToggle: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ item, isSelected, alertas, onToggle }) => {
  const shiftsWithAssessment = (
    ['morning', 'afternoon', 'night'] as const
  ).filter((s) => item.assessment[s]);

  const shiftsWithRecommendation = (
    ['morning', 'afternoon', 'night'] as const
  ).filter((s) => item.recommendation[s]);

  const shiftLabels: Record<string, string> = {
    morning: 'manhã',
    afternoon: 'tarde',
    night: 'noite',
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="rounded border-gray-300 text-primary focus:ring-primary size-5 mt-1"
      />
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{item.patient.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Leito: {item.patient.bed_number} | Status: {item.status}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              item.status === 'Urgente'
                ? 'bg-yellow-100 text-yellow-800'
                : item.status === 'Atenção'
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {item.status}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {item.datetime} | Médico: {item.author}
        </p>

        <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
          {shiftsWithAssessment.length > 0 && (
            <p className="mb-1">
              <span className="font-semibold">Avaliação:</span>{' '}
              Registros em {shiftsWithAssessment.map((s) => shiftLabels[s]).join(', ')}
            </p>
          )}
          {shiftsWithRecommendation.length > 0 && (
            <p>
              <span className="font-semibold">Recomendação:</span>{' '}
              Registros em {shiftsWithRecommendation.map((s) => shiftLabels[s]).join(', ')}
            </p>
          )}
        </div>

        {alertas.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
              🔔 Alertas Clínicos ({alertas.length})
            </p>
            <div className="space-y-2">
              {alertas.slice(0, 5).map((alerta: any) => {
                const status = (alerta.live_status || alerta.status || '').toLowerCase();
                const borderColor =
                  status === 'fora_do_prazo'
                    ? 'border-l-red-500'
                    : status === 'concluido' || status === 'resolvido'
                    ? 'border-l-green-500'
                    : 'border-l-yellow-500';
                const badgeStyle =
                  status === 'fora_do_prazo'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : status === 'concluido' || status === 'resolvido'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';

                return (
                  <div
                    key={alerta.id_alerta}
                    className={`p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 border-l-4 ${borderColor}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white flex-1">
                        {alerta.alertaclinico}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${badgeStyle}`}>
                        {(alerta.status || '').replace('_', ' ') || 'ativo'}
                      </span>
                    </div>
                    {alerta.justificativa?.trim() && (
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 italic">
                        <strong>Justificativa:</strong> {alerta.justificativa}
                      </p>
                    )}
                  </div>
                );
              })}
              {alertas.length > 5 && (
                <p className="text-[11px] text-gray-500 italic text-center pt-1">
                  + {alertas.length - 5} outros alerta(s)
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
