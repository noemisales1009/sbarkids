/**
 * Componente para exibir Alertas do Paciente
 * Clique no card para expandir e mostrar alertas abaixo
 * Pode receber alertas de duas fontes:
 * 1. tasks_view_horario_br
 * 2. alertas_paciente_view_completa
 * 
 * Agora exibe os alertas agrupados por turno (Manhã, Tarde, Noite)
 * e mostra a avaliação (assessment) correspondente para cada turno
 */

import React, { useState, useEffect } from 'react';
import { alertasService, Alerta } from '../../services/alertasService';
import { shiftFilterService } from '../../services/shiftFilterService';
import { clinicalRoundsSimpleService, ClinicalRoundsSimple } from '../../services/clinicalRoundsSimpleService';
import { useUser } from '../../contexts/UserContext';
import { auditService } from '../../services/auditService';
import { useToast } from '../Toast';
import AlertasHeader from './AlertasHeader';
import AlertaCard from './AlertaCard';
import AlertasTurno from './AlertasTurno';
import { AlertasSkeleton } from '../SkeletonLoader';

interface AlertasDisplayProps {
  patientId: string;
  patientName?: string;
  roundId?: string;
  alertas?: Alerta[];
}

const AlertasDisplay: React.FC<AlertasDisplayProps> = ({ patientId, patientName, roundId, alertas: propsAlertas }) => {
  const { user } = useUser();
  const { showToast, showConfirm } = useToast();

  const [alertas, setAlertas] = useState<Alerta[]>(propsAlertas || []);
  const [assessment, setAssessment] = useState<ClinicalRoundsSimple | null>(null);
  const [alertasPorTurno, setAlertasPorTurno] = useState<{
    morning: Alerta[];
    afternoon: Alerta[];
    night: Alerta[];
  }>({ morning: [], afternoon: [], night: [] });
  const [usarTurnos, setUsarTurnos] = useState(false);
  const [loading, setLoading] = useState(!propsAlertas);
  const [expanded, setExpanded] = useState(false);
  const [justificativaModal, setJustificativaModal] = useState<{ visible: boolean; alertaId: string; texto: string }>({
    visible: false,
    alertaId: '',
    texto: ''
  });
  const [arquivamentoModal, setArquivamentoModal] = useState<{ visible: boolean; alertaId: string; motivo: string }>({
    visible: false,
    alertaId: '',
    motivo: ''
  });

  useEffect(() => {
    // Carregar assessment se roundId foi passado
    if (roundId) {
      loadAssessment();
    }

    // Se foram passadas alertas como props, usa elas
    if (propsAlertas && propsAlertas.length > 0) {
      
      // Filtrar apenas alertas visíveis (ativos + concluídos há menos de 24h)
      const alertasVisiveis = propsAlertas.filter(a => alertasService.isAlertaVisible(a));
      setAlertas(alertasVisiveis);
      
      // Separar apenas alertas ATIVOS para os turnos (excluir concluídos)
      const alertasAtivos = alertasVisiveis.filter(
        a => !a.concluded_at && a.status !== 'concluido' && a.status !== 'resolvido' && a.live_status !== 'resolvido / arquivado' && a.live_status !== 'concluido'
      );
      
      // Verificar se os alertas têm o campo shift_criacao
      const temShift = alertasAtivos.some((a: any) => a.shift_criacao);
      setUsarTurnos(temShift);
      
      if (temShift) {
        // Agrupar por turno (apenas ativos)
        const agrupados = {
          morning: alertasAtivos.filter(a => (a as any).shift_criacao === 'morning'),
          afternoon: alertasAtivos.filter(a => (a as any).shift_criacao === 'afternoon'),
          night: alertasAtivos.filter(a => (a as any).shift_criacao === 'night')
        };
        setAlertasPorTurno(agrupados);
      }
      
      setLoading(false);
      return;
    }

    // Caso contrário, carrega do alertasService (comportamento padrão)
    loadAlertas();
  }, [patientId, roundId, propsAlertas]);

  // Atualizar timer a cada 60 segundos para alertas concluídos
  useEffect(() => {
    const timerInterval = setInterval(() => {
      // Forçar re-render dos alertas para atualizar o timer
      setAlertas(prev => 
        prev.map(a => ({...a}))
      );
      
      setAlertasPorTurno(prev => ({
        morning: prev.morning.map(a => ({...a})),
        afternoon: prev.afternoon.map(a => ({...a})),
        night: prev.night.map(a => ({...a}))
      }));
    }, 60000); // Atualizar a cada 1 minuto

    return () => clearInterval(timerInterval);
  }, []);

  const loadAlertas = async () => {
    try {
      setLoading(true);
      // Usar getVisiveis em vez de getAlertas para filtrar alertas visíveis
      const data = await alertasService.getVisiveis(patientId);
      setAlertas(data);
      
      // Separar apenas alertas ATIVOS para os turnos (excluir concluídos)
      const alertasAtivos = data.filter(
        a => !a.concluded_at && a.status !== 'concluido' && a.status !== 'resolvido' && a.live_status !== 'resolvido / arquivado' && a.live_status !== 'concluido'
      );
      
      // Verificar se os alertas têm o campo shift_criacao
      const temShift = alertasAtivos.some((a: any) => a.shift_criacao);
      setUsarTurnos(temShift);
      
      if (temShift) {
        // Agrupar por turno (apenas ativos)
        const agrupados = {
          morning: alertasAtivos.filter(a => (a as any).shift_criacao === 'morning'),
          afternoon: alertasAtivos.filter(a => (a as any).shift_criacao === 'afternoon'),
          night: alertasAtivos.filter(a => (a as any).shift_criacao === 'night')
        };
        setAlertasPorTurno(agrupados);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadAssessment = async () => {
    if (!roundId) return;
    
    try {
      const data = await clinicalRoundsSimpleService.getByRound(patientId, roundId);
      setAssessment(data);
    } catch (error) {
    }
  };

  const handleJustificar = (alertaId: string) => {
    setJustificativaModal({ visible: true, alertaId, texto: '' });
  };

  const handleSalvarJustificativa = async () => {
    if (!justificativaModal.texto.trim()) {
      showToast('Por favor, informe uma justificativa', 'warning');
      return;
    }

    if (!user) {
      showToast('Usuário não identificado. Faça login novamente.', 'error');
      return;
    }

    try {
      const alerta = alertas.find(a => a.id_alerta === justificativaModal.alertaId);
      if (!alerta) {
        showToast('Alerta não encontrado', 'error');
        return;
      }

      const sucesso = await alertasService.updateJustificativa(
        justificativaModal.alertaId,
        justificativaModal.texto,
        alerta.fonte || 'alertas_paciente',
        user.id
      );

      if (sucesso) {
        setAlertas(alertas.map(a =>
          a.id_alerta === justificativaModal.alertaId
            ? { ...a, justificativa: justificativaModal.texto, justificativa_by: user.id }
            : a
        ));
        auditService.logJustificouAlerta(user.id, user.name, patientId, patientName || '', alerta.alertaclinico);
        setJustificativaModal({ visible: false, alertaId: '', texto: '' });
        showToast('Justificativa salva com sucesso!', 'success');
      } else {
        showToast('Erro ao salvar justificativa', 'error');
      }
    } catch {
      showToast('Erro ao salvar justificativa', 'error');
    }
  };

  const handleConcluir = async (alertaId: string) => {
    const confirmado = await showConfirm('Deseja concluir este alerta? (Ficará visível por 24 horas)');
    if (!confirmado) return;

    if (!user) {
      showToast('Usuário não identificado. Faça login novamente.', 'error');
      return;
    }

    try {
      const alerta = alertas.find(a => a.id_alerta === alertaId);
      if (!alerta) {
        showToast('Alerta não encontrado', 'error');
        return;
      }

      const sucesso = await alertasService.marcarComoConcluido(
        alertaId,
        alerta.fonte || 'alertas_paciente',
        user.id
      );

      if (sucesso) {
        auditService.logConclusaoAlerta(user.id, user.name, patientId, patientName || '', alerta.alertaclinico);
        await loadAlertas();
        showToast('Alerta concluído! Ficará visível por 24 horas.', 'success');
      } else {
        showToast('Erro ao marcar alerta como concluído', 'error');
      }
    } catch {
      showToast('Erro ao marcar alerta como concluído', 'error');
    }
  };

  const handleArquivar = (alertaId: string) => {
    setArquivamentoModal({
      visible: true,
      alertaId,
      motivo: ''
    });
  };

  const handleConfirmarArquivamento = async () => {
    if (!arquivamentoModal.motivo.trim()) {
      showToast('Por favor, informe o motivo do arquivamento', 'warning');
      return;
    }

    if (!user) {
      showToast('Usuário não identificado. Faça login novamente.', 'error');
      return;
    }

    try {
      const alerta = alertas.find(a => a.id_alerta === arquivamentoModal.alertaId);
      if (!alerta) {
        showToast('Alerta não encontrado', 'error');
        return;
      }

      const sucesso = await alertasService.arquivarAlerta(
        arquivamentoModal.alertaId,
        arquivamentoModal.motivo,
        alerta.fonte || 'alertas_paciente',
        user.id
      );

      if (sucesso) {
        auditService.logArquivouAlerta(user.id, user.name, patientId, patientName || '', alerta.alertaclinico, arquivamentoModal.motivo);
        setAlertas(alertas.filter(a => a.id_alerta !== arquivamentoModal.alertaId));
        setAlertasPorTurno(prev => ({
          morning: prev.morning.filter(a => a.id_alerta !== arquivamentoModal.alertaId),
          afternoon: prev.afternoon.filter(a => a.id_alerta !== arquivamentoModal.alertaId),
          night: prev.night.filter(a => a.id_alerta !== arquivamentoModal.alertaId)
        }));
        setArquivamentoModal({ visible: false, alertaId: '', motivo: '' });
        showToast('Alerta arquivado com sucesso!', 'success');
      } else {
        showToast('Erro ao arquivar alerta', 'error');
      }
    } catch {
      showToast('Erro ao arquivar alerta', 'error');
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

  const isAtivo = (a: Alerta) => {
    const s = (a.status || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const ls = (a.live_status || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return !a.concluded_at && s !== 'concluido' && s !== 'resolvido' && !ls.includes('resolvido') && !ls.includes('concluido') && !ls.includes('arquivado');
  };

  const alertasAtivos = alertas.filter(isAtivo);

  if (loading) {
    return <AlertasSkeleton count={3} />;
  }

  return (
    <div className="space-y-3">
      <AlertasHeader
        activeCount={alertasAtivos.length}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      />

      {expanded && (
        <div className="space-y-3">
          {alertasAtivos.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              ✓ Nenhum alerta ativo
            </div>
          ) : usarTurnos ? (
            <AlertasTurno
              alertasPorTurno={alertasPorTurno}
              assessment={assessment}
              onJustificar={handleJustificar}
              onConcluir={handleConcluir}
              onArquivar={handleArquivar}
            />
          ) : (
            <div className="space-y-2">
              {alertasAtivos.map((alerta) => (
                <AlertaCard
                  key={alerta.id_alerta}
                  alerta={alerta}
                  onJustificar={handleJustificar}
                  onConcluir={handleConcluir}
                  onArquivar={handleArquivar}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Justificativa */}
      {justificativaModal.visible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Adicionar Justificativa</h3>
            <textarea
              value={justificativaModal.texto}
              onChange={(e) => setJustificativaModal({ ...justificativaModal, texto: e.target.value })}
              placeholder="Digite a justificativa..."
              className="w-full h-24 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setJustificativaModal({ visible: false, alertaId: '', texto: '' })}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md font-medium transition-colors"
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

      {/* Modal de Arquivamento */}
      {arquivamentoModal.visible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Arquivar Alerta</h3>
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">{alertas.find(a => a.id_alerta === arquivamentoModal.alertaId)?.alertaclinico}</p>
            </div>
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded">
              <p className="text-xs text-blue-800 dark:text-blue-100">
                <strong>Info:</strong> O alerta será arquivado e não aparecerá mais na lista ativa, mas ficará registrado no histórico.
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Motivo do Arquivamento: <span className="text-red-500">*</span>
              </label>
              <textarea
                value={arquivamentoModal.motivo}
                onChange={(e) => setArquivamentoModal({ ...arquivamentoModal, motivo: e.target.value })}
                placeholder="Explique por que está arquivando este alerta..."
                className="w-full h-24 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setArquivamentoModal({ visible: false, alertaId: '', motivo: '' })}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarArquivamento}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium transition-colors"
              >
                Arquivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertasDisplay;
