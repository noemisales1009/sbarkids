
import React from 'react';

interface ReportDetailHeaderProps {
    onBack: () => void;
    reportDate: string;
}

const ReportDetailHeader: React.FC<ReportDetailHeaderProps> = ({ onBack, reportDate }) => {
    return (
        <header className="sticky top-0 z-10 flex items-center bg-gray-900 backdrop-blur-sm p-4 pb-2 justify-between border-b border-gray-800 print:hidden">
            <button 
                className="text-white flex size-12 shrink-0 items-center justify-center -ml-3"
                onClick={onBack}
                aria-label="Voltar"
            >
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex flex-col items-center">
                <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Detalhes do Relatório</h1>
            </div>
            <div className="size-12 shrink-0"></div>
        </header>
    );
};

export default ReportDetailHeader;
