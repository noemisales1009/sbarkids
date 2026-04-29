import React, { useState, useEffect } from 'react';
import { alertasService, Alerta } from '../../services/alertasService';
import AlertasDisplay from './AlertasDisplay';
import CompletedAlertsSection from './CompletedAlertsSection';
import CriarAlertaModal from './CriarAlertaModal';

interface AlertasPanelProps {
  patientId: string;
  patientName: string;
  roundId?: string;
}

const AlertasPanel: React.FC<AlertasPanelProps> = ({ patientId, patientName, roundId }) => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadAlertas();
  }, [patientId]);

  const loadAlertas = async () => {
    try {
      const data = await alertasService.getAlertas(patientId);
      setAlertas(data);
    } catch {
      setAlertas([]);
    }
  };

  return (
    <>
      <div className="flex justify-start">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          + Criar Alerta
        </button>
      </div>

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

      <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
        <CompletedAlertsSection patientId={patientId} />
      </div>
    </>
  );
};

export default AlertasPanel;
