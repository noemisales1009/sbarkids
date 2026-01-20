/**
 * Componente para exibir e editar Background (B - Breve Histórico)
 * Medicações, Dispositivos, Culturas, Procedimentos, Exames e Dietas
 */

import React, { useState, useEffect } from 'react';
import {
  backgroundService,
  Medicacao,
  Dispositivo,
  Cultura,
  Procedimento,
  Exame,
  Dieta
} from '../../services/backgroundService';

interface BackgroundEditorProps {
  patientId: string;
}

const BackgroundEditor: React.FC<BackgroundEditorProps> = ({ patientId }) => {
  const [medicacoes, setMedicacoes] = useState<Medicacao[]>([]);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [culturas, setCulturas] = useState<Cultura[]>([]);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [exames, setExames] = useState<Exame[]>([]);
  const [dietas, setDietas] = useState<Dieta[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [medicacaoModal, setMedicacaoModal] = useState<{ open: boolean; data?: Medicacao }>({ open: false });
  const [dispositivoModal, setDispositivoModal] = useState<{ open: boolean; data?: Dispositivo }>({ open: false });
  const [culturaModal, setCulturaModal] = useState<{ open: boolean; data?: Cultura }>({ open: false });
  const [procedimentoModal, setProcedimentoModal] = useState<{ open: boolean; data?: Procedimento }>({ open: false });
  const [exameModal, setExameModal] = useState<{ open: boolean; data?: Exame }>({ open: false });
  const [dietaModal, setDietaModal] = useState<{ open: boolean; data?: Dieta }>({ open: false });

  // Carregar dados ao montar
  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meds, devs, cults, procs, exs, diets] = await Promise.all([
        backgroundService.getMedicacoes(patientId),
        backgroundService.getDispositivos(patientId),
        backgroundService.getCulturas(patientId),
        backgroundService.getProcedimentos(patientId),
        backgroundService.getExames(patientId),
        backgroundService.getDietas(patientId)
      ]);

      setMedicacoes(meds);
      setDispositivos(devs);
      setCulturas(cults);
      setProcedimentos(procs);
      setExames(exs);
      setDietas(diets);
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

  return (
    <div className="space-y-6">
      {/* MEDICAÇÕES */}
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
        {medicacoes.length > 0 ? (
          <div className="space-y-2">
            {medicacoes.map((med) => (
              <div key={med.id} className="p-3 bg-blue-900/20 border border-blue-800 rounded-lg flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{med.nome_medicacao}</p>
                  <p className="text-xs text-gray-300 mt-1">
                    {med.dosagem_valor} {med.unidade_medida}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Desde: {new Date(med.data_inicio).toLocaleDateString('pt-BR')}
                    {med.data_fim && ` até ${new Date(med.data_fim).toLocaleDateString('pt-BR')}`}
                  </p>
                  {med.observacao && (
                    <p className="text-xs text-gray-300 mt-2 italic">{med.observacao}</p>
                  )}
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
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">Nenhuma medicação registrada</p>
        )}
      </div>

      {/* DISPOSITIVOS */}
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
        {dispositivos.length > 0 ? (
          <div className="space-y-2">
            {dispositivos.map((dev) => (
              <div key={dev.id} className="p-3 bg-green-900/20 border border-green-800 rounded-lg flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{dev.tipo_dispositivo}</p>
                  <p className="text-xs text-gray-300 mt-1">Localização: {dev.localizacao}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Inserido em: {new Date(dev.data_insercao).toLocaleDateString('pt-BR')}
                    {dev.data_remocao && ` (Removido em ${new Date(dev.data_remocao).toLocaleDateString('pt-BR')})`}
                  </p>
                  {dev.observacao && (
                    <p className="text-xs text-gray-300 mt-2 italic">{dev.observacao}</p>
                  )}
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
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">Nenhum dispositivo registrado</p>
        )}
      </div>

      {/* CULTURAS */}
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
        {culturas.length > 0 ? (
          <div className="space-y-2">
            {culturas.map((cult) => (
              <div key={cult.id} className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{cult.microorganismo}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Local: {cult.local}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Coletado em: {new Date(cult.data_coleta).toLocaleDateString('pt-BR')}
                  </p>
                  {cult.observacao && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 italic">{cult.observacao}</p>
                  )}
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
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">Nenhuma cultura registrada</p>
        )}
      </div>

      {/* PROCEDIMENTOS */}
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
        {procedimentos.length > 0 ? (
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
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">Nenhum procedimento registrado</p>
        )}
      </div>

      {/* EXAMES */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">🩺 Exames</h4>
          <button
            onClick={() => setExameModal({ open: true })}
            className="px-3 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600 transition"
          >
            + Adicionar
          </button>
        </div>
        {exames.length > 0 ? (
          <div className="space-y-2">
            {exames.map((exame) => (
              <div key={exame.id} className="p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{exame.nome_exame}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Data: {new Date(exame.data_exame).toLocaleDateString('pt-BR')}
                  </p>
                  {exame.observacao && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 italic">{exame.observacao}</p>
                  )}
                </div>
                <button
                  onClick={() => setExameModal({ open: true, data: exame })}
                  className="ml-2 p-1 text-teal-500 hover:bg-teal-100 dark:hover:bg-teal-800 rounded transition"
                  title="Editar"
                >
                  ✏️
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">Nenhum exame registrado</p>
        )}
      </div>

      {/* DIETAS */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">🍽️ Dietas</h4>
          <button
            onClick={() => setDietaModal({ open: true })}
            className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          >
            + Adicionar
          </button>
        </div>
        {dietas.length > 0 ? (
          <div className="space-y-2">
            {dietas.map((dieta) => (
              <div key={dieta.id} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{dieta.tipo}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Desde: {new Date(dieta.data_inicio).toLocaleDateString('pt-BR')}
                    {dieta.data_remocao && ` até ${new Date(dieta.data_remocao).toLocaleDateString('pt-BR')}`}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    {dieta.volume && <p className="text-gray-600 dark:text-gray-300">Volume: {dieta.volume} ml</p>}
                    {dieta.vet && <p className="text-gray-600 dark:text-gray-300">VET: {dieta.vet} kcal</p>}
                    {dieta.pt && <p className="text-gray-600 dark:text-gray-300">PT: {dieta.pt} g</p>}
                    {dieta.th && <p className="text-gray-600 dark:text-gray-300">TH: {dieta.th} g</p>}
                    {dieta.vet_at && <p className="text-gray-600 dark:text-gray-300">VET Atual: {dieta.vet_at.toFixed(1)}%</p>}
                    {dieta.pt_at && <p className="text-gray-600 dark:text-gray-300">PT Atual: {dieta.pt_at.toFixed(1)}%</p>}
                  </div>
                  {dieta.observacao && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 italic">{dieta.observacao}</p>
                  )}
                </div>
                <button
                  onClick={() => setDietaModal({ open: true, data: dieta })}
                  className="ml-2 p-1 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-800 rounded transition"
                  title="Editar"
                >
                  ✏️
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">Nenhuma dieta registrada</p>
        )}
      </div>

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

      {exameModal.open && (
        <ExameModal
          data={exameModal.data}
          patientId={patientId}
          onClose={() => setExameModal({ open: false })}
          onSave={() => {
            setExameModal({ open: false });
            loadData();
          }}
        />
      )}

      {dietaModal.open && (
        <DietaModal
          data={dietaModal.data}
          patientId={patientId}
          onClose={() => setDietaModal({ open: false })}
          onSave={() => {
            setDietaModal({ open: false });
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
    data_fim: data?.data_fim || '',
    observacao: data?.observacao || ''
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
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">
          {data ? 'Editar Medicação' : 'Nova Medicação'}
        </h3>

        <input
          type="text"
          placeholder="Nome da medicação"
          value={form.nome_medicacao || ''}
          onChange={(e) => setForm({ ...form, nome_medicacao: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Dosagem"
            value={form.dosagem_valor || ''}
            onChange={(e) => setForm({ ...form, dosagem_valor: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
          />
          <input
            type="text"
            placeholder="Unidade (mg/dia)"
            value={form.unidade_medida || ''}
            onChange={(e) => setForm({ ...form, unidade_medida: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Data Início</label>
            <input
              type="date"
              value={form.data_inicio || ''}
              onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Data Fim (opcional)</label>
            <input
              type="date"
              value={form.data_fim || ''}
              onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
            />
          </div>
        </div>

        <textarea
          placeholder="Observações (opcional)"
          value={form.observacao || ''}
          onChange={(e) => setForm({ ...form, observacao: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm resize-none h-20"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
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
    data_insercao: data?.data_insercao || '',
    data_remocao: data?.data_remocao || '',
    observacao: data?.observacao || ''
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
          is_archived: false
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
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">
          {data ? 'Editar Dispositivo' : 'Novo Dispositivo'}
        </h3>

        <input
          type="text"
          placeholder="Tipo de dispositivo"
          value={form.tipo_dispositivo || ''}
          onChange={(e) => setForm({ ...form, tipo_dispositivo: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
        />

        <input
          type="text"
          placeholder="Localização"
          value={form.localizacao || ''}
          onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Data Inserção</label>
            <input
              type="date"
              value={form.data_insercao || ''}
              onChange={(e) => setForm({ ...form, data_insercao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Data Remoção (opcional)</label>
            <input
              type="date"
              value={form.data_remocao || ''}
              onChange={(e) => setForm({ ...form, data_remocao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
            />
          </div>
        </div>

        <textarea
          placeholder="Observações (opcional)"
          value={form.observacao || ''}
          onChange={(e) => setForm({ ...form, observacao: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm resize-none h-20"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
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
    data_coleta: data?.data_coleta || '',
    observacao: data?.observacao || ''
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
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">
          {data ? 'Editar Cultura' : 'Nova Cultura'}
        </h3>

        <input
          type="text"
          placeholder="Local da coleta"
          value={form.local || ''}
          onChange={(e) => setForm({ ...form, local: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
        />

        <input
          type="text"
          placeholder="Microorganismo"
          value={form.microorganismo || ''}
          onChange={(e) => setForm({ ...form, microorganismo: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
        />

        <input
          type="date"
          value={form.data_coleta || ''}
          onChange={(e) => setForm({ ...form, data_coleta: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
        />

        <textarea
          placeholder="Observações (opcional)"
          value={form.observacao || ''}
          onChange={(e) => setForm({ ...form, observacao: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm resize-none h-20"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
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
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">
          {data ? 'Editar Procedimento' : 'Novo Procedimento'}
        </h3>

        <input
          type="text"
          placeholder="Nome do procedimento"
          value={form.nome_procedimento || ''}
          onChange={(e) => setForm({ ...form, nome_procedimento: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
        />

        <input
          type="date"
          value={form.data_procedimento || ''}
          onChange={(e) => setForm({ ...form, data_procedimento: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
        />

        <input
          type="text"
          placeholder="Nome do cirurgião (opcional)"
          value={form.nome_cirurgiao || ''}
          onChange={(e) => setForm({ ...form, nome_cirurgiao: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
        />

        <textarea
          placeholder="Notas (opcional)"
          value={form.notas || ''}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm resize-none h-20"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
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

// ============================================================================
// MODAL: EXAME
// ============================================================================
interface ExameModalProps {
  data?: Exame;
  patientId: string;
  onClose: () => void;
  onSave: () => void;
}

const ExameModal: React.FC<ExameModalProps> = ({ data, patientId, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<Exame>>({
    nome_exame: data?.nome_exame || '',
    data_exame: data?.data_exame || '',
    observacao: data?.observacao || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (data?.id) {
        await backgroundService.updateExame(data.id, form as Exame);
      } else {
        await backgroundService.saveExame({
          ...form,
          paciente_id: patientId,
          is_archived: false
        } as Omit<Exame, 'id' | 'created_at'>);
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar exame:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">
          {data ? 'Editar Exame' : 'Novo Exame'}
        </h3>

        <input
          type="text"
          placeholder="Nome do exame"
          value={form.nome_exame || ''}
          onChange={(e) => setForm({ ...form, nome_exame: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
        />

        <input
          type="date"
          value={form.data_exame || ''}
          onChange={(e) => setForm({ ...form, data_exame: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
        />

        <textarea
          placeholder="Observações (opcional)"
          value={form.observacao || ''}
          onChange={(e) => setForm({ ...form, observacao: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm resize-none h-20"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 transition"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL: DIETA
// ============================================================================
interface DietaModalProps {
  data?: Dieta;
  patientId: string;
  onClose: () => void;
  onSave: () => void;
}

const DietaModal: React.FC<DietaModalProps> = ({ data, patientId, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<Dieta>>({
    tipo: data?.tipo || '',
    data_inicio: data?.data_inicio || '',
    volume: data?.volume || null,
    vet: data?.vet || null,
    pt: data?.pt || null,
    th: data?.th || null,
    vet_pleno: data?.vet_pleno || null,
    pt_g_dia: data?.pt_g_dia || null,
    data_remocao: data?.data_remocao || null,
    observacao: data?.observacao || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (data?.id) {
        await backgroundService.updateDieta(data.id, form as Dieta);
      } else {
        await backgroundService.saveDieta({
          ...form,
          paciente_id: patientId,
          is_archived: false
        } as Omit<Dieta, 'id' | 'created_at' | 'updated_at' | 'vet_at' | 'pt_at'>);
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar dieta:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full p-6 space-y-4 my-8">
        <h3 className="text-lg font-bold text-white">
          {data ? 'Editar Dieta' : 'Nova Dieta'}
        </h3>

        <input
          type="text"
          placeholder="Tipo de dieta"
          value={form.tipo || ''}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Data Início</label>
            <input
              type="date"
              value={form.data_inicio || ''}
              onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Data Remoção (opcional)</label>
            <input
              type="date"
              value={form.data_remocao || ''}
              onChange={(e) => setForm({ ...form, data_remocao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Volume (ml)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Volume"
              value={form.volume || ''}
              onChange={(e) => setForm({ ...form, volume: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">VET (kcal)</label>
            <input
              type="number"
              step="0.01"
              placeholder="VET"
              value={form.vet || ''}
              onChange={(e) => setForm({ ...form, vet: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">VET Pleno (kcal)</label>
            <input
              type="number"
              step="0.01"
              placeholder="VET Pleno"
              value={form.vet_pleno || ''}
              onChange={(e) => setForm({ ...form, vet_pleno: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">PT (g)</label>
            <input
              type="number"
              step="0.01"
              placeholder="PT"
              value={form.pt || ''}
              onChange={(e) => setForm({ ...form, pt: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">PT g/dia</label>
            <input
              type="number"
              step="0.01"
              placeholder="PT g/dia"
              value={form.pt_g_dia || ''}
              onChange={(e) => setForm({ ...form, pt_g_dia: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">TH (g)</label>
            <input
              type="number"
              step="0.01"
              placeholder="TH"
              value={form.th || ''}
              onChange={(e) => setForm({ ...form, th: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
            />
          </div>
        </div>

        <textarea
          placeholder="Observações (opcional)"
          value={form.observacao || ''}
          onChange={(e) => setForm({ ...form, observacao: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm resize-none h-20"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundEditor;
