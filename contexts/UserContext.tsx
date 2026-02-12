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
    const [lastFetch, setLastFetch] = useState<number>(0);
    const [currentAuthId, setCurrentAuthId] = useState<string | null>(null);
    
    // Cache de 5 minutos
    const CACHE_TIME = 300000;

    const refetchUser = useCallback(async (forceRefresh: boolean = false) => {
        const now = Date.now();
        
        console.log('🔍 refetchUser chamado', { forceRefresh, cached: !forceRefresh && user && (now - lastFetch) < CACHE_TIME });
        
        // Se forceRefresh está true, sempre recarrega (ignora cache)
        // Caso contrário, verifica se tem cache válido
        if (!forceRefresh && user && (now - lastFetch) < CACHE_TIME) {
            console.log('📦 Usando dados em cache');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Aguardar Supabase recuperar a sessão do storage
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
            
            console.log('🔐 Auth Check:', { authUserId: authUser?.id, authUserEmail: authUser?.email, authError: authError?.message });
            
            if (authError) {
                // Silenciar erros de refresh token inválido - não descapacita o fluxo de login
                if (!authError.message.includes('Refresh Token')) {
                    console.error('❌ Erro ao obter usuário autenticado:', authError);
                }
                setUser(null);
                setCurrentAuthId(null);
                setLoading(false);
                return;
            }
            
            if (!authUser) {
                console.log('ℹ️ Nenhum usuário autenticado');
                setUser(null);
                setCurrentAuthId(null);
                setLoading(false);
                return;
            }

            // Tentar buscar usuário na tabela users
            console.log('🔎 Buscando usuário na tabela users com ID:', authUser.id);
            const { data, error: fetchError } = await supabase
                .from('users')
                .select('id, name, email, role, sector, access_level, foto')
                .eq('id', authUser.id)
                .single();

            console.log('📊 Resultado da busca:', { data, error: fetchError?.message });

            // Se encontrou, usar dados da tabela
            if (data && !fetchError) {
                console.log('✅ Usuário encontrado na tabela users:', data.name);
                setUser({
                    id: data.id,
                    name: data.name || authUser.email?.split('@')[0] || 'Usuário',
                    email: data.email || authUser.email || '',
                    role: data.role || 'Médico(a)',
                    sector: data.sector,
                    access_level: data.access_level,
                    foto: data.foto
                });
                setCurrentAuthId(authUser.id);
                setLastFetch(Date.now());
                setLoading(false);
                return;
            }

            // Se NÃO encontrou na tabela users, fazer logout (acesso não autorizado)
            console.warn('⚠️ Usuário não cadastrado na tabela users. Fazendo logout...');
            await supabase.auth.signOut();
            setUser(null);
            setCurrentAuthId(null);
            setError('Acesso não autorizado. Usuário não cadastrado.');
            setLoading(false);
        } catch (err: any) {
            console.error('Erro ao carregar usuário:', err);
            setError(err.message);
            setLoading(false);
        }
    }, [user, lastFetch]);

    useEffect(() => {
        console.log('🚀 UserContext iniciando - currentAuthId:', currentAuthId);
        
        // Carregar usuário na primeira vez
        refetchUser(true);

        // Escutar mudanças de autenticação em tempo real
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔄 onAuthStateChange:', { event, userId: session?.user?.id, email: session?.user?.email, currentAuthId });
            
            if (session?.user) {
                // SEMPRE recarregar dados quando há uma sessão ativa
                // Comparar de forma segura
                if (session.user.id !== currentAuthId) {
                    console.log('📝 Novo usuário detectado ou primeira autenticação. Foi:', currentAuthId, 'Agora:', session.user.id);
                    setCurrentAuthId(session.user.id);
                    setLastFetch(0);
                }
                // Sempre chamar refetchUser quando tem sessão
                console.log('📥 Chamando refetchUser para carregar dados do usuário...');
                await refetchUser(true);
            } else {
                // Logout
                console.log('🚪 Logout detectado');
                setUser(null);
                setCurrentAuthId(null);
                setLastFetch(0);
            }
        });

        return () => {
            console.log('🧹 Limpando subscription do UserContext');
            subscription?.unsubscribe();
        };
    }, [currentAuthId]); // Adicionar currentAuthId como dependência

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
