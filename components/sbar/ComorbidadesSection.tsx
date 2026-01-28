import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService';

interface ComorbidadesSectionProps {
  patientId: string;
}

const ComorbidadesSection: React.FC<ComorbidadesSectionProps> = ({ patientId }) => {
  const [comorbidades, setComorbidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [comorbidadeParaAdicionar, setComorbidadeParaAdicionar] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleAdicionarComorbidade = async () => {
    const comorbidadeLimpa = comorbidadeParaAdicionar.trim();
    
    if (!comorbidadeLimpa || comorbidades.includes(comorbidadeLimpa)) {
      return;
    }

    const novasComorbidades = [...comorbidades, comorbidadeLimpa];
    setComorbidades(novasComorbidades);
    setComorbidadeParaAdicionar('');

    // Salvar no banco
    const success = await patientService.updateComorbidades(patientId, novasComorbidades);
    if (!success) {
      console.error('Erro ao salvar comorbidade');
      // Reverter em caso de erro
      setComorbidades(comorbidades);
    }
  };

  const handleRemoverComorbidade = async (comorbidade: string) => {
    const novasComorbidades = comorbidades.filter(c => c !== comorbidade);
    setComorbidades(novasComorbidades);

    // Salvar no banco
    const success = await patientService.updateComorbidades(patientId, novasComorbidades);
    if (!success) {
      console.error('Erro ao salvar comorbidade');
      // Reverter em caso de erro
      setComorbidades(comorbidades);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdicionarComorbidade();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-400">
        Carregando comorbidades...
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-gray-700 bg-gray-800/40">
      {/* Header - Expandível */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 text-white text-sm font-medium leading-normal flex items-center justify-between hover:bg-gray-700/30 transition-colors"
      >
        <span className="flex items-center gap-3">
          <span className="text-base">📋</span>
          <span>Comorbidades</span>
          {comorbidades.length > 0 && (
            <span className="text-xs bg-blue-600 text-white rounded-full px-2 py-0.5">
              ({comorbidades.length})
            </span>
          )}
        </span>
        <span className={`text-xl transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
          ›
        </span>
      </button>

      {/* Card com as comorbidades - Sempre visível */}
      <div className="border-t border-gray-700 px-4 py-3">
        <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
          {comorbidades.length > 0 ? (
            <div className="space-y-2">
              {comorbidades.map((comorbidade, index) => (
                <div
                  key={`${comorbidade}-${index}`}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-300 text-sm">• {comorbidade}</span>
                  <button
                    onClick={() => handleRemoverComorbidade(comorbidade)}
                    className="text-red-500 hover:text-red-400 transition-colors text-sm leading-none"
                    title="Remover"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">Nenhuma comorbidade adicionada</p>
          )}
        </div>
      </div>

      {/* Input para adicionar - Aparece quando expandido */}
      {isExpanded && (
        <div className="border-t border-gray-700 px-4 py-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={comorbidadeParaAdicionar}
              onChange={(e) => setComorbidadeParaAdicionar(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Adicionar comorbidade..."
              className="flex-1 h-8 text-sm rounded-md border border-gray-700 bg-gray-800 text-white px-3 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleAdicionarComorbidade}
              disabled={!comorbidadeParaAdicionar.trim()}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComorbidadesSection;

