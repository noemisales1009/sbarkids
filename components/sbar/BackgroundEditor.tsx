/**
 * Componente para exibir e editar Background (B - Breve Histórico)
 * Medicações, Dispositivos, Culturas e Procedimentos
 */

import React, { useState, useEffect } from 'react';
import {
  backgroundService,
  Medicacao,
  Dispositivo,
  Cultura,
  Procedimento
} from '../../services/backgroundService';

interface BackgroundEditorProps {
  patientId: string;
}

const BackgroundEditor: React.FC<BackgroundEditorProps> = ({ patientId }) => {
  const [medicacoes, setMedicacoes] = useState<Medicacao[]>([]);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [culturas, setCulturas] = useState<Cultura[]>([]);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [medicacaoModal, setMedicacaoModal] = useState<{ open: boolean; data?: Medicacao }>({ open: false });
  const [dispositivoModal, setDispositivoModal] = useState<{ open: boolean; data?: Dispositivo }>({ open: false });
  const [culturaModal, setCulturaModal] = useState<{ open: boolean; data?: Cultura }>({ open: false });
  const [procedimentoModal, setProcedimentoModal] = useState<{ open: boolean; data?: Procedimento }>({ open: false });

  // Carregar dados ao montar
  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meds, devs, cults, procs] = await Promise.all([
        backgroundService.getMedicacoes(patientId),
        backgroundService.getDispositivos(patientId),
        backgroundService.getCulturas(patientId),
        backgroundService.getProcedimentos(patientId)
      ]);

      setMedicacoes(meds);
      setDispositivos(devs);
      setCulturas(cults);
      setProcedimentos(procs);
    } catch (error) {
      console.error('Erro ao carregar background:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-600 dark:text-gray-400">
        Carregando informações...
      </div>
    );
  }

  const hasData = medicacoes.length > 0 || dispositivos.length > 0 || culturas.length > 0 || procedimentos.length > 0;

  if (!hasData) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        Nenhuma informação registrada
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* MEDICAÇÕES */}
      {medicacoes.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">💊 Medicações</h4>
            <button
              onClick={() => setMedicacaoModal({ open: true })}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              + Adicionar
            </button>
          </div>
          <div className="space-y-2">
            {medicacoes.map((med) => (
              <div key={med.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{med.nome_medicacao}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {med.dosagem_valor} {med.unidade_medida}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Desde: {new Date(med.data_inicio).toLocaleDateString('pt-BR')}
                    {med.data_fim && ` até ${new Date(med.data_fim).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
                <button
                  onClick={() => setMedicacaoModal({ open: true, data: med })}
                  className="ml-2 p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition"
                  title="Editar"
                >
                  ✏️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISPOSITIVOS */}
      {dispositivos.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">🔧 Dispositivos</h4>
            <button
              onClick={() => setDispositivoModal({ open: true })}
              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              + Adicionar
            </button>
          </div>
          <div className="space-y-2">
            {dispositivos.map((dev) => (
              <div key={dev.id} className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{dev.tipo_dispositivo}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Localização: {dev.localizacao}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Inserido em: {new Date(dev.data_insercao).toLocaleDateString('pt-BR')}
                    {dev.data_remocao && ` (Removido em ${new Date(dev.data_remocao).toLocaleDateString('pt-BR')})`}
                  </p>
                </div>
                <button
                  onClick={() => setDispositivoModal({ open: true, data: dev })}
                  className="ml-2 p-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-800 rounded transition"
                  title="Editar"
                >
                  ✏️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CULTURAS */}
      {culturas.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">🧪 Culturas</h4>
            <button
              onClick={() => setCulturaModal({ open: true })}
              className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition"
            >
              + Adicionar
            </button>
          </div>
          <div className="space-y-2">
            {culturas.map((cult) => (
              <div key={cult.id} className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{cult.microorganismo}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Local: {cult.local}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Coletado em: {new Date(cult.data_coleta).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => setCulturaModal({ open: true, data: cult })}
                  className="ml-2 p-1 text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-800 rounded transition"
                  title="Editar"
                >
                  ✏️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROCEDIMENTOS */}
      {procedimentos.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">⚕️ Procedimentos</h4>
            <button
              onClick={() => setProcedimentoModal({ open: true })}
              className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            >
              + Adicionar
            </button>
          </div>
          <div className="space-y-2">
            {procedimentos.map((proc) => (
              <div key={proc.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{proc.nome_procedimento}</p>
                  {proc.nome_cirurgiao && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Cirurgião: {proc.nome_cirurgiao}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Data: {new Date(proc.data_procedimento).toLocaleDateString('pt-BR')}
                  </p>
                  {proc.notas && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 italic">{proc.notas}</p>
                  )}
                </div>
                <button
                  onClick={() => setProcedimentoModal({ open: true, data: proc })}
                  className="ml-2 p-1 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-800 rounded transition"
                  title="Editar"
                >
                  ✏️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAIS */}
      {medicacaoModal.open && (
        <MedicacaoModal
          data={medicacaoModal.data}
          patientId={patientId}
          onClose={() => setMedicacaoModal({ open: false })}
          onSave={() => {
            setMedicacaoModal({ open: false });
            loadData();
          }}
        />
      )}

      {dispositivoModal.open && (
        <DispositivoModal
          data={dispositivoModal.data}
          patientId={patientId}
          onClose={() => setDispositivoModal({ open: false })}
          onSave={() => {
            setDispositivoModal({ open: false });
            loadData();
          }}
        />
      )}

      {culturaModal.open && (
        <CulturaModal
          data={culturaModal.data}
          patientId={patientId}
          onClose={() => setCulturaModal({ open: false })}
          onSave={() => {
            setCulturaModal({ open: false });
            loadData();
          }}
        />
      )}

      {procedimentoModal.open && (
        <ProcedimentoModal
          data={procedimentoModal.data}
          patientId={patientId}
          onClose={() => setProcedimentoModal({ open: false })}
          onSave={() => {
            setProcedimentoModal({ open: false });
            loadData();
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// MODAL: MEDICAÇÃO
// ============================================================================
interface MedicacaoModalProps {
  data?: Medicacao;
  patientId: string;
  onClose: () => void;
  onSave: () => void;
}

const MedicacaoModal: React.FC<MedicacaoModalProps> = ({ data, patientId, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<Medicacao>>({
    nome_medicacao: data?.nome_medicacao || '',
    dosagem_valor: data?.dosagem_valor || '',
    unidade_medida: data?.unidade_medida || '',
    data_inicio: data?.data_inicio || '',
    data_fim: data?.data_fim || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (data?.id) {
        await backgroundService.updateMedicacao(data.id, form as Medicacao);
      } else {
        await backgroundService.saveMedicacao({
          ...form,
          paciente_id: patientId,
          is_archived: false
        } as Omit<Medicacao, 'id' | 'created_at'>);
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar medicação:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {data ? 'Editar Medicação' : 'Nova Medicação'}
        </h3>

        <input
          type="text"
          placeholder="Nome da medicação"
          value={form.nome_medicacao || ''}
          onChange={(e) => setForm({ ...form, nome_medicacao: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Dosagem"
            value={form.dosagem_valor || ''}
            onChange={(e) => setForm({ ...form, dosagem_valor: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          />
          <input
            type="text"
            placeholder="Unidade"
            value={form.unidade_medida || ''}
            onChange={(e) => setForm({ ...form, unidade_medida: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          />
        </div>

        <input
          type="date"
          value={form.data_inicio || ''}
          onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />

        <input
          type="date"
          placeholder="Data fim (opcional)"
          value={form.data_fim || ''}
          onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL: DISPOSITIVO
// ============================================================================
interface DispositivoModalProps {
  data?: Dispositivo;
  patientId: string;
  onClose: () => void;
  onSave: () => void;
}

const DispositivoModal: React.FC<DispositivoModalProps> = ({ data, patientId, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<Dispositivo>>({
    tipo_dispositivo: data?.tipo_dispositivo || '',
    localizacao: data?.localizacao || '',
    data_insercao: data?.data_insercao || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (data?.id) {
        await backgroundService.updateDispositivo(data.id, form as Dispositivo);
      } else {
        await backgroundService.saveDispositivo({
          ...form,
          paciente_id: patientId,
          is_archived: false,
          data_remocao: null
        } as Omit<Dispositivo, 'id' | 'created_at'>);
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar dispositivo:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {data ? 'Editar Dispositivo' : 'Novo Dispositivo'}
        </h3>

        <input
          type="text"
          placeholder="Tipo de dispositivo"
          value={form.tipo_dispositivo || ''}
          onChange={(e) => setForm({ ...form, tipo_dispositivo: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />

        <input
          type="text"
          placeholder="Localização"
          value={form.localizacao || ''}
          onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />

        <input
          type="date"
          value={form.data_insercao || ''}
          onChange={(e) => setForm({ ...form, data_insercao: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL: CULTURA
// ============================================================================
interface CulturaModalProps {
  data?: Cultura;
  patientId: string;
  onClose: () => void;
  onSave: () => void;
}

const CulturaModal: React.FC<CulturaModalProps> = ({ data, patientId, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<Cultura>>({
    local: data?.local || '',
    microorganismo: data?.microorganismo || '',
    data_coleta: data?.data_coleta || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (data?.id) {
        await backgroundService.updateCultura(data.id, form as Cultura);
      } else {
        await backgroundService.saveCultura({
          ...form,
          paciente_id: patientId,
          is_archived: false
        } as Omit<Cultura, 'id' | 'created_at'>);
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar cultura:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {data ? 'Editar Cultura' : 'Nova Cultura'}
        </h3>

        <input
          type="text"
          placeholder="Local da coleta"
          value={form.local || ''}
          onChange={(e) => setForm({ ...form, local: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />

        <input
          type="text"
          placeholder="Microorganismo"
          value={form.microorganismo || ''}
          onChange={(e) => setForm({ ...form, microorganismo: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />

        <input
          type="date"
          value={form.data_coleta || ''}
          onChange={(e) => setForm({ ...form, data_coleta: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL: PROCEDIMENTO
// ============================================================================
interface ProcedimentoModalProps {
  data?: Procedimento;
  patientId: string;
  onClose: () => void;
  onSave: () => void;
}

const ProcedimentoModal: React.FC<ProcedimentoModalProps> = ({ data, patientId, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<Procedimento>>({
    nome_procedimento: data?.nome_procedimento || '',
    data_procedimento: data?.data_procedimento || '',
    nome_cirurgiao: data?.nome_cirurgiao || '',
    notas: data?.notas || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (data?.id) {
        await backgroundService.updateProcedimento(data.id, form as Procedimento);
      } else {
        await backgroundService.saveProcedimento({
          ...form,
          paciente_id: patientId,
          is_archived: false
        } as Omit<Procedimento, 'id' | 'created_at'>);
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar procedimento:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {data ? 'Editar Procedimento' : 'Novo Procedimento'}
        </h3>

        <input
          type="text"
          placeholder="Nome do procedimento"
          value={form.nome_procedimento || ''}
          onChange={(e) => setForm({ ...form, nome_procedimento: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />

        <input
          type="date"
          value={form.data_procedimento || ''}
          onChange={(e) => setForm({ ...form, data_procedimento: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />

        <input
          type="text"
          placeholder="Nome do cirurgião (opcional)"
          value={form.nome_cirurgiao || ''}
          onChange={(e) => setForm({ ...form, nome_cirurgiao: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />

        <textarea
          placeholder="Notas (opcional)"
          value={form.notas || ''}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none h-20"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundEditor;
