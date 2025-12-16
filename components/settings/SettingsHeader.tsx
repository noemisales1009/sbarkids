
import React from 'react';

const SettingsHeader: React.FC = () => {
    return (
        <header className="sm:hidden flex items-center bg-background-light dark:bg-background-dark p-3 sm:p-4 pb-2 justify-between sticky top-0 z-10">
            <div className="flex size-10 sm:size-12 shrink-0 items-center"></div>
            <h1 className="text-slate-900 dark:text-white text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Configurações</h1>
            <div className="flex size-10 sm:size-12 shrink-0 items-center"></div>
        </header>
    );
};

export default SettingsHeader;