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
  onSave?: (diagnosticos: DiagnosticoSelecionado[]) => Promise<void>;
  onSaveMessage?: (message: string) => void;
}

const DiagnosticoSelector = ({ pacienteId, onSave, onSaveMessage }: DiagnosticoSelectorProps) => {
  const [opcoesProncipais, setOpcoesProncipais] = useState<OpcaoDiagnostico[]>([]);
  const [opcoesSecundarios, setOpcoesSecundarios] = useState<OpcaoDiagnostico[]>([]);
  const [selecionados, setSelecionados] = useState<DiagnosticoSelecionado[]>([]);
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);

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
          const opcao = opcoesProncipais?.find(o => o.id === d.opcao_id);
          diagnosticosCarregadosList.push({
            opcao_id: d.opcao_id,
            label: opcao?.label || '',
            valor_input: d.texto_digitado || '',
            tipo: 'principal',
            status: d.status as 'resolvido' | 'nao_resolvido'
          });
          inputsCarregados[d.opcao_id] = d.texto_digitado || '';
        });
      }

      if (secundarios && secundarios.length > 0) {
        secundarios.forEach(d => {
          const opcao = opcoesSecundarios?.find(o => o.id === d.opcao_id);
          diagnosticosCarregadosList.push({
            opcao_id: d.opcao_id,
            label: opcao?.label || '',
            valor_input: d.texto_digitado || '',
            tipo: 'secundario',
            status: d.status as 'resolvido' | 'nao_resolvido'
          });
          inputsCarregados[d.opcao_id] = d.texto_digitado || '';
        });
      }

      setInputValues(inputsCarregados);
      
      if (diagnosticosCarregadosList.length > 0) {
        setSelecionados(diagnosticosCarregadosList);
      }
    } catch (error) {
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
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const principais = selecionados.filter(s => s.tipo === 'principal');
  const secundarios = selecionados.filter(s => s.tipo === 'secundario');

  if (loading) {
    return <div className="p-4 text-center text-gray-400">⏳ Carregando diagnósticos...</div>;
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800">
      {/* Resumo de diagnósticos - APENAS VISUALIZAÇÃO */}
      {selecionados.length > 0 ? (
        <div className="p-6 bg-linear-to-r from-blue-900/30 to-green-900/30 border-b-2 border-gray-700">
          <p className="text-lg font-bold text-white mb-4">
            📋 {selecionados.length} diagnóstico(s) registrado(s)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {principais.length > 0 && (
              <div>
                <p className="text-sm font-bold text-blue-400 mb-2">Principais: {principais.length}</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  {principais.map(diag => (
                    <li key={diag.opcao_id} className={`text-sm text-gray-300 ${diag.status === 'resolvido' ? 'line-through text-gray-500' : ''}`}>
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
                    <li key={diag.opcao_id} className={`text-sm text-gray-300 ${diag.status === 'resolvido' ? 'line-through text-gray-500' : ''}`}>
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
        </div>
      ) : (
        <div className="p-6 text-center text-gray-400">
          <p className="text-lg">📭</p>
          <p className="mt-2">Nenhum diagnóstico registrado</p>
        </div>
      )}
    </div>
  );
};

export default DiagnosticoSelector;
