import React, { useState, useEffect } from 'react';
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
                setLoading(true);
                const patientsList = await patientsService.listPatients();
                setPatients(patientsList);
                setError(null);
            } catch (err) {
                console.error('Erro ao carregar pacientes:', err);
                setError('Erro ao carregar pacientes. Tente novamente.');
                setPatients([]);
            } finally {
                setLoading(false);
            }
        };

        loadPatients();
    }, []);

    const filteredPatients = patients.filter(patient => {
        const term = searchTerm.toLowerCase();
        return (
            patient.name.toLowerCase().includes(term) || 
            patient.bed_number.toString().includes(term)
        );
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-zinc-600 dark:text-zinc-400">Carregando pacientes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 mt-4">
                <span className="material-symbols-outlined text-5xl text-red-500 mb-3">error</span>
                <h3 className="text-lg sm:text-xl font-semibold text-red-900 dark:text-red-300">{error}</h3>
            </div>
        );
    }

    if (filteredPatients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 mt-4">
                <span className="material-symbols-outlined text-5xl sm:text-6xl text-zinc-400 dark:text-zinc-500 mb-3 sm:mb-4">person_search</span>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-zinc-900 dark:text-white">Nenhum paciente encontrado</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base mt-1 sm:mt-2 max-w-sm">
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