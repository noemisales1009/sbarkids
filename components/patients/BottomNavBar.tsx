
import React from 'react';
import { CurrentPage } from '../../types';

interface BottomNavBarProps {
    onNavigate: (page: CurrentPage) => void;
    currentPage: CurrentPage;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ onNavigate, currentPage }) => {
    const navItems: { page: CurrentPage; icon: string; label: string }[] = [
        { page: 'patients', icon: 'groups', label: 'Pacientes' },
        { page: 'reports', icon: 'summarize', label: 'Relatórios' },
        { page: 'team', icon: 'badge', label: 'Equipe' },
        { page: 'settings', icon: 'settings', label: 'Ajustes' },
    ];
    
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-zinc-200 dark:border-zinc-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm sm:hidden">
            <nav className="flex h-16 sm:h-20 items-center justify-around px-2">
                {navItems.map(item => (
                    <button 
                        key={item.page}
                        onClick={() => onNavigate(item.page)}
                        className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 w-1/4 h-full transition-colors ${
                            currentPage === item.page
                                ? 'text-primary'
                                : 'text-zinc-500 dark:text-zinc-400 hover:text-primary/80 dark:hover:text-primary/80'
                        }`}
                        aria-current={currentPage === item.page ? 'page' : undefined}
                    >
                        <span className={`material-symbols-outlined text-lg sm:text-2xl ${currentPage === item.page ? 'fill-1' : ''}`}>{item.icon}</span>
                        <span className={`text-xs ${currentPage === item.page ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                    </button>
                ))}
            </nav>
        </footer>
    );
};

export default BottomNavBar;
