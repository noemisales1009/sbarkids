import React, { useState, useEffect } from 'react';
import { Parecer } from '../../types';
import { pareceresService } from '../../services/pareceresService';

interface Props {
  pacienteId: string;
}

const PareceresSection: React.FC<Props> = ({ pacienteId }) => {
  const [pareceres, setPareceres] = useState<Parecer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    pareceresService.getAll(pacienteId)
      .then(setPareceres)
      .catch(() => setPareceres([]))
      .finally(() => setLoading(false));
  }, [pacienteId]);

  const formatDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-xl">assignment</span>
          <span className="font-bold text-base">Pareceres</span>
          {pareceres.length > 0 && (
            <span className="bg-white/20 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {pareceres.length}
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
          ) : pareceres.length === 0 ? (
            <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm italic">
              Nenhum parecer registrado
            </div>
          ) : (
            <div className="space-y-2">
              {pareceres.map(p => (
                <div
                  key={p.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3"
                >
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-500/20 px-2 py-0.5 rounded-full">
                      {p.especialista}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(p.data_parecer)}
                    </span>
                  </div>
                  {p.parecer && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-line">
                      {p.parecer}
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

export default PareceresSection;
