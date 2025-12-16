
import React from 'react';

const DesktopHeader: React.FC = () => {
    return (
        <header className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Meus Pacientes</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Gerencie e acesse os registros de seus pacientes.</p>
            </div>
            <div className="flex items-center gap-4">
            </div>
        </header>
    );
};
export default DesktopHeader;
