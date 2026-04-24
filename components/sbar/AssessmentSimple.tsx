/**
 * Componente simplificado para A - Assessment (Avaliação)
 * Um único campo de texto por turno (Manhã, Tarde, Noite)
 */

import React, { useState, useEffect, useRef } from 'react';
import { clinicalRoundsSimpleService } from '../../services/clinicalRoundsSimpleService';
import { ShiftType, shiftFilterService } from '../../services/shiftFilterService';

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
  const [selectedShift, setSelectedShift] = useState<ShiftType>('morning');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [assessmentMorning, setAssessmentMorning] = useState('');
  const [assessmentAfternoon, setAssessmentAfternoon] = useState('');
  const [assessmentNight, setAssessmentNight] = useState('');

  const cancelContentRef = useRef('');
  const [edits, setEdits] = useState<EditRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await clinicalRoundsSimpleService.getByRound(patientId, roundId);
        if (!cancelled && data) {
          setAssessmentMorning(data.assessment_morning || '');
          setAssessmentAfternoon(data.assessment_afternoon || '');
          setAssessmentNight(data.assessment_night || '');
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Erro ao carregar avaliação:', error);
          onSaved?.('❌ Erro ao carregar avaliação');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, [patientId, roundId]);

  useEffect(() => {
    setEditing(false);
  }, [selectedShift]);

  useEffect(() => {
    let cancelled = false;
    const loadEdits = async () => {
      const rows = await clinicalRoundsSimpleService.getAssessmentEdits(patientId, selectedShift);
      if (!cancelled) setEdits(rows);
    };
    loadEdits();
    return () => { cancelled = true; };
  }, [patientId, selectedShift]);

  const handleEdit = (content: string) => {
    cancelContentRef.current = content;
    setEditing(true);
  };

  const handleCancel = (setContent: (v: string) => void) => {
    setContent(cancelContentRef.current);
    setEditing(false);
  };

  const handleSave = async () => {
    const contentMap: Record<ShiftType, string> = {
      morning: assessmentMorning,
      afternoon: assessmentAfternoon,
      night: assessmentNight,
    };
    const content = contentMap[selectedShift];

    setSaving(true);
    try {
      const success = await clinicalRoundsSimpleService.saveAssessment(
        patientId,
        roundId,
        selectedShift,
        content,
        currentUserName
      );

      if (success) {
        onSaved?.(`✅ Avaliação da ${shiftFilterService.getShiftLabel(selectedShift)} salva com sucesso!`);
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

  const shiftData: Record<ShiftType, { label: string; content: string; setContent: (v: string) => void }> = {
    morning: { label: shiftFilterService.SHIFTS.morning.label, content: assessmentMorning, setContent: setAssessmentMorning },
    afternoon: { label: shiftFilterService.SHIFTS.afternoon.label, content: assessmentAfternoon, setContent: setAssessmentAfternoon },
    night: { label: shiftFilterService.SHIFTS.night.label, content: assessmentNight, setContent: setAssessmentNight },
  };

  const currentData = shiftData[selectedShift];
  const hasContent = currentData.content.trim().length > 0;
  const isReadOnly = hasContent && !editing;

  const criador = edits.length > 0 ? edits[edits.length - 1] : null;
  const ultimoEditor = edits.length > 1 ? edits[0] : null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800/50">
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0 shadow-sm">A</span>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wide uppercase">Assessment <span className="normal-case font-normal text-gray-500 dark:text-gray-400">(Avaliação)</span></h3>
      </div>

      <div className="p-4">
        {/* Tabs de Turnos */}
        <div className="flex gap-1 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
          {(Object.keys(shiftData) as ShiftType[]).map((shift) => {
            const isCurrentShift = selectedShift === shift;
            return (
              <button
                key={shift}
                onClick={() => setSelectedShift(shift)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all ${
                  isCurrentShift
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {shiftData[shift].label}
              </button>
            );
          })}
        </div>

        {/* Área de conteúdo */}
        <div className="mb-3">
          {isReadOnly ? (
            <div className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 text-gray-800 dark:text-gray-100 min-h-[10rem] whitespace-pre-wrap text-sm leading-relaxed">
              {currentData.content}
            </div>
          ) : (
            <textarea
              value={currentData.content}
              onChange={(e) => currentData.setContent(e.target.value)}
              placeholder="Digite a avaliação do paciente..."
              autoFocus={editing}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 text-sm leading-relaxed transition"
              rows={8}
              wrap="soft"
            />
          )}
        </div>

        {/* Info de criação/edição */}
        {criador && (
          <div className="mb-3 flex flex-col gap-0.5 text-xs text-gray-400 dark:text-gray-500">
            <span>
              ✍️ Criado por{' '}
              <span className="font-medium text-blue-500 dark:text-blue-400">{criador.nome_editor}</span>
              <span className="mx-1">·</span>
              {new Date(criador.data_edicao).toLocaleString('pt-BR')}
            </span>
            {ultimoEditor && (
              <span>
                📝 Editado por{' '}
                <span className="font-medium text-amber-500 dark:text-amber-400">{ultimoEditor.nome_editor}</span>
                <span className="mx-1">·</span>
                {new Date(ultimoEditor.data_edicao).toLocaleString('pt-BR')}
              </span>
            )}
          </div>
        )}

        {/* Botões de ação */}
        {isReadOnly ? (
          <button
            onClick={() => handleEdit(currentData.content)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white text-sm font-semibold rounded-lg transition shadow-sm hover:shadow"
          >
            ✏️ Editar Avaliação
          </button>
        ) : (
          <div className="flex gap-2">
            {hasContent && (
              <button
                onClick={() => handleCancel(currentData.setContent)}
                disabled={saving}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition shadow-sm hover:shadow"
            >
              {saving ? '⏳ Salvando...' : '💾 Salvar Avaliação'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentSimple;
