import React, { useState, useEffect } from 'react';
import { patientService, SuporteVentilatorio } from '../../services/patientService';

interface SuportesVentilatoriosSectionProps {
  patientId: string;
}

const SuportesVentilatoriosSection: React.FC<SuportesVentilatoriosSectionProps> = ({ patientId }) => {
  const [suportesSelecionados, setSuportesSelecionados] = useState<SuporteVentilatorio[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar suportes ao montar
  useEffect(() => {
    const loadSuportes = async () => {
      try {
        setLoading(true);
        const suportes = await patientService.getSuportesVentilatorios(patientId);
        setSuportesSelecionados(suportes);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadSuportes();
  }, [patientId]);

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-400">
        Carregando suportes...
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-gray-800 bg-gray-900/50">
      <p className="px-3 py-2 text-white text-sm font-medium leading-normal border-b border-gray-800">
        Suportes Ventilatórios Vigentes
      </p>
      <div className="p-3 space-y-2">
        {/* Lista de suportes selecionados */}
        {suportesSelecionados.length > 0 ? (
          <div className="space-y-1.5">
            {suportesSelecionados.map((suporte) => (
              <div
                key={suporte}
                className="flex items-center px-2 py-1.5 bg-blue-900/20 border border-blue-800 rounded-lg"
              >
                <span className="text-xs font-medium text-blue-300">{suporte}</span>
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
