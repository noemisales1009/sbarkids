/**
 * Componente simplificado para A - Assessment (Avaliação)
 * Um único campo de texto por turno (Manhã, Tarde, Noite)
 */

import React, { useState, useEffect } from 'react';
import { clinicalRoundsSimpleService } from '../../services/clinicalRoundsSimpleService';

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
  const [selectedShift, setSelectedShift] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estado dos campos
  const [assessmentMorning, setAssessmentMorning] = useState('');
  const [assessmentAfternoon, setAssessmentAfternoon] = useState('');
  const [assessmentNight, setAssessmentNight] = useState('');

  // Info de salvamento
  const [morningInfo, setMorningInfo] = useState({ savedBy: '', savedAt: '' });
  const [afternoonInfo, setAfternoonInfo] = useState({ savedBy: '', savedAt: '' });
  const [nightInfo, setNightInfo] = useState({ savedBy: '', savedAt: '' });

  // Carregar dados ao montar
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await clinicalRoundsSimpleService.getByRound(patientId, roundId);
        if (data) {
          setAssessmentMorning(data.assessment_morning || '');
          setAssessmentAfternoon(data.assessment_afternoon || '');
          setAssessmentNight(data.assessment_night || '');

          setMorningInfo({
            savedBy: data.assessment_morning_saved_by_name || '',
            savedAt: data.assessment_morning_saved_at ? new Date(data.assessment_morning_saved_at).toLocaleString('pt-BR') : ''
          });

          setAfternoonInfo({
            savedBy: data.assessment_afternoon_saved_by_name || '',
            savedAt: data.assessment_afternoon_saved_at ? new Date(data.assessment_afternoon_saved_at).toLocaleString('pt-BR') : ''
          });

          setNightInfo({
            savedBy: data.assessment_night_saved_by_name || '',
            savedAt: data.assessment_night_saved_at ? new Date(data.assessment_night_saved_at).toLocaleString('pt-BR') : ''
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId, roundId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const content = selectedShift === 'morning' ? assessmentMorning : selectedShift === 'afternoon' ? assessmentAfternoon : assessmentNight;
      
      const success = await clinicalRoundsSimpleService.saveAssessment(
        patientId,
        roundId,
        selectedShift,
        content,
        currentUserName
      );

      if (success) {
        const shiftLabel = { morning: 'Manhã', afternoon: 'Tarde', night: 'Noite' }[selectedShift];
        onSaved?.(`✅ Avaliação da ${shiftLabel} salva com sucesso!`);

        // Atualizar info de salvamento
        if (selectedShift === 'morning') {
          setMorningInfo({ savedBy: currentUserName, savedAt: new Date().toLocaleString('pt-BR') });
        } else if (selectedShift === 'afternoon') {
          setAfternoonInfo({ savedBy: currentUserName, savedAt: new Date().toLocaleString('pt-BR') });
        } else {
          setNightInfo({ savedBy: currentUserName, savedAt: new Date().toLocaleString('pt-BR') });
        }
      } else {
        onSaved?.('❌ Erro ao salvar avaliação');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      onSaved?.('❌ Erro ao salvar avaliação');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-400">Carregando...</div>;
  }

  const shiftData = {
    morning: {
      label: '🌅 Manhã',
      content: assessmentMorning,
      setContent: setAssessmentMorning,
      info: morningInfo
    },
    afternoon: {
      label: '☀️ Tarde',
      content: assessmentAfternoon,
      setContent: setAssessmentAfternoon,
      info: afternoonInfo
    },
    night: {
      label: '🌙 Noite',
      content: assessmentNight,
      setContent: setAssessmentNight,
      info: nightInfo
    }
  };

  const currentData = shiftData[selectedShift];

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
      <h3 className="text-lg font-bold text-white mb-4">A - Assessment (Avaliação)</h3>

      {/* Tabs de Turnos */}
      <div className="flex gap-2 mb-4 border-b border-gray-700 flex-wrap">
        {Object.entries(shiftData).map(([shift, { label }]) => {
          const isCurrentShift = selectedShift === shift;
          return (
            <button
              key={shift}
              onClick={() => setSelectedShift(shift as 'morning' | 'afternoon' | 'night')}
              className={`px-4 py-2 font-semibold transition ${
                isCurrentShift
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Textarea único */}
      <div className="mb-4">
        <textarea
          value={currentData.content}
          onChange={(e) => currentData.setContent(e.target.value)}
          placeholder="Digite a avaliação do paciente..."
          className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-800 whitespace-pre-wrap"
          rows={8}
          wrap="soft"
        />
      </div>

      {/* Info de salvamento */}
      {currentData.info.savedBy && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700 text-sm text-gray-300">
          <p>💾 Salvo por: <span className="text-blue-400 font-medium">{currentData.info.savedBy}</span></p>
          <p>🕐 Em: <span className="text-blue-400 font-medium">{currentData.info.savedAt}</span></p>
        </div>
      )}

      {/* Botão Salvar */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition"
      >
        {saving ? '⏳ Salvando...' : '💾 Salvar Avaliação'}
      </button>
    </div>
  );
};

export default AssessmentSimple;
