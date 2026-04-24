/**
 * Componente simplificado para A - Assessment (Avaliação)
 * Um único campo de texto por turno (Manhã, Tarde, Noite)
 */

import React, { useState, useEffect, useRef } from 'react';
import { clinicalRoundsSimpleService } from '../../services/clinicalRoundsSimpleService';

type EditRow = { id: number; content: string; nome_editor: string; data_edicao: string };

interface AssessmentSimpleProps {
  patientId: string;
  roundId?: string;
  currentUserName: string;
  onSaved?: (message: string) => void;
}

const AssessmentSimple: React.FC<AssessmentSimpleProps> = ({
  patientId,
  roundId,
  currentUserName,
  onSaved
}) => {
  const [selectedShift, setSelectedShift] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Estado dos campos
  const [assessmentMorning, setAssessmentMorning] = useState('');
  const [assessmentAfternoon, setAssessmentAfternoon] = useState('');
  const [assessmentNight, setAssessmentNight] = useState('');

  // Guarda o conteúdo original para cancelar edição
  const cancelContentRef = useRef('');

  // Histórico de edições
  const [edits, setEdits] = useState<EditRow[]>([]);

  // Carregar dados ao montar
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await clinicalRoundsSimpleService.getByRound(patientId, roundId);
        if (data) {
          setAssessmentMorning(data.assessment_morning || '');
          setAssessmentAfternoon(data.assessment_afternoon || '');
          setAssessmentNight(data.assessment_night || '');
        }
      } catch (error) {
        console.error('Erro ao carregar avaliação:', error);
        onSaved?.('❌ Erro ao carregar avaliação');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId, roundId]);

  // Ao trocar de turno, sai do modo edição
  useEffect(() => {
    setEditing(false);
  }, [selectedShift]);

  // Carregar histórico de edições quando trocar de turno
  useEffect(() => {
    const loadEdits = async () => {
      const rows = await clinicalRoundsSimpleService.getAssessmentEdits(patientId, selectedShift);
      setEdits(rows);
    };
    loadEdits();
  }, [patientId, selectedShift]);

  const handleEdit = () => {
    cancelContentRef.current = currentData.content;
    setEditing(true);
  };

  const handleCancel = () => {
    currentData.setContent(cancelContentRef.current);
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const content = selectedShift === 'morning' ? assessmentMorning : selectedShift === 'afternoon' ? assessmentAfternoon : assessmentNight;

      const success = await clinicalRoundsSimpleService.saveAssessment(
        patientId,
        roundId,
        selectedShift,
        content,
        currentUserName
      );

      if (success) {
        const shiftLabel = { morning: 'Manhã', afternoon: 'Tarde', night: 'Noite' }[selectedShift];
        onSaved?.(`✅ Avaliação da ${shiftLabel} salva com sucesso!`);
        setEditing(false);

        const updatedEdits = await clinicalRoundsSimpleService.getAssessmentEdits(patientId, selectedShift);
        setEdits(updatedEdits);
      } else {
        onSaved?.('❌ Erro ao salvar avaliação');
      }
    } catch (error) {
      onSaved?.('❌ Erro ao salvar avaliação');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-400">Carregando...</div>;
  }

  const shiftData = {
    morning: {
      label: '🌅 Manhã',
      content: assessmentMorning,
      setContent: setAssessmentMorning,
    },
    afternoon: {
      label: '☀️ Tarde',
      content: assessmentAfternoon,
      setContent: setAssessmentAfternoon,
    },
    night: {
      label: '🌙 Noite',
      content: assessmentNight,
      setContent: setAssessmentNight,
    }
  };

  const currentData = shiftData[selectedShift];
  const hasContent = currentData.content.trim().length > 0;
  const isReadOnly = hasContent && !editing;

  // Info de criação/edição
  const criador = edits.length > 0 ? edits[edits.length - 1] : null;
  const ultimoEditor = edits.length > 1 ? edits[0] : null;

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">A - Assessment (Avaliação)</h3>

      {/* Tabs de Turnos */}
      <div className="flex gap-2 mb-4 border-b border-gray-300 dark:border-gray-700 flex-wrap">
        {Object.entries(shiftData).map(([shift, { label }]) => {
          const isCurrentShift = selectedShift === shift;
          return (
            <button
              key={shift}
              onClick={() => setSelectedShift(shift as 'morning' | 'afternoon' | 'night')}
              className={`px-4 py-2 font-semibold transition ${
                isCurrentShift
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Área de conteúdo */}
      <div className="mb-4">
        {isReadOnly ? (
          <div className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white min-h-[12rem] whitespace-pre-wrap">
            {currentData.content}
          </div>
        ) : (
          <textarea
            value={currentData.content}
            onChange={(e) => currentData.setContent(e.target.value)}
            placeholder="Digite a avaliação do paciente..."
            autoFocus={editing}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap"
            rows={8}
            wrap="soft"
          />
        )}
      </div>

      {/* Info de criação/edição */}
      {criador && (
        <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
          <p>
            ✍️ Criado por{' '}
            <span className="font-medium text-blue-600 dark:text-blue-400">{criador.nome_editor}</span>
            <span className="ml-1">• {new Date(criador.data_edicao).toLocaleString('pt-BR')}</span>
          </p>
          {ultimoEditor && (
            <p>
              📝 Editado por{' '}
              <span className="font-medium text-amber-600 dark:text-amber-400">{ultimoEditor.nome_editor}</span>
              <span className="ml-1">• {new Date(ultimoEditor.data_edicao).toLocaleString('pt-BR')}</span>
            </p>
          )}
        </div>
      )}

      {/* Botões de ação */}
      {isReadOnly ? (
        <button
          onClick={handleEdit}
          className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition"
        >
          ✏️ Editar Avaliação
        </button>
      ) : (
        <div className="flex gap-2">
          {hasContent && (
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold rounded-lg transition"
          >
            {saving ? '⏳ Salvando...' : '💾 Salvar Avaliação'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AssessmentSimple;
