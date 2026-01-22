
import React from 'react';

const DesktopHeader: React.FC = () => {
    return (
        <header className="flex items-center justify-between pb-5 border-b border-slate-300 dark:border-slate-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Meus Pacientes</h1>
                <p className="text-slate-700 dark:text-slate-400 mt-1">Gerencie e acesse os registros de seus pacientes.</p>
            </div>
            <div className="flex items-center gap-4">
            </div>
        </header>
    );
};
export default DesktopHeader;
