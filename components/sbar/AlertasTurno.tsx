import React from 'react';
import { Alerta } from '../../services/alertasService';
import { ClinicalRoundsSimple } from '../../services/clinicalRoundsSimpleService';
import AlertaCard from './AlertaCard';

interface ShiftConfig {
  key: 'morning' | 'afternoon' | 'night';
  label: string;
  icon: string;
  timeRange: string;
  badgeColor: string;
  borderColor: string;
}

const SHIFT_CONFIGS: ShiftConfig[] = [
  { key: 'morning', label: 'Manhã', icon: '🌅', timeRange: '7:01 - 13:00', badgeColor: 'bg-orange-500', borderColor: 'border-l-orange-500' },
  { key: 'afternoon', label: 'Tarde', icon: '☀️', timeRange: '13:01 - 19:00', badgeColor: 'bg-yellow-500', borderColor: 'border-l-yellow-500' },
  { key: 'night', label: 'Noite', icon: '🌙', timeRange: '19:01 - 07:00', badgeColor: 'bg-indigo-500', borderColor: 'border-l-indigo-500' },
];

interface AlertasTurnoProps {
  alertasPorTurno: Record<'morning' | 'afternoon' | 'night', Alerta[]>;
  assessment: ClinicalRoundsSimple | null;
  onJustificar: (alertaId: string) => void;
  onConcluir: (alertaId: string) => void;
  onArquivar: (alertaId: string) => void;
}

const AssessmentPanel: React.FC<{
  shift: 'morning' | 'afternoon' | 'night';
  assessment: ClinicalRoundsSimple;
}> = ({ shift, assessment }) => {
  const content = assessment[`assessment_${shift}` as keyof ClinicalRoundsSimple] as string | null;
  const savedBy = assessment[`assessment_${shift}_saved_by_name` as keyof ClinicalRoundsSimple] as string | null;
  const savedAt = assessment[`assessment_${shift}_saved_at` as keyof ClinicalRoundsSimple] as string | null;

  if (!content) return null;

  return (
    <div className="mb-3 ml-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
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

const AlertasTurno: React.FC<AlertasTurnoProps> = ({
  alertasPorTurno,
  assessment,
  onJustificar,
  onConcluir,
  onArquivar,
}) => {
  return (
    <div className="space-y-4">
      {SHIFT_CONFIGS.map((shift) => (
        <div key={shift.key}>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            {shift.icon} {shift.label} ({shift.timeRange})
            {alertasPorTurno[shift.key].length > 0 && (
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full ${shift.badgeColor} text-white text-xs font-semibold`}>
                {alertasPorTurno[shift.key].length}
              </span>
            )}
          </h4>

          {assessment && <AssessmentPanel shift={shift.key} assessment={assessment} />}

          {alertasPorTurno[shift.key].length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-6">Nenhum alerta neste turno</p>
          ) : (
            <div className="space-y-2">
              {alertasPorTurno[shift.key].map((alerta) => (
                <AlertaCard
                  key={alerta.id_alerta}
                  alerta={alerta}
                  borderColorClass={shift.borderColor}
                  onJustificar={onJustificar}
                  onConcluir={onConcluir}
                  onArquivar={onArquivar}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AlertasTurno;
