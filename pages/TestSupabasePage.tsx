/**
 * Página de teste da conexão com Supabase
 * Carrega a lista de pacientes do banco de dados
 */

import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { supabase } from '../lib/supabase';

export const TestSupabasePage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🔍 Iniciando teste de conexão com Supabase...');

        // Testa conexão simples
        const { data: testData, error: testError } = await supabase
          .from('patients')
          .select('id, name, bed_number', { count: 'exact' })
          .limit(5);

        console.log('Resposta da query:', { testData, testError });

        if (testError) {
          console.error('❌ Erro na query:', testError);
          setConnectionStatus('error');
          setError(`Erro ao conectar: ${testError.message}`);
          setDebugInfo({ error: testError });
          setLoading(false);
          return;
        }

        console.log('✅ Conexão OK!');
        setConnectionStatus('connected');

        // Carrega todos os pacientes
        const { data: allPatients, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .order('name', { ascending: true });

        console.log('Pacientes carregados:', allPatients?.length, 'Erro:', patientsError);

        if (patientsError) {
          throw patientsError;
        }

        setPatients((allPatients as Patient[]) || []);
        setError(null);
      } catch (err) {
        console.error('❌ Erro durante teste:', err);
        setConnectionStatus('error');
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setDebugInfo({ error: err });
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Conectando ao Supabase...</p>
          <p className="text-xs text-gray-400 mt-2">Verifique o console do navegador (F12)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Teste Supabase</h1>

      {/* Status da Conexão */}
      <div className={`p-4 rounded-lg mb-6 ${
        connectionStatus === 'connected' 
          ? 'bg-green-100 border-2 border-green-500' 
          : 'bg-red-100 border-2 border-red-500'
      }`}>
        <p className={`font-semibold text-lg ${
          connectionStatus === 'connected' ? 'text-green-700' : 'text-red-700'
        }`}>
          {connectionStatus === 'connected' 
            ? '✅ Conectado ao Supabase com sucesso!' 
            : '❌ Erro ao conectar'}
        </p>
        {error && <p className="text-sm mt-2 text-gray-700 font-mono">{error}</p>}
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <h3 className="font-semibold mb-2">🐛 Debug Info:</h3>
          <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded border">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      {/* Lista de Pacientes */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Pacientes Carregados: <span className="text-blue-600">{patients.length}</span>
        </h2>

        {patients.length === 0 ? (
          <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg">
            <p className="text-yellow-800 font-semibold">⚠️ Nenhum paciente encontrado</p>
            <p className="text-sm text-yellow-700 mt-2">
              Verifique se a tabela "patients" existe no Supabase e tem dados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-200 sticky top-0">
                <tr>
                  <th className="border border-gray-300 p-2 text-left">Nome</th>
                  <th className="border border-gray-300 p-2 text-left">Leito</th>
                  <th className="border border-gray-300 p-2 text-left">Status</th>
                  <th className="border border-gray-300 p-2 text-left">Data Nasc.</th>
                  <th className="border border-gray-300 p-2 text-left">Diagnóstico</th>
                  <th className="border border-gray-300 p-2 text-left">Mãe</th>
                  <th className="border border-gray-300 p-2 text-left">D.I.</th>
                </tr>
              </thead>
              <tbody className="max-h-96 overflow-y-auto">
                {patients.map(patient => (
                  <tr key={patient.id} className="hover:bg-gray-50 border-b">
                    <td className="border border-gray-300 p-2 font-semibold">{patient.name}</td>
                    <td className="border border-gray-300 p-2">{patient.bed_number}</td>
                    <td className="border border-gray-300 p-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        patient.status === 'estavel' 
                          ? 'bg-green-100 text-green-800'
                          : patient.status === 'instavel'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-2 text-xs">{patient.dob}</td>
                    <td className="border border-gray-300 p-2 text-xs">{patient.diagnosis || '-'}</td>
                    <td className="border border-gray-300 p-2 text-xs">{patient.mother_name || '-'}</td>
                    <td className="border border-gray-300 p-2 text-xs">{patient.dt_internacao || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Informações da Configuração */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-300">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informações da Configuração</h3>
        <ul className="text-sm text-blue-800 space-y-1 font-mono">
          <li>✓ VITE_SUPABASE_URL: https://ouybwkjapejgpuuujwgy.supabase.co...</li>
          <li>✓ VITE_SUPABASE_ANON_KEY: Configurada</li>
          <li>✓ Tabela: patients</li>
          <li>✓ Total de pacientes: {patients.length}</li>
        </ul>
      </div>
    </div>
  );
};
