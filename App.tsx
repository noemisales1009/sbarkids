
import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import PatientsPage from './pages/PatientsPage';
import SbarReportPage from './pages/SbarReportPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import { Patient } from './components/patients/PatientCard';
import { HistoryItemData } from './components/history/HistoryItem';
import ReportDetailPage from './pages/ReportDetailPage';

export type CurrentPage = 'login' | 'patients' | 'sbar' | 'history' | 'settings' | 'home' | 'messages' | 'reports' | 'team' | 'reportDetail';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<CurrentPage>('patients');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedReport, setSelectedReport] = useState<HistoryItemData | null>(null);

    const handleNavigate = (page: CurrentPage) => {
        if (page === 'login') {
            setSelectedPatient(null);
            setSelectedReport(null);
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
                return <LoginPage onLoginSuccess={() => handleNavigate('patients')} />;
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
            default:
                // Redirect unhandled pages to patients for this example
                return <PatientsPage onSelectPatient={handleSelectPatientForSbar} onSelectHistory={handleSelectPatientForHistory} onNavigate={handleNavigate} currentPage={currentPage} />;
        }
    }

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root">
            {renderPage()}
        </div>
    );
};

export default App;
