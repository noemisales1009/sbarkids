import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Patient } from '../../types';

interface Props {
  onClose: () => void;
  onSuccess: (patient: Patient) => void;
}

interface FormState {
  nome_paciente: string;
  numero_leito: string;
  dt_nasc: string;
  dt_internacao: string;
}

const CadastroManualModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState<FormState>({
    nome_paciente: '',
    numero_leito: '',
    dt_nasc: '',
    dt_internacao: '',
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');
  const [leitoOcupado, setLeitoOcupado] = useState<{ nome: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (field === 'numero_leito') setLeitoOcupado(null);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLeitoOcupado(null);
    if (!form.nome_paciente.trim()) return setErro('Nome do paciente é obrigatório.');
    if (!form.numero_leito) return setErro('Número do leito é obrigatório.');
    if (!form.dt_nasc) return setErro('Data de nascimento é obrigatória.');
    if (!form.dt_internacao) return setErro('Data de internação é obrigatória.');

    setSaving(true);
    try {
      const { data: ocupado } = await supabase
        .from('patients')
        .select('name')
        .eq('bed_number', parseInt(form.numero_leito))
        .is('archived_at', null)
        .limit(1)
        .maybeSingle();

      if (ocupado) {
        setLeitoOcupado({ nome: ocupado.name });
        setSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from('patients')
        .insert([{
          name: form.nome_paciente.trim().toUpperCase(),
          bed_number: parseInt(form.numero_leito),
          dob: form.dt_nasc,
          dt_internacao: form.dt_internacao,
          status: 'estavel',
          mother_name: null,
          diagnosis: null,
          comorbidade: null,
          peso: null,
          destino: null,
        }])
        .select()
        .single();

      if (error) throw error;
      onSuccess(data as Patient);
    } catch (err: any) {
      setErro(err?.message || 'Erro ao cadastrar paciente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-bold shadow-sm">
              <span className="material-symbols-outlined text-base">person_add</span>
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Cadastro Manual</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Preencha os dados do paciente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
              Nome do Paciente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nome_paciente}
              onChange={set('nome_paciente')}
              placeholder="Ex: MARIA CECILIA CONCEICAO FRANCA"
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition uppercase"
            />
          </div>

          {/* Leito */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
              Número do Leito <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={form.numero_leito}
              onChange={set('numero_leito')}
              placeholder="Ex: 1"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                Dt. Nascimento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.dt_nasc}
                onChange={set('dt_nasc')}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                Dt. Internação <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.dt_internacao}
                onChange={set('dt_internacao')}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Leito ocupado */}
          {leitoOcupado && (
            <div className="px-3 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-300 text-sm space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <span className="material-symbols-outlined text-base">bed</span>
                Leito {form.numero_leito} já está ocupado
              </div>
              <div>
                Paciente: <span className="font-bold">{leitoOcupado.nome}</span>
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-400">
                Archive o paciente atual antes de cadastrar um novo neste leito.
              </div>
            </div>
          )}

          {/* Erro */}
          {erro && (
            <div className="px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 text-sm">
              {erro}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition shadow-sm"
            >
              {saving ? '⏳ Cadastrando...' : '✓ Cadastrar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroManualModal;
