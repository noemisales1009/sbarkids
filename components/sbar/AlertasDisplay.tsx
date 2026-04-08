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

interface AlertasDisplayProps {
  patientId: string;
  roundId?: string;
  alertas?: Alerta[];
}

const AlertasDisplay: React.FC<AlertasDisplayProps> = ({ patientId, roundId, alertas: propsAlertas }) => {
  const { user } = useUser();
  
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
      alert('Por favor, informe uma justificativa');
      return;
    }

    if (!user) {
      alert('Usuário não identificado. Faça login novamente.');
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
        alerta.fonte || 'alertas_paciente',
        user.id  // Passar ID do usuário
      );
      
      if (sucesso) {
        // Atualizar estado local com todos os campos
        const agora = new Date().toISOString();
        setAlertas(alertas.map(a => 
          a.id_alerta === justificativaModal.alertaId 
            ? { 
                ...a, 
                justificativa: justificativaModal.texto,
                justificativa_by: user.id  // Pode ser não-exista essa propriedade, mas colocamos
              }
            : a
        ));
        
        setJustificativaModal({ visible: false, alertaId: '', texto: '' });
        alert('✓ Justificativa salva com sucesso!');
      } else {
        alert('Erro ao salvar justificativa');
      }
    } catch (error) {
      alert('Erro ao salvar justificativa');
    }
  };

  const handleConcluir = async (alertaId: string) => {
    if (!window.confirm('Deseja concluir este alerta? (Ficará visível por 24 horas)')) {
      return;
    }

    if (!user) {
      alert('Usuário não identificado. Faça login novamente.');
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
        alerta.fonte || 'alertas_paciente',
        user.id  // Passar ID do usuário logado
      );
      
      if (sucesso) {
        // Recarregar os alertas do servidor para ter dados sincronizados
        await loadAlertas();
        alert('✓ Alerta concluído! Ficará visível por 24 horas.');
      } else {
        alert('Erro ao marcar alerta como concluído');
      }
    } catch (error) {
      alert('Erro ao marcar alerta como concluído');
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
      alert('Por favor, informe o motivo do arquivamento');
      return;
    }

    if (!user) {
      alert('Usuário não identificado. Faça login novamente.');
      return;
    }

    try {
      const alerta = alertas.find(a => a.id_alerta === arquivamentoModal.alertaId);
      if (!alerta) {
        alert('Alerta não encontrado');
        return;
      }

      const sucesso = await alertasService.arquivarAlerta(
        arquivamentoModal.alertaId,
        arquivamentoModal.motivo,
        alerta.fonte || 'alertas_paciente',
        user.id  // Passar ID do usuário logado
      );
      
      if (sucesso) {
        // Remover da lista principal
        setAlertas(alertas.filter(a => a.id_alerta !== arquivamentoModal.alertaId));
        
        // Remover também da lista por turno se estiver sendo usada
        setAlertasPorTurno(prev => ({
          morning: prev.morning.filter(a => a.id_alerta !== arquivamentoModal.alertaId),
          afternoon: prev.afternoon.filter(a => a.id_alerta !== arquivamentoModal.alertaId),
          night: prev.night.filter(a => a.id_alerta !== arquivamentoModal.alertaId)
        }));
        
        setArquivamentoModal({ visible: false, alertaId: '', motivo: '' });
        alert('✓ Alerta arquivado com sucesso!');
      } else {
        alert('Erro ao arquivar alerta');
      }
    } catch (error) {
      alert('Erro ao arquivar alerta');
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
            {(() => {
              const countAtivos = alertas.filter(
                a => {
                  const s = (a.status || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                  const ls = (a.live_status || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                  return !a.concluded_at && s !== 'concluido' && s !== 'resolvido' && !ls.includes('resolvido') && !ls.includes('concluido') && !ls.includes('arquivado');
                }
              ).length;
              return countAtivos > 0 ? (
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold text-sm">
                  {countAtivos}
                </span>
              ) : null;
            })()}
            <span className={`text-2xl transition-transform ${expanded ? 'rotate-90' : ''}`}>›</span>
          </div>
        </div>
      </div>

      {/* Lista de alertas (expande/colapsa) */}
      {expanded && (
        <div className="space-y-3">
          {(() => {
            const isAtivo = (a: any) => {
              const s = (a.status || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              const ls = (a.live_status || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              return !a.concluded_at && s !== 'concluido' && s !== 'resolvido' && !ls.includes('resolvido') && !ls.includes('concluido') && !ls.includes('arquivado');
            };
            const alertasAtivos = alertas.filter(isAtivo);

            if (alertasAtivos.length === 0) return (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                ✓ Nenhum alerta ativo
              </div>
            );

            return (
            <>
              {/* SEÇÃO: ALERTAS ATIVOS (concluídos agora ficam no CompletedAlertsSection) */}
              {(() => {
                return usarTurnos ? (
            <div className="space-y-4">
              {/* Turno Manhã */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  🌅 Manhã (7:01 - 13:00)
                  {alertasPorTurno.morning.length > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-semibold">
                      {alertasPorTurno.morning.length}
                    </span>
                  )}
                </h4>
                
                {/* Assessment da Manhã */}
                {assessment && assessment.assessment_morning && (
                  <div className="mb-3 ml-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">📝 Avaliação (Assessment)</p>
                    <p className="text-sm text-gray-900 dark:text-white mb-2 whitespace-pre-wrap">{assessment.assessment_morning}</p>
                    {assessment.assessment_morning_saved_by_name && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 border-t border-blue-200 dark:border-blue-800 pt-2">
                        <span>💾 Salvo por: <strong>{assessment.assessment_morning_saved_by_name}</strong></span>
                        {assessment.assessment_morning_saved_at && (
                          <span className="block">
                            🕐 Em: {new Date(assessment.assessment_morning_saved_at).toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {alertasPorTurno.morning.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-6">Nenhum alerta neste turno</p>
                ) : (
                  <div className="space-y-2">
                    {alertasPorTurno.morning.map((alerta) => (
                      <div
                        key={alerta.id_alerta}
                        className={`p-4 rounded-lg border-l-4 ml-4 ${getStatusColor(
                          alerta.live_status
                        )} border-l-orange-500`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-white text-lg">🔔</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white break-word">
                                {alerta.alertaclinico}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 flex flex-col items-end gap-2">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadgeColor(
                                alerta.live_status
                              )}`}
                            >
                              {getStatusLabel(alerta.live_status)}
                            </span>
                          </div>
                        </div>
                        {alerta.justificativa && (
                          <div className="mt-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              <strong>Justificativa:</strong> {alerta.justificativa}
                            </p>
                          </div>
                        )}
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
                            onClick={() => handleArquivar(alerta.id_alerta)}
                            className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium transition-colors flex items-center gap-2"
                          >
                            📦 Arquivar
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Criado por: <strong>{alerta.created_by_name}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Turno Tarde */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  ☀️ Tarde (13:01 - 19:00)
                  {alertasPorTurno.afternoon.length > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-yellow-500 text-white text-xs font-semibold">
                      {alertasPorTurno.afternoon.length}
                    </span>
                  )}
                </h4>
                
                {/* Assessment da Tarde */}
                {assessment && assessment.assessment_afternoon && (
                  <div className="mb-3 ml-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">📝 Avaliação (Assessment)</p>
                    <p className="text-sm text-gray-900 dark:text-white mb-2 whitespace-pre-wrap">{assessment.assessment_afternoon}</p>
                    {assessment.assessment_afternoon_saved_by_name && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 border-t border-blue-200 dark:border-blue-800 pt-2">
                        <span>💾 Salvo por: <strong>{assessment.assessment_afternoon_saved_by_name}</strong></span>
                        {assessment.assessment_afternoon_saved_at && (
                          <span className="block">
                            🕐 Em: {new Date(assessment.assessment_afternoon_saved_at).toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {alertasPorTurno.afternoon.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-6">Nenhum alerta neste turno</p>
                ) : (
                  <div className="space-y-2">
                    {alertasPorTurno.afternoon.map((alerta) => (
                      <div
                        key={alerta.id_alerta}
                        className={`p-4 rounded-lg border-l-4 ml-4 ${getStatusColor(
                          alerta.live_status
                        )} border-l-yellow-500`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-white text-lg">🔔</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white break-word">
                                {alerta.alertaclinico}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadgeColor(
                                alerta.live_status
                              )}`}
                            >
                              {getStatusLabel(alerta.live_status)}
                            </span>
                            {(alerta.status === 'concluido' || alerta.status === 'Concluído' || alerta.live_status === 'concluido') ? (
                              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded whitespace-nowrap mt-1">
                                ⏰ {alertasService.getTempoRestanteVisibilidade(alerta) || 'Calcular...'}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        {alerta.justificativa && (
                          <div className="mt-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              <strong>Justificativa:</strong> {alerta.justificativa}
                            </p>
                          </div>
                        )}
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
                            onClick={() => handleArquivar(alerta.id_alerta)}
                            className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium transition-colors flex items-center gap-2"
                          >
                            📦 Arquivar
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Criado por: <strong>{alerta.created_by_name}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Turno Noite */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  🌙 Noite (19:01 - 07:00)
                  {alertasPorTurno.night.length > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-indigo-500 text-white text-xs font-semibold">
                      {alertasPorTurno.night.length}
                    </span>
                  )}
                </h4>
                
                {/* Assessment da Noite */}
                {assessment && assessment.assessment_night && (
                  <div className="mb-3 ml-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">📝 Avaliação (Assessment)</p>
                    <p className="text-sm text-gray-900 dark:text-white mb-2 whitespace-pre-wrap">{assessment.assessment_night}</p>
                    {assessment.assessment_night_saved_by_name && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 border-t border-blue-200 dark:border-blue-800 pt-2">
                        <span>💾 Salvo por: <strong>{assessment.assessment_night_saved_by_name}</strong></span>
                        {assessment.assessment_night_saved_at && (
                          <span className="block">
                            🕐 Em: {new Date(assessment.assessment_night_saved_at).toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {alertasPorTurno.night.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-6">Nenhum alerta neste turno</p>
                ) : (
                  <div className="space-y-2">
                    {alertasPorTurno.night.map((alerta) => (
                      <div
                        key={alerta.id_alerta}
                        className={`p-4 rounded-lg border-l-4 ml-4 ${getStatusColor(
                          alerta.live_status
                        )} border-l-indigo-500`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-white text-lg">🔔</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white break-word">
                                {alerta.alertaclinico}
                              </p>
                            </div>
                          </div>
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
                        {alerta.justificativa && (
                          <div className="mt-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              <strong>Justificativa:</strong> {alerta.justificativa}
                            </p>
                          </div>
                        )}
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
                            onClick={() => handleArquivar(alerta.id_alerta)}
                            className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium transition-colors flex items-center gap-2"
                          >
                            📦 Arquivar
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Criado por: <strong>{alerta.created_by_name}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Exibição padrão (sem turno)
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
                    onClick={() => handleArquivar(alerta.id_alerta)}
                    className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium transition-colors flex items-center gap-2"
                  >
                    📦 Arquivar
                  </button>
                </div>

                {/* Criado por */}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Criado por: <strong>{alerta.created_by_name}</strong>
                </div>
              </div>
            ))
          );
              })()}

              {/* Modals and other UI elements */}
            </>
            );
          })()}
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

      {/* Modal de Arquivamento */}
      {arquivamentoModal.visible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-700 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">⚠️ Arquivar Alerta</h3>

            {/* Alerta apresentado */}
            <div className="mb-4 p-3 bg-gray-800 rounded border border-gray-700">
              <p className="text-sm text-gray-300 font-mono">{alertas.find(a => a.id_alerta === arquivamentoModal.alertaId)?.alertaclinico}</p>
            </div>

            {/* Informação importante */}
            <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded">
              <p className="text-xs text-blue-100">
                <strong>ℹ️ Informação:</strong> O alerta será arquivado e não aparecerá mais na lista ativa, mas ficará registrado no histórico do paciente com o motivo do arquivamento.
              </p>
            </div>

            {/* Campo de motivo */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Motivo do Arquivamento: <span className="text-red-400">*</span>
              </label>
              <textarea
                value={arquivamentoModal.motivo}
                onChange={(e) => setArquivamentoModal({ ...arquivamentoModal, motivo: e.target.value })}
                placeholder="Explique por que está arquivando este alerta..."
                className="w-full h-24 bg-gray-800 border border-gray-700 rounded-md text-white px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2">
              <button
                onClick={() => setArquivamentoModal({ visible: false, alertaId: '', motivo: '' })}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-medium transition-colors"
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
