import React, { useState, useEffect } from 'react';
import { patientService, SuporteVentilatorio } from '../../services/patientService';

interface SuportesVentilatoriosSectionProps {
  patientId: string;
}

const suportesOptions: SuporteVentilatorio[] = [
  'Cateter Nasal (O2)',
  'Máscara de Venturi (O2)',
  'Máscara Não Reinalante (O2)',
  'CNAF (Alto Fluxo)',
  'CPAP (VNI)',
  'BiPAP (VNI)',
  'Ventilação Invasiva - PCV',
  'Ventilação Invasiva - VCV',
  'Ventilação Invasiva - PSV'
];

const SuportesVentilatoriosSection: React.FC<SuportesVentilatoriosSectionProps> = ({ patientId }) => {
  const [suportesSelecionados, setSuportesSelecionados] = useState<SuporteVentilatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [suporteParaAdicionar, setSuporteParaAdicionar] = useState<string>('');

  // Carregar suportes ao montar
  useEffect(() => {
    const loadSuportes = async () => {
      try {
        setLoading(true);
        const suportes = await patientService.getSuportesVentilatorios(patientId);
        setSuportesSelecionados(suportes);
      } catch (error) {
        console.error('Erro ao carregar suportes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSuportes();
  }, [patientId]);

  const handleAdicionarSuporte = async () => {
    if (!suporteParaAdicionar || suportesSelecionados.includes(suporteParaAdicionar as SuporteVentilatorio)) {
      return;
    }

    const novosSuportes = [...suportesSelecionados, suporteParaAdicionar as SuporteVentilatorio];
    setSuportesSelecionados(novosSuportes);
    setSuporteParaAdicionar('');

    // Salvar no banco
    const success = await patientService.updateSuportesVentilatorios(patientId, novosSuportes);
    if (!success) {
      console.error('Erro ao salvar suporte ventilatório');
      // Reverter em caso de erro
      setSuportesSelecionados(suportesSelecionados);
    }
  };

  const handleRemoverSuporte = async (suporte: SuporteVentilatorio) => {
    const novosSuportes = suportesSelecionados.filter(s => s !== suporte);
    setSuportesSelecionados(novosSuportes);

    // Salvar no banco
    const success = await patientService.updateSuportesVentilatorios(patientId, novosSuportes);
    if (!success) {
      console.error('Erro ao salvar suporte ventilatório');
      // Reverter em caso de erro
      setSuportesSelecionados(suportesSelecionados);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-400">
        Carregando suportes...
      </div>
    );
  }

  // Filtrar opções já selecionadas
  const opcoesDisponiveis = suportesOptions.filter(opt => !suportesSelecionados.includes(opt));

  return (
    <div className="flex flex-col rounded-xl border border-gray-800 bg-gray-900/50">
      <p className="px-3 py-2 text-white text-sm font-medium leading-normal border-b border-gray-800">
        Suportes Ventilatórios Vigentes
      </p>
      <div className="p-3 space-y-2">
        {/* Dropdown para adicionar */}
        <div className="flex gap-2">
          <select
            value={suporteParaAdicionar}
            onChange={(e) => setSuporteParaAdicionar(e.target.value)}
            className="flex-1 h-9 text-sm rounded-lg border border-gray-700 bg-gray-800 text-white px-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione um suporte</option>
            {opcoesDisponiveis.map((suporte) => (
              <option key={suporte} value={suporte}>
                {suporte}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdicionarSuporte}
            disabled={!suporteParaAdicionar}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>

        {/* Lista de suportes selecionados */}
        {suportesSelecionados.length > 0 ? (
          <div className="space-y-1.5">
            {suportesSelecionados.map((suporte) => (
              <div
                key={suporte}
                className="flex items-center justify-between px-2 py-1.5 bg-blue-900/20 border border-blue-800 rounded-lg"
              >
                <span className="text-xs font-medium text-blue-300">{suporte}</span>
                <button
                  onClick={() => handleRemoverSuporte(suporte)}
                  className="text-red-400 hover:text-red-300 transition-colors p-0.5"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-2 text-xs text-gray-500">
            Nenhum suporte selecionado
          </div>
        )}
      </div>
    </div>
  );
};

export default SuportesVentilatoriosSection;
