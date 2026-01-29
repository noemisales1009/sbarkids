/**
 * Componente para cadastrar opções de diagnóstico
 */

import React, { useState, useEffect } from 'react';
import { diagnosticoPerguntasService, PerguntaDiagnostico, OpcaoDiagnostico } from '../../services/diagnosticoPerguntasService';

const DiagnosticoOpcoesAdmin: React.FC = () => {
  const [perguntas, setPerguntas] = useState<PerguntaDiagnostico[]>([]);
  const [selectedPergunta, setSelectedPergunta] = useState<number | null>(null);
  const [opcoes, setOpcoes] = useState<OpcaoDiagnostico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    codigo: '',
    label: '',
    has_input: false,
    input_placeholder: '',
    ordem: 1,
    parent_id: null as number | null
  });

  // Carregar perguntas
  useEffect(() => {
    const loadPerguntas = async () => {
      setLoading(true);
      const data = await diagnosticoPerguntasService.getPerguntas();
      setPerguntas(data);
      if (data.length > 0) {
        setSelectedPergunta(data[0].id);
      }
      setLoading(false);
    };

    loadPerguntas();
  }, []);

  // Carregar opções quando pergunta muda
  useEffect(() => {
    const loadOpcoes = async () => {
      if (selectedPergunta) {
        const data = await diagnosticoPerguntasService.getOpcoes(selectedPergunta);
        setOpcoes(data);
      }
    };

    loadOpcoes();
  }, [selectedPergunta]);

  const handleAddOpcao = async () => {
    if (!selectedPergunta || !formData.codigo.trim() || !formData.label.trim()) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const newOpcao: Omit<OpcaoDiagnostico, 'id'> = {
      pergunta_id: selectedPergunta,
      codigo: formData.codigo.trim(),
      label: formData.label.trim(),
      has_input: formData.has_input,
      input_placeholder: formData.input_placeholder || null,
      ordem: formData.ordem,
      parent_id: formData.parent_id || null
    };

    if (editingId) {
      // Atualizar
      const success = await diagnosticoPerguntasService.updateOpcao(editingId, newOpcao);
      if (success) {
        alert('Opção atualizada com sucesso!');
        setOpcoes(opcoes.map(o => o.id === editingId ? { ...o, ...newOpcao } : o));
        resetForm();
      } else {
        alert('Erro ao atualizar opção');
      }
    } else {
      // Criar nova
      const result = await diagnosticoPerguntasService.createOpcao(newOpcao);
      if (result) {
        alert('Opção criada com sucesso!');
        setOpcoes([...opcoes, result]);
        resetForm();
      } else {
        alert('Erro ao criar opção');
      }
    }
  };

  const handleEdit = (opcao: OpcaoDiagnostico) => {
    setFormData({
      codigo: opcao.codigo,
      label: opcao.label,
      has_input: opcao.has_input,
      input_placeholder: opcao.input_placeholder || '',
      ordem: opcao.ordem,
      parent_id: opcao.parent_id || null
    });
    setEditingId(opcao.id);
    setSelectedParentId(opcao.parent_id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja deletar esta opção?')) {
      return;
    }

    const success = await diagnosticoPerguntasService.deleteOpcao(id);
    if (success) {
      alert('Opção deletada com sucesso!');
      setOpcoes(opcoes.filter(o => o.id !== id));
    } else {
      alert('Erro ao deletar opção');
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      label: '',
      has_input: false,
      input_placeholder: '',
      ordem: 1,
      parent_id: null
    });
    setEditingId(null);
    setSelectedParentId(null);
    setShowForm(false);
  };

  const getChildOpcoes = (parentId: number | null) => {
    return opcoes.filter(o => o.parent_id === parentId).sort((a, b) => a.ordem - b.ordem);
  };

  const renderOpcaoRow = (opcao: OpcaoDiagnostico, isChild: boolean = false) => {
    const childOpcoes = getChildOpcoes(opcao.id);

    return (
      <div key={opcao.id}>
        <tr className={isChild ? 'bg-gray-800' : 'bg-gray-750 hover:bg-gray-700'}>
          <td className={`px-4 py-3 text-white ${isChild ? 'pl-12' : ''}`}>
            {isChild && <span className="text-gray-500 mr-2">├─</span>}
            {opcao.codigo}
          </td>
          <td className="px-4 py-3 text-white">{opcao.label}</td>
          <td className="px-4 py-3 text-center">
            {opcao.has_input ? (
              <span className="text-green-500">✓</span>
            ) : (
              <span className="text-gray-500">-</span>
            )}
          </td>
          <td className="px-4 py-3 text-gray-400 text-sm">{opcao.input_placeholder || '-'}</td>
          <td className="px-4 py-3 text-center text-gray-400">{opcao.ordem}</td>
          <td className="px-4 py-3 text-center flex gap-2 justify-center">
            <button
              onClick={() => handleEdit(opcao)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              ✎
            </button>
            <button
              onClick={() => handleDelete(opcao.id)}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
            >
              🗑
            </button>
          </td>
        </tr>
        {childOpcoes.length > 0 && childOpcoes.map(child => renderOpcaoRow(child, true))}
      </div>
    );
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-400">Carregando...</div>;
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">📋 Cadastro de Opções de Diagnóstico</h2>

      {/* Seleção de Pergunta */}
      <div className="mb-6">
        <label className="block text-white font-semibold mb-2">Selecione a Pergunta:</label>
        <select
          value={selectedPergunta || ''}
          onChange={(e) => setSelectedPergunta(Number(e.target.value))}
          className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Selecione --</option>
          {perguntas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.titulo}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Opções */}
      {selectedPergunta && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Opções Cadastradas:</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              {showForm ? '✕ Cancelar' : '+ Nova Opção'}
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 mb-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Código:</label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Ex: hfhf"
                    className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-1">Label (Rótulo):</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Ex: Abdome agudo clínico secundário a"
                    className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-1">Ordem de Exibição:</label>
                  <input
                    type="number"
                    value={formData.ordem}
                    onChange={(e) => setFormData({ ...formData, ordem: Number(e.target.value) })}
                    className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-1">Opção Pai (deixe em branco para opção raiz):</label>
                  <select
                    value={formData.parent_id || ''}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
                    className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  >
                    <option value="">-- Nenhuma (opção raiz) --</option>
                    {getChildOpcoes(null).map(opcao => (
                      <option key={opcao.id} value={opcao.id}>
                        {opcao.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.has_input}
                    onChange={(e) => setFormData({ ...formData, has_input: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-gray-300 text-sm">Tem campo de entrada customizado?</label>
                </div>

                {formData.has_input && (
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Placeholder do Input:</label>
                    <input
                      type="text"
                      value={formData.input_placeholder}
                      onChange={(e) => setFormData({ ...formData, input_placeholder: e.target.value })}
                      placeholder="Ex: Digite aqui..."
                      className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleAddOpcao}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                  >
                    {editingId ? '✓ Atualizar' : '+ Adicionar'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabela de Opções */}
          {opcoes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800 border border-gray-700">
                    <th className="px-4 py-2 text-left text-white text-sm">Código</th>
                    <th className="px-4 py-2 text-left text-white text-sm">Label</th>
                    <th className="px-4 py-2 text-center text-white text-sm">Input?</th>
                    <th className="px-4 py-2 text-left text-white text-sm">Placeholder</th>
                    <th className="px-4 py-2 text-center text-white text-sm">Ordem</th>
                    <th className="px-4 py-2 text-center text-white text-sm">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {getChildOpcoes(null).map((opcao) => renderOpcaoRow(opcao, false))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400 bg-gray-800 rounded-lg">
              Nenhuma opção cadastrada para esta pergunta
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiagnosticoOpcoesAdmin;
