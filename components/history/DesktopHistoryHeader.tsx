import React from 'react';
import SearchBar from '../patients/SearchBar';

interface DesktopHistoryHeaderProps {
    patientName: string;
}

const DesktopHistoryHeader: React.FC<DesktopHistoryHeaderProps> = ({ patientName }) => {
    return (
        <header className="pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Histórico - {patientName}</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Veja e filtre os relatórios SBAR anteriores do paciente.</p>
                </div>
            </div>
             <div className="mt-6 max-w-md">
                <SearchBar placeholder="Filtrar relatórios por data ou palavra-chave" />
            </div>
        </header>
    );
};
export default DesktopHistoryHeader;