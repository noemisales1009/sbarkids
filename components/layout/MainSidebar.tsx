
import React from 'react';
import { CurrentPage } from '../../App';

interface MainSidebarProps {
    currentPage: CurrentPage;
    onNavigate: (page: CurrentPage) => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({ currentPage, onNavigate }) => {
    const navItems: { page: CurrentPage; icon: string; label: string }[] = [
        { page: 'patients', icon: 'groups', label: 'Pacientes' },
        { page: 'reports', icon: 'summarize', label: 'Relatórios' },
        { page: 'team', icon: 'badge', label: 'Equipe' },
        { page: 'settings', icon: 'settings', label: 'Ajustes' },
    ];

    return (
        <aside className="hidden sm:flex flex-col w-64 bg-white dark:bg-slate-900/70 border-r border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-3 pb-8 pt-4 px-2">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                    <span className="material-symbols-outlined text-4xl text-primary">
                        waving_hand
                    </span>
                </div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">SBAR Juju</h1>
            </div>
            <nav className="flex flex-col gap-2">
                {navItems.map(item => (
                    <button
                        key={item.page}
                        onClick={() => onNavigate(item.page)}
                        className={`flex items-center gap-3 p-3 rounded-lg text-base font-semibold transition-colors ${
                            currentPage === item.page
                                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        aria-current={currentPage === item.page ? 'page' : undefined}
                    >
                        <span className={`material-symbols-outlined ${currentPage === item.page ? 'fill-1' : ''}`}>{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default MainSidebar;
