import React from 'react';
import { ExameImagem } from '../../../../types';
import TabContent from '../TabContent';

interface Props {
  examesImagem: ExameImagem[];
}

const ExamesImagemTab: React.FC<Props> = ({ examesImagem }) => (
  <TabContent
    title="Exames de Imagem"
    isEmpty={examesImagem.length === 0}
    emptyMessage="Nenhum exame de imagem registrado"
  >
    <div className="space-y-2">
      {examesImagem.map((exame) => (
        <div
          key={exame.id}
          className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/20 px-2 py-0.5 rounded-full">
              {exame.categoria}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
              {new Date(exame.data_exame + 'T00:00:00').toLocaleDateString('pt-BR')}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{exame.exame}</p>
          {exame.resultado && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">{exame.resultado}</p>
          )}
        </div>
      ))}
    </div>
  </TabContent>
);

export default ExamesImagemTab;
