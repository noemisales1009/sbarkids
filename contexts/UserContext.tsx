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
            
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
            
            if (authError) {
                console.error('Erro ao obter usuário autenticado:', authError);
                setUser(null);
                setLoading(false);
                return;
            }
            
            if (!authUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            // Tentar buscar usuário na tabela users
            const { data, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();

            // Se encontrou, usar dados da tabela
            if (data && !fetchError) {
                setUser({
                    id: data.id,
                    name: data.name || authUser.email?.split('@')[0] || 'Usuário',
                    email: data.email || authUser.email || '',
                    role: data.role || 'Médico(a)',
                    foto: data.foto
                });
                setLoading(false);
                return;
            }

            // Se não encontrou, usar dados do auth diretamente (não tenta criar)
            console.log('⚠️ Usuário não encontrado na tabela users, usando dados do auth');
            setUser({
                id: authUser.id,
                name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
                email: authUser.email || '',
                role: 'Médico(a)',
                foto: authUser.user_metadata?.avatar_url || null
            });
            
            setLoading(false);
        } catch (err: any) {
            console.error('Erro ao carregar usuário:', err);
            setError(err.message);
            setLoading(false);
        }
    };
                // Usuário encontrado, usar dados da tabela
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
