
import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import PatientsPage from './pages/PatientsPage';
import SbarReportPage from './pages/SbarReportPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import { Patient, HistoryItemData, CurrentPage } from './types';
import ReportDetailPage from './pages/ReportDetailPage';
import { ViewportProvider } from './hooks/useViewport';
import { TestSupabasePage } from './pages/TestSupabasePage';
import { DebugFloatingButton } from './components/DebugFloatingButton';
import { supabase } from './lib/supabase';

interface AuthUser {
    id: string;
    email: string;
    name: string;
}

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<CurrentPage>('login');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedReport, setSelectedReport] = useState<HistoryItemData | null>(null);
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // Verificar autenticação ao montar o componente
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                console.log('Sessão encontrada:', session);
                
                if (session?.user) {
                    // Buscar dados do usuário na tabela users
                    const { data: userData, error } = await supabase
                        .from('users')
                        .select('id, name, email')
                        .eq('id', session.user.id)
                        .single();

                    if (userData) {
                        console.log('Usuário autenticado:', userData);
                        setAuthUser({
                            id: userData.id,
                            email: userData.email || session.user.email || '',
                            name: userData.name || 'Usuário'
                        });
                        setCurrentPage('patients');
                    }
                } else {
                    console.log('Nenhuma sessão ativa');
                    setCurrentPage('login');
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                setCurrentPage('login');
            } finally {
                setLoadingAuth(false);
            }
        };

        checkAuth();

        // Escutar mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (session?.user) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('id, name, email')
                    .eq('id', session.user.id)
                    .single();

                if (userData) {
                    setAuthUser({
                        id: userData.id,
                        email: userData.email || session.user.email || '',
                        name: userData.name || 'Usuário'
                    });
                    setCurrentPage('patients');
                }
            } else {
                setAuthUser(null);
                setCurrentPage('login');
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const handleLogin = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error('Erro ao fazer login:', error);
                alert('Erro ao fazer login: ' + error.message);
                return;
            }

            if (data.user) {
                // Buscar dados do usuário na tabela users
                const { data: userData } = await supabase
                    .from('users')
                    .select('id, name, email')
                    .eq('id', data.user.id)
                    .single();

                if (userData) {
                    setAuthUser({
                        id: userData.id,
                        email: userData.email || data.user.email || '',
                        name: userData.name || 'Usuário'
                    });
                    setCurrentPage('patients');
                }
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            alert('Erro ao fazer login');
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            setAuthUser(null);
            setCurrentPage('login');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    const handleNavigate = (page: CurrentPage) => {
        if (page === 'login') {
            setSelectedPatient(null);
            setSelectedReport(null);
            handleLogout();
        }
        if (page !== 'reportDetail') {
            setSelectedReport(null);
        }
        setCurrentPage(page);
    };

    const handleSelectPatientForSbar = (patient: Patient) => {
        setSelectedPatient(patient);
        handleNavigate('sbar');
    };
    
    const handleSelectPatientForHistory = (patient: Patient) => {
        setSelectedPatient(patient);
        handleNavigate('history');
    };
    
    const handleSelectReport = (report: HistoryItemData) => {
        setSelectedReport(report);
        handleNavigate('reportDetail');
    };

    // Handler para selecionar paciente e relatório ao mesmo tempo (vindo da lista geral)
    const handleSelectReportContext = (patient: Patient, report: HistoryItemData) => {
        setSelectedPatient(patient);
        setSelectedReport(report);
        handleNavigate('reportDetail');
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'login':
                return <LoginPage onLoginSuccess={handleLogin} />;
            case 'patients':
                return <PatientsPage onSelectPatient={handleSelectPatientForSbar} onSelectHistory={handleSelectPatientForHistory} onNavigate={handleNavigate} currentPage={currentPage} />;
            case 'sbar':
                return selectedPatient ? <SbarReportPage patient={selectedPatient} onBack={() => handleNavigate('patients')} /> : <PatientsPage onSelectPatient={handleSelectPatientForSbar} onSelectHistory={handleSelectPatientForHistory} onNavigate={handleNavigate} currentPage={currentPage} />;
            case 'history':
                return selectedPatient ? <HistoryPage patient={selectedPatient} onBack={() => handleNavigate('patients')} onNavigate={handleNavigate} currentPage={currentPage} onSelectReport={handleSelectReport} /> : <PatientsPage onSelectPatient={handleSelectPatientForSbar} onSelectHistory={handleSelectPatientForHistory} onNavigate={handleNavigate} currentPage={currentPage} />;
            case 'settings':
                return <SettingsPage onNavigate={handleNavigate} currentPage={currentPage} />;
            case 'reports':
                return <ReportsPage onNavigate={handleNavigate} currentPage={currentPage} onSelectReportContext={handleSelectReportContext} />;
            case 'reportDetail':
                return selectedPatient && selectedReport ? <ReportDetailPage patient={selectedPatient} report={selectedReport} onBack={() => handleNavigate('history')} /> : <HistoryPage patient={selectedPatient!} onBack={() => handleNavigate('patients')} onNavigate={handleNavigate} currentPage={'history'} onSelectReport={handleSelectReport} />;
            case 'test':
                return <TestSupabasePage />;
            default:
                // Redirect unhandled pages to patients for this example
                return <PatientsPage onSelectPatient={handleSelectPatientForSbar} onSelectHistory={handleSelectPatientForHistory} onNavigate={handleNavigate} currentPage={currentPage} />;
        }
    }

    return (
        <ViewportProvider>
            <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root">
                {renderPage()}
            </div>
            <DebugFloatingButton onTestClick={() => handleNavigate('test')} />
        </ViewportProvider>
    );
};

export default App;
