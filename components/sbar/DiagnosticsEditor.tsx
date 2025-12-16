/**
 * Componente para exibir diagnósticos do paciente
 * (Apenas leitura - dados vêm do Supabase)
 */

import React, { useState, useEffect } from 'react';
import { diagnosticsService, PatientDiagnostics, DiagnosticHistory } from '../../services/diagnosticsService';

interface DiagnosticsEditorProps {
  patientId: string;
}

const DiagnosticsEditor: React.FC<DiagnosticsEditorProps> = ({ patientId }) => {
  const [diagnostics, setDiagnostics] = useState<PatientDiagnostics>({
    principal: null,
    secundarios: []
  });
  const [loading, setLoading] = useState(true);

  // Carregar diagnósticos ao montar o componente
  useEffect(() => {
    const loadDiagnostics = async () => {
      try {
        setLoading(true);
        const data = await diagnosticsService.getPatientDiagnostics(patientId);
        setDiagnostics(data);
      } catch (error) {
        console.error('Erro ao carregar diagnósticos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDiagnostics();
  }, [patientId]);

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-600 dark:text-gray-400">
        Carregando diagnósticos...
      </div>
    );
  }

  // Se não houver diagnósticos
  if (!diagnostics.principal && diagnostics.secundarios.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        Nenhum diagnóstico registrado
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Diagnóstico Principal */}
      {diagnostics.principal && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Diagnóstico Principal</h4>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-gray-900 dark:text-white font-medium">{diagnostics.principal.opcao_label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Criado por: <span className="font-semibold">{diagnostics.principal.created_by_name}</span> em{' '}
              {new Date(diagnostics.principal.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      )}

      {/* Diagnósticos Secundários */}
      {diagnostics.secundarios.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Diagnósticos Secundários</h4>
          <div className="space-y-2">
            {diagnostics.secundarios.map((diagnostic) => (
              <div
                key={diagnostic.id}
                className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <p className="text-sm text-gray-900 dark:text-white font-medium">{diagnostic.opcao_label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Criado por: <span className="font-semibold">{diagnostic.created_by_name}</span> em{' '}
                  {new Date(diagnostic.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsEditor;
