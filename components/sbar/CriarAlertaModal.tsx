import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../Toast';
import { auditService } from '../../services/auditService';

const SISTEMAS = [
  'Avaliação Respiratória',
  'Avaliação Cardiovascular',
  'Avaliação Renal',
  'Distúrbios Hidroeletrolíticos e Metabólicos',
  'Avaliação Gastrointestinal',
  'Avaliação Hematológica',
  'Avaliação Neurológica',
  'Avaliação Nutricional e Metabólica',
  'Infecções Relacionadas à Assistência à Saúde (IRAS)',
  'Outras Infecções',
  'Gestão de Riscos Assistenciais',
  'Precauções e Controle de Infecção',
  'Notificação de Eventos Adversos',
];

const RESPONSAVEIS = [
  'Médico',
  'Enfermeiro',
  'Fisioterapeuta',
  'Farmacêutico',
  'Nutricionista',
  'Odontólogo',
  'Psicólogo',
  'Fonoaudiólogo',
  'Serviço Social',
  'Terapeuta Ocupacional',
  'Médico / Enfermeiro',
  'Médico / Fisioterapeuta',
  'Médico / Nutricionista',
];

const HORAS = Array.from({ length: 24 }, (_, i) => ({
  value: `${i + 1}`,
  label: `${i + 1} hora${i + 1 > 1 ? 's' : ''}`,
}));

interface CriarAlertaModalProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
  onAlertaCriado: () => void;
}

const CriarAlertaModal: React.FC<CriarAlertaModalProps> = ({
  patientId,
  patientName,
  onClose,
  onAlertaCriado,
}) => {
  const { user } = useUser();
  const { showToast } = useToast();
  const [alerta, setAlerta] = useState('');
  const [sistema, setSistema] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [horaSelecionada, setHoraSelecionada] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSalvar = async () => {
    if (!alerta.trim()) {
      showToast('Digite o alerta', 'warning');
      return;
    }
    if (!responsavel) {
      showToast('Selecione o responsável', 'warning');
      return;
    }
    if (!horaSelecionada) {
      showToast('Selecione a hora', 'warning');
      return;
    }
    if (!user) {
      showToast('Usuário não identificado', 'error');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('alertas_paciente')
        .insert([{
          patient_id: patientId,
          alerta_descricao: alerta.trim().toUpperCase(),
          sistemas: sistema ? [sistema] : [],
          responsavel,
          hora_selecionada: horaSelecionada,
          status: 'alerta',
          status_conclusao: 'pendente',
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);

      if (error) {
        showToast('Erro ao criar alerta', 'error');
        return;
      }

      auditService.logCriouAlerta(user.id, user.name, patientId, patientName, alerta.trim());
      showToast('Alerta criado com sucesso!', 'success');
      onAlertaCriado();
      onClose();
    } catch {
      showToast('Erro ao criar alerta', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9998] p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header vermelho */}
        <div className="bg-red-600 dark:bg-red-800 px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl">⚠️</span>
            <h3 className="text-lg font-bold">Criar Alerta</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
          {/* Campo Alerta */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Alerta
            </label>
            <input
              type="text"
              value={alerta}
              onChange={(e) => setAlerta(e.target.value)}
              placeholder="Digite o alerta identificado..."
              className="w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500"
              autoFocus
            />
          </div>

          {/* Campo Sistema */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Sistema
            </label>
            <select
              value={sistema}
              onChange={(e) => setSistema(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 appearance-none"
            >
              <option value="">Selecione...</option>
              {SISTEMAS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Campo Responsável */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Responsável
            </label>
            <select
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 appearance-none"
            >
              <option value="">Selecione...</option>
              {RESPONSAVEIS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Campo Hora */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Selecione a hora
            </label>
            <select
              value={horaSelecionada}
              onChange={(e) => setHoraSelecionada(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 appearance-none"
            >
              <option value="">Selecione...</option>
              {HORAS.map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>

          {/* Botão Salvar */}
          <button
            onClick={handleSalvar}
            disabled={saving}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>💾 Salvar Alerta</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CriarAlertaModal;
