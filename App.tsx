
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
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Verificar autenticação ao montar o componente
    useEffect(() => {
        const checkAuth = async () => {
            try {
                console.log('🔄 Iniciando verificação de autenticação...');
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) {
                    console.warn('⚠️ Erro ao obter sessão (pode ser falta de configuração Supabase):', sessionError);
                    setCurrentPage('login');
                    setLoadingAuth(false);
                    return;
                }
                
                console.log('✅ Sessão encontrada:', session ? 'Sim' : 'Não');
                
                if (session?.user) {
                    try {
                        // Buscar dados do usuário na tabela users
                        const { data: userData, error } = await supabase
                            .from('users')
                            .select('id, name, email')
                            .eq('id', session.user.id)
                            .single();

                        if (userData) {
                            console.log('✅ Usuário autenticado:', userData);
                            setAuthUser({
                                id: userData.id,
                                email: userData.email || session.user.email || '',
                                name: userData.name || 'Usuário'
                            });
                            setCurrentPage('patients');
                        } else {
                            console.log('❌ Usuário não encontrado na tabela users, usando dados do auth');
                            setAuthUser({
                                id: session.user.id,
                                email: session.user.email || '',
                                name: session.user.user_metadata?.name || 'Usuário'
                            });
                            setCurrentPage('patients');
                        }
                    } catch (err) {
                        console.error('❌ Erro ao buscar dados do usuário:', err);
                        setAuthUser({
                            id: session.user.id,
                            email: session.user.email || '',
                            name: 'Usuário'
                        });
                        setCurrentPage('patients');
                    }
                } else {
                    console.log('ℹ️ Nenhuma sessão ativa');
                    setCurrentPage('login');
                }
            } catch (error) {
                console.error('❌ Erro geral ao verificar autenticação:', error);
                setCurrentPage('login');
            } finally {
                setLoadingAuth(false);
            }
        };

        checkAuth();

        // Escutar mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔔 Auth state changed:', event);
            
            if (session?.user) {
                try {
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
                    } else {
                        setAuthUser({
                            id: session.user.id,
                            email: session.user.email || '',
                            name: session.user.user_metadata?.name || 'Usuário'
                        });
                        setCurrentPage('patients');
                    }
                } catch (err) {
                    console.error('Erro ao buscar dados do usuário:', err);
                    setAuthUser({
                        id: session.user.id,
                        email: session.user.email || '',
                        name: 'Usuário'
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
            console.log('🔐 Tentando fazer login com:', email);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error('❌ Erro ao fazer login:', error);
                alert('Erro ao fazer login: ' + error.message);
                return;
            }

            console.log('✅ Login bem-sucedido! User:', data.user?.email);
            
            if (data.user) {
                // Buscar dados do usuário na tabela users
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('id, name, email')
                    .eq('id', data.user.id)
                    .single();

                if (userData) {
                    console.log('✅ Dados do usuário encontrados na tabela users');
                    setAuthUser({
                        id: userData.id,
                        email: userData.email || data.user.email || '',
                        name: userData.name || 'Usuário'
                    });
                } else {
                    // Se não encontrar na tabela users, usar dados do auth
                    console.log('⚠️ Usuário não encontrado na tabela users, usando dados do auth');
                    setAuthUser({
                        id: data.user.id,
                        email: data.user.email || '',
                        name: data.user.user_metadata?.name || 'Usuário'
                    });
                }
                console.log('📍 Navegando para página de pacientes...');
                setCurrentPage('patients');
            }
        } catch (error) {
            console.error('❌ Erro ao fazer login:', error);
            alert('Erro ao fazer login: ' + (error as any).message);
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
            <div className="dark relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root">
                {loadingAuth ? (
                    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#101C22' }}>
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4 mx-auto"></div>
                            <p className="text-gray-400 dark:text-gray-400">Carregando aplicativo...</p>
                            {loadingTimeout && (
                                <p className="text-yellow-400 text-sm mt-2">Se continuar nesta tela, verifique:</p>
                            )}
                            {loadingTimeout && (
                                <ul className="text-gray-400 text-xs mt-2 space-y-1">
                                    <li>✓ Variáveis de ambiente na Vercel</li>
                                    <li>✓ Console (F12) para mais informações</li>
                                    <li>✓ Conexão com internet</li>
                                </ul>
                            )}
                        </div>
                    </div>
                ) : (
                    renderPage()
                )}
            </div>
        </ViewportProvider>
    );
};

export default App;
