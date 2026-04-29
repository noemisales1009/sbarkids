import React from 'react';
import { Medicacao } from '../../../../services/backgroundService';
import { calculateDaysOfUsage } from '../../../../utils/backgroundDateHelpers';
import TabContent from '../TabContent';

interface Props {
  medicacoes: Medicacao[];
}

const MedicacoesTab: React.FC<Props> = ({ medicacoes }) => (
  <TabContent
    title="Medicações"
    isEmpty={medicacoes.length === 0}
    emptyMessage="Nenhuma medicação registrada"
  >
    <div className="space-y-2">
      {medicacoes.map((med) => {
        const temFim = med.data_fim && new Date(med.data_fim).getTime() > 0;
        return (
          <div
            key={med.id}
            className={`p-3 border rounded-lg ${
              temFim
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800'
            }`}
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{med.nome_medicacao}</p>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {med.dosagem_valor} {med.unidade_medida}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Início:{' '}
              {med.data_inicio.includes('-')
                ? new Date(med.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')
                : med.data_inicio}
            </p>
            {temFim ? (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 font-semibold">
                Fim:{' '}
                {med.data_fim ? new Date(med.data_fim + 'T00:00:00').toLocaleDateString('pt-BR') : ''}
              </p>
            ) : (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold">
                ✓ {calculateDaysOfUsage(med.data_inicio)} dia
                {calculateDaysOfUsage(med.data_inicio) !== 1 ? 's' : ''} de uso
              </p>
            )}
            {med.observacao && (
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-2 italic">{med.observacao}</p>
            )}
          </div>
        );
      })}
    </div>
  </TabContent>
);

export default MedicacoesTab;
