
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Patient, HistoryItemData, CurrentPage } from './types';
import { ViewportProvider } from './hooks/useViewport';

// Lazy loading - páginas carregam sob demanda
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SessionExpiredPage = React.lazy(() => import('./pages/SessionExpiredPage'));
const PassagemPage = React.lazy(() => import('./pages/PassagemPage'));
const PatientsPage = React.lazy(() => import('./pages/PatientsPage'));
const SbarReportPage = React.lazy(() => import('./pages/SbarReportPage'));
const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));
const ReportDetailPage = React.lazy(() => import('./pages/ReportDetailPage'));
const TestSupabasePage = React.lazy(() => import('./pages/TestSupabasePage').then(m => ({ default: m.TestSupabasePage })));
import { supabase } from './lib/supabase';
import { patientsService } from './services/patientsService';
import { UserProvider, useUser } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { auditService } from './services/auditService';
import { ToastProvider, useToast } from './components/Toast';
import { logError } from './utils/errorHandler';
import { NetworkBanner } from './components/NetworkBanner';
import { NetworkProvider } from './contexts/NetworkContext';

interface AuthUser {
    id: string;
    email: string;
    name: string;
}

const ProtectedRoute = ({ children, isAuthenticated }: { children: React.ReactNode; isAuthenticated: boolean }) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

// Componente para gerenciar navegação
const AppContent: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, refetchUser } = useUser();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedReport, setSelectedReport] = useState<HistoryItemData | null>(null);
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [refreshKey] = useState(0);
    const { showToast } = useToast();
    const hadSessionRef = useRef(false);   // houve sessão ativa em algum momento
    const manualSignOutRef = useRef(false); // o logout foi iniciado pelo utilizador

    // Estado mantido apenas em memória (sem sessionStorage) por segurança LGPD

    // Limpeza diária 00:05 SP agora é feita por pg_cron no Supabase

    // Dados de pacientes mantidos apenas em memória (LGPD compliance)

    // Verificar autenticação ao montar o componente
    useEffect(() => {
        let mounted = true;


        // Escutar mudanças de autenticação - listener passivo
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!mounted) return;


            if (session?.user) {
                hadSessionRef.current = true;
                setAuthUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.name || 'Usuário'
                });
                refetchUser();
                if (event === 'SIGNED_IN') {
                    auditService.logLogin(session.user.id, session.user.email || 'Usuário');
                }
                if (location.pathname === '/login' || location.pathname === '/session-expired') {
                    navigate('/patients', { replace: true });
                }
            } else {
                setAuthUser(null);
                const wasManual = manualSignOutRef.current;
                manualSignOutRef.current = false;

                if (wasManual || !hadSessionRef.current) {
                    // Logout manual ou app a abrir sem sessão → vai para /login
                    if (location.pathname !== '/login' && location.pathname !== '/session-expired') {
                        navigate('/login', { replace: true });
                    }
                } else {
                    // Token expirou sozinho → mostra página de sessão expirada
                    navigate('/session-expired', { replace: true });
                }
                hadSessionRef.current = false;
            }
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, [navigate, location.pathname]);

    const handleLogout = async () => {
        try {
            if (user) {
                await auditService.logLogout(user.id, user.name);
            }
            manualSignOutRef.current = true;
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
            sbar: selectedPatient ? `/sbar/${selectedPatient.id}` : '/patients',
            history: selectedPatient ? `/history/${selectedPatient.id}` : '/patients',
            settings: '/settings',
            reports: '/reports',
            reportDetail: '/report-detail',
            passagem: '/passagem',
            ponto: '/ponto',
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
            logError(error, 'handleSelectPatientForSbar');
            showToast('Erro ao sincronizar paciente com o servidor', 'error');
        }

        setSelectedPatient(patient);
        if (user) {
            auditService.logAcessoFicha(user.id, user.name, patient.id, patient.name);
        }
        navigate(`/sbar/${patient.id}`);
    };

    const handleSelectPatientForHistory = (patient: Patient) => {
        setSelectedPatient(patient);
        if (user) {
            auditService.log({
                user_id: user.id,
                user_name: user.name,
                action: 'visualizou_historico',
                patient_id: patient.id,
                patient_name: patient.name,
            });
        }
        navigate('/history');
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


    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            }>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/session-expired" element={<SessionExpiredPage />} />
                
                <Route path="/patients" element={
                    <ProtectedRoute isAuthenticated={!!authUser}>
                        <PatientsPage
                            onSelectPatient={handleSelectPatientForSbar} 
                            onSelectHistory={handleSelectPatientForHistory} 
                            onNavigate={handleNavigate} 
                            currentPage="patients" 
                            refreshKey={refreshKey} 
                        />
                    </ProtectedRoute>
                } />
                
                <Route path="/sbar/:patientId" element={
                    <ProtectedRoute isAuthenticated={!!authUser}>
                        <SbarReportPage
                            patient={selectedPatient || undefined}
                            onBack={() => navigate('/patients')}
                            onNavigate={handleNavigate}
                            currentPage="sbar"
                        />
                    </ProtectedRoute>
                } />
                
                <Route path="/history" element={
                    <ProtectedRoute isAuthenticated={!!authUser}>
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
                
                <Route path="/passagem" element={
                    <ProtectedRoute isAuthenticated={!!authUser}>
                        <PassagemPage onNavigate={handleNavigate} currentPage="passagem" />
                    </ProtectedRoute>
                } />

                <Route path="/settings" element={
                    <ProtectedRoute isAuthenticated={!!authUser}>
                        <SettingsPage onNavigate={handleNavigate} currentPage="settings" />
                    </ProtectedRoute>
                } />
                
                <Route path="/reports" element={
                    <ProtectedRoute isAuthenticated={!!authUser}>
                        <ReportsPage 
                            onNavigate={handleNavigate} 
                            currentPage="reports" 
                            onSelectReportContext={handleSelectReportContext} 
                        />
                    </ProtectedRoute>
                } />
                
                <Route path="/report-detail" element={
                    <ProtectedRoute isAuthenticated={!!authUser}>
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
                        <ProtectedRoute isAuthenticated={!!authUser}>
                            <TestSupabasePage />
                        </ProtectedRoute>
                    } />
                )}

                <Route path="*" element={<Navigate to="/patients" replace />} />
            </Routes>
            </Suspense>
        </div>
    );
};

// Componente principal com BrowserRouter
const App: React.FC = () => {
    return (
        <ThemeProvider>
            <ViewportProvider>
                <UserProvider>
                    <ToastProvider>
                        <NetworkProvider>
                            <NetworkBanner />
                            <BrowserRouter>
                                <AppContent />
                            </BrowserRouter>
                        </NetworkProvider>
                    </ToastProvider>
                </UserProvider>
            </ViewportProvider>
        </ThemeProvider>
    );
};

export default App;
