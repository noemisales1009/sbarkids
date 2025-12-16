
import React from 'react';

const DesktopHeader: React.FC = () => {
    return (
        <header className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Meus Pacientes</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Gerencie e acesse os registros de seus pacientes.</p>
            </div>
            <div className="flex items-center gap-4">
                <button className="flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-primary text-white text-base font-semibold hover:bg-primary/90 transition-colors">
                    <span className="material-symbols-outlined text-xl">add</span>
                    Adicionar Paciente
                </button>
                 <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 w-11 bg-transparent text-zinc-600 dark:text-zinc-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Notifications">
                    <span className="material-symbols-outlined text-2xl">notifications</span>
                </button>
                 <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-11 border-2 border-white dark:border-slate-800 shadow-sm" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB0ZpipYbxO_r7vGie_I6-oy1QTrkv8pqvSYuaUA-7xNzolWfawHBembBKlRo3OihdHq8k-rNvDRulXGM86cIlDoK9qIdSBegHACjzFTh5yec0LJitcMAW3EtgWEAWlxZSH65tw2URQ0s5W5fuSeCbl9qQOa0UOhwUHqK0R2G5RhOlrgqXvimz9PQvlJMsvdS73Nk7MeuFMBYgz4SKMrbPdkD63iPC0zho1Yj_9YDwALKFpxSiXjIm7CERHwxTKl5pjL8RKR6NF-M7R")' }} aria-label="User profile picture"></div>
            </div>
        </header>
    );
};
export default DesktopHeader;
