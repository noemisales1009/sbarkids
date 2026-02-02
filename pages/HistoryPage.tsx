
import React, { useState } from 'react';
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
    const [selectedShifts, setSelectedShifts] = useState({
        morning: true,
        afternoon: true,
        night: true
    });
    const [selectedDate, setSelectedDate] = useState<string>('');

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
                    {/* Date Filter */}
                    <div className="mb-4 bg-gray-800 rounded-lg p-3">
                        <label className="text-sm font-medium text-gray-300 block mb-2">Filtrar por Data</label>
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full h-10 rounded-lg border-gray-600 bg-gray-700 text-white text-sm"
                        />
                    </div>
                    
                    <HistoryList 
                        onSelectReport={onSelectReport} 
                        patientId={patient.id}
                        selectedShifts={selectedShifts}
                        selectedDate={selectedDate}
                    />
                </main>
                <BottomNavBar onNavigate={onNavigate} currentPage={currentPage} />
            </div>
            
            {/* Desktop View */}
            <DesktopLayout currentPage={currentPage} onNavigate={onNavigate}>
                <DesktopHistoryHeader patientName={patient.name} onBack={onBack} />
                <main className="grow pt-6 px-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Date Filter */}
                        <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <label className="text-sm font-medium text-gray-300 block mb-3">Filtrar por Data</label>
                            <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full h-11 rounded-lg border-gray-600 bg-gray-700 text-white"
                            />
                        </div>

                        <HistoryList 
                            onSelectReport={onSelectReport} 
                            patientId={patient.id}
                            selectedShifts={selectedShifts}
                            selectedDate={selectedDate}
                        />
                    </div>
                </main>
            </DesktopLayout>
        </>
    );
};

export default HistoryPage;