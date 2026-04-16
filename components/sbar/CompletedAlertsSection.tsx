/**
 * Componente para exibir Alertas Concluidos do Paciente
 * Busca dados da view alertas_paciente_visibilidade_24h
 * Mostra alertas concluidos/resolvidos que ainda estao dentro da janela de 24h
 */

import React, { useState, useEffect } from 'react';
import { alertasService } from '../../services/alertasService';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../Toast';

interface CompletedAlertsSectionProps {
  patientId: string;
}

type ShiftKey = 'morning' | 'afternoon' | 'night';

interface ShiftConfig {
  key: ShiftKey;
  label: string;
  icon: string;
  timeRange: string;
  badgeColor: string;
}

const SHIFT_CONFIGS: ShiftConfig[] = [
  { key: 'morning', label: 'Manhã', icon: '🌅', timeRange: '07:00 - 13:00', badgeColor: 'bg-orange-500' },
  { key: 'afternoon', label: 'Tarde', icon: '☀️', timeRange: '13:00 - 19:00', badgeColor: 'bg-yellow-500' },
  { key: 'night', label: 'Noite', icon: '🌙', timeRange: '19:00 - 07:00', badgeColor: 'bg-indigo-500' },
];

const getShiftFromHour = (hour: number): ShiftKey => {
  if (hour >= 7 && hour < 13) return 'morning';
  if (hour >= 13 && hour < 19) return 'afternoon';
  return 'night';
};

const getCurrentShift = (): ShiftKey => getShiftFromHour(new Date().getHours());

interface AlertaConcluido {
  id_alerta: string;
  patient_id: string;
  patient_name?: string;
  bed_number?: string;
  created_by_name?: string;
  concluded_by_name?: string;
  alertaclinico: string;
  responsavel?: string;
  status: string;
  justificativa?: string | null;
  created_at: string;
  deadline?: string;
  updated_at?: string;
  archived_at?: string | null;
  concluded_at?: string | null;
  concluded_by?: string;
  tempo_visibilidade?: string;
  tipo_origem?: string;
  live_status?: string;
}

