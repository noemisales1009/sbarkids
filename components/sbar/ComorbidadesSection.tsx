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
        console.error('Erro ao carregar comorbidades:', error);
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
    <div className="flex flex-col rounded-xl border border-gray-700 bg-gray-800/40">
      {/* Header */}
      <div className="px-4 py-3 text-white text-sm font-medium leading-normal flex items-center gap-3">
        <span className="text-base">📋</span>
        <span>Comorbidades</span>
        {comorbidades.length > 0 && (
          <span className="text-xs bg-blue-600 text-white rounded-full px-2 py-0.5">
            ({comorbidades.length})
          </span>
        )}
      </div>

      {/* Card com as comorbidades */}
      <div className="border-t border-gray-700 px-4 py-3">
        <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
          {comorbidades.length > 0 ? (
            <div className="space-y-2">
              {comorbidades.map((comorbidade, index) => (
                <div
                  key={`${comorbidade}-${index}`}
                  className="flex items-center"
                >
                  <span className="text-gray-300 text-sm">• {comorbidade}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">Nenhuma comorbidade registrada</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComorbidadesSection;

