
import React from 'react';
import { CurrentPage } from '../types';
import SettingsHeader from '../components/settings/SettingsHeader';
import Accordion from '../components/settings/Accordion';
import ProfileSection from '../components/settings/ProfileSection';
import LogoutButton from '../components/settings/LogoutButton';
import BottomNavBar from '../components/patients/BottomNavBar';
import DesktopLayout from '../components/layout/DesktopLayout';
import DesktopSettingsHeader from '../components/settings/DesktopSettingsHeader';
import ThemeToggle from '../components/settings/ThemeToggle';


interface SettingsPageProps {
    onNavigate: (page: CurrentPage) => void;
    currentPage: CurrentPage;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate, currentPage }) => {
    const settingsMainContent = (
        <>
            <section className="mt-4 mb-8 text-center sm:hidden">
                <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] mb-2">Bem-vindo(a) ao seu espaço!</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-normal leading-normal px-4">Guie-se por estas seções para configurar suas preferências no SBAR KIDS.</p>
            </section>
            <div className="flex flex-col gap-4">
                <Accordion title="Perfil" icon="person" defaultOpen>
                    <ProfileSection />
                </Accordion>
                <Accordion title="Aparência" icon="palette">
                    <ThemeToggle />
                </Accordion>
            </div>
            <LogoutButton onLogout={() => {
                console.log('🔐 Executando logout...');
                onNavigate('login');
            }} />
        </>
    );

    return (
        <>
            {/* Mobile Layout */}
            <div className="w-full overflow-x-hidden sm:hidden">
                <SettingsHeader />
                <main className="grow pb-24 px-4">
                    {settingsMainContent}
                </main>
                <BottomNavBar onNavigate={onNavigate} currentPage={currentPage} />
            </div>

            {/* Desktop Layout */}
            <DesktopLayout currentPage={currentPage} onNavigate={onNavigate}>
                 <DesktopSettingsHeader />
                 <main className="grow pt-8">
                    <div className="max-w-3xl">
                        {settingsMainContent}
                    </div>
                 </main>
            </DesktopLayout>
        </>
    );
};

export default SettingsPage;