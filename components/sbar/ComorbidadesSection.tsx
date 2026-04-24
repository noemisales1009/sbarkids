import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService';

interface ComorbidadesSectionProps {
  patientId: string;
}

const ComorbidadesSection: React.FC<ComorbidadesSectionProps> = ({ patientId }) => {
  const [comorbidades, setComorbidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar comorbidades ao montar
  useEffect(() => {
    const loadComorbidades = async () => {
      try {
        setLoading(true);
        const comorbidadeStr = await patientService.getComorbidades(patientId);
        // Parsear a string de comorbidades (separadas por vírgula ou armazenadas como array JSON)
        if (comorbidadeStr) {
          try {
            const parsed = JSON.parse(comorbidadeStr);
            setComorbidades(Array.isArray(parsed) ? parsed : []);
          } catch {
            // Se não for JSON, dividir por vírgula
            setComorbidades(
              comorbidadeStr
                .split(',')
                .map(c => c.trim())
                .filter(c => c.length > 0)
            );
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadComorbidades();
  }, [patientId]);

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-400">
        Carregando comorbidades...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-gray-800/40 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-700/50 bg-gray-800/30">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-purple-500 shrink-0" />
          <p className="text-sm font-semibold text-gray-200">Comorbidades</p>
        </div>
        {comorbidades.length > 0 && (
          <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-2.5 py-0.5 font-bold">
            {comorbidades.length}
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="px-5 py-4">
        {comorbidades.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {comorbidades.map((comorbidade, index) => (
              <span
                key={`${comorbidade}-${index}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-600/50 text-gray-200 text-sm font-medium hover:border-purple-500/40 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                {comorbidade}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
            <p className="text-sm italic">Nenhuma comorbidade registrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComorbidadesSection;

