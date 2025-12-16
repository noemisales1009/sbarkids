
import React from 'react';

const DesktopSettingsHeader: React.FC = () => {
    return (
        <header className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Configurações</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Gerencie suas preferências de perfil, conta e notificações.</p>
            </div>
             <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-11 border-2 border-white dark:border-slate-800 shadow-sm" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB0ZpipYbxO_r7vGie_I6-oy1QTrkv8pqvSYuaUA-7xNzolWfawHBembBKlRo3OihdHq8k-rNvDRulXGM86cIlDoK9qIdSBegHACjzFTh5yec0LJitcMAW3EtgWEAWlxZSH65tw2URQ0s5W5fuSeCbl9qQOa0UOhwUHqK0R2G5RhOlrgqXvimz9PQvlJMsvdS73Nk7MeuFMBYgz4SKMrbPdkD63iPC0zho1Yj_9YDwALKFpxSiXjIm7CERHwxTKl5pjL8RKR6NF-M7R")' }} aria-label="User profile picture"></div>
        </header>
    );
};
export default DesktopSettingsHeader;