const CompletedAlertsSection: React.FC<CompletedAlertsSectionProps> = ({ patientId }) => {
  const { user } = useUser();
  const { showToast, showPrompt } = useToast();
  const [alertas, setAlertas] = useState<AlertaConcluido[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [activeShift, setActiveShift] = useState<ShiftKey>(getCurrentShift());

  const getShiftOfAlerta = (alerta: AlertaConcluido): ShiftKey => {
    const shiftCampo = (alerta as any).shift_criacao as ShiftKey | undefined;
    if (shiftCampo === 'morning' || shiftCampo === 'afternoon' || shiftCampo === 'night') {
      return shiftCampo;
    }
    const ref = alerta.created_at ? new Date(alerta.created_at) : new Date();
    return getShiftFromHour(ref.getHours());
  };

  const alertasPorTurno: Record<ShiftKey, AlertaConcluido[]> = {
    morning: [],
    afternoon: [],
    night: [],
  };
  for (const a of alertas) {
    alertasPorTurno[getShiftOfAlerta(a)].push(a);
  }
  const alertasDoTurno = alertasPorTurno[activeShift];
  const activeConfig = SHIFT_CONFIGS.find(s => s.key === activeShift)!;

  useEffect(() => {
    loadConcluidos();
    const interval = setInterval(() => {
      loadConcluidos();
    }, 300000);
    return () => clearInterval(interval);
  }, [patientId]);

  const loadConcluidos = async () => {
    try {
      const data = await alertasService.getConcluidos24h(patientId);
      setAlertas(data);
    } catch {
      showToast('Erro ao carregar alertas concluídos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleArquivar = async (alerta: AlertaConcluido) => {
    const motivo = await showPrompt('Motivo do arquivamento', 'Informe o motivo...');
    if (!motivo) return;

    if (!user) {
      showToast('Usuário não identificado. Faça login novamente.', 'error');
      return;
    }

    try {
      const fonte = alerta.tipo_origem === 'tasks' ? 'tasks' : 'alertas_paciente';
      const sucesso = await alertasService.arquivarAlerta(
        alerta.id_alerta,
        motivo,
        fonte as 'tasks' | 'alertas_paciente',
        user.id
      );

      if (sucesso) {
        setAlertas(prev => prev.filter(a => a.id_alerta !== alerta.id_alerta));
        showToast('Alerta arquivado com sucesso!', 'success');
      } else {
        showToast('Erro ao arquivar alerta', 'error');
      }
    } catch {
      showToast('Erro ao arquivar alerta', 'error');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const getOrigemBadge = (tipo: string | undefined) => {
    if (tipo === 'tasks') {
      return (
        <span className="inline-block px-2 py-0.5 rounded-full bg-purple-500 text-white text-xs font-semibold">
          Task
        </span>
      );
    }
    return (
      <span className="inline-block px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-semibold">
        Clínico
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-600 dark:text-gray-400">
        Carregando alertas concluídos...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header clicável */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="bg-linear-to-r from-green-600 to-green-700 dark:from-green-900 dark:to-green-800 rounded-lg p-4 text-white border border-green-300 dark:border-green-700 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <h3 className="text-lg font-bold">Alertas Concluídos</h3>
          </div>
          <div className="flex items-center gap-2">
            {alertas.length > 0 && (
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-bold text-sm">
                {alertas.length}
              </span>
            )}
            <span className={`text-2xl transition-transform ${expanded ? 'rotate-90' : ''}`}>›</span>
          </div>
        </div>
      </div>

      {/* Lista de alertas concluídos (expande/colapsa) */}
      {expanded && (
        <div className="space-y-2">
          {alertas.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              ✓ Nenhum alerta concluído nas últimas 24h
            </div>
          ) : (
            <>
              {/* Tabs por turno */}
              <div role="tablist" className="flex border-b border-slate-700 mb-3">
                {SHIFT_CONFIGS.map((shift) => {
                  const count = alertasPorTurno[shift.key].length;
                  const isActive = shift.key === activeShift;
                  return (
                    <button
                      key={shift.key}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveShift(shift.key)}
                      className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center justify-center gap-2 ${
                        isActive
                          ? 'border-primary text-primary'
                          : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{shift.icon}</span>
                      <span>{shift.label}</span>
                      {count > 0 && (
                        <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full ${shift.badgeColor} text-white text-xs font-bold`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-slate-400 mb-3">
                {activeConfig.icon} {activeConfig.label} · {activeConfig.timeRange}
              </div>

              {alertasDoTurno.length === 0 ? (
                <p className="text-sm text-center py-6 text-gray-500 dark:text-gray-400">
                  ✓ Nenhum alerta concluído neste turno
                </p>
              ) : (
                alertasDoTurno.map((alerta) => (
              <div
                key={`${alerta.tipo_origem}-${alerta.id_alerta}`}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 border-l-4 border-l-green-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    {/* Nome do alerta e badge de origem */}
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {alerta.alertaclinico}
                      </p>
                      {getOrigemBadge(alerta.tipo_origem)}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {/* Status */}
                      <div className="text-gray-700 dark:text-gray-200">
                        Status: <strong className="text-green-500 dark:text-green-300">{alerta.status}</strong>
                      </div>

                      {/* Criado em */}
                      {alerta.created_at && (
                        <div className="text-gray-600 dark:text-gray-300">
                          📅 Criado: {formatDate(alerta.created_at)}
                        </div>
                      )}

                      {/* Concluído por */}
                      {alerta.concluded_by_name && (
                        <div className="text-gray-600 dark:text-gray-300">
                          ✓ Concluído por: <strong className="text-white">{alerta.concluded_by_name}</strong>
                        </div>
                      )}

                      {/* Responsável */}
                      {alerta.responsavel && (
                        <div className="text-gray-600 dark:text-gray-300">
                          👤 Responsável: <strong className="text-white">{alerta.responsavel}</strong>
                        </div>
                      )}

                      {/* Justificativa */}
                      {alerta.justificativa && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-xs border-l-2 border-blue-400">
                          <p className="text-blue-900 dark:text-blue-300">
                            <strong>Justificativa:</strong> {alerta.justificativa}
                          </p>
                        </div>
                      )}

                      {/* Timer de visibilidade */}
                      {alerta.tempo_visibilidade && (
                        <div className="mt-2 inline-block px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-semibold">
                          ⏰ Visível por: {alerta.tempo_visibilidade}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botão arquivar */}
                  <button
                    onClick={() => handleArquivar(alerta)}
                    className="ml-2 px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded font-medium transition-colors"
                    title="Arquivar alerta"
                  >
                    🗑 Arquivar
                  </button>
                </div>
              </div>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CompletedAlertsSection;
