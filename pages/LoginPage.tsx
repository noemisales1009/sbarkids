
import React, { useState } from 'react';
import { EmailField } from '../components/EmailField';
import { PasswordField } from '../components/PasswordField';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
    onLoginSuccess: (email: string, password: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [emailOrId, setEmailOrId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        setLoading(true);
        
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: emailOrId,
                password: password
            });

            if (signInError) {
                setError(signInError.message);
            } else {
                onLoginSuccess(emailOrId, password);
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
            <div className="flex w-full max-w-sm flex-col items-center gap-6">
                {/* Logo Section */}
                <div className="flex flex-col items-center gap-3 pb-4">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20">
                        <span className="material-symbols-outlined text-5xl text-primary">
                            waving_hand
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">SBAR Juju</h1>
                </div>

                {/* Headline */}
                <h2 className="text-slate-200 dark:text-white tracking-tight text-[32px] font-bold leading-tight text-center">Acesse sua conta</h2>

                {/* Form */}
                <div className="flex w-full flex-col items-stretch gap-4">
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
                        className="flex h-14 w-full items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background-dark"
                        onClick={handleLogin}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                    <button className="flex h-14 w-full items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-6 text-base font-bold text-primary transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background-dark">
                        Criar Nova Conta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
