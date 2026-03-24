
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { initializeDailyClearanceService } from './services/dailyClearanceService';

interface AuthUser {
    id: string;
    email: string;
    name: string;
}

// Componente para gerenciar navegação
const AppContent: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedReport, setSelectedReport] = useState<HistoryItemData | null>(null);
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Estado mantido apenas em memória (sem sessionStorage) por segurança LGPD

    // Inicializar serviço de limpeza diária (00:05 São Paulo)
    useEffect(() => {
        console.log('📅 Inicializando serviço de limpeza diária...');
        const cleanup = initializeDailyClearanceService();
        return cleanup;
    }, []);

    // Dados de pacientes mantidos apenas em memória (LGPD compliance)

    // Verificar autenticação ao montar o componente
    useEffect(() => {
        let mounted = true;

        console.log('🔐 Inicializando autenticação...');

        // Escutar mudanças de autenticação - listener passivo
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!mounted) return;

            console.log('🔄 Auth event:', event, 'Session:', session?.user?.email);

            if (session?.user) {
                console.log('✅ Usuário autenticado:', session.user.email);
                setAuthUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.name || 'Usuário'
                });
                // Navegar automaticamente ao fazer login
                if (location.pathname === '/login') {
                    navigate('/patients', { replace: true });
                }
            } else {
                console.log('ℹ️ sem sessão ativa');
                setAuthUser(null);
                // Navegar para login se não autenticado
                if (location.pathname !== '/login') {
                    navigate('/login', { replace: true });
                }
            }
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, [navigate, location.pathname]);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            setAuthUser(null);
            setSelectedPatient(null);
            setSelectedReport(null);
            sessionStorage.clear();
            navigate('/login', { replace: true });
        } catch (error) {
            // Silenciar erro de logout
        }
    };

    const handleNavigate = (page: CurrentPage) => {
        if (page === 'login') {
            handleLogout();
            return;
        }
        
        // Mapear páginas para rotas
        const routeMap: Record<CurrentPage, string> = {
            login: '/login',
            patients: '/patients',
            sbar: '/sbar',
            history: '/history',
            settings: '/settings',
            reports: '/reports',
            reportDetail: '/report-detail',
            test: '/test'
        };
        
        const route = routeMap[page];
        if (route) {
            navigate(route);
        }
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

    // Componente de proteção de rotas
    const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
        if (!authUser) {
            return <Navigate to="/login" replace />;
        }
        
        return <>{children}</>;
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root">
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                
                <Route path="/patients" element={
                    <ProtectedRoute>
                        <PatientsPage 
                            onSelectPatient={handleSelectPatientForSbar} 
                            onSelectHistory={handleSelectPatientForHistory} 
                            onNavigate={handleNavigate} 
                            currentPage="patients" 
                            refreshKey={refreshKey} 
                        />
                    </ProtectedRoute>
                } />
                
                <Route path="/sbar" element={
                    <ProtectedRoute>
                        {selectedPatient ? (
                            <SbarReportPage 
                                patient={selectedPatient} 
                                onBack={() => {
                                    navigate('/patients');
                                }} 
                                onNavigate={handleNavigate} 
                                currentPage="sbar" 
                            />
                        ) : (
                            <Navigate to="/patients" replace />
                        )}
                    </ProtectedRoute>
                } />
                
                <Route path="/history" element={
                    <ProtectedRoute>
                        {selectedPatient ? (
                            <HistoryPage 
                                patient={selectedPatient} 
                                onBack={() => {
                                    // Voltar para a página SBAR do paciente
                                    navigate('/sbar');
                                }} 
                                onNavigate={handleNavigate} 
                                currentPage="history" 
                                onSelectReport={handleSelectReport} 
                            />
                        ) : (
                            <Navigate to="/patients" replace />
                        )}
                    </ProtectedRoute>
                } />
                
                <Route path="/settings" element={
                    <ProtectedRoute>
                        <SettingsPage onNavigate={handleNavigate} currentPage="settings" />
                    </ProtectedRoute>
                } />
                
                <Route path="/reports" element={
                    <ProtectedRoute>
                        <ReportsPage 
                            onNavigate={handleNavigate} 
                            currentPage="reports" 
                            onSelectReportContext={handleSelectReportContext} 
                        />
                    </ProtectedRoute>
                } />
                
                <Route path="/report-detail" element={
                    <ProtectedRoute>
                        {selectedPatient && selectedReport ? (
                            <ReportDetailPage 
                                patient={selectedPatient} 
                                report={selectedReport} 
                                onBack={() => {
                                    navigate('/history');
                                }} 
                                onNavigate={handleNavigate} 
                                currentPage="reportDetail" 
                            />
                        ) : (
                            <Navigate to="/patients" replace />
                        )}
                    </ProtectedRoute>
                } />
                
                {import.meta.env.DEV && (
                    <Route path="/test" element={
                        <ProtectedRoute>
                            <TestSupabasePage />
                        </ProtectedRoute>
                    } />
                )}

                <Route path="*" element={<Navigate to="/patients" replace />} />
            </Routes>
        </div>
    );
};

// Componente principal com BrowserRouter
const App: React.FC = () => {
    return (
        <ThemeProvider>
            <ViewportProvider>
                <UserProvider>
                    <BrowserRouter>
                        <AppContent />
                    </BrowserRouter>
                </UserProvider>
            </ViewportProvider>
        </ThemeProvider>
    );
};

export default App;
