import React, { useState, useEffect, useMemo } from 'react';
import PatientCard from './PatientCard';
import { Patient } from '../../types';
import { patientsService } from '../../services/patientsService';

interface PatientListProps {
    onSelectPatient: (patient: Patient) => void;
    onSelectHistory: (patient: Patient) => void;
    searchTerm?: string;
}

const PatientList: React.FC<PatientListProps> = ({ onSelectPatient, onSelectHistory, searchTerm = '' }) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPatients = async () => {
            try {
                // Verificar se tem dados em cache no sessionStorage
                const cached = sessionStorage.getItem('patientsList');
                if (cached) {
                    console.log('📦 [PatientList] Usando dados do sessionStorage');
                    setPatients(JSON.parse(cached));
                    setLoading(false);
                    return;
                }

                // Se não tem cache, carregar do Supabase
                console.log('🔄 [PatientList] Carregando pacientes do Supabase...');
                setLoading(true);
                const data = await patientsService.listPatients();
                setPatients(data);
                
                // Salvar no sessionStorage
                sessionStorage.setItem('patientsList', JSON.stringify(data));
                console.log('✅ [PatientList] Pacientes salvos em cache');
            } catch (err) {
                console.error('❌ [PatientList] Erro:', err);
                setError(`Erro ao carregar pacientes: ${err instanceof Error ? err.message : 'Desconhecido'}`);
                setPatients([]);
            } finally {
                setLoading(false);
            }
        };

        loadPatients();
    }, []);

    const filteredPatients = useMemo(() => {
        if (!searchTerm) return patients;
        const term = searchTerm.toLowerCase();
        return patients.filter(patient => {
            return (
                patient.name.toLowerCase().includes(term) || 
                patient.bed_number.toString().includes(term)
            );
        });
    }, [patients, searchTerm]);

    if (loading && patients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Carregando pacientes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 mt-4">
                <span className="material-symbols-outlined text-5xl text-red-500 mb-3">error</span>
                <h3 className="text-lg sm:text-xl font-semibold text-red-900 dark:text-red-300 mb-2">{error}</h3>
                <button 
                    onClick={() => {
                        sessionStorage.removeItem('patientsList');
                        window.location.reload();
                    }}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Recarregar
                </button>
            </div>
        );
    }

    if (filteredPatients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 mt-4">
                <span className="material-symbols-outlined text-5xl sm:text-6xl text-slate-400 dark:text-slate-500 mb-3 sm:mb-4">person_search</span>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 dark:text-white">Nenhum paciente encontrado</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1 sm:mt-2 max-w-sm">
                    {searchTerm 
                        ? `Não encontramos resultados para "${searchTerm}".`
                        : "Sua lista de pacientes está vazia. Adicione um novo paciente para começar."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-4 pt-2">
            {filteredPatients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} onSelectPatient={onSelectPatient} onSelectHistory={onSelectHistory} />
            ))}
        </div>
    );
};

export default PatientList;