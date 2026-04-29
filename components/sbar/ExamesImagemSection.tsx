import React, { useState, useEffect } from 'react';
import { ExameImagem } from '../../types';
import { examesImagemService } from '../../services/examesImagemService';

interface Props {
  pacienteId: string;
}

const ExamesImagemSection: React.FC<Props> = ({ pacienteId }) => {
  const [exames, setExames] = useState<ExameImagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    examesImagemService.getAll(pacienteId)
      .then(setExames)
      .catch(() => setExames([]))
      .finally(() => setLoading(false));
  }, [pacienteId]);

  const formatDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-xl">photo_camera</span>
          <span className="font-bold text-base">Imagem</span>
          {exames.length > 0 && (
            <span className="bg-white/20 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {exames.length}
            </span>
          )}
        </div>
        <span
          className={`material-symbols-outlined text-xl transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>

      {expanded && (
        <div className="px-5 py-4">
          {loading ? (
            <div className="text-center py-6 text-gray-400 text-sm">Carregando...</div>
          ) : exames.length === 0 ? (
            <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm italic">
              Nenhum exame de imagem registrado
            </div>
          ) : (
            <div className="space-y-2">
              {exames.map(exame => (
                <div
                  key={exame.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3"
                >
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/20 px-2 py-0.5 rounded-full">
                      {exame.categoria}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(exame.data_exame)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {exame.exame}
                  </p>
                  {exame.resultado && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">
                      {exame.resultado}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamesImagemSection;
