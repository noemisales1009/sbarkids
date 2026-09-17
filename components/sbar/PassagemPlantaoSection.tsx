import React, { useState } from 'react';
import { passagensService, Medico } from '../../services/passagensService';
import { ShiftType, shiftFilterService } from '../../services/shiftFilterService';
import { useUser } from '../../contexts/UserContext';

interface PassagemPlantaoSectionProps {
  patientId: string;
  shift: ShiftType;
  onShiftChange?: (shift: ShiftType) => void;
}

const PassagemPlantaoSection: React.FC<PassagemPlantaoSectionProps> = ({ patientId, shift, onShiftChange }) => {
  const { user } = useUser();
  const shiftLabel = shiftFilterService.getShiftLabel(shift);

  const [showPassagemModal, setShowPassagemModal] = useState(false);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [selectedMedicoId, setSelectedMedicoId] = useState('');
  const [tipoPassagem, setTipoPassagem] = useState<'Plantonista do turno' | 'Colega de plantão'>('Plantonista do turno');
  const [recebeuComoColega, setRecebeuComoColega] = useState(false);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [savingPassagem, setSavingPassagem] = useState(false);
  const [passagemSucesso, setPassagemSucesso] = useState(false);

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
    const ok = await passagensService.criar(user.id, selectedMedicoId, [patientId], undefined, shiftLabel, tipoPassagem);
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

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-sm p-4">
      {onShiftChange && (
        <div className="flex gap-1 mb-3 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
          {(Object.keys(shiftFilterService.SHIFTS) as ShiftType[]).map((s) => (
            <button
              key={s}
              onClick={() => onShiftChange(s)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all ${
                shift === s
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {shiftFilterService.SHIFTS[s].label}
            </button>
          ))}
        </div>
      )}
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
        Passar {shiftLabel} para...
      </button>

      {/* Modal de Passagem */}
      {showPassagemModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-800 w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-xl p-5 space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-blue-400">transfer_within_a_station</span>
                Passar {shiftLabel} para
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

export default PassagemPlantaoSection;
