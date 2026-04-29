import React from 'react';
import { Cultura } from '../../../../services/backgroundService';
import TabContent from '../TabContent';

interface Props {
  culturas: Cultura[];
}

const CulturasTab: React.FC<Props> = ({ culturas }) => (
  <TabContent
    title="Culturas"
    isEmpty={culturas.length === 0}
    emptyMessage="Nenhuma cultura registrada"
  >
    <div className="space-y-2">
      {culturas.map((cult) => (
        <div
          key={cult.id}
          className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg"
        >
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{cult.microorganismo}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Local: {cult.local}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Coletado em: {new Date(cult.data_coleta).toLocaleDateString('pt-BR')}
          </p>
          {cult.observacao && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 italic">{cult.observacao}</p>
          )}
        </div>
      ))}
    </div>
  </TabContent>
);

export default CulturasTab;
