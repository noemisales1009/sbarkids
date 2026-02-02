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
import { MEDICATION_LIST, MEDICATION_DOSAGE_UNITS, DEVICE_TYPES, DEVICE_LOCATIONS, CULTURE_COLLECTION_SITES } from '../../utils/constants';
import { PATHOGENS_LIST } from '../../utils/pathogens';

interface BackgroundEditorProps {
  patientId: string;
}

// Função para converter datas entre formatos
const convertDateFormat = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  dateStr = String(dateStr).trim();
  // Se já está em YYYY-MM-DD, retorna como está
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
  // Se está em DD/MM/YYYY, converte
  if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [dia, mes, ano] = dateStr.split('/');
    return `${ano}-${mes}-${dia}`;
  }
  return dateStr;
};

// Função para calcular dias de uso considerando fuso de São Paulo
const calculateDaysOfUsage = (dataInicio: string | null | undefined): number => {
  try {
    if (!dataInicio) return 0;
    
    // Remover espaços
    dataInicio = dataInicio.trim();
    
    let startDate: Date;
    
    // Tentar parsear como ISO (YYYY-MM-DD)
    if (dataInicio.includes('-') && !dataInicio.includes('/')) {
      startDate = new Date(dataInicio + 'T00:00:00');
    }
    // Tentar parsear como brasileiro (DD/MM/YYYY)
    else if (dataInicio.includes('/')) {
      const parts = dataInicio.split('/');
      if (parts.length === 3) {
        startDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      } else {
        return 0;
      }
    }
    // Tentar parsear como data genérica
    else {
      startDate = new Date(dataInicio);
    }
    
    // Se ainda for inválida, retorna 0
    if (isNaN(startDate.getTime())) {
      console.warn('Data inválida:', dataInicio);
      return 0;
    }
    
    // Obter data atual (sem considerar hora)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calcular diferença em milissegundos
    const timeDifference = today.getTime() - startDate.getTime();
    
    // Converter para dias (1 dia = 24 * 60 * 60 * 1000 ms)
    const daysDifference = Math.floor(timeDifference / (24 * 60 * 60 * 1000));
    
    return Math.max(daysDifference, 0);
  } catch (error) {
    console.error('Erro ao calcular dias:', error);
    return 0;
  }
};

