
import React from 'react';
import { useUser } from '../../contexts/UserContext';

const DesktopSettingsHeader: React.FC = () => {
    const { user } = useUser();
    const userPhoto = user?.foto || '';

    return (
        <header className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Configurações</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Gerencie suas preferências de perfil, conta e notificações.</p>
            </div>
            <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-11 border-2 border-white dark:border-slate-800 shadow-sm" 
                style={{ 
                    backgroundImage: userPhoto ? `url("${userPhoto}")` : 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Ccircle cx=%2212%22 cy=%228%22 r=%224%22 fill=%22%23ccc%22/%3E%3Cpath d=%22M12 14c-6 0-8 3-8 3v3h16v-3s-2-3-8-3z%22 fill=%22%23ccc%22/%3E%3C/svg%3E")'
                }}
                aria-label="Foto de perfil do usuário"
            ></div>
        </header>
    );
};
export default DesktopSettingsHeader;