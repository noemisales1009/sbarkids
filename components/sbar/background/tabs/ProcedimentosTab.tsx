import React from 'react';
import { Procedimento } from '../../../../services/backgroundService';
import { calculateDaysOfUsage } from '../../../../utils/backgroundDateHelpers';
import TabContent from '../TabContent';

interface Props {
  procedimentos: Procedimento[];
}

const ProcedimentosTab: React.FC<Props> = ({ procedimentos }) => (
  <TabContent
    title="Procedimentos"
    isEmpty={procedimentos.length === 0}
    emptyMessage="Nenhum procedimento registrado"
  >
    <div className="space-y-2">
      {procedimentos.map((proc) => (
        <div
          key={proc.id}
          className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
        >
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{proc.nome_procedimento}</p>
          {proc.nome_cirurgiao && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              Cirurgião: {proc.nome_cirurgiao}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Data: {new Date(proc.data_procedimento).toLocaleDateString('pt-BR')}
          </p>
          <p className="text-xs text-blue-400 mt-1 font-semibold">
            Dia Pós-Operatório: +{calculateDaysOfUsage(proc.data_procedimento)} dia
            {calculateDaysOfUsage(proc.data_procedimento) !== 1 ? 's' : ''}
          </p>
          {proc.notas && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 italic">{proc.notas}</p>
          )}
        </div>
      ))}
    </div>
  </TabContent>
);

export default ProcedimentosTab;
