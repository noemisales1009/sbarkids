
import React from 'react';

interface LogoutButtonProps {
    onLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
    return (
        <section className="mt-8">
            <button 
                className="flex items-center gap-4 bg-red-500/10 dark:bg-red-500/20 p-4 min-h-14 justify-center rounded-lg w-full"
                onClick={onLogout}
            >
                <div className="text-red-600 dark:text-red-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">logout</span>
                </div>
                <p className="text-red-600 dark:text-red-400 text-base font-bold leading-normal">Sair</p>
            </button>
        </section>
    );
};

export default LogoutButton;
