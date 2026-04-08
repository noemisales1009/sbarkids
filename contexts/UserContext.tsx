import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    sector: string | null;
    access_level: string | null;
    foto: string | null;
}

interface UserContextType {
    user: UserData | null;
    loading: boolean;
    error: string | null;
    refetchUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const refetchUser = useCallback(async (forceRefresh: boolean = false) => {
        try {
            setLoading(true);
            setError(null);
            
            // Obter sessão (safe destructuring)
            const { data: sessionData } = await supabase.auth.getSession();
            const session = sessionData?.session;

            if (!session?.user) {
                setUser(null);
                setLoading(false);
                return;
            }
            
            // Buscar usuário na tabela
            const { data, error: fetchError } = await supabase
                .from('users')
                .select('id, name, email, role, sector, access_level, foto')
                .eq('id', session.user.id)
                .single();

            if (!fetchError && data) {
                setUser({
                    id: data.id,
                    name: data.name || session.user.email?.split('@')[0] || 'Usuário',
                    email: data.email || session.user.email || '',
                    role: data.role || 'Médico(a)',
                    sector: data.sector,
                    access_level: data.access_level,
                    foto: data.foto
                });
            } else {
                // Usuário não encontrado na tabela
                await supabase.auth.signOut();
                setUser(null);
                setError('Acesso não autorizado.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Carregar apenas na montagem - sem listener duplicado
        // O App.tsx já tem o listener de onAuthStateChange
        refetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, error, refetchUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser deve ser usado dentro de UserProvider');
    }
    return context;
};
