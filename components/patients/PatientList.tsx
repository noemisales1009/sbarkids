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
                // Verificar se tem dados em cache no sessionStorage (válido por 5 minutos)
                const cacheKey = 'patientsList';
                const cacheTimestampKey = 'patientsListTimestamp';
                const cached = sessionStorage.getItem(cacheKey);
                const timestamp = sessionStorage.getItem(cacheTimestampKey);
                const now = Date.now();
                const cacheExpiry = 5 * 60 * 1000; // 5 minutos

                if (cached && timestamp && (now - parseInt(timestamp)) < cacheExpiry) {
                    console.log('📦 [PatientList] Usando dados do sessionStorage (cache válido)');
                    const parsedData = JSON.parse(cached);
                    // Filtro extra: garantir que não há pacientes arquivados
                    const filtered = parsedData.filter((p: any) => !p.archived_at);
                    setPatients(filtered);
                    setLoading(false);
                    return;
                }

                // Cache expirou ou não existe, carregar do Supabase
                console.log('🔄 [PatientList] Carregando pacientes do Supabase (cache expirado ou inexistente)...');
                setLoading(true);
                const data = await patientsService.listPatients();
                setPatients(data);
                
                // Salvar no sessionStorage com timestamp
                sessionStorage.setItem(cacheKey, JSON.stringify(data));
                sessionStorage.setItem(cacheTimestampKey, now.toString());
                console.log('✅ [PatientList] Pacientes salvos em cache com timestamp');
            } catch (err) {
                console.error('❌ [PatientList] Erro:', err);
                setError(`Erro ao carregar pacientes: ${err instanceof Error ? err.message : 'Desconhecido'}`);
                setPatients([]);
                // Limpar cache em caso de erro
                sessionStorage.removeItem('patientsList');
                sessionStorage.removeItem('patientsListTimestamp');
            } finally {
                setLoading(false);
            }
        };

        loadPatients();
    }, []);

    const filteredPatients = useMemo(() => {
        // Primeiro, filtrar pacientes arquivados
        const activePatients = patients.filter(patient => !patient.archived_at);
        
        if (!searchTerm) return activePatients;
        const term = searchTerm.toLowerCase();
        return activePatients.filter(patient => {
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