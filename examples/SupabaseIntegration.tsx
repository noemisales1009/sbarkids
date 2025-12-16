/**
 * EXEMPLO: Como integrar Supabase na sua aplicação
 * 
 * Siga este padrão para migrar os dados mock para o Supabase
 */

import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { patientsService } from '../services/patientsService';
import { logError } from '../utils/errorHandler';

interface PatientListExampleProps {
  onSelectPatient: (patient: Patient) => void;
  onSelectHistory: (patient: Patient) => void;
  searchTerm?: string;
}

/**
 * ✅ ANTES: Usando dados mock (estado local)
 */
export const PatientListMock: React.FC<PatientListExampleProps> = ({
  onSelectPatient,
  onSelectHistory,
  searchTerm = ''
}) => {
  const mockPatients: Patient[] = [
    {
      id: '1',
      name: 'Paciente 1',
      bed_number: 102,
      status: 'estavel',
      dob: '2021-10-05',
      mother_name: 'Mãe 1',
      diagnosis: 'Pneumonia',
      dt_internacao: '2025-12-01',
      peso: 12.5,
      comorbidade: null,
      destino: null,
    }
  ];

  return (
    <div>
      {mockPatients.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
};

/**
 * ✅ DEPOIS: Usando dados do Supabase
 */
export const PatientListSupabase: React.FC<PatientListExampleProps> = ({
  onSelectPatient,
  onSelectHistory,
  searchTerm = ''
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        let data: Patient[];

        if (searchTerm) {
          // Buscar com filtro
          data = await patientsService.searchPatients(searchTerm);
        } else {
          // Listar todos
          data = await patientsService.listPatients();
        }

        setPatients(data);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar pacientes';
        logError(err, 'PatientList.loadPatients');
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [searchTerm]);

  if (loading) return <div className="p-4">Carregando pacientes...</div>;
  if (error) return <div className="p-4 text-red-500">Erro: {error}</div>;
  if (patients.length === 0) {
    return <div className="p-4">Nenhum paciente encontrado</div>;
  }

  return (
    <div className="space-y-3">
      {patients.map(patient => (
        <div key={patient.id} className="flex justify-between p-4 bg-white rounded border">
          <div>
            <h3 className="font-bold">{patient.name}</h3>
            <p>{patient.status}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onSelectPatient(patient)}>SBAR</button>
            <button onClick={() => onSelectHistory(patient)}>Histórico</button>
          </div>
        </div>
      ))}
    </div>
  );
};
