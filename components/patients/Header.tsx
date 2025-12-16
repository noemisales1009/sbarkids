
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
            <div className="flex items-center p-3 sm:p-4 pb-2 justify-between">
                <div className="flex size-10 sm:size-12 shrink-0 items-center">
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-7 sm:size-8" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB0ZpipYbxO_r7vGie_I6-oy1QTrkv8pqvSYuaUA-7xNzolWfawHBembBKlRo3OihdHq8k-rNvDRulXGM86cIlDoK9qIdSBegHACjzFTh5yec0LJitcMAW3EtgWEAWlxZSH65tw2URQ0s5W5fuSeCbl9qQOa0UOhwUHqK0R2G5RhOlrgqXvimz9PQvlJMsvdS73Nk7MeuFMBYgz4SKMrbPdkD63iPC0zho1Yj_9YDwALKFpxSiXjIm7CERHwxTKl5pjL8RKR6NF-M7R")' }} aria-label="User profile picture"></div>
                </div>
                <h1 className="text-base sm:text-lg lg:text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center text-zinc-900 dark:text-white px-2">Meus Pacientes</h1>
                <div className="flex items-center justify-end">
                    <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 sm:h-12 bg-transparent text-zinc-600 dark:text-zinc-300 gap-2 text-sm sm:text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0" aria-label="Notifications">
                        <span className="material-symbols-outlined text-lg sm:text-2xl">notifications</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
