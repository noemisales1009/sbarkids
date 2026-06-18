import React, { useState, useEffect, useMemo } from 'react';
import PatientCard from './PatientCard';
import CadastroManualModal from './CadastroManualModal';
import { Patient } from '../../types';
import { patientsService } from '../../services/patientsService';
import { PatientListSkeleton } from '../SkeletonLoader';
import { supabase } from '../../lib/supabase';
import { passagensService, Passagem } from '../../services/passagensService';

interface PatientListProps {
    onSelectPatient: (patient: Patient) => void;
    onSelectHistory: (patient: Patient) => void;
    searchTerm?: string;
}

const PatientList: React.FC<PatientListProps> = ({ onSelectPatient, onSelectHistory, searchTerm = '' }) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [precaucoesMap, setPrecaucoesMap] = useState<Record<string, string[]>>({});
    const [passagensMap, setPassagensMap] = useState<Record<string, Passagem>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCadastro, setShowCadastro] = useState(false);

    useEffect(() => {
        const loadPatients = async () => {
            try {
                setLoading(true);
                const data = await patientsService.listPatients();
                setPatients(data);

                const today = new Date().toISOString().split('T')[0];
                const { data: prec } = await supabase
                    .from('precautions_com_calculo')
                    .select('patient_id, tipo_precaucao, doenca_nome')
                    .is('archived_at', null)
                    .or(`data_fim_calculada.is.null,data_fim_calculada.gte.${today}`);

                if (prec) {
                    const map: Record<string, string[]> = {};
                    for (const p of prec) {
                        const nome = p.doenca_nome || p.tipo_precaucao;
                        if (!nome) continue;
                        if (!map[p.patient_id]) map[p.patient_id] = [];
                        if (!map[p.patient_id].includes(nome)) map[p.patient_id].push(nome);
                    }
                    setPrecaucoesMap(map);
                }

                // Buscar passagens de hoje e montar mapa patientId -> última passagem
                const passagens = await passagensService.getToday();
                const pMap: Record<string, Passagem> = {};
                for (const passagem of passagens) {
                    if (!Array.isArray(passagem.patient_ids)) continue;
                    for (const pid of passagem.patient_ids) {
                        if (!pMap[pid]) pMap[pid] = passagem; // primeira = mais recente (ordenado desc)
                    }
                }
                setPassagensMap(pMap);
            } catch (err) {
                setError(`Erro ao carregar pacientes: ${err instanceof Error ? err.message : 'Desconhecido'}`);
                setPatients([]);
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
            <div className="px-4 sm:px-6 py-4">
                <PatientListSkeleton count={4} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 mt-4">
                <span className="material-symbols-outlined text-5xl text-red-500 mb-3">error</span>
                <h3 className="text-lg sm:text-xl font-semibold text-red-900 dark:text-red-300 mb-2">{error}</h3>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Recarregar
                </button>
            </div>
        );
    }

    if (filteredPatients.length === 0) {
        return (
            <>
                <div className="flex flex-col items-center justify-center text-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 mt-4">
                    <span className="material-symbols-outlined text-5xl sm:text-6xl text-slate-400 dark:text-slate-500 mb-3 sm:mb-4">person_search</span>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 dark:text-white">Nenhum paciente encontrado</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1 sm:mt-2 max-w-sm">
                        {searchTerm
                            ? `Não encontramos resultados para "${searchTerm}".`
                            : 'Sua lista de pacientes está vazia. Cadastre um novo paciente para começar.'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setShowCadastro(true)}
                            className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition shadow-sm hover:shadow"
                        >
                            <span className="material-symbols-outlined text-base">person_add</span>
                            Cadastrar Paciente
                        </button>
                    )}
                </div>

                {showCadastro && (
                    <CadastroManualModal
                        onClose={() => setShowCadastro(false)}
                        onSuccess={(newPatient) => {
                            setPatients(prev => [...prev, newPatient].sort((a, b) => (a.bed_number || 0) - (b.bed_number || 0)));
                            setShowCadastro(false);
                        }}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <div className="space-y-3 sm:space-y-4 pt-2">
                {/* Botão cadastro manual */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowCadastro(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold transition shadow-sm hover:shadow"
                    >
                        <span className="material-symbols-outlined text-base">person_add</span>
                        Cadastrar Paciente
                    </button>
                </div>

                {filteredPatients.map((patient) => (
                    <PatientCard
                        key={patient.id}
                        patient={patient}
                        precaucoes={precaucoesMap[patient.id] || []}
                        ultimaPassagem={passagensMap[patient.id] || null}
                        onSelectPatient={onSelectPatient}
                        onSelectHistory={onSelectHistory}
                    />
                ))}
            </div>

            {showCadastro && (
                <CadastroManualModal
                    onClose={() => setShowCadastro(false)}
                    onSuccess={(newPatient) => {
                        setPatients(prev => [...prev, newPatient].sort((a, b) => (a.bed_number || 0) - (b.bed_number || 0)));
                        setShowCadastro(false);
                    }}
                />
            )}
        </>
    );
};

export default PatientList;