import React from 'react';

interface DesktopHistoryHeaderProps {
    patientName: string;
    onBack?: () => void;
}

const DesktopHistoryHeader: React.FC<DesktopHistoryHeaderProps> = ({ patientName, onBack }) => {
    return (
        <header className="pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span className="text-sm font-medium">Voltar</span>
                    </button>
                )}
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Histórico - {patientName}</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Veja e filtre os relatórios SBAR anteriores do paciente.</p>
                </div>
            </div>
        </header>
    );
};
export default DesktopHistoryHeader;