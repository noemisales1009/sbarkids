import React from 'react';
import { Dispositivo } from '../../../../services/backgroundService';
import { calculateDaysOfUsage } from '../../../../utils/backgroundDateHelpers';
import TabContent from '../TabContent';

interface Props {
  dispositivos: Dispositivo[];
}

const DispositivosTab: React.FC<Props> = ({ dispositivos }) => (
  <TabContent
    title="Dispositivos"
    isEmpty={dispositivos.length === 0}
    emptyMessage="Nenhum dispositivo registrado"
  >
    <div className="space-y-2">
      {dispositivos.map((dev) => (
        <div key={dev.id} className="p-3 bg-green-900/20 border border-green-800 rounded-lg">
          <p className="text-sm font-semibold text-white">{dev.tipo_dispositivo}</p>
          <p className="text-xs text-gray-300 mt-1">Localização: {dev.localizacao}</p>
          <p className="text-xs text-gray-400 mt-1">
            Inserido em:{' '}
            {typeof dev.data_insercao === 'string'
              ? new Date(dev.data_insercao + 'T00:00:00').toLocaleDateString('pt-BR')
              : new Date(dev.data_insercao).toLocaleDateString('pt-BR')}
          </p>
          <p className="text-xs text-green-400 mt-1 font-semibold">
            {calculateDaysOfUsage(dev.data_insercao)} dia
            {calculateDaysOfUsage(dev.data_insercao) !== 1 ? 's' : ''} com dispositivo
          </p>
          {dev.data_remocao && (
            <p className="text-xs text-yellow-400 mt-1 font-semibold">
              Fim: {new Date(dev.data_remocao).toLocaleDateString('pt-BR')}
            </p>
          )}
          {dev.observacao && (
            <p className="text-xs text-gray-300 mt-2 italic">{dev.observacao}</p>
          )}
        </div>
      ))}
    </div>
  </TabContent>
);

export default DispositivosTab;
