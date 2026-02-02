
import React, { useState } from 'react';
import { Patient } from '../components/patients/PatientCard';
import HistoryHeader from '../components/history/HistoryHeader';
import HistoryList from '../components/history/HistoryList';
import ShiftSelector from '../components/report/ShiftSelector';
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
    const [selectedShifts, setSelectedShifts] = useState({
        morning: true,
        afternoon: true,
        night: true
    });

    const handleShiftToggle = (shift: 'morning' | 'afternoon' | 'night') => {
        setSelectedShifts(prev => ({
            ...prev,
            [shift]: !prev[shift]
        }));
    };

    const handlePrint = () => {
        // Armazenar os turnos selecionados para filtrar na impressão
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                ${!selectedShifts.morning ? '.shift-morning { display: none !important; }' : ''}
                ${!selectedShifts.afternoon ? '.shift-afternoon { display: none !important; }' : ''}
                ${!selectedShifts.night ? '.shift-night { display: none !important; }' : ''}
            }
        `;
        document.head.appendChild(style);
        window.print();
    };

    return (
        <>
            {/* Mobile View */}
            <div className="w-full overflow-x-hidden sm:hidden">
                <HistoryHeader patientName={patient.name} onBack={onBack} />
                <main className="grow px-4 pt-2 pb-28">
                    <ShiftSelector 
                        selectedShifts={selectedShifts}
                        onShiftToggle={handleShiftToggle}
                        onPrint={handlePrint}
                    />
                    <HistoryList 
                        onSelectReport={onSelectReport} 
                        patientId={patient.id}
                        selectedShifts={selectedShifts}
                    />
                </main>
                <BottomNavBar onNavigate={onNavigate} currentPage={currentPage} />
            </div>
            
            {/* Desktop View */}
            <DesktopLayout currentPage={currentPage} onNavigate={onNavigate}>
                <DesktopHistoryHeader patientName={patient.name} onBack={onBack} />
                <main className="grow pt-6 px-6">
                    <div className="max-w-6xl mx-auto">
                        <ShiftSelector 
                            selectedShifts={selectedShifts}
                            onShiftToggle={handleShiftToggle}
                            onPrint={handlePrint}
                        />
                        <HistoryList 
                            onSelectReport={onSelectReport} 
                            patientId={patient.id}
                            selectedShifts={selectedShifts}
                        />
                    </div>
                </main>
            </DesktopLayout>
        </>
    );
};

export default HistoryPage;