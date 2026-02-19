import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Patient } from '../types';
import { patientsService } from '../services/patientsService';

interface PatientsCacheContextType {
    patients: Patient[];
    loading: boolean;
    error: string | null;
    loadPatients: (forceRefresh?: boolean) => Promise<void>;
}

const PatientsCacheContext = createContext<PatientsCacheContextType | undefined>(undefined);

export const PatientsCacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFetch, setLastFetch] = useState<number>(0);
    
    const CACHE_TIME = 5 * 60 * 1000; // 5 minutos

    const loadPatients = useCallback(async (forceRefresh = false) => {
        const now = Date.now();
        
        // Se tem dados em cache e não é refresh forçado, usa cache
        if (!forceRefresh && patients.length > 0 && (now - lastFetch) < CACHE_TIME) {
            console.log('📦 [PatientsCache] Usando cache (idade:', now - lastFetch, 'ms)');
            setLoading(false);
            return;
        }

        try {
            console.log('🔄 [PatientsCache] Carregando pacientes...');
            setLoading(true);
            setError(null);
            
            const startTime = Date.now();
            const data = await patientsService.listPatients();
            const duration = Date.now() - startTime;
            
            console.log('✅ [PatientsCache] Carregado em:', duration + 'ms');
            setPatients(data);
            setLastFetch(now);
        } catch (err) {
            console.error('❌ [PatientsCache] Erro:', err);
            setError(`Erro ao carregar pacientes: ${err instanceof Error ? err.message : 'Desconhecido'}`);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    }, [patients.length, lastFetch]);

    return (
        <PatientsCacheContext.Provider value={{ patients, loading, error, loadPatients }}>
            {children}
        </PatientsCacheContext.Provider>
    );
};

export const usePatientsCache = () => {
    const context = useContext(PatientsCacheContext);
    if (context === undefined) {
        throw new Error('usePatientsCache deve ser usado dentro de PatientsCacheProvider');
    }
    return context;
};
