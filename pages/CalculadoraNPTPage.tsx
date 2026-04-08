import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { CurrentPage } from '../types';
import BottomNavBar from '../components/patients/BottomNavBar';
import MainSidebar from '../components/layout/MainSidebar';
import NPTCalculatorApp from '../components/calculadora/NPTCalculatorApp';
import { supabase } from '../lib/supabase';

interface CalculadoraNPTPageProps {
  onNavigate: (page: CurrentPage) => void;
  currentPage: CurrentPage;
}

const CalculadoraNPTPage: React.FC<CalculadoraNPTPageProps> = ({ onNavigate, currentPage }) => {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('login');
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:flex w-full min-h-screen">
        <MainSidebar currentPage={currentPage} onNavigate={onNavigate} />
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark">
          {/* Top Bar */}
          <div className="flex items-center justify-end gap-4 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
            <button onClick={toggleTheme} className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-xl text-slate-600 dark:text-slate-300">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-cover bg-center border-2 border-slate-200 dark:border-slate-700"
                style={{ backgroundImage: user?.foto ? `url("${user.foto}")` : 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Ccircle cx=%2212%22 cy=%228%22 r=%224%22 fill=%22%23ccc%22/%3E%3Cpath d=%22M12 14c-6 0-8 3-8 3v3h16v-3s-2-3-8-3z%22 fill=%22%23ccc%22/%3E%3C/svg%3E")' }} />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.name}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <span className="material-symbols-outlined text-xl text-slate-500 dark:text-slate-400 hover:text-red-500">logout</span>
            </button>
          </div>
          {/* Conteúdo sem max-w - usa tela toda */}
          <div className="flex-1 overflow-y-auto">
            <NPTCalculatorApp userInfo={{ id: user.id, name: user.name }} />
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <NPTCalculatorApp userInfo={{ id: user.id, name: user.name }} />
        <BottomNavBar onNavigate={onNavigate} currentPage={currentPage} />
      </div>
    </>
  );
};

export default CalculadoraNPTPage;
