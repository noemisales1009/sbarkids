
import React from 'react';
import { CurrentPage } from '../../types';

interface MainSidebarProps {
    currentPage: CurrentPage;
    onNavigate: (page: CurrentPage) => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({ currentPage, onNavigate }) => {
    const navItems: { page: CurrentPage; icon: string; label: string }[] = [
        { page: 'patients', icon: 'groups', label: 'Pacientes' },
        { page: 'reports', icon: 'summarize', label: 'Relatórios' },
        { page: 'settings', icon: 'settings', label: 'Ajustes' },
    ];

    return (
        <aside className="hidden sm:flex flex-col w-64 bg-background-light dark:bg-background-dark border-r border-slate-700 dark:border-slate-800 p-4 print:hidden">
            <div className="flex items-center gap-3 pb-8 pt-4 px-2">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                    <span className="material-symbols-outlined text-4xl text-primary">
                        waving_hand
                    </span>
                </div>
                <h1 className="text-xl font-bold" style={{ color: '#13A4EC' }}>SBAR KIDS</h1>
            </div>
            <nav className="flex flex-col gap-2">
                {navItems.map(item => (
                    <button
                        key={item.page}
                        onClick={() => onNavigate(item.page)}
                        className={`flex items-center gap-3 p-3 rounded-lg text-base font-semibold transition-colors ${
                            currentPage === item.page
                                ? 'text-white dark:text-white'
                                : 'text-slate-400 dark:text-slate-400 hover:text-white hover:bg-slate-700 dark:hover:bg-slate-700'
                        }`}
                        style={currentPage === item.page ? { backgroundColor: '#13A4EC', color: '#FFFFFF' } : {}}
                        aria-current={currentPage === item.page ? 'page' : undefined}
                    >
                        <span className={`material-symbols-outlined`} style={currentPage === item.page ? { color: '#FFFFFF' } : {}}>{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default MainSidebar;
