import React, { useState, useEffect } from 'react';
import { alertasService, Alerta, precisaRevisao, isAlertaAtivo } from '../../services/alertasService';
import AlertasDisplay from './AlertasDisplay';
import CriarAlertaModal from './CriarAlertaModal';
import RevisaoAlertasModal from './RevisaoAlertasModal';

interface AlertasPanelProps {
  patientId: string;
  patientName: string;
  roundId?: string;
}

const AlertasPanel: React.FC<AlertasPanelProps> = ({ patientId, patientName, roundId }) => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showRevisao, setShowRevisao] = useState(false);
  const [pendentes, setPendentes] = useState<Alerta[]>([]);

  useEffect(() => {
    loadAlertas();
  }, [patientId]);

  const loadAlertas = async () => {
    try {
      const data = await alertasService.getAlertas(patientId);
      setAlertas(data);
      return data;
    } catch {
      setAlertas([]);
      return [];
    }
  };

  // Antes de criar, o médico revisa o que está em aberto e fora do prazo — de qualquer turno
  const handleCriarAlerta = async () => {
    const data = await loadAlertas();
    const abertos = await alertasService.enriquecerJustificativas(data.filter(isAlertaAtivo));
    const aRevisar = abertos
      .filter(precisaRevisao)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    if (aRevisar.length > 0) {
      setPendentes(aRevisar);
      setShowRevisao(true);
    } else {
      setShowModal(true);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800/50">
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-600 text-white text-xs font-bold shrink-0 shadow-sm">R</span>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wide uppercase">
          Recomendação <span className="normal-case font-normal text-gray-500 dark:text-gray-400">(Recommendation)</span>
        </h3>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-start">
          <button
            onClick={handleCriarAlerta}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            + Criar Alerta (condutas médicas)
          </button>
        </div>

        {showRevisao && (
          <RevisaoAlertasModal
            pendentes={pendentes}
            onClose={() => setShowRevisao(false)}
            onLiberado={() => { setShowRevisao(false); setShowModal(true); }}
            onAlertaTratado={loadAlertas}
          />
        )}

        {showModal && (
          <CriarAlertaModal
            patientId={patientId}
            patientName={patientName}
            onClose={() => setShowModal(false)}
            onAlertaCriado={loadAlertas}
          />
        )}

        <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
          <AlertasDisplay
            patientId={patientId}
            patientName={patientName}
            roundId={roundId}
            alertas={alertas}
          />
        </div>
      </div>
    </div>
  );
};

export default AlertasPanel;
