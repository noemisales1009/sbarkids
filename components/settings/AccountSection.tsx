
import React from 'react';

const AccountSection: React.FC = () => {
    return (
        <div className="flex flex-col gap-2">
            <button className="flex items-center gap-2 justify-start rounded-lg bg-slate-100 dark:bg-slate-700 p-3 text-slate-800 dark:text-slate-200 text-base font-medium hover:bg-slate-200 dark:hover:bg-slate-600">
                <span className="material-symbols-outlined text-xl">vpn_key</span>
                Alterar Senha
            </button>
        </div>
    );
};

export default AccountSection;
