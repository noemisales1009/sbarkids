
import React from 'react';

interface ReportDetailHeaderProps {
    onBack: () => void;
    reportDate: string;
}

const ReportDetailHeader: React.FC<ReportDetailHeaderProps> = ({ onBack, reportDate }) => {
    return (
        <header className="sticky top-0 z-10 flex items-center bg-slate-50/80 dark:bg-background-dark/80 backdrop-blur-sm p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
            <button 
                className="text-gray-800 dark:text-white flex size-12 shrink-0 items-center justify-center -ml-3"
                onClick={onBack}
                aria-label="Voltar"
            >
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex flex-col items-center">
                <h1 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Detalhes do Relatório</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{reportDate}</p>
            </div>
            <div className="size-12 shrink-0"></div>
        </header>
    );
};

export default ReportDetailHeader;
