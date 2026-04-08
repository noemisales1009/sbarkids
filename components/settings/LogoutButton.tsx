
import React, { useState } from 'react';

interface LogoutButtonProps {
    onLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            onLogout();
        } catch (error) {
            setLoading(false);
        }
    };

    return (
        <section className="mt-8">
            <button 
                className="flex items-center gap-4 bg-red-500/10 dark:bg-red-500/20 p-4 min-h-14 justify-center rounded-lg w-full hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleLogout}
                disabled={loading}
            >
                <div className="text-red-600 dark:text-red-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">logout</span>
                </div>
                <p className="text-red-600 dark:text-red-400 text-base font-bold leading-normal">
                    {loading ? 'Saindo...' : 'Sair'}
                </p>
            </button>
        </section>
    );
};

export default LogoutButton;
