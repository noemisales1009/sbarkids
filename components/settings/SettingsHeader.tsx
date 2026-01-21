
import React from 'react';
import { useUser } from '../../contexts/UserContext';

const SettingsHeader: React.FC = () => {
    const { user } = useUser();
    const userPhoto = user?.foto || '';

    return (
        <header className="sm:hidden flex items-center bg-background-light dark:bg-background-dark p-3 sm:p-4 pb-2 justify-between sticky top-0 z-10">
            <div className="flex size-10 sm:size-12 shrink-0 items-center"></div>
            <h1 className="text-slate-900 dark:text-white text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Configurações</h1>
            <div className="flex size-10 sm:size-12 shrink-0 items-center">
                <div 
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border border-slate-300 dark:border-slate-600" 
                    style={{ 
                        backgroundImage: userPhoto ? `url("${userPhoto}")` : 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Ccircle cx=%2212%22 cy=%228%22 r=%224%22 fill=%22%23ccc%22/%3E%3Cpath d=%22M12 14c-6 0-8 3-8 3v3h16v-3s-2-3-8-3z%22 fill=%22%23ccc%22/%3E%3C/svg%3E")'
                    }}
                    aria-label="Foto de perfil"
                ></div>
            </div>
        </header>
    );
};

export default SettingsHeader;