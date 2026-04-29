import React from 'react';
import { Parecer } from '../../../../types';
import TabContent from '../TabContent';

interface Props {
  pareceres: Parecer[];
}

const PareceresTab: React.FC<Props> = ({ pareceres }) => (
  <TabContent
    title="Pareceres"
    isEmpty={pareceres.length === 0}
    emptyMessage="Nenhum parecer registrado"
  >
    <div className="space-y-2">
      {pareceres.map((p) => (
        <div
          key={p.id}
          className="p-3 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.especialista}</p>
            <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
              {new Date(p.data_parecer + 'T00:00:00').toLocaleDateString('pt-BR')}
            </span>
          </div>
          {p.parecer && (
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{p.parecer}</p>
          )}
        </div>
      ))}
    </div>
  </TabContent>
);

export default PareceresTab;
