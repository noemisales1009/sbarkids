/**
 * Componente para exibir Alertas do Paciente
 * Clique no card para expandir e mostrar alertas abaixo
 * Pode receber alertas de duas fontes:
 * 1. tasks_view_horario_br
 * 2. alertas_paciente_view_completa
 */

import React, { useState, useEffect } from 'react';
import { alertasService, Alerta } from '../../services/alertasService';

interface AlertasDisplayProps {
  patientId: string;
  alertas?: Alerta[];
}

const AlertasDisplay: React.FC<AlertasDisplayProps> = ({ patientId, alertas: propsAlertas }) => {
  const [alertas, setAlertas] = useState<Alerta[]>(propsAlertas || []);
  const [loading, setLoading] = useState(!propsAlertas);
  const [expanded, setExpanded] = useState(false);
  const [justificativaModal, setJustificativaModal] = useState<{ visible: boolean; alertaId: string; texto: string }>({
    visible: false,
    alertaId: '',
    texto: ''
  });

  useEffect(() => {
    // Se foram passadas alertas como props, usa elas
    if (propsAlertas && propsAlertas.length > 0) {
      console.log('📍 AlertasDisplay recebeu alertas como props:', propsAlertas);
      setAlertas(propsAlertas);
      setLoading(false);
      return;
    }

    // Caso contrário, carrega do alertasService (comportamento padrão)
    loadAlertas();
  }, [patientId, propsAlertas]);

  const loadAlertas = async () => {
    try {
      setLoading(true);
      const data = await alertasService.getAlertas(patientId);
      setAlertas(data);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJustificar = (alertaId: string) => {
    setJustificativaModal({ visible: true, alertaId, texto: '' });
  };

  const handleSalvarJustificativa = async () => {
    if (!justificativaModal.texto.trim()) {
      alert('Por favor, digite uma justificativa');
      return;
    }

    try {
      // Encontrar o alerta para pegar a fonte
      const alerta = alertas.find(a => a.id_alerta === justificativaModal.alertaId);
      if (!alerta) {
        alert('Alerta não encontrado');
        return;
      }

      const sucesso = await alertasService.updateJustificativa(
        justificativaModal.alertaId,
        justificativaModal.texto,
        alerta.fonte || 'alertas_paciente'
      );
      
      if (sucesso) {
        // Atualizar estado local
        setAlertas(alertas.map(a => 
          a.id_alerta === justificativaModal.alertaId 
            ? { ...a, justificativa: justificativaModal.texto }
            : a
        ));
        
        setJustificativaModal({ visible: false, alertaId: '', texto: '' });
        alert('Justificativa salva com sucesso!');
      } else {
        alert('Erro ao salvar justificativa');
      }
    } catch (error) {
      console.error('Erro ao salvar justificativa:', error);
      alert('Erro ao salvar justificativa');
    }
  };

  const handleConcluir = async (alertaId: string) => {
    if (!window.confirm('Deseja marcar este alerta como concluído?')) {
      return;
    }

    try {
      // Encontrar o alerta para pegar a fonte
      const alerta = alertas.find(a => a.id_alerta === alertaId);
      if (!alerta) {
        alert('Alerta não encontrado');
        return;
      }

      const sucesso = await alertasService.marcarComoConcluido(
        alertaId,
        alerta.fonte || 'alertas_paciente'
      );
      
      if (sucesso) {
        setAlertas(alertas.map(a => 
          a.id_alerta === alertaId 
            ? { ...a, live_status: 'concluido', status: 'concluido' }
            : a
        ));
        
        alert('Alerta marcado como concluído!');
      } else {
        alert('Erro ao concluir alerta');
      }
    } catch (error) {
      console.error('Erro ao concluir alerta:', error);
      alert('Erro ao concluir alerta');
    }
  };

  const handleDeletar = async (alertaId: string) => {
    if (!window.confirm('Deseja deletar este alerta?')) {
      return;
    }

    try {
      // Encontrar o alerta para pegar a fonte
      const alerta = alertas.find(a => a.id_alerta === alertaId);
      if (!alerta) {
        alert('Alerta não encontrado');
        return;
      }

      const sucesso = await alertasService.deleteAlerta(
        alertaId,
        alerta.fonte || 'alertas_paciente'
      );
      
      if (sucesso) {
        setAlertas(alertas.filter(a => a.id_alerta !== alertaId));
        alert('Alerta deletado com sucesso!');
      } else {
        alert('Erro ao deletar alerta');
      }
    } catch (error) {
      console.error('Erro ao deletar alerta:', error);
      alert('Erro ao deletar alerta');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
      case 'Concluído':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'fora_do_prazo':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'concluido':
      case 'Concluído':
        return 'bg-green-500 text-white';
      case 'fora_do_prazo':
        return 'bg-red-500 text-white';
      default:
        return 'bg-yellow-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'concluido':
        return '✓ Concluído';
      case 'fora_do_prazo':
        return '⚠ Fora do prazo';
      default:
        return '⏳ No prazo';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-600 dark:text-gray-400">
        Carregando alertas...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header clicável */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="bg-linear-to-r from-red-600 to-red-700 dark:from-red-900 dark:to-red-800 rounded-lg p-4 text-white border border-red-300 dark:border-red-700 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <h3 className="text-lg font-bold">Alertas do Paciente</h3>
          </div>
          <div className="flex items-center gap-2">
            {alertas.length > 0 && (
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold text-sm">
                {alertas.length}
              </span>
            )}
            <span className={`text-2xl transition-transform ${expanded ? 'rotate-90' : ''}`}>›</span>
          </div>
        </div>
      </div>

      {/* Lista de alertas (expande/colapsa) */}
      {expanded && (
        <div className="space-y-3">
          {alertas.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              ✓ Nenhum alerta registrado
            </div>
          ) : (
            alertas.map((alerta) => (
              <div
                key={alerta.id_alerta}
                className={`p-4 rounded-lg border-l-4 ${getStatusColor(
                  alerta.live_status
                )} border-l-red-500`}
              >
                {/* Cabeçalho do alerta */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Ícone */}
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-white text-lg">🔔</span>
                    </div>

                    {/* Conteúdo principal */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white break-word">
                        {alerta.alertaclinico}
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        {/* Responsável */}
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400">👤 Responsável:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {alerta.responsavel}
                          </span>
                        </div>

                        {/* Prazo */}
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400">📅 Prazo:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {alerta.prazo_limite_formatado || 'Sem prazo'}
                          </span>
                        </div>

                        {/* Tempo */}
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400">⏱ Tempo:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {alerta.prazo_formatado || 'Sem prazo'}
                          </span>
                        </div>

                        {/* Horário de criação */}
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                          <span className="text-gray-600 dark:text-gray-400">🕐 Horário:</span>
                          <span>{alerta.hora_criacao_formatado}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="shrink-0">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadgeColor(
                        alerta.live_status
                      )}`}
                    >
                      {getStatusLabel(alerta.live_status)}
                    </span>
                  </div>
                </div>

                {/* Justificativa (se houver) */}
                {alerta.justificativa && (
                  <div className="mt-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <strong>Justificativa:</strong> {alerta.justificativa}
                    </p>
                  </div>
                )}

                {/* Botões de ação */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleJustificar(alerta.id_alerta)}
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center gap-2"
                  >
                    📝 Justificar
                  </button>
                  <button
                    onClick={() => handleConcluir(alerta.id_alerta)}
                    className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors flex items-center gap-2"
                  >
                    ✓ Concluir
                  </button>
                  <button
                    onClick={() => handleDeletar(alerta.id_alerta)}
                    className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors flex items-center gap-2"
                  >
                    🗑 Deletar
                  </button>
                </div>

                {/* Criado por */}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Criado por: <strong>{alerta.created_by_name}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de Justificativa */}
      {justificativaModal.visible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Adicionar Justificativa</h3>
            
            <textarea
              value={justificativaModal.texto}
              onChange={(e) => setJustificativaModal({ ...justificativaModal, texto: e.target.value })}
              placeholder="Digite a justificativa..."
              className="w-full h-24 bg-gray-800 border border-gray-700 rounded-md text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setJustificativaModal({ visible: false, alertaId: '', texto: '' })}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarJustificativa}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertasDisplay;
