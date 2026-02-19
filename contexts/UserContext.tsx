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

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const refetchUser = useCallback(async (forceRefresh: boolean = false) => {
        try {
            setLoading(true);
            setError(null);
            
            // Obter sessão
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session?.user) {
                console.log('ℹ️ Nenhuma sessão');
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
                console.warn('⚠️ Usuário não cadastrado. Fazendo logout...');
                await supabase.auth.signOut();
                setUser(null);
                setError('Acesso não autorizado.');
            }
        } catch (err: any) {
            console.error('Erro ao carregar usuário:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Carregar na montagem
        refetchUser(true);

        // Ouvir mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                refetchUser(true);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription?.unsubscribe();
    }, [refetchUser]);

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