// ============================================================================
// TAB COMPONENTS
// ============================================================================
interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
      isActive
        ? 'text-blue-400 border-b-2 border-blue-400'
        : 'text-gray-400 hover:text-gray-300 border-b-2 border-transparent'
    }`}
  >
    {label}
  </button>
);

interface TabContentProps {
  title: string;
  addButtonLabel: string;
  onAddClick: () => void;
  isEmpty: boolean;
  emptyMessage: string;
  children: React.ReactNode;
}

const TabContent: React.FC<TabContentProps> = ({
  title,
  addButtonLabel,
  onAddClick,
  isEmpty,
  emptyMessage,
  children
}) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h4>
      <button
        onClick={onAddClick}
        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        {addButtonLabel}
      </button>
    </div>
    {isEmpty ? (
      <p className="text-xs text-gray-500 dark:text-gray-400 italic">{emptyMessage}</p>
    ) : (
      children
    )}
  </div>
);

const BackgroundEditor: React.FC<BackgroundEditorProps> = ({ patientId }) => {
  const [medicacoes, setMedicacoes] = useState<Medicacao[]>([]);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [culturas, setCulturas] = useState<Cultura[]>([]);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [exames, setExames] = useState<Exame[]>([]);
  const [dietas, setDietas] = useState<Dieta[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'medicacoes' | 'dispositivos' | 'culturas' | 'procedimentos' | 'exames' | 'dietas'>('medicacoes');

  // Modal states
  const [medicacaoModal, setMedicacaoModal] = useState<{ open: boolean; data?: Medicacao }>({ open: false });
  const [fimMedicacaoModal, setFimMedicacaoModal] = useState<{ open: boolean; medicacao?: Medicacao }>({ open: false });
  const [fimDispositivoModal, setFimDispositivoModal] = useState<{ open: boolean; dispositivo?: Dispositivo }>({ open: false });
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
      console.log('📦 Carregando dados do background para paciente:', patientId);
      
      const [meds, devs, cults, procs, exs, diets] = await Promise.all([
        backgroundService.getMedicacoes(patientId),
        backgroundService.getDispositivos(patientId),
        backgroundService.getCulturas(patientId),
        backgroundService.getProcedimentos(patientId),
        backgroundService.getExames(patientId),
        backgroundService.getDietas(patientId)
      ]);

      console.log('💊 Medicações carregadas:', meds.length);
      console.log('🔧 Dispositivos carregados:', devs.length);
      console.log('🧬 Culturas carregadas:', cults.length);
      console.log('⚕️ Procedimentos carregados:', procs.length);
      console.log('🔬 Exames carregados:', exs.length);
      console.log('🍽️ Dietas carregadas:', diets.length);

      setMedicacoes(meds);
      setDispositivos(devs);
      setCulturas(cults);
      setProcedimentos(procs);
      setExames(exs);
      setDietas(diets);
    } catch (error) {
      console.error('❌ Erro ao carregar background:', error);
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
    <div className="space-y-4">
      {/* TAB NAVIGATION */}
      <div className="border-b border-gray-700 flex overflow-x-auto gap-1">
        <TabButton
          label="💊 Medicações"
          isActive={activeTab === 'medicacoes'}
          onClick={() => setActiveTab('medicacoes')}
        />
        <TabButton
          label="🔧 Dispositivos"
          isActive={activeTab === 'dispositivos'}
          onClick={() => setActiveTab('dispositivos')}
        />
        <TabButton
          label="🧬 Culturas"
          isActive={activeTab === 'culturas'}
          onClick={() => setActiveTab('culturas')}
        />
        <TabButton
          label="⚕️ Procedimentos"
          isActive={activeTab === 'procedimentos'}
          onClick={() => setActiveTab('procedimentos')}
        />
        <TabButton
          label="🔬 Exames"
          isActive={activeTab === 'exames'}
          onClick={() => setActiveTab('exames')}
        />
        <TabButton
          label="🍽️ Dietas"
          isActive={activeTab === 'dietas'}
          onClick={() => setActiveTab('dietas')}
        />
      </div>

      {/* TAB CONTENT */}
      <div>
        {/* MEDICAÇÕES */}
        {activeTab === 'medicacoes' && (
          <TabContent
            title="Medicações"
            addButtonLabel="+ Adicionar"
            onAddClick={() => setMedicacaoModal({ open: true })}
            isEmpty={medicacoes.length === 0}
            emptyMessage="Nenhuma medicação registrada"
          >
            <div className="space-y-2">
              {medicacoes.map((med) => {
                const temFim = med.data_fim && new Date(med.data_fim).getTime() > 0;
                return (
                  <div 
                    key={med.id} 
                    className={`p-3 border rounded-lg flex justify-between items-start ${
                      temFim 
                        ? 'bg-yellow-900/20 border-yellow-700' 
                        : 'bg-blue-900/20 border-blue-800'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{med.nome_medicacao}</p>
                      <p className="text-xs text-gray-300 mt-1">
                        {med.dosagem_valor} {med.unidade_medida}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Início: {
                          med.data_inicio.includes('-')
                            ? new Date(med.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')
                            : med.data_inicio
                        }
                      </p>
                      {temFim ? (
                        <p className="text-xs text-yellow-400 mt-1 font-semibold">
                          Fim: {new Date(med.data_fim).toLocaleDateString('pt-BR')}
                        </p>
                      ) : (
                        <p className="text-xs text-green-400 mt-1 font-semibold">
                          ✓ {calculateDaysOfUsage(med.data_inicio)} dia{calculateDaysOfUsage(med.data_inicio) !== 1 ? 's' : ''} de uso
                        </p>
                      )}
                      {med.observacao && (
                        <p className="text-xs text-gray-300 mt-2 italic">{med.observacao}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={() => setMedicacaoModal({ open: true, data: med })}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      >
                        Editar
                      </button>
                      {!temFim && (
                        <button
                          onClick={() => setFimMedicacaoModal({ open: true, medicacao: med })}
                          className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                        >
                          Fim
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabContent>
        )}

        {/* DISPOSITIVOS */}
        {activeTab === 'dispositivos' && (
          <TabContent
            title="Dispositivos"
            addButtonLabel="+ Adicionar"
            onAddClick={() => setDispositivoModal({ open: true })}
            isEmpty={dispositivos.length === 0}
            emptyMessage="Nenhum dispositivo registrado"
          >
            <div className="space-y-2">
              {dispositivos.map((dev) => (
                <div key={dev.id} className="p-3 bg-green-900/20 border border-green-800 rounded-lg flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{dev.tipo_dispositivo}</p>
                    <p className="text-xs text-gray-300 mt-1">Localização: {dev.localizacao}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Inserido em: {
                        typeof dev.data_insercao === 'string' 
                          ? new Date(dev.data_insercao + 'T00:00:00').toLocaleDateString('pt-BR')
                          : new Date(dev.data_insercao).toLocaleDateString('pt-BR')
                      }
                    </p>
                    <p className="text-xs text-green-400 mt-1 font-semibold">
                      {calculateDaysOfUsage(dev.data_insercao)} dia{calculateDaysOfUsage(dev.data_insercao) !== 1 ? 's' : ''} com dispositivo
                    </p>
                    {dev.data_remocao && (
                      <p className="text-xs text-yellow-400 mt-1 font-semibold">
                        Fim: {
                          typeof dev.data_remocao === 'string'
                            ? new Date(dev.data_remocao).toLocaleDateString('pt-BR')
                            : new Date(dev.data_remocao).toLocaleDateString('pt-BR')
                        }
                      </p>
                    )}
                    {dev.observacao && (
                      <p className="text-xs text-gray-300 mt-2 italic">{dev.observacao}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => setDispositivoModal({ open: true, data: dev })}
                      className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition"
                    >
                      Editar
                    </button>
                    {!dev.data_remocao && (
                      <button
                        onClick={() => setFimDispositivoModal({ open: true, dispositivo: dev })}
                        className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                      >
                        Fim
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabContent>
        )}

        {/* CULTURAS */}
        {activeTab === 'culturas' && (
          <TabContent
            title="Culturas"
            addButtonLabel="+ Adicionar"
            onAddClick={() => setCulturaModal({ open: true })}
            isEmpty={culturas.length === 0}
            emptyMessage="Nenhuma cultura registrada"
          >
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
                    className="ml-2 px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                  >
                    Editar
                  </button>
                </div>
              ))}
            </div>
          </TabContent>
        )}

        {/* PROCEDIMENTOS */}
        {activeTab === 'procedimentos' && (
          <TabContent
            title="Procedimentos"
            addButtonLabel="+ Adicionar"
            onAddClick={() => setProcedimentoModal({ open: true })}
            isEmpty={procedimentos.length === 0}
            emptyMessage="Nenhum procedimento registrado"
          >
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
                    <p className="text-xs text-blue-400 mt-1 font-semibold">
                      Dia Pós-Operatório: +{calculateDaysOfUsage(proc.data_procedimento)} dia{calculateDaysOfUsage(proc.data_procedimento) !== 1 ? 's' : ''}
                    </p>
                    {proc.notas && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 italic">{proc.notas}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setProcedimentoModal({ open: true, data: proc })}
                    className="ml-2 px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                  >
                    Editar
                  </button>
                </div>
              ))}
            </div>
          </TabContent>
        )}

        {/* EXAMES */}
        {activeTab === 'exames' && (
          <TabContent
            title="Exames"
            addButtonLabel="+ Adicionar"
            onAddClick={() => setExameModal({ open: true })}
            isEmpty={exames.length === 0}
            emptyMessage="Nenhum exame registrado"
          >
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
                    className="ml-2 px-3 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600 transition"
                  >
                    Editar
                  </button>
                </div>
              ))}
            </div>
          </TabContent>
        )}

        {/* DIETAS */}
        {activeTab === 'dietas' && (
          <TabContent
            title="Dietas"
            addButtonLabel="+ Adicionar"
            onAddClick={() => setDietaModal({ open: true })}
            isEmpty={dietas.length === 0}
            emptyMessage="Nenhuma dieta registrada"
          >
            <div className="space-y-2">
              {dietas.map((dieta) => (
                <div key={dieta.id} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{dieta.tipo}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Início: {new Date(dieta.data_inicio).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 font-semibold">
                      Dias: {calculateDaysOfUsage(dieta.data_inicio)}
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
                    className="ml-2 px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                  >
                    Editar
                  </button>
                </div>
              ))}
            </div>
          </TabContent>
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

      {fimMedicacaoModal.open && fimMedicacaoModal.medicacao && (
        <FimMedicacaoModal
          medicacao={fimMedicacaoModal.medicacao}
          onClose={() => setFimMedicacaoModal({ open: false })}
          onSave={() => {
            setFimMedicacaoModal({ open: false });
            loadData();
          }}
        />
      )}

      {fimDispositivoModal.open && fimDispositivoModal.dispositivo && (
        <FimDispositivoModal
          dispositivo={fimDispositivoModal.dispositivo}
          onClose={() => setFimDispositivoModal({ open: false })}
          onSave={() => {
            setFimDispositivoModal({ open: false });
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
  const [customMedication, setCustomMedication] = useState('');
  const [saving, setSaving] = useState(false);

  const handleMedicationChange = (value: string) => {
    setForm({ ...form, nome_medicacao: value });
    if (value !== 'Outro') {
      setCustomMedication('');
    }
  };

  const handleCustomMedicationChange = (value: string) => {
    setCustomMedication(value);
    setForm({ ...form, nome_medicacao: value });
  };

  const handleSave = async () => {
    // Validar campos obrigatórios
    if (!form.nome_medicacao || !form.dosagem_valor || !form.unidade_medida || !form.data_inicio) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);
      console.log('💊 Salvando medicação:', form);
      
      // Preparar dados para envio - garantir que datas estejam em YYYY-MM-DD
      const medicacaoData: Omit<Medicacao, 'id' | 'created_at'> = {
        ...form,
        paciente_id: patientId,
        is_archived: false,
        data_inicio: convertDateFormat(form.data_inicio || ''),
        data_fim: form.data_fim && form.data_fim.trim() ? convertDateFormat(form.data_fim) : null
      } as any;
      
      console.log('📤 Enviando dados:', medicacaoData);
      
      if (data?.id) {
        const result = await backgroundService.updateMedicacao(data.id, medicacaoData as any);
        console.log('✅ Medicação atualizada:', result);
      } else {
        const result = await backgroundService.saveMedicacao(medicacaoData);
        console.log('✅ Medicação salva:', result);
      }
      onSave();
    } catch (error) {
      console.error('❌ Erro ao salvar medicação:', error);
      alert('Erro ao salvar medicação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const isSelectingOutro = form.nome_medicacao === 'Outro';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">
          {data ? 'Editar Medicação' : 'Nova Medicação'}
        </h3>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Medicação</label>
          <select
            value={isSelectingOutro ? 'Outro' : (form.nome_medicacao || '')}
            onChange={(e) => handleMedicationChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
          >
            <option value="">Selecione uma medicação</option>
            {MEDICATION_LIST.map((med) => (
              <option key={med} value={med}>
                {med}
              </option>
            ))}
          </select>
        </div>

        {isSelectingOutro && (
          <input
            type="text"
            placeholder="Digite o nome da medicação"
            value={customMedication}
            onChange={(e) => handleCustomMedicationChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Dosagem"
            value={form.dosagem_valor || ''}
            onChange={(e) => setForm({ ...form, dosagem_valor: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
          />
          <div>
            <select
              value={form.unidade_medida || ''}
              onChange={(e) => setForm({ ...form, unidade_medida: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
            >
              <option value="">Selecione unidade</option>
              {MEDICATION_DOSAGE_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Data de Início</label>
          <input
            type="date"
            value={
              form.data_inicio 
                ? (form.data_inicio.includes('-') 
                    ? form.data_inicio 
                    : (() => {
                        const parts = form.data_inicio.split('/');
                        return parts.length === 3 
                          ? `${parts[2]}-${String(parts[1]).padStart(2, '0')}-${String(parts[0]).padStart(2, '0')}` 
                          : form.data_inicio;
                      })()
                  )
                : ''
            }
            onChange={(e) => {
              // Converter de YYYY-MM-DD para DD/MM/YYYY para armazenar
              const dateValue = e.target.value;
              if (dateValue) {
                const [year, month, day] = dateValue.split('-');
                setForm({ ...form, data_inicio: `${day}/${month}/${year}` });
              } else {
                setForm({ ...form, data_inicio: '' });
              }
            }}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
          />
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
  const [customDevice, setCustomDevice] = useState('');
  const [saving, setSaving] = useState(false);

  const handleDeviceTypeChange = (value: string) => {
    setForm({ ...form, tipo_dispositivo: value });
    if (value !== 'Outros') {
      setCustomDevice('');
    }
  };

  const handleCustomDeviceChange = (value: string) => {
    setCustomDevice(value);
    setForm({ ...form, tipo_dispositivo: value });
  };

  const handleSave = async () => {
    try {
      // Validação de campos obrigatórios
      if (!form.tipo_dispositivo || !form.localizacao || !form.data_insercao) {
        alert('Por favor, preencha todos os campos obrigatórios: Tipo, Localização e Data de Inserção');
        return;
      }

      setSaving(true);
      console.log('🔧 Salvando dispositivo:', form);
      
      // Preparar dados para envio - converter strings vazias para null e datas para YYYY-MM-DD
      const dataToSend = {
        tipo_dispositivo: form.tipo_dispositivo,
        localizacao: form.localizacao,
        data_insercao: convertDateFormat(form.data_insercao),
        data_remocao: form.data_remocao && form.data_remocao.toString().trim() ? convertDateFormat(form.data_remocao) : null,
        observacao: form.observacao && form.observacao.trim() ? form.observacao : null,
        paciente_id: patientId,
        is_archived: false
      };
      
      console.log('📤 Dados para enviar:', dataToSend);
      
      if (data?.id) {
        const result = await backgroundService.updateDispositivo(data.id, dataToSend as Dispositivo);
        console.log('✅ Dispositivo atualizado:', result);
      } else {
        const result = await backgroundService.saveDispositivo(
          dataToSend as Omit<Dispositivo, 'id' | 'created_at'>
        );
        console.log('✅ Dispositivo salvo:', result);
      }
      onSave();
    } catch (error) {
      console.error('❌ Erro ao salvar dispositivo:', error);
      alert('Erro ao salvar dispositivo. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const isSelectingOutro = form.tipo_dispositivo === 'Outros';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 space-y-5">
        <h3 className="text-lg font-bold text-white">
          {data ? 'Editar Dispositivo' : 'Novo Dispositivo'}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">Tipo de dispositivo</label>
            <select
              value={isSelectingOutro ? 'Outros' : (form.tipo_dispositivo || '')}
              onChange={(e) => handleDeviceTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Selecione um dispositivo</option>
              {DEVICE_TYPES.map((device) => (
                <option key={device} value={device}>
                  {device}
                </option>
              ))}
            </select>
          </div>

          {isSelectingOutro && (
            <input
              type="text"
              placeholder="Digite o tipo de dispositivo"
              value={customDevice}
              onChange={(e) => handleCustomDeviceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-500"
            />
          )}

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">Localização</label>
            <select
              value={form.localizacao || ''}
              onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Selecione um local</option>
              {DEVICE_LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">Data Inserção</label>
            <input
              type="date"
              value={form.data_insercao || ''}
              onChange={(e) => setForm({ ...form, data_insercao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-2">Observações (opcional)</label>
          <textarea
            placeholder="Digite observações..."
            value={form.observacao || ''}
            onChange={(e) => setForm({ ...form, observacao: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-500 text-sm resize-none h-24 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.tipo_dispositivo || !form.localizacao || !form.data_insercao}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
  const [customCollectionSite, setCustomCollectionSite] = useState('');
  const [customPathogen, setCustomPathogen] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCollectionSiteChange = (value: string) => {
    setForm({ ...form, local: value });
    if (value !== 'Outros') {
      setCustomCollectionSite('');
    }
  };

  const handleCustomCollectionSiteChange = (value: string) => {
    setCustomCollectionSite(value);
    setForm({ ...form, local: value });
  };

  const handlePathogenChange = (value: string) => {
    setForm({ ...form, microorganismo: value });
    if (value !== 'Outros') {
      setCustomPathogen('');
    }
  };

  const handleCustomPathogenChange = (value: string) => {
    setCustomPathogen(value);
    setForm({ ...form, microorganismo: value });
  };

  const handleSave = async () => {
    // Validar campos obrigatórios
    if (!form.local || !form.microorganismo || !form.data_coleta) {
      alert('Por favor, preencha todos os campos obrigatórios: Local, Microrganismo e Data');
      return;
    }

    try {
      setSaving(true);
      console.log('🧬 Salvando cultura:', form);
      
      const culturaData: Omit<Cultura, 'id' | 'created_at'> = {
        ...form,
        paciente_id: patientId,
        is_archived: false,
        data_coleta: convertDateFormat(form.data_coleta || '')
      } as any;

      if (data?.id) {
        const result = await backgroundService.updateCultura(data.id, culturaData as any);
        console.log('✅ Cultura atualizada:', result);
      } else {
        const result = await backgroundService.saveCultura(culturaData);
        console.log('✅ Cultura salva:', result);
      }
      onSave();
    } catch (error) {
      console.error('❌ Erro ao salvar cultura:', error);
      alert('Erro ao salvar cultura. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const isSelectingOutroLocal = form.local === 'Outros';
  const isSelectingOutroPathogen = form.microorganismo === 'Outros';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">
          {data ? 'Editar Cultura' : 'Nova Cultura'}
        </h3>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Local da coleta</label>
          <select
            value={isSelectingOutroLocal ? 'Outros' : (form.local || '')}
            onChange={(e) => handleCollectionSiteChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
          >
            <option value="">Selecione um local</option>
            {CULTURE_COLLECTION_SITES.map((site) => (
              <option key={site} value={site}>
                {site}
              </option>
            ))}
          </select>
        </div>

        {isSelectingOutroLocal && (
          <input
            type="text"
            placeholder="Digite o local da coleta"
            value={customCollectionSite}
            onChange={(e) => handleCustomCollectionSiteChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
          />
        )}

        <div>
          <label className="text-xs text-gray-400 block mb-1">Microrganismo</label>
          <select
            value={isSelectingOutroPathogen ? 'Outros' : (form.microorganismo || '')}
            onChange={(e) => handlePathogenChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
          >
            <option value="">Selecione um microrganismo</option>
            {PATHOGENS_LIST.map((pathogen) => (
              <option key={pathogen} value={pathogen}>
                {pathogen}
              </option>
            ))}
          </select>
        </div>

        {isSelectingOutroPathogen && (
          <input
            type="text"
            placeholder="Digite o microrganismo"
            value={customPathogen}
            onChange={(e) => handleCustomPathogenChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 text-sm"
          />
        )}

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
    // Validar campos obrigatórios
    if (!form.nome_procedimento || !form.data_procedimento) {
      alert('Por favor, preencha todos os campos obrigatórios: Procedimento e Data');
      return;
    }

    try {
      setSaving(true);
      console.log('⚕️ Salvando procedimento:', form);
      
      const procedimentoData = {
        ...form,
        paciente_id: patientId,
        is_archived: false,
        data_procedimento: convertDateFormat(form.data_procedimento || '')
      } as Omit<Procedimento, 'id' | 'created_at'>;

      if (data?.id) {
        const result = await backgroundService.updateProcedimento(data.id, procedimentoData as any);
        console.log('✅ Procedimento atualizado:', result);
      } else {
        const result = await backgroundService.saveProcedimento(procedimentoData);
        console.log('✅ Procedimento salvo:', result);
      }
      onSave();
    } catch (error) {
      console.error('❌ Erro ao salvar procedimento:', error);
      alert('Erro ao salvar procedimento. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">
            {data ? 'Editar Cirurgia' : 'Cadastrar Cirurgia'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-300 block mb-2">Procedimento</label>
          <input
            type="text"
            placeholder="Ex: Apendicitomia"
            value={form.nome_procedimento || ''}
            onChange={(e) => setForm({ ...form, nome_procedimento: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-300 block mb-2">Data</label>
          <input
            type="date"
            value={form.data_procedimento || ''}
            onChange={(e) => setForm({ ...form, data_procedimento: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-300 block mb-2">Cirurgião</label>
          <input
            type="text"
            placeholder="Dr(a). Sobrenome"
            value={form.nome_cirurgiao || ''}
            onChange={(e) => setForm({ ...form, nome_cirurgiao: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-300 block mb-2">Observação (Opcional)</label>
          <textarea
            placeholder="Digite aqui..."
            value={form.notas || ''}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-500 text-sm resize-none h-24 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Cadastrando...' : 'Cadastrar'}
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
    // Validar campos obrigatórios
    if (!form.nome_exame || !form.data_exame) {
      alert('Por favor, preencha todos os campos obrigatórios: Nome e Data');
      return;
    }

    try {
      setSaving(true);
      console.log('🔬 Salvando exame:', form);
      
      const exameData = {
        ...form,
        paciente_id: patientId,
        is_archived: false,
        data_exame: convertDateFormat(form.data_exame || '')
      } as Omit<Exame, 'id' | 'created_at'>;

      if (data?.id) {
        const result = await backgroundService.updateExame(data.id, exameData as any);
        console.log('✅ Exame atualizado:', result);
      } else {
        const result = await backgroundService.saveExame(exameData);
        console.log('✅ Exame salvo:', result);
      }
      onSave();
    } catch (error) {
      console.error('❌ Erro ao salvar exame:', error);
      alert('Erro ao salvar exame. Tente novamente.');
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
    // Validar campos obrigatórios
    if (!form.tipo || !form.data_inicio) {
      alert('Por favor, preencha todos os campos obrigatórios: Tipo e Data de Início');
      return;
    }

    try {
      setSaving(true);
      console.log('🍽️ Salvando dieta:', form);
      
      const dietaData = {
        ...form,
        paciente_id: patientId,
        is_archived: false,
        data_inicio: convertDateFormat(form.data_inicio || ''),
        data_remocao: form.data_remocao ? convertDateFormat(form.data_remocao) : null
      } as Omit<Dieta, 'id' | 'created_at' | 'updated_at' | 'vet_at' | 'pt_at'>;

      if (data?.id) {
        const result = await backgroundService.updateDieta(data.id, dietaData as any);
        console.log('✅ Dieta atualizada:', result);
      } else {
        const result = await backgroundService.saveDieta(dietaData);
        console.log('✅ Dieta salva:', result);
      }
      onSave();
    } catch (error) {
      console.error('❌ Erro ao salvar dieta:', error);
      alert('Erro ao salvar dieta. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full p-6 space-y-5 my-8">
        <h3 className="text-lg font-bold text-white">
          {data ? 'Editar Dieta' : 'Nova Dieta'}
        </h3>

        <div>
          <label className="text-sm font-semibold text-gray-300 block mb-2">Tipo de dieta</label>
          <select
            value={form.tipo || ''}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">Selecione um tipo</option>
            <option value="Oral">Oral</option>
            <option value="Enteral">Enteral</option>
            <option value="Parenteral">Parenteral</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-300 block mb-2">Data Início</label>
          <input
            type="date"
            value={form.data_inicio || ''}
            onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-300 block mb-2">Volume (ml)</label>
          <input
            type="number"
            step="0.01"
            placeholder="Volume em ml"
            value={form.volume || ''}
            onChange={(e) => setForm({ ...form, volume: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">VET (kcal)</label>
            <input
              type="number"
              step="0.01"
              placeholder="VET atingido"
              value={form.vet || ''}
              onChange={(e) => setForm({ ...form, vet: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">VET Pleno (kcal)</label>
            <input
              type="number"
              step="0.01"
              placeholder="VET pleno"
              value={form.vet_pleno || ''}
              onChange={(e) => setForm({ ...form, vet_pleno: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">PT (g)</label>
            <input
              type="number"
              step="0.01"
              placeholder="PT atingida"
              value={form.pt || ''}
              onChange={(e) => setForm({ ...form, pt: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">PT g/dia</label>
            <input
              type="number"
              step="0.01"
              placeholder="PT plena"
              value={form.pt_g_dia || ''}
              onChange={(e) => setForm({ ...form, pt_g_dia: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-300 block mb-2">TH (g)</label>
          <input
            type="number"
            step="0.01"
            placeholder="Carboidrato total"
            value={form.th || ''}
            onChange={(e) => setForm({ ...form, th: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-300 block mb-2">Observações (opcional)</label>
          <textarea
            placeholder="Digite aqui..."
            value={form.observacao || ''}
            onChange={(e) => setForm({ ...form, observacao: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-500 text-sm resize-none h-24 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* CÁLCULOS AUTOMÁTICOS */}
        {(form.vet || form.vet_pleno || form.pt || form.pt_g_dia) && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
              📊 Cálculos Automáticos
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {form.vet && form.vet_pleno && form.vet_pleno > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">VET AT:</p>
                  <p className="text-lg font-bold text-white">
                    {((form.vet / form.vet_pleno) * 100).toFixed(1)}%
                  </p>
                </div>
              )}
              
              {form.pt && form.pt_g_dia && form.pt_g_dia > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">PT AT:</p>
                  <p className="text-lg font-bold text-white">
                    {((form.pt / form.pt_g_dia) * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

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

// ============================================================================
// MODAL: FIM MEDICAÇÃO
// ============================================================================
interface FimMedicacaoModalProps {
  medicacao: Medicacao;
  onClose: () => void;
  onSave: () => void;
}

const FimMedicacaoModal: React.FC<FimMedicacaoModalProps> = ({ medicacao, onClose, onSave }) => {
  const [dataFim, setDataFim] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      if (!dataFim) {
        alert('Por favor, selecione uma data');
        return;
      }

      setSaving(true);
      await backgroundService.updateMedicacao(medicacao.id, {
        ...medicacao,
        data_fim: dataFim
      });
      onSave();
    } catch (error) {
      console.error('Erro ao registrar fim da medicação:', error);
      alert('Erro ao registrar fim da medicação');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">
          Registrar Fim da Medicação
        </h3>
        
        <div className="bg-blue-900/20 border border-blue-800 p-3 rounded">
          <p className="text-sm font-semibold text-white">{medicacao.nome_medicacao}</p>
          <p className="text-xs text-gray-300 mt-1">
            {medicacao.dosagem_valor} {medicacao.unidade_medida}
          </p>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Data de Fim</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
          />
        </div>

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
            {saving ? 'Salvando...' : 'Registrar Fim'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL: FIM DISPOSITIVO
// ============================================================================
interface FimDispositivoModalProps {
  dispositivo: Dispositivo;
  onClose: () => void;
  onSave: () => void;
}

const FimDispositivoModal: React.FC<FimDispositivoModalProps> = ({ dispositivo, onClose, onSave }) => {
  const [dataRemocao, setDataRemocao] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      if (!dataRemocao) {
        alert('Por favor, selecione uma data');
        return;
      }

      setSaving(true);
      await backgroundService.updateDispositivo(dispositivo.id, {
        ...dispositivo,
        data_remocao: dataRemocao
      });
      onSave();
    } catch (error) {
      console.error('Erro ao registrar fim do dispositivo:', error);
      alert('Erro ao registrar fim do dispositivo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">
          Registrar Retirada do Dispositivo
        </h3>
        
        <div className="bg-green-900/20 border border-green-800 p-3 rounded">
          <p className="text-sm font-semibold text-white">{dispositivo.tipo_dispositivo}</p>
          <p className="text-xs text-gray-300 mt-1">Localização: {dispositivo.localizacao}</p>
          <p className="text-xs text-gray-300 mt-1">
            Inserido em: {new Date(dispositivo.data_insercao + 'T00:00:00').toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Data de Retirada</label>
          <input
            type="date"
            value={dataRemocao}
            onChange={(e) => setDataRemocao(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
          />
        </div>

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
            {saving ? 'Salvando...' : 'Registrar Retirada'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundEditor;


