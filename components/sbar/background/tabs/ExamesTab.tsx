import React from 'react';
import { Exame } from '../../../../services/backgroundService';
import TabContent from '../TabContent';

interface Props {
  exames: Exame[];
}

const ExamesTab: React.FC<Props> = ({ exames }) => (
  <TabContent
    title="Exames"
    isEmpty={exames.length === 0}
    emptyMessage="Nenhum exame registrado"
  >
    <div className="space-y-2">
      {exames.map((exame) => (
        <div
          key={exame.id}
          className="p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg"
        >
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{exame.nome_exame}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Data: {new Date(exame.data_exame).toLocaleDateString('pt-BR')}
          </p>
          {exame.observacao && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 italic">{exame.observacao}</p>
          )}
        </div>
      ))}
    </div>
  </TabContent>
);

export default ExamesTab;
