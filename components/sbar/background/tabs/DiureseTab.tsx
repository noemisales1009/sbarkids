import React from 'react';
import { Diurese } from '../../../../services/diureseService';
import TabContent from '../TabContent';

interface Props {
  diurese: Diurese[];
}

const DiureseTab: React.FC<Props> = ({ diurese }) => (
  <TabContent
    title="Diurese"
    isEmpty={diurese.length === 0}
    emptyMessage="Nenhuma diurese registrada"
  >
    <div className="space-y-2">
      {diurese.map((diur) => (
        <div
          key={diur.id}
          className="p-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg space-y-2"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Diurese</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(diur.data_registro).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Volume</p>
              <p className="font-bold text-gray-900 dark:text-white">{diur.volume.toFixed(2)}</p>
              <p className="text-xs text-gray-500">ml</p>
            </div>
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Peso</p>
              <p className="font-bold text-gray-900 dark:text-white">{diur.peso.toFixed(2)}</p>
              <p className="text-xs text-gray-500">kg</p>
            </div>
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Horas</p>
              <p className="font-bold text-gray-900 dark:text-white">{diur.horas}</p>
              <p className="text-xs text-gray-500">h</p>
            </div>
          </div>

          <div className="bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-700 rounded-lg p-3">
            <div className="text-center">
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mb-2">Resultado</p>
              <p className="text-lg font-bold text-cyan-900 dark:text-white">
                {diur.resultado.toFixed(2)}
              </p>
              <p className="text-xs text-cyan-500 dark:text-cyan-300 mt-1">mL/kg/h</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </TabContent>
);

export default DiureseTab;
