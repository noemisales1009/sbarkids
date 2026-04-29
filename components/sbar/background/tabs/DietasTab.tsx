import React from 'react';
import { Dieta } from '../../../../services/backgroundService';
import { calculateDaysOfUsage } from '../../../../utils/backgroundDateHelpers';
import TabContent from '../TabContent';

interface Props {
  dietas: Dieta[];
}

const DietasTab: React.FC<Props> = ({ dietas }) => (
  <TabContent
    title="Dietas"
    isEmpty={dietas.length === 0}
    emptyMessage="Nenhuma dieta registrada"
  >
    <div className="space-y-2">
      {dietas.map((dieta) => (
        <div
          key={dieta.id}
          className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-3"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{dieta.tipo}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Início: {new Date(dieta.data_inicio).toLocaleDateString('pt-BR')}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 font-semibold">
              Dias: {calculateDaysOfUsage(dieta.data_inicio)}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              {dieta.volume && <p className="text-gray-600 dark:text-gray-300">Volume: {dieta.volume} ml</p>}
              {dieta.vet && <p className="text-gray-600 dark:text-gray-300">VET: {dieta.vet} kcal</p>}
              {dieta.pt && <p className="text-gray-600 dark:text-gray-300">PT: {dieta.pt} g</p>}
              {dieta.th && <p className="text-gray-600 dark:text-gray-300">TH: {dieta.th} g</p>}
            </div>
            {dieta.observacao && (
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 italic">{dieta.observacao}</p>
            )}
          </div>

          {(dieta.vet || dieta.vet_pleno || dieta.pt || dieta.pt_g_dia) && (
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 space-y-2">
              <h5 className="text-xs font-bold text-blue-400 flex items-center gap-2">
                📊 Cálculos Automáticos
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {dieta.vet && dieta.vet_pleno && dieta.vet_pleno > 0 && (
                  <div>
                    <p className="text-gray-400 mb-1">VET AT:</p>
                    <p className="font-bold text-white">
                      {((dieta.vet / dieta.vet_pleno) * 100).toFixed(1)}%
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {dieta.vet} kcal/dia de {dieta.vet_pleno} kcal/dia
                    </p>
                  </div>
                )}
                {dieta.pt && dieta.pt_g_dia && dieta.pt_g_dia > 0 && (
                  <div>
                    <p className="text-gray-400 mb-1">PT AT:</p>
                    <p className="font-bold text-white">
                      {((dieta.pt / dieta.pt_g_dia) * 100).toFixed(1)}%
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {dieta.pt} g/dia de {dieta.pt_g_dia} g/dia
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </TabContent>
);

export default DietasTab;
