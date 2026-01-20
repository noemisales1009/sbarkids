
import React from 'react';
import { Patient } from '../components/patients/PatientCard';
import { HistoryItemData } from '../components/history/HistoryItem';
import { CurrentPage } from '../types';
import ReportDetailHeader from '../components/report/ReportDetailHeader';
import PatientInfoHeader from '../components/sbar/PatientInfoHeader';
import ReportDetailContent from '../components/report/ReportDetailContent';
import ReportDetailFooter from '../components/report/ReportDetailFooter';
import BottomNavBar from '../components/patients/BottomNavBar';

interface ReportDetailPageProps {
    patient: Patient;
    report: HistoryItemData;
    onBack: () => void;
    onNavigate: (page: CurrentPage) => void;
    currentPage: CurrentPage;
}

const ReportDetailPage: React.FC<ReportDetailPageProps> = ({ patient, report, onBack, onNavigate, currentPage }) => {
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-gray-900 print:bg-white">
            <ReportDetailHeader onBack={onBack} reportDate={report.datetime} />
            <main className="flex-1 pb-24 sm:pb-20 print:pb-0">
                <ReportDetailContent report={report} patient={patient} />
            </main>
            <BottomNavBar onNavigate={onNavigate} currentPage={currentPage} />
            <ReportDetailFooter />
        </div>
    );
};

export default ReportDetailPage;
