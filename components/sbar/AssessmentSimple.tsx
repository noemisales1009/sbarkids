import React, { useState, useEffect, useRef } from 'react';
import { clinicalRoundsSimpleService } from '../../services/clinicalRoundsSimpleService';
import { ShiftType, shiftFilterService } from '../../services/shiftFilterService';
import { passagensService, Medico } from '../../services/passagensService';
import { useUser } from '../../contexts/UserContext';

type EditRow = { id: number; content: string; nome_editor: string; data_edicao: string };
type EditRowWithShift = EditRow & { shift: string };

interface AssessmentSimpleProps {
  patientId: string;
  roundId?: string;
  currentUserName: string;
  onSaved?: (message: string) => void;
}

const todayISO = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

const AssessmentSimple: React.FC<AssessmentSimpleProps> = ({
  patientId,
  roundId,
  currentUserName,
  onSaved
}) => {
  const { user } = useUser();
  const [selectedShift, setSelectedShift] = useState<ShiftType>('morning');
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [assessmentMorning, setAssessmentMorning] = useState('');
  const [assessmentAfternoon, setAssessmentAfternoon] = useState('');
  const [assessmentNight, setAssessmentNight] = useState('');
  const [savedContent, setSavedContent] = useState({ morning: '', afternoon: '', night: '' });

  const cancelContentRef = useRef('');
  const [edits, setEdits] = useState<EditRow[]>([]);
  const [historicalEdits, setHistoricalEdits] = useState<EditRowWithShift[]>([]);

  // Passagem state
  const [showPassagemModal, setShowPassagemModal] = useState(false);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [selectedMedicoId, setSelectedMedicoId] = useState('');
  const [tipoPassagem, setTipoPassagem] = useState<'Plantonista do turno' | 'Colega de plantão'>('Plantonista do turno');
  const [recebeuComoColega, setRecebeuComoColega] = useState(false);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [savingPassagem, setSavingPassagem] = useState(false);
  const [passagemSucesso, setPassagemSucesso] = useState(false);

  const isToday = selectedDate === todayISO();

  // Carrega dados de hoje (editable)
  useEffect(() => {
    if (!isToday) return;
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
        if (editsResult.status === 'fulfilled') setEdits(editsResult.value);
        setLoading(false);
      }
    };
    loadAll();
    return () => { cancelled = true; };
  }, [patientId, roundId, isToday]);

  // Carrega dados históricos (read-only)
  useEffect(() => {
    if (isToday) return;
    let cancelled = false;
    setLoading(true);
    clinicalRoundsSimpleService.getAssessmentEditsByDate(patientId, selectedDate)
      .then(rows => {
        if (!cancelled) {
          setHistoricalEdits(rows);
          setEditing(false);
          setHasChanges(false);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [patientId, selectedDate, isToday]);

  // Ao trocar turno no modo hoje: recarrega histórico do turno
  useEffect(() => {
    if (!isToday) return;
    setEditing(false);
    setHasChanges(false);
    let cancelled = false;
    clinicalRoundsSimpleService.getAssessmentEdits(patientId, selectedShift)
      .then(rows => { if (!cancelled) setEdits(rows); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [patientId, selectedShift, isToday]);

  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  const goToPrevDay = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    if (isToday) return;
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    const next = d.toISOString().split('T')[0];
    setSelectedDate(next > todayISO() ? todayISO() : next);
  };

  const formatDateLabel = (iso: string) => {
    if (iso === todayISO()) return 'Hoje';
    return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

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

  const handleArchiveShift = async () => {
    const shiftLabel = shiftFilterService.getShiftLabel(selectedShift);
    if (!confirm(`Arquivar o turno da ${shiftLabel}? O conteúdo será limpo para um novo registro, mas o histórico é mantido.`)) return;
    setArchiving(true);
    const shiftSetter = { morning: setAssessmentMorning, afternoon: setAssessmentAfternoon, night: setAssessmentNight }[selectedShift];
    try {
      const success = await clinicalRoundsSimpleService.archiveAssessmentShift(patientId, roundId, selectedShift);
      if (success) {
        shiftSetter('');
        setSavedContent(prev => ({ ...prev, [selectedShift]: '' }));
        setEditing(false);
        setHasChanges(false);
        onSaved?.(`✅ Turno da ${shiftLabel} arquivado com sucesso!`);
      } else {
        onSaved?.('❌ Erro ao arquivar turno');
      }
    } catch {
      onSaved?.('❌ Erro ao arquivar turno');
    } finally {
      setArchiving(false);
    }
  };

  const handleSave = async () => {
    const domValue = textareaRef.current?.value ?? '';
    const contentMap: Record<ShiftType, string> = {
      morning: assessmentMorning,
      afternoon: assessmentAfternoon,
      night: assessmentNight,
    };
    const content = domValue || contentMap[selectedShift];

    if (content !== contentMap[selectedShift]) {
      currentData.setContent(content);
    }

    setSaving(true);
    try {
      const success = await clinicalRoundsSimpleService.saveAssessment(
        patientId, roundId, selectedShift, content, currentUserName
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
    morning:   { label: shiftFilterService.SHIFTS.morning.label,   content: assessmentMorning,   setContent: setAssessmentMorning },
    afternoon: { label: shiftFilterService.SHIFTS.afternoon.label, content: assessmentAfternoon, setContent: setAssessmentAfternoon },
    night:     { label: shiftFilterService.SHIFTS.night.label,     content: assessmentNight,     setContent: setAssessmentNight },
  };

  const currentData = shiftData[selectedShift];

  const handleOpenPassagemModal = async () => {
    setShowPassagemModal(true);
    if (medicos.length === 0) {
      setLoadingMedicos(true);
      const [meds, foiColega] = await Promise.all([
        passagensService.getMedicos(),
        user ? passagensService.getRecebidaComoColega(user.id, patientId) : Promise.resolve(false),
      ]);
      setMedicos(meds);
      setRecebeuComoColega(foiColega);
      if (foiColega) setTipoPassagem('Plantonista do turno');
      setLoadingMedicos(false);
    } else if (user) {
      const foiColega = await passagensService.getRecebidaComoColega(user.id, patientId);
      setRecebeuComoColega(foiColega);
      if (foiColega) setTipoPassagem('Plantonista do turno');
    }
  };

  const handleRegistrarPassagem = async () => {
    if (!user || !selectedMedicoId) return;
    setSavingPassagem(true);
    const ok = await passagensService.criar(user.id, selectedMedicoId, [patientId], undefined, currentData.label, tipoPassagem);
    if (ok) {
      setPassagemSucesso(true);
      setShowPassagemModal(false);
      setSelectedMedicoId('');
      setTipoPassagem('Plantonista do turno');
      setRecebeuComoColega(false);
      setTimeout(() => setPassagemSucesso(false), 3000);
    }
    setSavingPassagem(false);
  };

  // Conteúdo histórico do turno selecionado (mais recente do dia)
  const historicalContent = isToday ? null :
    historicalEdits.filter(e => e.shift === selectedShift)[0] ?? null;

  const displayContent = isToday ? currentData.content : (historicalContent?.content ?? '');
  const hasContent = displayContent.trim().length > 0;
  const isReadOnly = isToday
    ? (savedContent[selectedShift] !== '' && !editing && !hasChanges)
    : true;

  // Info criador/editor (apenas hoje)
  const todayStr = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const todayEdits = edits.filter(e =>
    new Date(e.data_edicao).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) === todayStr
  );
  const criador = todayEdits.length > 0 ? todayEdits[todayEdits.length - 1] : null;
  const ultimoEditor = todayEdits.length > 1 ? todayEdits[0] : null;

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
        {/* Seletor de data */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={goToPrevDay}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition"
          >
            ←
          </button>
          <span className={`text-sm font-semibold px-3 py-1 rounded-lg ${isToday ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>
            {formatDateLabel(selectedDate)}
          </span>
          <button
            onClick={goToNextDay}
            disabled={isToday}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            →
          </button>
        </div>

        {/* Tabs de Turnos */}
        <div className="flex gap-1 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
          {(Object.keys(shiftData) as ShiftType[]).map((shift) => (
            <button
              key={shift}
              onClick={() => setSelectedShift(shift)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all ${
                selectedShift === shift
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {shiftData[shift].label}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <div className="mb-3">
          {!isToday && !hasContent && !loading ? (
            <div className="w-full px-4 py-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 text-center text-sm text-gray-400 dark:text-gray-500 italic">
              Nenhuma avaliação registrada para este turno neste dia.
            </div>
          ) : (
            <textarea
              ref={isToday ? textareaRef : undefined}
              value={isToday ? currentData.content : displayContent}
              onChange={(e) => {
                if (!isToday || isReadOnly) return;
                currentData.setContent(e.target.value);
                setHasChanges(true);
              }}
              onInput={(e) => {
                if (!isToday || isReadOnly) return;
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
          )}
        </div>

        {/* Info criador/editor — apenas hoje */}
        <div className="mb-3 min-h-[1rem]">
          {isToday && isReadOnly && criador && (
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
          {/* Info do editor histórico */}
          {!isToday && historicalContent && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              ✍️ <span className="font-medium text-blue-500 dark:text-blue-400">{historicalContent.nome_editor}</span>
              <span className="mx-1">·</span>
              {new Date(historicalContent.data_edicao).toLocaleString('pt-BR')}
            </div>
          )}
        </div>

        {/* Botões — apenas hoje */}
        {isToday && (
          isReadOnly ? (
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(currentData.content)}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition shadow-sm hover:shadow"
              >
                ✏️ Editar Avaliação
              </button>
              <button
                onClick={handleArchiveShift}
                disabled={archiving || loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg transition"
              >
                {archiving ? '⏳ Arquivando...' : '🗂️ Arquivar Turno'}
              </button>
            </div>
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
          )
        )}

        {/* Botão Passar — sempre visível hoje */}
        {isToday && (
          <div className="mt-3">
            {passagemSucesso && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                Passagem registrada com sucesso!
              </div>
            )}
            <button
              onClick={handleOpenPassagemModal}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border border-blue-200 dark:border-blue-700/60 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
            >
              <span className="material-symbols-outlined text-base">transfer_within_a_station</span>
              Passar {currentData.label} para...
            </button>
          </div>
        )}
      </div>

      {/* Modal de Passagem */}
      {showPassagemModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-800 w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-xl p-5 space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-blue-400">transfer_within_a_station</span>
                Passar {currentData.label} para
              </h3>
              <button
                onClick={() => { setShowPassagemModal(false); setSelectedMedicoId(''); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* De → Para */}
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-2.5">
                <p className="text-xs text-slate-400 mb-0.5">De</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name || '—'}</p>
              </div>
              <span className="material-symbols-outlined text-xl text-blue-400 shrink-0">transfer_within_a_station</span>
              <div className="flex-1 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-2.5">
                <p className="text-xs text-slate-400 mb-0.5">Para</p>
                {medicos.find(m => m.id === selectedMedicoId) ? (
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {medicos.find(m => m.id === selectedMedicoId)?.name}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">Nenhum</p>
                )}
              </div>
            </div>

            {/* Aviso colega de plantão */}
            {recebeuComoColega && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                <span className="material-symbols-outlined text-amber-500 shrink-0" style={{ fontSize: '18px' }}>warning</span>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  Você recebeu este paciente como colega de plantão. Registre agora a passagem para o plantonista do turno.
                </p>
              </div>
            )}

            {/* Tipo de passagem — oculto quando veio como colega */}
            {!recebeuComoColega && (
              <div className="flex gap-2">
                {(['Plantonista do turno', 'Colega de plantão'] as const).map(tipo => (
                  <button
                    key={tipo}
                    onClick={() => setTipoPassagem(tipo)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition ${
                      tipoPassagem === tipo
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500'
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            )}

            {/* Dropdown profissional */}
            {loadingMedicos ? (
              <p className="text-sm text-slate-400 text-center py-2">Carregando...</p>
            ) : (
              <select
                value={selectedMedicoId}
                onChange={e => setSelectedMedicoId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{tipoPassagem === 'Colega de plantão' ? 'Selecionar colega...' : 'Selecionar profissional...'}</option>
                {medicos.map(m => (
                  <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                ))}
              </select>
            )}


            {/* Botão confirmar */}
            <button
              onClick={handleRegistrarPassagem}
              disabled={!selectedMedicoId || savingPassagem}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              {savingPassagem ? (
                <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span> Registrando...</>
              ) : (
                <><span className="material-symbols-outlined text-base">send</span> Registrar Passagem</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentSimple;
