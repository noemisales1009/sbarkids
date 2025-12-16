
import React from 'react';
import { CurrentPage } from '../../App';

interface HistoryBottomNavBarProps {
    onNavigate: (page: CurrentPage) => void;
}

const HistoryBottomNavBar: React.FC<HistoryBottomNavBarProps> = ({ onNavigate }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200/50 bg-background-light/80 backdrop-blur-sm dark:border-gray-700/50 dark:bg-background-dark/80">
            <div className="mx-auto flex h-20 max-w-md items-center justify-around px-4">
                <button className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined">home</span>
                    <span className="text-xs">Início</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-primary" onClick={() => onNavigate('patients')} aria-current="page">
                    <span className="material-symbols-outlined fill-1">groups</span>
                    <span className="text-xs font-bold">Pacientes</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400" onClick={() => onNavigate('settings')}>
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-xs">Ajustes</span>
                </button>
            </div>
        </nav>
    );
};

export default HistoryBottomNavBar;
