import React, { useState } from 'react';
import { alertasService, Alerta, getShiftDoAlerta, isForaDoPrazo } from '../../services/alertasService';
import { ShiftType } from '../../services/shiftFilterService';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../Toast';

const SHIFT_INFO: Record<ShiftType, { label: string; icon: string; badge: string }> = {
  morning: { label: 'Manhã', icon: '🌅', badge: 'bg-orange-500' },
  afternoon: { label: 'Tarde', icon: '☀️', badge: 'bg-yellow-500' },
  night: { label: 'Noite', icon: '🌙', badge: 'bg-indigo-500' },
};

type Modo = 'justificar' | 'arquivar';

interface RevisaoAlertasModalProps {
  pendentes: Alerta[];
  onClose: () => void;
  onLiberado: () => void;
  onAlertaTratado: () => void;
}

const RevisaoAlertasModal: React.FC<RevisaoAlertasModalProps> = ({
  pendentes,
  onClose,
  onLiberado,
  onAlertaTratado,
}) => {
  const { user } = useUser();
  const { showToast } = useToast();

  const [removidos, setRemovidos] = useState<string[]>([]);
  const [justificados, setJustificados] = useState<Record<string, string>>({});
  const [acaoAberta, setAcaoAberta] = useState<{ id: string; modo: Modo } | null>(null);
  const [texto, setTexto] = useState('');
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  // Concluído/arquivado some da lista; justificado continua visível, mas já conta como tratado
  const visiveis = pendentes.filter(a => !removidos.includes(a.id_alerta));
  const faltam = visiveis.filter(a => !justificados[a.id_alerta]);
  const liberado = faltam.length === 0;

  const fecharAcao = () => {
    setAcaoAberta(null);
    setTexto('');
  };

  const exigeUsuario = () => {
    if (!user) {
      showToast('Usuário não identificado. Faça login novamente.', 'error');
      return false;
    }
    return true;
  };

  const handleConcluir = async (alerta: Alerta) => {
    if (!exigeUsuario()) return;
    setSalvandoId(alerta.id_alerta);
    const ok = await alertasService.marcarComoConcluido(
      alerta.id_alerta,
      alerta.fonte || 'alertas_paciente',
      user!.id
    );
    setSalvandoId(null);
    if (ok) {
      setRemovidos(prev => [...prev, alerta.id_alerta]);
      fecharAcao();
      onAlertaTratado();
      showToast('Alerta concluído!', 'success');
    } else {
      showToast('Erro ao concluir alerta', 'error');
    }
  };

  const handleSalvarJustificativa = async (alerta: Alerta) => {
    const justificativa = texto.trim();
    if (!justificativa) {
      showToast('Escreva a justificativa antes de salvar', 'warning');
      return;
    }
    if (!exigeUsuario()) return;
    setSalvandoId(alerta.id_alerta);
    const ok = await alertasService.updateJustificativa(
      alerta.id_alerta,
      justificativa,
      alerta.fonte || 'alertas_paciente',
      user!.id
    );
    setSalvandoId(null);
    if (ok) {
      setJustificados(prev => ({ ...prev, [alerta.id_alerta]: justificativa }));
      fecharAcao();
      onAlertaTratado();
      showToast('Justificativa registrada!', 'success');
    } else {
      showToast('Erro ao salvar justificativa', 'error');
    }
  };

  const handleArquivar = async (alerta: Alerta) => {
    const motivo = texto.trim();
    if (!motivo) {
      showToast('Informe o motivo do arquivamento', 'warning');
      return;
    }
    if (!exigeUsuario()) return;
    setSalvandoId(alerta.id_alerta);
    const ok = await alertasService.arquivarAlerta(
      alerta.id_alerta,
      motivo,
      alerta.fonte || 'alertas_paciente',
      user!.id
    );
    setSalvandoId(null);
    if (ok) {
      setRemovidos(prev => [...prev, alerta.id_alerta]);
      fecharAcao();
      onAlertaTratado();
      showToast('Alerta arquivado!', 'success');
    } else {
      showToast('Erro ao arquivar alerta', 'error');
    }
  };

  const abrirJustificativa = (alerta: Alerta) => {
    const atual = justificados[alerta.id_alerta] || alerta.justificativa || alerta.justification || '';
    setAcaoAberta({ id: alerta.id_alerta, modo: 'justificar' });
    setTexto(atual);
  };

  const abrirArquivamento = (alerta: Alerta) => {
    setAcaoAberta({ id: alerta.id_alerta, modo: 'arquivar' });
    setTexto('');
  };

  const formatHora = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-800 w-full sm:max-w-2xl max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-500 shrink-0" style={{ fontSize: '24px' }}>warning</span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Revisão obrigatória</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Resolva, justifique ou arquive os alertas fora do prazo antes de criar um novo.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {faltam.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-red-600 text-white text-sm font-bold">
                {faltam.length}
              </span>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Fechar"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Lista corrida — todos os turnos juntos, do mais antigo para o mais novo */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {visiveis.length === 0 ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: '48px' }}>task_alt</span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-2">
                Tudo revisado! Pode criar o novo alerta.
              </p>
            </div>
          ) : (
            visiveis.map((alerta) => {
              const shift = getShiftDoAlerta(alerta);
              const info = SHIFT_INFO[shift];
              const atrasado = isForaDoPrazo(alerta);
              const modo = acaoAberta?.id === alerta.id_alerta ? acaoAberta.modo : null;
              const salvando = salvandoId === alerta.id_alerta;
              const justificativaNova = justificados[alerta.id_alerta];
              const justificativaAnterior = alerta.justificativa || alerta.justification;

              return (
                <div
                  key={`${alerta.fonte}-${alerta.id_alerta}`}
                  className={`p-4 rounded-lg border ${
                    justificativaNova
                      ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60'
                  }`}
                >
                  {/* Etiqueta do turno + origem */}
                  <div className="flex items-center flex-wrap gap-2 mb-2 text-xs">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${info.badge} text-white font-semibold`}>
                      {info.icon} {info.label}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      criado {formatHora(alerta.created_at)}
                      {alerta.created_by_name ? ` · ${alerta.created_by_name}` : ''}
                    </span>
                    {atrasado && !justificativaNova && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold">
                        ⏰ atrasado
                      </span>
                    )}
                    {justificativaNova && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-semibold">
                        ✓ justificado
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                    {alerta.alertaclinico}
                  </p>

                  {alerta.sistemas && alerta.sistemas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {alerta.sistemas.map((s) => (
                        <span
                          key={s}
                          className="inline-block px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Justificativa salva agora */}
                  {justificativaNova && !modo && (
                    <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-2 border-l-2 border-emerald-500 pl-2">
                      {justificativaNova}
                    </p>
                  )}

                  {/* Justificativa herdada de plantão anterior */}
                  {!justificativaNova && justificativaAnterior && !modo && (
                    <div className="mb-2 p-2.5 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/60">
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-0.5">
                        📝 Justificativa
                        {(alerta.justificativa_at || alerta.justification_at) && (
                          <span className="font-normal"> · {formatHora((alerta.justificativa_at || alerta.justification_at)!)}</span>
                        )}
                      </p>
                      <p className="text-sm text-slate-800 dark:text-slate-100">{justificativaAnterior}</p>
                    </div>
                  )}

                  {modo ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={texto}
                        onChange={e => setTexto(e.target.value)}
                        placeholder={modo === 'arquivar'
                          ? 'Motivo do arquivamento (ex: conduta suspensa, alerta duplicado)'
                          : 'Por que este alerta ainda está em aberto?'}
                        autoFocus
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={fecharAcao}
                          disabled={salvando}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-sm font-medium transition"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => modo === 'arquivar' ? handleArquivar(alerta) : handleSalvarJustificativa(alerta)}
                          disabled={salvando}
                          className={`flex-1 px-3 py-1.5 rounded-lg disabled:opacity-50 text-white text-sm font-semibold transition ${
                            modo === 'arquivar'
                              ? 'bg-orange-600 hover:bg-orange-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {salvando
                            ? 'Salvando...'
                            : modo === 'arquivar' ? 'Arquivar alerta' : 'Salvar justificativa'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        onClick={() => handleConcluir(alerta)}
                        disabled={salvando}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition"
                      >
                        {salvando ? 'Salvando...' : '✓ Concluir'}
                      </button>
                      <button
                        onClick={() => abrirJustificativa(alerta)}
                        disabled={salvando}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-sm font-medium transition"
                      >
                        {justificativaNova ? '✏️ Editar justificativa' : '📝 Justificar'}
                      </button>
                      <button
                        onClick={() => abrirArquivamento(alerta)}
                        disabled={salvando}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-300 dark:border-orange-700/60 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 disabled:opacity-50 text-sm font-medium transition"
                      >
                        🗂 Arquivar
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé — libera a criação só quando zerar */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onLiberado}
            disabled={!liberado}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            {liberado
              ? '+ Criar novo alerta'
              : `Faltam ${faltam.length} alerta${faltam.length > 1 ? 's' : ''} para revisar`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevisaoAlertasModal;
