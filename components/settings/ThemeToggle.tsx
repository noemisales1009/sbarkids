import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">
                    {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                </span>
                <div>
                    <h4 className="text-slate-900 dark:text-white text-base font-medium">
                        Tema do Aplicativo
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
                    </p>
                </div>
            </div>
            
            <button
                onClick={toggleTheme}
                className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                style={{
                    backgroundColor: theme === 'dark' ? '#3b82f6' : '#cbd5e1'
                }}
                aria-label={`Mudar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
            >
                <span
                    className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform"
                    style={{
                        transform: theme === 'dark' ? 'translateX(32px)' : 'translateX(4px)'
                    }}
                />
            </button>
        </div>
    );
};

export default ThemeToggle;
