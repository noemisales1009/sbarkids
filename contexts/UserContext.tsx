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
                // Limpar sessão corrompida
                await supabase.auth.signOut();
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

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = não encontrado
                console.error('Erro ao carregar dados do usuário:', fetchError);
                setError('Erro ao carregar dados do usuário');
                setLoading(false);
                return;
            }

            // Se não encontrou o usuário, criar um novo registro
            if (!data) {
                console.log('Criando novo registro de usuário...');
                const newUser = {
                    id: authUser.id,
                    email: authUser.email || '',
                    name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
                    role: 'Médico(a)',
                    foto: authUser.user_metadata?.avatar_url || null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                const { data: insertedUser, error: insertError } = await supabase
                    .from('users')
                    .insert([newUser])
                    .select()
                    .single();

                if (insertError) {
                    console.error('Erro ao criar usuário:', insertError);
                    // Usar dados do auth mesmo sem conseguir inserir
                    setUser({
                        id: authUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role,
                        foto: newUser.foto
                    });
                } else {
                    setUser({
                        id: insertedUser.id,
                        name: insertedUser.name || '',
                        email: insertedUser.email || authUser.email || '',
                        role: insertedUser.role || '',
                        foto: insertedUser.foto
                    });
                }
            } else {
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
