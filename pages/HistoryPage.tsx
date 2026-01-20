
import React from 'react';
import { Patient } from '../components/patients/PatientCard';
import HistoryHeader from '../components/history/HistoryHeader';
import HistoryList from '../components/history/HistoryList';
import BottomNavBar from '../components/patients/BottomNavBar';
import { CurrentPage } from '../App';
import DesktopLayout from '../components/layout/DesktopLayout';
import DesktopHistoryHeader from '../components/history/DesktopHistoryHeader';
import { HistoryItemData } from '../components/history/HistoryItem';

interface HistoryPageProps {
    patient: Patient;
    onBack: () => void;
    onNavigate: (page: CurrentPage) => void;
    currentPage: CurrentPage;
    onSelectReport: (report: HistoryItemData) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ patient, onBack, onNavigate, currentPage, onSelectReport }) => {
    return (
        <>
            {/* Mobile View */}
            <div className="w-full overflow-x-hidden sm:hidden">
                <HistoryHeader patientName={patient.name} onBack={onBack} />
                <main className="grow px-4 pt-2 pb-28">
                    <HistoryList onSelectReport={onSelectReport} patientId={patient.id} />
                </main>
                <BottomNavBar onNavigate={onNavigate} currentPage={currentPage} />
            </div>
            
            {/* Desktop View */}
            <DesktopLayout currentPage={currentPage} onNavigate={onNavigate}>
                <DesktopHistoryHeader patientName={patient.name} />
                <main className="grow pt-6">
                    <HistoryList onSelectReport={onSelectReport} patientId={patient.id} />
                </main>
            </DesktopLayout>
        </>
    );
};

export default HistoryPage;