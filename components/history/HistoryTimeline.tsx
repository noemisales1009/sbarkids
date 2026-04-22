import React, { useState, useEffect } from 'react';
import { Alerta, alertasService } from '../../services/alertasService';

interface HistoryTimelineProps {
  date: string;
  items: Alerta[];
}

const getShiftBorderColor = (createdAt: string | undefined): string => {
  if (!createdAt) return 'border-l-gray-400';
  const hour = new Date(createdAt).getHours();
  if (hour >= 7 && hour < 13) return 'border-l-orange-500';
  if (hour >= 13 && hour < 19) return 'border-l-yellow-500';
  return 'border-l-indigo-500';
};

const isConcluded = (status: string, liveStatus: string): boolean => {
  const s = (status || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const ls = (liveStatus || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return s === 'concluido' || s === 'resolvido' || ls.includes('concluido') || ls.includes('resolvido');
};

const getStatusColor = (status: string, liveStatus: string): string => {
  if (isConcluded(status, liveStatus)) return 'text-green-400';
  const ls = (liveStatus || '').toLowerCase();
  if (ls === 'fora_do_prazo' || ls.includes('fora')) return 'text-red-400';
  return 'text-yellow-400';
};

const getOriginBadge = (fonte?: string) => {
  if (fonte === 'tasks') {
    return <span className="inline-block px-2 py-0.5 rounded-full bg-purple-500 text-white text-xs font-semibold ml-2">Task</span>;
  }
  return <span className="inline-block px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-semibold ml-2">Clínico</span>;
};

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleString('pt-BR');
  } catch {
    return dateStr;
  }
};

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ date, items }) => {
  const [visibilityMap, setVisibilityMap] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const concluded = items.filter(i => isConcluded(i.status, i.live_status));
    if (concluded.length === 0) return;

    Promise.all(
      concluded.map(async (item) => {
        const tempo = await alertasService.getTempoRestanteVisibilidadeSQL(
          item.id_alerta,
          item.status,
          item.concluded_at ?? item.updated_at ?? null,
          item.fonte ?? 'alertas_paciente'
        );
        return [item.id_alerta, tempo] as [string, string | null];
      })
    ).then(results => {
      setVisibilityMap(Object.fromEntries(results));
    });
  }, [items]);

  return (
    <div className="mb-6">
      <h3 className="text-gray-400 text-sm font-medium mb-3">
        {date}
      </h3>
      <div className="space-y-2">
        {items.map((item) => {
          const concluded = isConcluded(item.status, item.live_status);
          const statusLabel = item.status?.replace('_', ' ') || 'ativo';
          const tempoVisibilidade = concluded ? (visibilityMap[item.id_alerta] ?? null) : null;

          return (
            <div
              key={item.id_alerta}
              className={`p-4 bg-gray-800/40 rounded-lg border border-gray-700 border-l-4 ${getShiftBorderColor(item.created_at)}`}
            >
              {/* Título e badge de origem */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <p className="font-semibold text-white text-sm">{item.alertaclinico}</p>
                {getOriginBadge(item.fonte)}
              </div>

              <div className="space-y-1.5 text-xs">
                {/* Status */}
                <div className="text-gray-300">
                  Status: <strong className={getStatusColor(item.status, item.live_status)}>{statusLabel}</strong>
                </div>

                {/* Criado em */}
                <div className="text-gray-400">
                  📅 Criado: {item.hora_criacao_formatado || formatDate(item.created_at)}
                </div>

                {/* Concluído por (se concluído) */}
                {concluded && item.concluded_by_name && (
                  <div className="text-gray-300">
                    ✓ Concluído por: <strong className="text-white">{item.concluded_by_name}</strong>
                  </div>
                )}

                {/* Criado por (se não concluído) */}
                {!concluded && item.created_by_name && (
                  <div className="text-gray-400">
                    👤 Criado por: <strong className="text-white">{item.created_by_name}</strong>
                  </div>
                )}

                {/* Justificativa */}
                {item.justificativa && item.justificativa.trim() !== '' && (
                  <div className="mt-2 p-2 bg-blue-900/30 rounded border-l-2 border-blue-400">
                    <p className="text-blue-200">
                      <strong>Justificativa:</strong> {item.justificativa}
                    </p>
                  </div>
                )}

                {/* Timer de visibilidade (apenas para concluídos dentro de 24h) */}
                {tempoVisibilidade && tempoVisibilidade !== 'Expirado' && (
                  <div className="mt-2 inline-block px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs font-semibold">
                    ⏰ Visível por: {tempoVisibilidade}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryTimeline;
