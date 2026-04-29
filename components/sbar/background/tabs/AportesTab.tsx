import React from 'react';
import { AportesPaciente } from '../../../../services/aportesService';
import TabContent from '../TabContent';

interface Props {
  aportes: AportesPaciente[];
}

const AportesTab: React.FC<Props> = ({ aportes }) => (
  <TabContent
    title="Aportes"
    isEmpty={aportes.length === 0}
    emptyMessage="Nenhum aporte registrado"
  >
    <div className="space-y-2">
      {aportes.map((aporte) => (
        <div
          key={aporte.id}
          className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg space-y-2"
        >
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {new Date(aporte.data_referencia + 'T00:00:00').toLocaleDateString('pt-BR')}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-gray-500 dark:text-gray-400 mb-1">VO</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {Number(aporte.vo_ml_kg_h).toFixed(3)}
              </p>
              <p className="text-gray-400 text-xs">ml/kg/h</p>
            </div>
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-gray-500 dark:text-gray-400 mb-1">HV/NPT</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {Number(aporte.hv_npt_ml_kg_h).toFixed(3)}
              </p>
              <p className="text-gray-400 text-xs">ml/kg/h</p>
            </div>
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-gray-500 dark:text-gray-400 mb-1">Medicações</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {Number(aporte.medicacoes_ml_kg_h).toFixed(3)}
              </p>
              <p className="text-gray-400 text-xs">ml/kg/h</p>
            </div>
            {aporte.tht_ml_kg_h !== null && (
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-700 rounded">
                <p className="text-indigo-600 dark:text-indigo-400 mb-1">THT Total</p>
                <p className="font-bold text-indigo-900 dark:text-white">
                  {Number(aporte.tht_ml_kg_h).toFixed(3)}
                </p>
                <p className="text-indigo-400 text-xs">ml/kg/h</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </TabContent>
);

export default AportesTab;
