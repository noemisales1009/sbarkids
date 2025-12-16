
import React, { useState } from 'react';
import Header from '../components/patients/Header';
import DesktopHeader from '../components/patients/DesktopHeader';
import SearchBar from '../components/patients/SearchBar';
import PatientList from '../components/patients/PatientList';
import BottomNavBar from '../components/patients/BottomNavBar';
import { Patient } from '../components/patients/PatientCard';
import { CurrentPage } from '../App';
import DesktopLayout from '../components/layout/DesktopLayout';

interface PatientsPageProps {
    onSelectPatient: (patient: Patient) => void;
    onSelectHistory: (patient: Patient) => void;
    onNavigate: (page: CurrentPage) => void;
    currentPage: CurrentPage;
}

const PatientsPage: React.FC<PatientsPageProps> = ({ onSelectPatient, onSelectHistory, onNavigate, currentPage }) => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <>
            {/* Mobile View */}
            <div className="w-full overflow-x-hidden sm:hidden">
                <Header />
                <div className="px-4 py-3 sticky top-[68px] z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
                    <SearchBar 
                        placeholder="Buscar paciente por nome ou leito" 
                        onSearch={setSearchTerm}
                    />
                </div>
                <main className="flex-grow pb-28 px-4">
                    <PatientList 
                        onSelectPatient={onSelectPatient} 
                        onSelectHistory={onSelectHistory}
                        searchTerm={searchTerm}
                    />
                </main>
                <BottomNavBar onNavigate={onNavigate} currentPage={currentPage} />
            </div>

            {/* Desktop View */}
            <DesktopLayout currentPage={currentPage} onNavigate={onNavigate}>
                <DesktopHeader />
                <div className="mt-8">
                    <SearchBar 
                        placeholder="Buscar paciente por nome ou leito" 
                        onSearch={setSearchTerm}
                    />
                </div>
                <main className="flex-grow pt-6">
                    <PatientList 
                        onSelectPatient={onSelectPatient} 
                        onSelectHistory={onSelectHistory}
                        searchTerm={searchTerm}
                    />
                </main>
            </DesktopLayout>
        </>
    );
};

export default PatientsPage;