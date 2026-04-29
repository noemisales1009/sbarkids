import React from 'react';
import { BalancoHidrico } from '../../../../services/balanceHidricoService';
import TabContent from '../TabContent';

interface Props {
  balanceHidrico: BalancoHidrico[];
}

const BalancoHidricoTab: React.FC<Props> = ({ balanceHidrico }) => (
  <TabContent
    title="Balanço Hídrico"
    isEmpty={balanceHidrico.length === 0}
    emptyMessage="Nenhum balanço hídrico registrado"
  >
    <div className="space-y-2">
      {balanceHidrico.map((balance) => (
        <div
          key={balance.id}
          className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Balanço Hídrico</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(balance.data_registro).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Volume</p>
              <p className="font-bold text-gray-900 dark:text-white">{balance.volume.toFixed(2)} ml</p>
            </div>
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Peso</p>
              <p className="font-bold text-gray-900 dark:text-white">{balance.peso.toFixed(2)} kg</p>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-3">
            <div className="text-center">
              <p className="text-xs text-purple-600 dark:text-purple-400 mb-2">Resultado</p>
              <p className="text-lg font-bold text-purple-900 dark:text-white">
                {balance.resultado > 0 ? '+' : ''}
                {(balance.resultado * 100).toFixed(2)}%
              </p>
              <p className="text-xs text-purple-500 dark:text-purple-300 mt-1">
                {balance.resultado > 0 ? 'Ganho' : balance.resultado < 0 ? 'Perda' : 'Equilibrado'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </TabContent>
);

export default BalancoHidricoTab;
