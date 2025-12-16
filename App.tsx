
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
import { supabase } from './lib/supabase';
import { patientsService } from './services/patientsService';

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
    const [refreshKey, setRefreshKey] = useState(0);

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
        // Recarregar lista de pacientes quando volta para essa página
        if (page === 'patients') {
            setRefreshKey(prev => prev + 1);
        }
        setCurrentPage(page);
    };

    const handleSelectPatientForSbar = async (patient: Patient) => {
        // Salvar/atualizar paciente no Supabase
        try {
            // Verificar se o paciente já existe
            const existingPatient = await patientsService.getPatient(patient.id);
            
            if (!existingPatient) {
                // Criar novo paciente
                await patientsService.createPatient({
                    name: patient.name,
                    bed_number: patient.bed_number || 0,
                    dob: patient.dob,
                    mother_name: patient.mother_name || null,
                    diagnosis: patient.diagnosis || null,
                    status: patient.status || 'estavel',
                    comorbidade: patient.comorbidade || null,
                    dt_internacao: patient.dt_internacao || null,
                    peso: patient.peso || null,
                    destino: patient.destino || null,
                });
            } else {
                // Atualizar paciente existente com dados mais recentes
                await patientsService.updatePatient(patient.id, {
                    name: patient.name,
                    bed_number: patient.bed_number || 0,
                    dob: patient.dob,
                    mother_name: patient.mother_name || null,
                    diagnosis: patient.diagnosis || null,
                    status: patient.status || 'estavel',
                    comorbidade: patient.comorbidade || null,
                    dt_internacao: patient.dt_internacao || null,
                    peso: patient.peso || null,
                    destino: patient.destino || null,
                });
            }
        } catch (error) {
            console.error('Erro ao salvar paciente:', error);
        }
        
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
                return <PatientsPage onSelectPatient={handleSelectPatientForSbar} onSelectHistory={handleSelectPatientForHistory} onNavigate={handleNavigate} currentPage={currentPage} refreshKey={refreshKey} />;
            case 'sbar':
                return selectedPatient ? <SbarReportPage patient={selectedPatient} onBack={() => handleNavigate('patients')} /> : <PatientsPage onSelectPatient={handleSelectPatientForSbar} onSelectHistory={handleSelectPatientForHistory} onNavigate={handleNavigate} currentPage={currentPage} refreshKey={refreshKey} />;
            case 'history':
                return selectedPatient ? <HistoryPage patient={selectedPatient} onBack={() => handleNavigate('patients')} onNavigate={handleNavigate} currentPage={currentPage} onSelectReport={handleSelectReport} /> : <PatientsPage onSelectPatient={handleSelectPatientForSbar} onSelectHistory={handleSelectPatientForHistory} onNavigate={handleNavigate} currentPage={currentPage} refreshKey={refreshKey} />;
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
                return <PatientsPage onSelectPatient={handleSelectPatientForSbar} onSelectHistory={handleSelectPatientForHistory} onNavigate={handleNavigate} currentPage={currentPage} refreshKey={refreshKey} />;
        }
    }

    return (
        <ViewportProvider>
            <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root">
                {renderPage()}
            </div>
        </ViewportProvider>
    );
};

export default App;
