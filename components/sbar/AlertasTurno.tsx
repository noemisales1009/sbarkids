import React, { useState } from 'react';
import { Alerta } from '../../services/alertasService';
import { ClinicalRoundsSimple } from '../../services/clinicalRoundsSimpleService';
import AlertaCard from './AlertaCard';

type ShiftKey = 'morning' | 'afternoon' | 'night';

interface ShiftConfig {
  key: ShiftKey;
  label: string;
  icon: string;
  timeRange: string;
  badgeColor: string;
  borderColor: string;
}

const SHIFT_CONFIGS: ShiftConfig[] = [
  { key: 'morning', label: 'Manhã', icon: '🌅', timeRange: '07:00 - 13:00', badgeColor: 'bg-orange-500', borderColor: 'border-l-orange-500' },
  { key: 'afternoon', label: 'Tarde', icon: '☀️', timeRange: '13:00 - 19:00', badgeColor: 'bg-yellow-500', borderColor: 'border-l-yellow-500' },
  { key: 'night', label: 'Noite', icon: '🌙', timeRange: '19:00 - 07:00', badgeColor: 'bg-indigo-500', borderColor: 'border-l-indigo-500' },
];

interface AlertasTurnoProps {
  alertasPorTurno: Record<ShiftKey, Alerta[]>;
  assessment: ClinicalRoundsSimple | null;
  onJustificar: (alertaId: string) => void;
  onConcluir: (alertaId: string) => void;
  onArquivar: (alertaId: string) => void;
}

const AssessmentPanel: React.FC<{
  shift: ShiftKey;
  assessment: ClinicalRoundsSimple;
}> = ({ shift, assessment }) => {
  const content = assessment[`assessment_${shift}` as keyof ClinicalRoundsSimple] as string | null;
  const savedBy = assessment[`assessment_${shift}_saved_by_name` as keyof ClinicalRoundsSimple] as string | null;
  const savedAt = assessment[`assessment_${shift}_saved_at` as keyof ClinicalRoundsSimple] as string | null;

  if (!content) return null;

  return (
    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <p className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">📝 Avaliação (Assessment)</p>
      <p className="text-sm text-gray-900 dark:text-white mb-2 whitespace-pre-wrap">{content}</p>
      {savedBy && (
        <div className="text-xs text-gray-600 dark:text-gray-400 border-t border-blue-200 dark:border-blue-800 pt-2">
          <span>💾 Salvo por: <strong>{savedBy}</strong></span>
          {savedAt && (
            <span className="block">
              🕐 Em: {new Date(savedAt).toLocaleString('pt-BR')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const getCurrentShift = (): ShiftKey => {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 13) return 'morning';
  if (hour >= 13 && hour < 19) return 'afternoon';
  return 'night';
};

const AlertasTurno: React.FC<AlertasTurnoProps> = ({
  alertasPorTurno,
  assessment,
  onJustificar,
  onConcluir,
  onArquivar,
}) => {
  const [activeShift, setActiveShift] = useState<ShiftKey>(getCurrentShift());
  const activeConfig = SHIFT_CONFIGS.find(s => s.key === activeShift)!;
  const alertasAtivos = alertasPorTurno[activeShift];

  return (
    <div>
      <div role="tablist" className="flex border-b border-slate-700 mb-4">
        {SHIFT_CONFIGS.map((shift) => {
          const count = alertasPorTurno[shift.key].length;
          const isActive = shift.key === activeShift;
          return (
            <button
              key={shift.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveShift(shift.key)}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center justify-center gap-2 ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span>{shift.icon}</span>
              <span>{shift.label}</span>
              {count > 0 && (
                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full ${shift.badgeColor} text-white text-xs font-bold`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        <div className="text-xs text-slate-400 mb-3">
          {activeConfig.icon} {activeConfig.label} · {activeConfig.timeRange}
        </div>

        {assessment && <AssessmentPanel shift={activeShift} assessment={assessment} />}

        {alertasAtivos.length === 0 ? (
          <p className="text-sm text-center py-6 text-gray-500 dark:text-gray-400">
            ✓ Nenhum alerta neste turno
          </p>
        ) : (
          <div className="space-y-2">
            {alertasAtivos.map((alerta) => (
              <AlertaCard
                key={alerta.id_alerta}
                alerta={alerta}
                borderColorClass={activeConfig.borderColor}
                onJustificar={onJustificar}
                onConcluir={onConcluir}
                onArquivar={onArquivar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertasTurno;
