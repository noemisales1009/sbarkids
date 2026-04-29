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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [assessmentMorning, setAssessmentMorning] = useState('');
  const [assessmentAfternoon, setAssessmentAfternoon] = useState('');
  const [assessmentNight, setAssessmentNight] = useState('');
  const [savedContent, setSavedContent] = useState({ morning: '', afternoon: '', night: '' });

  const cancelContentRef = useRef('');
  const [edits, setEdits] = useState<EditRow[]>([]);

  // Carrega dados e histórico juntos (allSettled = nunca lança erro, trata cada um separado)
  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      setLoading(true);
      const [dataResult, editsResult] = await Promise.allSettled([
        clinicalRoundsSimpleService.getByRound(patientId, roundId),
        clinicalRoundsSimpleService.getAssessmentEdits(patientId, selectedShift),
      ]);
      if (!cancelled) {
        if (dataResult.status === 'fulfilled' && dataResult.value) {
          const data = dataResult.value;
          const m = data.assessment_morning || '';
          const a = data.assessment_afternoon || '';
          const n = data.assessment_night || '';
          setAssessmentMorning(m);
          setAssessmentAfternoon(a);
          setAssessmentNight(n);
          setSavedContent({ morning: m, afternoon: a, night: n });
        }
        if (editsResult.status === 'fulfilled') {
          setEdits(editsResult.value);
        }
        setLoading(false);
      }
    };
    loadAll();
    return () => { cancelled = true; };
  }, [patientId, roundId]);

  // Foca o textarea quando entra no modo edição
  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  // Ao trocar de turno: sai do modo edição e recarrega apenas o histórico
  useEffect(() => {
    setEditing(false);
    setHasChanges(false);
    let cancelled = false;
    clinicalRoundsSimpleService.getAssessmentEdits(patientId, selectedShift)
      .then(rows => { if (!cancelled) setEdits(rows); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [patientId, selectedShift]);

  const handleEdit = (content: string) => {
    cancelContentRef.current = content;
    setEditing(true);
    setHasChanges(false);
  };

  const handleCancel = (setContent: (v: string) => void) => {
    setContent(cancelContentRef.current);
    setEditing(false);
    setHasChanges(false);
  };

  const handleSave = async () => {
    // Lê direto do DOM para capturar texto colado que pode não ter disparado onChange
    const domValue = textareaRef.current?.value;
    const contentMap: Record<ShiftType, string> = {
      morning: assessmentMorning,
      afternoon: assessmentAfternoon,
      night: assessmentNight,
    };
    const content = domValue ?? contentMap[selectedShift];

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
        setSavedContent(prev => ({ ...prev, [selectedShift]: content }));
        setEditing(false);
        setHasChanges(false);
        const updatedEdits = await clinicalRoundsSimpleService.getAssessmentEdits(patientId, selectedShift);
        setEdits(updatedEdits);
      } else {
        onSaved?.('❌ Erro ao salvar avaliação');
      }
    } catch {
      onSaved?.('❌ Erro ao salvar avaliação');
    } finally {
      setSaving(false);
    }
  };

  const shiftData: Record<ShiftType, { label: string; content: string; setContent: (v: string) => void }> = {
    morning: { label: shiftFilterService.SHIFTS.morning.label, content: assessmentMorning, setContent: setAssessmentMorning },
    afternoon: { label: shiftFilterService.SHIFTS.afternoon.label, content: assessmentAfternoon, setContent: setAssessmentAfternoon },
    night: { label: shiftFilterService.SHIFTS.night.label, content: assessmentNight, setContent: setAssessmentNight },
  };

  const currentData = shiftData[selectedShift];
  const hasContent = currentData.content.trim().length > 0;
  const isReadOnly = savedContent[selectedShift] !== '' && !editing && !hasChanges;

  const criador = edits.length > 0 ? edits[edits.length - 1] : null;
  const ultimoEditor = edits.length > 1 ? edits[0] : null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800/50">
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0 shadow-sm">A</span>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wide uppercase">
          Assessment <span className="normal-case font-normal text-gray-500 dark:text-gray-400">(Avaliação)</span>
        </h3>
        {loading && <div className="ml-auto w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />}
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

        {/* Área de conteúdo — sempre usa textarea para manter altura constante */}
        <div className="mb-3">
          <textarea
            ref={textareaRef}
            value={currentData.content}
            onChange={(e) => {
              if (isReadOnly) return;
              currentData.setContent(e.target.value);
              setHasChanges(true);
            }}
            onInput={(e) => {
              if (isReadOnly) return;
              const val = (e.target as HTMLTextAreaElement).value;
              if (val !== currentData.content) {
                currentData.setContent(val);
                setHasChanges(true);
              }
            }}
            placeholder={loading ? '' : 'Digite a avaliação do paciente...'}
            disabled={loading}
            readOnly={isReadOnly}
            className={`w-full px-4 py-3 rounded-lg border text-sm leading-relaxed transition resize-none
              ${isReadOnly
                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 text-gray-800 dark:text-gray-100 cursor-default focus:outline-none'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500'
              }
              ${loading ? 'opacity-40' : ''}
            `}
            rows={8}
          />
        </div>

        {/* Info de criação/edição — reserva espaço mínimo para evitar salto quando aparecer */}
        <div className="mb-3 min-h-[1rem]">
          {isReadOnly && criador && (
            <div className="flex flex-col gap-0.5 text-xs text-gray-400 dark:text-gray-500">
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
        </div>

        {/* Botões de ação */}
        {isReadOnly ? (
          <button
            onClick={() => handleEdit(currentData.content)}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition shadow-sm hover:shadow"
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
              disabled={saving || loading}
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
