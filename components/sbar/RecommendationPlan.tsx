/**
 * Componente para R - Recomendação / Plano
 * Com categorias por turno (manhã, tarde, noite)
 * Um único botão para salvar todos os turnos
 */

import React, { useState, useEffect } from 'react';
import { recommendationService, ClinicalRoundRecommendation } from '../../services/recommendationService';
import { auditLogService, AuditLogEntry } from '../../services/auditLogService';
import { backgroundService, Exame } from '../../services/backgroundService';

interface RecommendationByShift {
  respiratorio: string;
  hemodinamico: string;
  neurologico: string;
  deliriumPrevencao: string;
  metabolicoRenal: string;
  exames: string;
  pendencias: string;
}

interface RecommendationPlanProps {
  morning: RecommendationByShift;
  afternoon: RecommendationByShift;
  night: RecommendationByShift;
  currentUserId: string;
  currentUserName: string;
  roundId?: string;
  patientId: string;
  shiftStatus?: ClinicalRoundRecommendation | null;
  selectedShift?: 'morning' | 'afternoon' | 'night';
  onShiftChange?: (shift: 'morning' | 'afternoon' | 'night') => void;
  onMorningChange: (key: keyof RecommendationByShift, value: string) => void;
  onAfternoonChange: (key: keyof RecommendationByShift, value: string) => void;
  onNightChange: (key: keyof RecommendationByShift, value: string) => void;
  onSaved?: (message: string) => void;
}

// Componente interno para exibir histórico de Recomendações
interface RecommendationHistoryPanelProps {
  shift: 'morning' | 'afternoon' | 'night';
  roundId: string;
  shiftStatus?: ClinicalRoundRecommendation | null;
}

