import React from 'react';
import { Alerta } from '../../services/alertasService';
import { getStatusColor, getStatusBadgeColor, getStatusLabel } from '../sbar/AlertaCard';

interface HistoryTimelineProps {
  date: string;
  items: Alerta[];
}

const getShiftBorderColor = (createdAt: string | undefined): string => {
  if (!createdAt) return 'border-l-gray-400';
  const hour = new Date(createdAt).getHours();
  if (hour >= 7 && hour < 13) return 'border-l-orange-500';
  if (hour >= 13 && hour < 19) return 'border-l-yellow-500';
  return 'border-l-indigo-500';
};

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ date, items }) => {
  return (
    <div className="mb-6">
      <h3 className="text-gray-400 text-sm font-medium mb-3">
        {date}
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id_alerta}
            className={`p-4 rounded-lg border-l-4 ${getStatusColor(item.live_status)} ${getShiftBorderColor(item.created_at)}`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-lg">🔔</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white break-word">
                    {item.alertaclinico}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadgeColor(item.live_status)}`}
                >
                  {getStatusLabel(item.live_status)}
                </span>
              </div>
            </div>

            {item.justificativa && item.justificativa.trim() !== '' && (
              <div className="mt-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Justificativa:</strong> {item.justificativa}
                </p>
              </div>
            )}

            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Criado por: <strong>{item.created_by_name}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryTimeline;
