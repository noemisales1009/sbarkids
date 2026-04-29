import React from 'react';
import { ScaleScore } from '../../../../services/scalesService';
import TabContent from '../TabContent';

interface Props {
  scaleScores: ScaleScore[];
}

const EscalasTab: React.FC<Props> = ({ scaleScores }) => (
  <TabContent
    title="Escalas"
    isEmpty={scaleScores.length === 0}
    emptyMessage="Nenhuma escala registrada"
  >
    <div className="space-y-2">
      {scaleScores.map((scale) => (
        <div
          key={scale.id}
          className="p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg space-y-2"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{scale.scale_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(scale.date).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </p>
          </div>
          <div className="bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 rounded-lg p-3">
            <div className="text-center">
              <p className="text-xs text-violet-500 dark:text-violet-400 mb-1">Score</p>
              <p className="text-2xl font-bold text-violet-900 dark:text-white">{scale.score}</p>
              <p className="text-xs text-violet-600 dark:text-violet-300 font-medium mt-1">
                {scale.interpretation}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </TabContent>
);

export default EscalasTab;