const RecommendationHistoryPanel: React.FC<RecommendationHistoryPanelProps> = ({ shift, roundId, shiftStatus }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        const logs = await auditLogService.getAuditLogByShift(roundId, shift);
        setAuditLogs(logs);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuditLogs();
  }, [roundId, shift]);

  if (loading) {
    return <div className="mt-4 p-3 bg-gray-800 rounded text-center text-gray-400">Carregando histórico...</div>;
  }

  const recommendationLogs = auditLogs.filter(log => log.data_type === 'recommendation');

  if (recommendationLogs.length === 0) {
    return null;
  }

  const shiftLabel = { morning: 'Manhã', afternoon: 'Tarde', night: 'Noite' }[shift];

  return (
    <div className="mt-6 p-4 bg-green-900 rounded-lg border border-green-700">
      <h4 className="font-semibold text-green-100 mb-3">📋 Histórico de Recomendações - {shiftLabel}</h4>
      <div className="space-y-2">
        {recommendationLogs.map((log, idx) => (
          <div key={idx} className="p-3 bg-gray-800 rounded border border-green-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-white">
                  ✅ Salvo por: <span className="text-green-400">{log.saved_by_name || 'Sistema'}</span>
                </p>
                <p className="text-sm text-gray-400">
                  📅 {new Date(log.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RecommendationPlan: React.FC<RecommendationPlanProps> = ({
  morning,
  afternoon,
  night,
  currentUserId,
  currentUserName,
  roundId,
  patientId,
  shiftStatus,
  selectedShift: propSelectedShift,
  onShiftChange,
  onMorningChange,
  onAfternoonChange,
  onNightChange,
  onSaved,
}) => {
  const [internalSelectedShift, setInternalSelectedShift] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [saving, setSaving] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Estado para modal de exames
  const [exameModal, setExameModal] = useState<{ open: boolean; exame?: Exame }>({ open: false });
  const [exames, setExames] = useState<Exame[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Usa o selectedShift da prop se fornecido, senão usa o estado interno
  const selectedShift = propSelectedShift || 'morning';
  
  // Carrega os exames do paciente
  useEffect(() => {
    const loadExames = async () => {
      if (!patientId) return;
      console.log('🔄 Carregando exames do paciente:', patientId);
      const data = await backgroundService.getExames(patientId);
      console.log('📋 Exames carregados:', data);
      setExames(data);
    };
    loadExames();
  }, [patientId, refreshKey]);
  
  const handleShiftChange = (shift: 'morning' | 'afternoon' | 'night') => {
    setInternalSelectedShift(shift);
    if (onShiftChange) {
      onShiftChange(shift);
    }
  };

  const shiftData = {
    morning: { label: '🌅 Manhã', data: morning, onChange: onMorningChange },
    afternoon: { label: '☀️ Tarde', data: afternoon, onChange: onAfternoonChange },
    night: { label: '🌙 Noite', data: night, onChange: onNightChange }
  };

  const categories = [
    { key: 'respiratorio' as const, icon: 'air', title: 'Respiratório', placeholder: 'Ajustes ventilatórios, reexpansão, metas de desmame...' },
    { key: 'hemodinamico' as const, icon: 'favorite', title: 'Hemodinâmico', placeholder: 'Titulação de drogas, metas de PAM/perfusão...' },
    { key: 'neurologico' as const, icon: 'psychology', title: 'Neurológico', placeholder: 'Metas de sedação e dor.\nMedidas de prevenção de delirium.' },
    { key: 'metabolicoRenal' as const, icon: 'water_drop', title: 'Metabólico/Renal', placeholder: 'Balanço hídrico alvo, ajustes de dieta/NPT...' },
    { key: 'exames' as const, icon: 'assignment', title: 'Exames e Avaliações', placeholder: 'Exames solicitados e avaliações...', showExamesList: true },
    { key: 'pendencias' as const, icon: 'checklist', title: 'Pendências', placeholder: 'Procedimentos, alertas, checagem de dispositivos...' }
  ];

  const handleSaveAll = async () => {
    if (!roundId) {
      onSaved?.('❌ Erro: Round não identificado');
      return;
    }

    setSaving(true);
    try {
      // Salva apenas o turno selecionado
      const currentData = shiftData[selectedShift].data;
      const result = await recommendationService.saveShiftRecommendation(
        patientId, 
        roundId, 
        selectedShift, 
        currentData, 
        currentUserId, 
        currentUserName
      );

      if (result) {
        const shiftLabel = {
          morning: 'Manhã',
          afternoon: 'Tarde',
          night: 'Noite'
        }[selectedShift];
        onSaved?.(`✅ Recomendação da ${shiftLabel} salva com sucesso!`);
      } else {
        onSaved?.('❌ Erro ao salvar recomendação');
      }
    } catch (error) {
      onSaved?.('❌ Erro ao salvar recomendação');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveExame = async (exameData: { nome_exame: string; data_exame: string; observacao?: string }) => {
    if (!patientId) {
      console.error('❌ PatientId não encontrado');
      return;
    }
    
    try {
      console.log('💾 Salvando exame:', exameData);
      console.log('👤 PatientId:', patientId);
      
      if (exameModal.exame) {
        console.log('✏️ Atualizando exame existente:', exameModal.exame.id);
        const result = await backgroundService.updateExame(exameModal.exame.id, exameData);
        console.log('✅ Exame atualizado:', result);
      } else {
        console.log('➕ Criando novo exame');
        const dataToSave = {
          ...exameData,
          paciente_id: patientId,
          is_archived: false
        };
        console.log('📦 Dados para salvar:', dataToSave);
        const result = await backgroundService.saveExame(dataToSave);
        console.log('✅ Exame salvo:', result);
        
        if (!result) {
          console.error('❌ backgroundService.saveExame retornou null');
          alert('Erro ao salvar exame. Verifique o console.');
          return;
        }
      }
      
      // Recarrega a lista
      console.log('🔄 Recarregando lista de exames...');
      const updatedExames = await backgroundService.getExames(patientId);
      console.log('📋 Exames carregados:', updatedExames);
      setExames(updatedExames);
      setRefreshKey(prev => prev + 1); // Força atualização
      setExameModal({ open: false });
      console.log('✅ Modal fechado');
    } catch (error) {
      console.error('❌ Erro ao salvar exame:', error);
      alert('Erro ao salvar exame: ' + (error as any).message);
    }
  };

  const handleDeleteExame = async (id: string) => {
    if (!patientId) return;
    await backgroundService.deleteExame(id);
    const updatedExames = await backgroundService.getExames(patientId);
    setExames(updatedExames);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
      <h3 className="text-lg font-bold text-white mb-4">R - Recomendação / Plano</h3>

      {/* Tabs de Turnos */}
      <div className="flex gap-2 mb-4 border-b border-gray-700 flex-wrap">
        {Object.entries(shiftData).map(([shift, { label }]) => {
          const isCurrentShift = selectedShift === shift;
          return (
            <button
              key={shift}
              onClick={() => handleShiftChange(shift as 'morning' | 'afternoon' | 'night')}
              className={`px-4 py-2 font-semibold transition ${
                isCurrentShift
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo do turno selecionado */}
      <div className="space-y-2 mb-6">
        {categories.map((category) => {
          const currentData = shiftData[selectedShift];
          const isExpanded = expandedCategory === category.key;
          const hasContent = currentData.data[category.key]?.trim().length > 0;
          
          return (
            <div key={category.key} className="border border-gray-600 rounded-lg">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.key)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-800 transition appearance-none"
              >
                <div className="flex items-center gap-3 font-semibold text-gray-300 text-lg">
                  <span className="material-symbols-outlined text-2xl shrink-0 text-green-400">{category.icon}</span>
                  <span className="grow text-left">{category.title}</span>
                  {hasContent && <span className="text-green-400 text-lg">✓</span>}
                </div>
                <span className={`text-gray-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {isExpanded && (
                <div className="p-3 border-t border-gray-600 bg-gray-800">
                  {category.showExamesList && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-400">Exames cadastrados:</span>
                        <button
                          onClick={() => setExameModal({ open: true })}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                        >
                          + Adicionar Exame
                        </button>
                      </div>
                      
                      {exames.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {exames.map((exame) => (
                            <div key={exame.id} className="bg-gray-700 p-3 rounded border border-gray-600">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-white">{exame.nome_exame}</p>
                                  <p className="text-sm text-gray-400">
                                    {new Date(exame.data_exame).toLocaleDateString('pt-BR')}
                                  </p>
                                  {exame.observacao && (
                                    <p className="text-sm text-gray-300 mt-1">{exame.observacao}</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setExameModal({ open: true, exame })}
                                    className="text-blue-400 hover:text-blue-300"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteExame(exame.id)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic mb-4">Nenhum exame cadastrado ainda.</p>
                      )}
                    </div>
                  )}
                  
                  {!category.showExamesList && (
                    <textarea
                      value={currentData.data[category.key]}
                      onChange={(e) => currentData.onChange(category.key, e.target.value)}
                      placeholder={category.placeholder}
                      className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-800 whitespace-pre-wrap"
                      rows={6}
                      wrap="soft"
                      autoFocus
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Painel de Histórico - Mostra quem salvou e quando */}
      {roundId && (
        <RecommendationHistoryPanel
          shift={selectedShift}
          roundId={roundId}
          shiftStatus={shiftStatus}
        />
      )}
      
      {/* Modal de Exame */}
      {exameModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              {exameModal.exame ? 'Editar Exame' : 'Cadastrar Exame'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveExame({
                  nome_exame: formData.get('nome_exame') as string,
                  data_exame: formData.get('data_exame') as string,
                  observacao: formData.get('observacao') as string
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Exame
                </label>
                <input
                  type="text"
                  name="nome_exame"
                  defaultValue={exameModal.exame?.nome_exame || ''}
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data do Exame
                </label>
                <input
                  type="date"
                  name="data_exame"
                  defaultValue={exameModal.exame?.data_exame || new Date().toISOString().split('T')[0]}
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observação
                </label>
                <textarea
                  name="observacao"
                  defaultValue={exameModal.exame?.observacao || ''}
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setExameModal({ open: false })}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationPlan;


