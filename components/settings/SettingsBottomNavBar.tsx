
import React from 'react';
import { CurrentPage } from '../../types';

interface SettingsBottomNavBarProps {
    onNavigate: (page: CurrentPage) => void;
}

const SettingsBottomNavBar: React.FC<SettingsBottomNavBarProps> = ({ onNavigate }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-20 mx-auto w-full max-w-md border-t border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm sm:hidden">
            <div className="flex h-20 justify-around px-2">
                <button 
                    onClick={() => onNavigate('patients')}
                    className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-2xl">home</span>
                    <span className="text-xs font-medium">Início</span>
                </button>
                <button 
                    onClick={() => onNavigate('patients')}
                    className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-2xl">groups</span>
                    <span className="text-xs font-medium">Pacientes</span>
                </button>
                <button 
                    onClick={() => onNavigate('history')}
                    className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-2xl">forum</span>
                    <span className="text-xs font-medium">Mensagens</span>
                </button>
                <button 
                    onClick={() => onNavigate('settings')}
                    className="flex flex-1 flex-col items-center justify-center gap-1 text-primary dark:text-primary" aria-current="page">
                    <span className="material-symbols-outlined text-2xl fill-1">settings</span>
                    <span className="text-xs font-bold">Ajustes</span>
                </button>
            </div>
        </nav>
    );
};

export default SettingsBottomNavBar;
