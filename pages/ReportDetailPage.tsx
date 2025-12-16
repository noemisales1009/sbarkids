
import React from 'react';
import { Patient } from '../components/patients/PatientCard';
import { HistoryItemData } from '../components/history/HistoryItem';
import ReportDetailHeader from '../components/report/ReportDetailHeader';
import PatientInfoHeader from '../components/sbar/PatientInfoHeader';
import ReportDetailContent from '../components/report/ReportDetailContent';
import ReportDetailFooter from '../components/report/ReportDetailFooter';

interface ReportDetailPageProps {
    patient: Patient;
    report: HistoryItemData;
    onBack: () => void;
}

const ReportDetailPage: React.FC<ReportDetailPageProps> = ({ patient, report, onBack }) => {
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-slate-50 dark:bg-background-dark">
            <ReportDetailHeader onBack={onBack} reportDate={report.datetime} />
            <main className="flex-1 pb-24">
                <PatientInfoHeader patient={patient} />
                <ReportDetailContent report={report} />
            </main>
            <ReportDetailFooter />
        </div>
    );
};

export default ReportDetailPage;
