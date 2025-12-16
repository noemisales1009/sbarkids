
import React from 'react';
import ToggleSwitch from './ToggleSwitch';

const NotificationsSection: React.FC = () => {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                <p className="text-slate-800 dark:text-slate-200 text-base font-medium">Novas Mensagens</p>
                <ToggleSwitch defaultChecked={true} />
            </div>
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                <p className="text-slate-800 dark:text-slate-200 text-base font-medium">Alertas Críticos</p>
                <ToggleSwitch defaultChecked={true} />
            </div>
        </div>
    );
};

export default NotificationsSection;
