
import React from 'react';

interface HistoryHeaderProps {
    patientName: string;
    onBack: () => void;
}

const HistoryHeader: React.FC<HistoryHeaderProps> = ({ patientName, onBack }) => {
    return (
        <header className="sm:hidden sticky top-0 z-10 flex items-center justify-between bg-background-light/80 p-2 sm:p-3 pb-2 backdrop-blur-sm dark:bg-background-dark/80">
            <button className="flex h-10 sm:h-12 w-10 sm:w-12 shrink-0 items-center justify-start -ml-2 sm:-ml-3" onClick={onBack} aria-label="Voltar">
                <span className="material-symbols-outlined text-gray-700 dark:text-gray-300" style={{ fontSize: 'clamp(20px, 5vw, 28px)' }}>arrow_back_ios_new</span>
            </button>
            <h1 className="flex-1 text-center text-sm sm:text-lg font-bold leading-tight tracking-tight text-gray-900 dark:text-white px-2 truncate">
                Histórico - {patientName.split(' ')[0]}
            </h1>
            <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-end">
                <button className="flex h-10 sm:h-12 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-transparent text-gray-700 dark:text-gray-300" aria-label="Buscar no histórico">
                    <span className="material-symbols-outlined" style={{ fontSize: 'clamp(18px, 5vw, 24px)' }}>search</span>
                </button>
            </div>
        </header>
    );
};

export default HistoryHeader;