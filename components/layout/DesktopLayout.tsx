
import React from 'react';
import { CurrentPage } from '../../types';
import MainSidebar from './MainSidebar';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';

interface DesktopLayoutProps {
    children: React.ReactNode;
    currentPage: CurrentPage;
    onNavigate: (page: CurrentPage) => void;
    onLogout: () => void;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children, currentPage, onNavigate, onLogout }) => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useUser();

    return (
        <div className="hidden sm:flex w-full min-h-screen print:block print:bg-white">
            <MainSidebar currentPage={currentPage} onNavigate={onNavigate} />
            <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark print:bg-white">
                {/* Top Bar */}
                <div className="flex items-center justify-end gap-4 px-6 py-3 border-b border-slate-200 dark:border-slate-800 print:hidden">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label={`Mudar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
                    >
                        <span className="material-symbols-outlined text-xl text-slate-600 dark:text-slate-300">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>

                    <div className="flex items-center gap-3">
                        <div
                            className="h-9 w-9 rounded-full bg-cover bg-center bg-no-repeat border-2 border-slate-200 dark:border-slate-700"
                            style={{
                                backgroundImage: user?.foto
                                    ? `url("${user.foto}")`
                                    : 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Ccircle cx=%2212%22 cy=%228%22 r=%224%22 fill=%22%23ccc%22/%3E%3Cpath d=%22M12 14c-6 0-8 3-8 3v3h16v-3s-2-3-8-3z%22 fill=%22%23ccc%22/%3E%3C/svg%3E")'
                            }}
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {user?.name || 'Usuário'}
                        </span>
                    </div>

                    <button
                        onClick={onLogout}
                        className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        aria-label="Sair"
                    >
                        <span className="material-symbols-outlined text-xl text-slate-500 dark:text-slate-400 hover:text-red-500">
                            logout
                        </span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                   <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 print:max-w-full print:px-0">
                    {children}
                   </div>
                </div>
            </div>
        </div>
    );
};

export default DesktopLayout;
