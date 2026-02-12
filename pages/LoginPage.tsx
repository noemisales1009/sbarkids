
import React, { useState } from 'react';
import { EmailField } from '../components/EmailField';
import { PasswordField } from '../components/PasswordField';
import { supabase } from '../lib/supabase';

const LoginPage: React.FC = () => {
    const [emailOrId, setEmailOrId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Debug: verificar se variáveis de ambiente estão carregadas
    React.useEffect(() => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        console.log('🔍 Debug Supabase Config:');
        console.log('- URL configurada:', supabaseUrl ? '✅' : '❌');
        console.log('- Key configurada:', supabaseKey ? '✅' : '❌');
        
        if (!supabaseUrl || !supabaseKey) {
            setError('Erro de configuração: Variáveis de ambiente não carregadas. Recarregue a página (F5).');
        }
    }, []);

    const handleLogin = async () => {
        if (loading) return;
        if (!emailOrId || !password) {
            setError('Por favor, preencha email e senha');
            return;
        }
        
        setError('');
        setLoading(true);
        
        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: emailOrId,
                password: password
            });

            if (signInError) {
                // Traduzir mensagens de erro comuns
                let errorMessage = signInError.message;
                
                if (errorMessage.includes('Invalid login credentials')) {
                    errorMessage = 'Email ou senha incorretos';
                } else if (errorMessage.includes('Invalid API key') || errorMessage.includes('API key')) {
                    errorMessage = 'Erro de configuração do servidor. Contate o administrador.';
                } else if (errorMessage.includes('Email not confirmed')) {
                    errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
                }
                
                setError(errorMessage);
                setLoading(false);
                return;
            }

            if (data.session) {
                console.log('✅ Login bem-sucedido via Supabase');
                // A navegação é feita automaticamente pelo onAuthStateChange do App
                // Não precisa chamar onLoginSuccess aqui pois causaria duplicação
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login');
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) {
            handleLogin();
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
            <div className="flex w-full max-w-sm flex-col items-center gap-6">
                {/* Logo Section */}
                <div className="flex flex-col items-center gap-3 pb-4">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                        <span className="material-symbols-outlined text-5xl text-blue-600 dark:text-blue-400">
                            waving_hand
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SBAR KIDS</h1>
                </div>

                {/* Headline */}
                <h2 className="text-gray-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight text-center">Acesse sua conta</h2>

                {/* Form */}
                <div className="flex w-full flex-col items-stretch gap-4" onKeyPress={handleKeyPress}>
                    <EmailField
                        value={emailOrId}
                        onChange={(e) => setEmailOrId(e.target.value)}
                    />
                    <PasswordField
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        showPassword={showPassword}
                        toggleVisibility={() => setShowPassword(!showPassword)}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex w-full flex-col items-stretch gap-4 pt-4">
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <button 
                        className="flex h-14 w-full items-center justify-center rounded-lg px-6 text-base font-bold text-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background-dark disabled:opacity-60 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
                        onClick={handleLogin}
                        disabled={loading || !emailOrId || !password}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Entrando...</span>
                            </div>
                        ) : 'Entrar'}
                    </button>
                </div>

                {/* Restricted Access Notice */}
                <div className="mt-8 pt-6 border-t border-slate-700 text-center">
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-normal leading-normal">
                        Acesso restrito a profissionais autorizados
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
