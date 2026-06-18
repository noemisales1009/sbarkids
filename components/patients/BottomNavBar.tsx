
import React from 'react';
import { supabase } from '../../lib/supabase';
import { CurrentPage } from '../../types';

interface BottomNavBarProps {
    onNavigate: (page: CurrentPage) => void;
    currentPage: CurrentPage;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ onNavigate, currentPage }) => {
    const handleGoToRound = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token && session?.refresh_token) {
            const url = `https://roundkids.com.br/?access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
            window.open(url, '_blank');
        } else {
            window.open('https://roundkids.com.br', '_blank');
        }
    };

    const navItems: { page: CurrentPage; icon: string; label: string }[] = [
        { page: 'patients', icon: 'groups', label: 'Pacientes' },
        { page: 'reports', icon: 'summarize', label: 'Relatórios' },
        { page: 'settings', icon: 'settings', label: 'Ajustes' },
    ];
    
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm sm:hidden print:hidden">
            <nav className="flex h-16 sm:h-20 items-center justify-around px-2">
                {navItems.map(item => (
                    <button
                        key={item.page}
                        onClick={() => onNavigate(item.page)}
                        className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 w-1/4 h-full transition-colors`}
                        style={{
                            color: currentPage === item.page ? '#14A4EC' : '#71717a'
                        }}
                        aria-current={currentPage === item.page ? 'page' : undefined}
                    >
                        <span className={`material-symbols-outlined text-lg sm:text-2xl ${currentPage === item.page ? 'fill-1' : ''}`}>{item.icon}</span>
                        <span className={`text-xs ${currentPage === item.page ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                    </button>
                ))}
                <button
                    onClick={handleGoToRound}
                    className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 w-1/4 h-full transition-colors"
                    style={{ color: '#71717a' }}
                >
                    <span className="material-symbols-outlined text-lg sm:text-2xl">arrow_back</span>
                    <span className="text-xs font-medium">Round</span>
                </button>
            </nav>
        </footer>
    );
};

export default BottomNavBar;
