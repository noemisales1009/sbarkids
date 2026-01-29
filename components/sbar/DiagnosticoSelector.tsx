import { useState, useEffect } from 'react';
import { diagnosticoPerguntasService } from '../../services/diagnosticoPerguntasService';

interface OpcaoDiagnostico {
  id: number;
  pergunta_id: number;
  codigo: string;
  label: string;
  has_input: boolean;
  input_placeholder: string;
  ordem: number;
  parent_id: number | null;
}

interface DiagnosticoSelecionado {
  opcao_id: number;
  label: string;
  valor_input?: string;
  tipo: 'principal' | 'secundario';
  status?: 'resolvido' | 'nao_resolvido';
}

interface DiagnosticoSelectorProps {
  pacienteId: string;
  onSave: (diagnosticos: DiagnosticoSelecionado[]) => Promise<void>;
  onSaveMessage?: (message: string) => void;
}

const DiagnosticoSelector = ({ pacienteId, onSave, onSaveMessage }: DiagnosticoSelectorProps) => {
  const [opcoesProncipais, setOpcoesProncipais] = useState<OpcaoDiagnostico[]>([]);
  const [opcoesSecundarios, setOpcoesSecundarios] = useState<OpcaoDiagnostico[]>([]);
  const [selecionados, setSelecionados] = useState<DiagnosticoSelecionado[]>([]);
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  const [expandedOpcoes, setExpandedOpcoes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [diagnosticosCarregados, setDiagnosticosCarregados] = useState<Set<number>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const DIAGNOSTICO_PRINCIPAIS_ID = 1;
  const DIAGNOSTICO_SECUNDARIOS_ID = 2;

  useEffect(() => {
    loadOpcoes();
  }, [pacienteId]);

  useEffect(() => {
    // Carregar diagnósticos DEPOIS que opções foram carregadas
    if (opcoesProncipais.length > 0 || opcoesSecundarios.length > 0) {
      loadDiagnosticosCarregados();
    }
  }, [opcoesProncipais, opcoesSecundarios]);

  useEffect(() => {
    // Sincronizar labels após carregar tudo
    if (selecionados.length > 0 && (opcoesProncipais.length > 0 || opcoesSecundarios.length > 0)) {
      setSelecionados(prev =>
        prev.map(selecionado => {
          if (selecionado.label && selecionado.label.startsWith('Diagnóstico #')) {
            // Se o label é um fallback, tenta encontrar o real
            const opcoes = selecionado.tipo === 'principal' ? opcoesProncipais : opcoesSecundarios;
            const opcao = opcoes?.find(o => o.id === selecionado.opcao_id);
            return {
              ...selecionado,
              label: opcao?.label || selecionado.label
            };
          }
          return selecionado;
        })
      );
    }
  }, [opcoesProncipais, opcoesSecundarios]);

  const loadDiagnosticosCarregados = async () => {
    try {
      const { diagnosticosSelecionadosService } = await import('../../services/diagnosticosSelecionadosService');
      
      const [principais, secundarios] = await Promise.all([
        diagnosticosSelecionadosService.getDiagnosticosPaciente(pacienteId, DIAGNOSTICO_PRINCIPAIS_ID),
        diagnosticosSelecionadosService.getDiagnosticosPaciente(pacienteId, DIAGNOSTICO_SECUNDARIOS_ID)
      ]);

      const diagnosticosCarregadosList: DiagnosticoSelecionado[] = [];
      const inputsCarregados: { [key: number]: string } = {};
      
      if (principais && principais.length > 0) {
        principais.forEach(d => {
          // Procura o label na lista de opções
          const opcao = opcoesProncipais?.find(o => o.id === d.opcao_id);
          diagnosticosCarregadosList.push({
            opcao_id: d.opcao_id,
            label: opcao?.label || '',
            valor_input: d.texto_digitado || '',
            tipo: 'principal',
            status: d.status as 'resolvido' | 'nao_resolvido'
          });
          // Sempre carregar o texto, mesmo que vazio
          inputsCarregados[d.opcao_id] = d.texto_digitado || '';
        });
      }

      if (secundarios && secundarios.length > 0) {
        secundarios.forEach(d => {
          // Procura o label na lista de opções
          const opcao = opcoesSecundarios?.find(o => o.id === d.opcao_id);
          diagnosticosCarregadosList.push({
            opcao_id: d.opcao_id,
            label: opcao?.label || '',
            valor_input: d.texto_digitado || '',
            tipo: 'secundario',
            status: d.status as 'resolvido' | 'nao_resolvido'
          });
          // Sempre carregar o texto, mesmo que vazio
          inputsCarregados[d.opcao_id] = d.texto_digitado || '';
        });
      }

      const idsJaSalvos = new Set<number>();
      diagnosticosCarregadosList.forEach(d => {
        idsJaSalvos.add(d.opcao_id);
      });

      setDiagnosticosCarregados(idsJaSalvos);
      setInputValues(inputsCarregados);
      
      if (diagnosticosCarregadosList.length > 0) {
        setSelecionados(diagnosticosCarregadosList);
      }
    } catch (error) {
      console.error('Erro ao carregar diagnósticos:', error);
    }
  };

  const loadOpcoes = async () => {
    try {
      const [principais, secundarios] = await Promise.all([
        diagnosticoPerguntasService.getOpcoes(DIAGNOSTICO_PRINCIPAIS_ID),
        diagnosticoPerguntasService.getOpcoes(DIAGNOSTICO_SECUNDARIOS_ID)
      ]);
      
      setOpcoesProncipais(principais || []);
      setOpcoesSecundarios(secundarios || []);

      setSelecionados(prev => 
        prev.map(selecionado => {
          const opcoes = selecionado.tipo === 'principal' ? principais : secundarios;
          const opcao = opcoes?.find(o => o.id === selecionado.opcao_id);
          return {
            ...selecionado,
            label: opcao?.label || selecionado.label
          };
        })
      );

      const idsComFilhas: number[] = [];
      
      if (principais) {
        principais.forEach(opcao => {
          const temFilhas = principais.some(o => o.parent_id === opcao.id);
          if (temFilhas) {
            idsComFilhas.push(opcao.id);
          }
        });
      }
      
      if (secundarios) {
        secundarios.forEach(opcao => {
          const temFilhas = secundarios.some(o => o.parent_id === opcao.id);
          if (temFilhas) {
            idsComFilhas.push(opcao.id);
          }
        });
      }
      
      setExpandedOpcoes(idsComFilhas);
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOpcao = (opcaoId: number, label: string, tipo: 'principal' | 'secundario') => {
    const index = selecionados.findIndex(s => s.opcao_id === opcaoId);
    
    if (index > -1) {
      const novo = selecionados.filter(s => s.opcao_id !== opcaoId);
      setSelecionados(novo);
      const newInputs = { ...inputValues };
      delete newInputs[opcaoId];
      setInputValues(newInputs);
    } else {
      if (selecionados.some(s => s.opcao_id === opcaoId)) {
        console.warn('Este diagnóstico já está selecionado');
        return;
      }
      setSelecionados([...selecionados, { opcao_id: opcaoId, label, tipo, valor_input: '', status: 'nao_resolvido' }]);
    }
  };

  const updateInputValue = (opcaoId: number, valor: string) => {
    setInputValues({ ...inputValues, [opcaoId]: valor });
    setSelecionados(selecionados.map(s => 
      s.opcao_id === opcaoId ? { ...s, valor_input: valor } : s
    ));
  };

  const removerDiagnostico = (opcaoId: number) => {
    setSelecionados(selecionados.filter(s => s.opcao_id !== opcaoId));
    const newInputs = { ...inputValues };
    delete newInputs[opcaoId];
    setInputValues(newInputs);
  };

  const updateDiagnosticoStatus = (opcaoId: number, status: 'resolvido' | 'nao_resolvido') => {
    setSelecionados(selecionados.map(s =>
      s.opcao_id === opcaoId ? { ...s, status } : s
    ));
  };

  const toggleExpand = (opcaoId: number) => {
    if (expandedOpcoes.includes(opcaoId)) {
      setExpandedOpcoes(expandedOpcoes.filter(id => id !== opcaoId));
    } else {
      setExpandedOpcoes([...expandedOpcoes, opcaoId]);
    }
  };

  const getOpcoesPai = (opcoes: OpcaoDiagnostico[]) => opcoes.filter(o => !o.parent_id).sort((a, b) => a.ordem - b.ordem);

  const getOpcoeFilhas = (parentId: number, opcoes: OpcaoDiagnostico[]) => 
    opcoes.filter(o => o.parent_id === parentId).sort((a, b) => a.ordem - b.ordem);

  const temOpcoeFilhas = (opcaoId: number, opcoes: OpcaoDiagnostico[]) => getOpcoeFilhas(opcaoId, opcoes).length > 0;

  const renderOpcao = (opcao: OpcaoDiagnostico, tipo: 'principal' | 'secundario', opcoes: OpcaoDiagnostico[], nivel: number = 0) => {
    const isSelected = selecionados.some(s => s.opcao_id === opcao.id);
    const temFilhas = temOpcoeFilhas(opcao.id, opcoes);
    const estaExpandida = expandedOpcoes.includes(opcao.id);
    const opcoesFilhas = getOpcoeFilhas(opcao.id, opcoes);
    const isFilha = nivel > 0;
    const borderColor = tipo === 'principal' ? 'border-blue-700/30' : 'border-green-700/30';
    const bgSelected = tipo === 'principal' ? 'bg-blue-900/30' : 'bg-green-900/20';
    const hoverBg = tipo === 'principal' ? 'hover:bg-blue-900/40' : 'hover:bg-green-900/30';

    return (
      <div key={opcao.id}>
        <div className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition ${
          isSelected ? bgSelected : ''
        } ${hoverBg} ${isFilha ? 'ml-6 text-sm' : ''} border ${borderColor} mb-1`}>
          <div className="flex items-start gap-3 flex-1">
            {temFilhas ? (
              <button
                onClick={() => toggleExpand(opcao.id)}
                className={`mt-1 text-gray-400 hover:text-white w-4 transition text-xs shrink-0 ${
                  estaExpandida ? 'text-blue-400' : ''
                }`}
              >
                {estaExpandida ? '▼' : '▶'}
              </button>
            ) : (
              <div className="w-4 shrink-0" />
            )}

            <div className="flex items-start gap-3 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleOpcao(opcao.id, opcao.label, tipo)}
                className={`mt-0.5 w-5 h-5 cursor-pointer shrink-0 ${
                  tipo === 'principal' ? 'accent-blue-500' : 'accent-green-500'
                }`}
              />
              
              <div className="flex-1 min-w-0">
                <label className={`cursor-pointer font-medium select-none block truncate ${
                  isFilha ? 'text-gray-300 text-xs' : 'text-gray-100 text-sm'
                }`}>
                  {opcao.label}
                </label>
                
                {isSelected && (
                  <input
                    type="text"
                    value={inputValues[opcao.id] || ''}
                    onChange={(e) => updateInputValue(opcao.id, e.target.value)}
                    placeholder={opcao.input_placeholder}
                    className="mt-2 w-full p-2 border border-gray-600 bg-gray-800 text-white rounded text-xs placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          {isSelected && (
            <button
              onClick={() => removerDiagnostico(opcao.id)}
              className="text-red-400 hover:text-red-300 font-bold text-lg w-5 shrink-0 transition"
            >
              ✕
            </button>
          )}
        </div>

        {temFilhas && estaExpandida && (
          <div className={`pl-2 mb-1`}>
            {opcoesFilhas.map(filha => renderOpcao(filha, tipo, opcoes, nivel + 1))}
          </div>
        )}
      </div>
    );
  };

  const principais = selecionados.filter(s => s.tipo === 'principal');
  const secundarios = selecionados.filter(s => s.tipo === 'secundario');

  if (loading) {
    return <div className="p-4 text-center text-gray-400">⏳ Carregando diagnósticos...</div>;
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800">
      {/* Resumo de selecionados - SEMPRE VISÍVEL */}
      {selecionados.length > 0 && (
        <div className="p-6 bg-linear-to-r from-blue-900/30 to-green-900/30 border-b-2 border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg font-bold text-white">
              📋 {selecionados.length} diagnóstico(s) selecionado(s)
            </p>
            <button
              onClick={() => {
                setSelecionados([]);
                setInputValues({});
              }}
              className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition"
            >
              Limpar Tudo
            </button>
          </div>
          
          {principais.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-bold text-blue-400 mb-2">Principais: {principais.length}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                {principais.map(diag => (
                  <li key={diag.opcao_id} className="text-sm text-gray-300">
                    <span>{diag.label || `Diagnóstico #${diag.opcao_id}`}</span>
                    {inputValues[diag.opcao_id] && (
                      <div className="text-xs text-gray-400 italic ml-5 mt-1">
                        "{inputValues[diag.opcao_id]}"
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {secundarios.length > 0 && (
            <div>
              <p className="text-sm font-bold text-green-400 mb-2">Secundários: {secundarios.length}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                {secundarios.map(diag => (
                  <li key={diag.opcao_id} className="text-sm text-gray-300">
                    <span>{diag.label || `Diagnóstico #${diag.opcao_id}`}</span>
                    {inputValues[diag.opcao_id] && (
                      <div className="text-xs text-gray-400 italic ml-5 mt-1">
                        "{inputValues[diag.opcao_id]}"
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Header Colapsável - Opções de Seleção */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800 transition border-t border-gray-700"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📘</span>
          <div className="text-left">
            <p className="font-bold text-white">Diagnósticos Principais</p>
          </div>
        </div>
        <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Opções de Seleção - OCULTAR/MOSTRAR */}
      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x divide-gray-800 border-t border-gray-700">
          {/* Diagnósticos Principais */}
          <div className="flex flex-col">
            <div className="px-6 py-4 bg-blue-900/20 border-b border-gray-800 sticky top-0 z-10">
              <h3 className="font-bold text-lg text-blue-300 flex items-center gap-2">
                <span className="text-2xl">📘</span> Diagnósticos Principais
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {opcoesProncipais.length} opção(ões) disponível(is)
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto flex-1">
              {opcoesProncipais.length > 0 ? (
                <div className="p-3 space-y-1">
                  {getOpcoesPai(opcoesProncipais).map(opcao => renderOpcao(opcao, 'principal', opcoesProncipais))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">
                  <p className="text-lg mb-2">📭</p>
                  <p>Nenhuma opção disponível</p>
                </div>
              )}
            </div>
          </div>

          {/* Diagnósticos Secundários */}
          <div className="flex flex-col">
            <div className="px-6 py-4 bg-green-900/20 border-b border-gray-800 sticky top-0 z-10">
              <h3 className="font-bold text-lg text-green-300 flex items-center gap-2">
                <span className="text-2xl">📗</span> Diagnósticos Secundários
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {opcoesSecundarios.length} opção(ões) disponível(is)
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto flex-1">
              {opcoesSecundarios.length > 0 ? (
                <div className="p-3 space-y-1">
                  {getOpcoesPai(opcoesSecundarios).map(opcao => renderOpcao(opcao, 'secundario', opcoesSecundarios))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">
                  <p className="text-lg mb-2">📭</p>
                  <p>Nenhuma opção disponível</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botão Salvar - SEMPRE VISÍVEL */}
      <div className="p-6 border-t-2 border-gray-800 bg-gray-900/50">
        {saveMessage && (
          <div className={`mb-4 p-3 rounded-lg font-semibold text-white text-center ${
            saveMessage.includes('✅') ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {saveMessage}
          </div>
        )}
        <button
          onClick={async () => {
            console.log('Salvando diagnósticos:', selecionados);
            setIsSaving(true);
            setSaveMessage(null);
            try {
              await onSave(selecionados);
              setSaveMessage('✅ Diagnósticos salvos com sucesso!');
              if (onSaveMessage) onSaveMessage('✅ Diagnósticos salvos com sucesso!');
              setTimeout(() => setSaveMessage(null), 3000);
            } catch (error) {
              console.error('Erro completo:', error);
              setSaveMessage(`❌ ${error instanceof Error ? error.message : 'Erro ao salvar diagnósticos'}`);
              if (onSaveMessage) onSaveMessage(`❌ Erro ao salvar`);
            } finally {
              setIsSaving(false);
            }
          }}
          disabled={selecionados.length === 0 || isSaving}
          className={`w-full px-6 py-4 font-bold rounded-lg transition flex items-center justify-center gap-2 text-lg ${
            selecionados.length > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          } ${isSaving ? 'opacity-75' : ''}`}
        >
          {isSaving ? '⏳ Salvando...' : '💾 Salvar Diagnósticos'}
          {selecionados.length > 0 && !isSaving && <span className="text-sm">({selecionados.length})</span>}
        </button>
      </div>
    </div>
  );
};

export default DiagnosticoSelector;
