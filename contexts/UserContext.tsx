import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
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

    const refetchUser = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const { data: { user: authUser } } = await supabase.auth.getUser();
            
            if (!authUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            const { data, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (fetchError) {
                setError('Erro ao carregar dados do usuário');
                setLoading(false);
                return;
            }

            if (data) {
                setUser({
                    id: data.id,
                    name: data.name || '',
                    email: data.email || authUser.email || '',
                    role: data.role || '',
                    foto: data.foto
                });
            }
            setLoading(false);
        } catch (err: any) {
            console.error('Erro ao carregar usuário:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
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
