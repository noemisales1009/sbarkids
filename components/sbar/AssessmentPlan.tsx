/**
 * Componente para A - Assessment (Avaliação)
 * Com categorias por turno (manhã, tarde, noite)
 * Um único botão para salvar todos os turnos
 */

import React, { useState, useEffect } from 'react';
import { assessmentService, ClinicalRoundAssessment } from '../../services/assessmentService';
import { auditLogService, AuditLogEntry } from '../../services/auditLogService';
import ShiftHistoryPanel from './ShiftHistoryPanel';

interface AssessmentByShift {
  respiratorio: string;
  hemodinamico: string;
  neurologico: string;
  renal: string;
  infeccioso: string;
  observacoes: string;
}

interface AssessmentPlanProps {
  morning: AssessmentByShift;
  afternoon: AssessmentByShift;
  night: AssessmentByShift;
  currentUserId: string;
  currentUserName: string;
  roundId?: string;
  patientId: string;
  shiftStatus?: ClinicalRoundAssessment | null;
  selectedShift?: 'morning' | 'afternoon' | 'night';
  onShiftChange?: (shift: 'morning' | 'afternoon' | 'night') => void;
  onMorningChange: (key: keyof AssessmentByShift, value: string) => void;
  onAfternoonChange: (key: keyof AssessmentByShift, value: string) => void;
  onNightChange: (key: keyof AssessmentByShift, value: string) => void;
  onSaved?: (message: string) => void;
}

// Componente interno para exibir histórico da Avaliação
interface AssessmentHistoryPanelProps {
  shift: 'morning' | 'afternoon' | 'night';
  roundId: string;
  shiftStatus?: ClinicalRoundAssessment | null;
}

const AssessmentHistoryPanel: React.FC<AssessmentHistoryPanelProps> = ({ shift, roundId, shiftStatus }) => {
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

  const assessmentLogs = auditLogs.filter(log => log.data_type === 'assessment');

  if (assessmentLogs.length === 0) {
    return null;
  }

  const shiftLabel = { morning: 'Manhã', afternoon: 'Tarde', night: 'Noite' }[shift];

  return (
    <div className="mt-6 p-4 bg-blue-900 rounded-lg border border-blue-700">
      <h4 className="font-semibold text-blue-100 mb-3">📋 Histórico de Avaliações - {shiftLabel}</h4>
      <div className="space-y-2">
        {assessmentLogs.map((log, idx) => (
          <div key={idx} className="p-3 bg-gray-800 rounded border border-blue-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-white">
                  ✅ Salvo por: <span className="text-blue-400">{log.saved_by_name || 'Sistema'}</span>
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

const AssessmentPlan: React.FC<AssessmentPlanProps> = ({
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

  // Usa o selectedShift da prop se fornecido, senão usa o estado interno
  const selectedShift = propSelectedShift || 'morning';
  
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
    { key: 'respiratorio' as const, icon: 'air', title: 'Respiratório', placeholder: 'Murmúrios vesiculares, sibilos, SpO2...' },
    { key: 'hemodinamico' as const, icon: 'favorite', title: 'Hemodinâmico', placeholder: 'PA, FC, débito urinário, perfusão...' },
    { key: 'neurologico' as const, icon: 'psychology', title: 'Neurológico', placeholder: 'Nível de consciência, escalas de sedação...' },
    { key: 'renal' as const, icon: 'water_drop', title: 'Renal/Hidro', placeholder: 'Diurese, balanço hídrico, eletrólitos...' },
    { key: 'infeccioso' as const, icon: 'shield', title: 'Infeccioso', placeholder: 'Sinais de infecção, febre, culturas...' },
    { key: 'observacoes' as const, icon: 'description', title: 'Observações Gerais', placeholder: 'Outros achados relevantes...' },
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
      const result = await assessmentService.saveShiftAssessment(
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
        onSaved?.(`✅ Avaliação da ${shiftLabel} salva com sucesso!`);
      } else {
        onSaved?.('❌ Erro ao salvar avaliação');
      }
    } catch (error) {
      onSaved?.('❌ Erro ao salvar avaliação');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
      <h3 className="text-lg font-bold text-white mb-4">A - Assessment (Avaliação)</h3>

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
                  <span className="material-symbols-outlined text-2xl shrink-0 text-blue-400">{category.icon}</span>
                  <span className="grow text-left">{category.title}</span>
                  {hasContent && <span className="text-green-400 text-lg">✓</span>}
                </div>
                <span className={`text-gray-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {isExpanded && (
                <div className="p-3 border-t border-gray-600 bg-gray-800">
                  <textarea
                    value={currentData.data[category.key]}
                    onChange={(e) => currentData.onChange(category.key, e.target.value)}
                    placeholder={category.placeholder}
                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-900 text-white placeholder:text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    autoFocus
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Painel de Histórico - Mostra quem salvou e quando */}
      {roundId && (
        <AssessmentHistoryPanel
          shift={selectedShift}
          roundId={roundId}
          shiftStatus={shiftStatus}
        />
      )}
    </div>
  );
};

export default AssessmentPlan;
