
import React from 'react';

interface SbarHeaderProps {
    onBack: () => void;
}

const SbarHeader: React.FC<SbarHeaderProps> = ({ onBack }) => {
    return (
        <header className="sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
            <button 
                className="text-gray-800 dark:text-white flex size-12 shrink-0 items-center justify-center -ml-3"
                onClick={onBack}
                aria-label="Voltar"
            >
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Novo Relatório SBAR</h1>
            <div className="size-12 shrink-0"></div>
        </header>
    );
};

export default SbarHeader;
