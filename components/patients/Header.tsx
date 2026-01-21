
import React from 'react';
import { useUser } from '../../contexts/UserContext';

const Header: React.FC = () => {
    const { user } = useUser();
    const userPhoto = user?.foto || '';
    const userName = user?.name || '';
    return (
        <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
            <div className="flex items-center p-3 sm:p-4 pb-2 justify-between">
                <div className="flex size-10 sm:size-12 shrink-0 items-center" title={userName}>
                    <div 
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-7 sm:size-8" 
                        style={{ 
                            backgroundImage: userPhoto ? `url("${userPhoto}")` : 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Ccircle cx=%2212%22 cy=%228%22 r=%224%22 fill=%22%23ccc%22/%3E%3Cpath d=%22M12 14c-6 0-8 3-8 3v3h16v-3s-2-3-8-3z%22 fill=%22%23ccc%22/%3E%3C/svg%3E")'
                        }} 
                        aria-label={`Foto de perfil de ${userName}`}
                    ></div>
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
