import React from 'react';
import { Alerta } from '../../services/alertasService';

interface HistoryTimelineProps {
  date: string;
  items: Alerta[];
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ date, items }) => {
  return (
    <div className="mb-6">
      <h3 className="text-gray-400 text-sm font-medium mb-3">
        {date}
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div 
            key={item.id_alerta}
            className="bg-[#1A1F2E] border border-gray-800 rounded-lg p-4 flex gap-4"
          >
            <div className="shrink-0 pt-1">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
            
            <div className="grow min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-white font-medium text-sm truncate pr-2">
                  [ALERTA] {item.alertaclinico}
                </h4>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center text-xs text-gray-400">
                  <span className="w-4 flex justify-center mr-2">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  Responsável: {item.responsavel}
                </div>

                <div className="flex items-center text-xs text-gray-400">
                  <span className="w-4 flex justify-center mr-2">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  Prazo Limite: {item.prazo_limite_formatado || item.prazo_limite_br}
                </div>

                {item.prazo_formatado && (
                  <div className="flex items-center text-xs text-gray-400">
                     <span className="w-4 flex justify-center mr-2">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    Prazo: {item.prazo_formatado}
                  </div>
                )}

                <div className="flex items-center text-xs text-gray-400">
                  <span className="w-4 flex justify-center mr-2">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Criado em: {item.hora_criacao_formatado || item.hora_criacao_br}
                </div>
                
                <div className="flex items-center text-xs text-gray-400">
                  <span className="w-4 flex justify-center mr-2">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  Criado por: {item.created_by_name}
                </div>

                <div className="flex items-center text-xs text-gray-400">
                  <span className="w-4 flex justify-center mr-2">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Status: {item.status.replace('_', ' ')}
                </div>

                {item.justificativa && (
                  <div className="flex items-start text-xs text-gray-400">
                    <span className="w-4 flex justify-center mr-2 mt-0.5">
                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                       </svg>
                    </span>
                    <span className="wrap-break-word">Justificativa: {item.justificativa}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
                <span className="text-gray-500 text-xs">{item.hora_criacao_hhmm}</span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryTimeline;
