import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService';

interface ComorbidadesSectionProps {
  patientId: string;
  comorbidade?: string | null;
}

function parseComorbidades(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return raw.split(',').map(c => c.trim()).filter(c => c.length > 0);
  }
}

const ComorbidadesSection: React.FC<ComorbidadesSectionProps> = ({ patientId, comorbidade }) => {
  const [comorbidades, setComorbidades] = useState<string[]>(() =>
    comorbidade !== undefined ? parseComorbidades(comorbidade) : []
  );
  const [loading, setLoading] = useState(comorbidade === undefined);

  useEffect(() => {
    if (comorbidade !== undefined) {
      setComorbidades(parseComorbidades(comorbidade));
      setLoading(false);
      return;
    }

    let cancelled = false;
    const loadComorbidades = async () => {
      try {
        setLoading(true);
        const raw = await patientService.getComorbidades(patientId);
        if (!cancelled) setComorbidades(parseComorbidades(raw));
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadComorbidades();
    return () => { cancelled = true; };
  }, [patientId, comorbidade]);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-purple-500 shrink-0" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Comorbidades</p>
        </div>
        {!loading && comorbidades.length > 0 && (
          <span className="text-xs bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 rounded-full px-2.5 py-0.5 font-bold">
            {comorbidades.length}
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="px-5 py-4">
        {loading ? (
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ))}
          </div>
        ) : comorbidades.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {comorbidades.map((comorbidade, index) => (
              <span
                key={`${comorbidade}-${index}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 shrink-0" />
                {comorbidade}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
            <p className="text-sm italic">Nenhuma comorbidade registrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComorbidadesSection;

