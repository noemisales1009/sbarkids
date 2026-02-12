
import React, { useEffect, useState } from 'react';
import { Patient, HistoryItemData, CurrentPage } from '../types';
import ReportDetailHeader from '../components/report/ReportDetailHeader';
import PatientInfoHeader from '../components/sbar/PatientInfoHeader';
import ReportDetailContent from '../components/report/ReportDetailContent';
import ReportDetailFooter from '../components/report/ReportDetailFooter';
import BottomNavBar from '../components/patients/BottomNavBar';
import { Alerta, alertasService } from '../services/alertasService';

interface ReportDetailPageProps {
    patient: Patient;
    report: HistoryItemData;
    onBack: () => void;
    onNavigate: (page: CurrentPage) => void;
    currentPage: CurrentPage;
}

const ReportDetailPage: React.FC<ReportDetailPageProps> = ({ patient, report, onBack, onNavigate, currentPage }) => {
    const [alertas, setAlertas] = useState<Alerta[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlertas = async () => {
            try {
                const alertasData = await alertasService.getAlertas(patient.id);
                setAlertas(alertasData);
            } catch (error) {
                console.error("Erro ao buscar alertas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlertas();
    }, [patient.id]);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark print:bg-white">
            <ReportDetailHeader onBack={onBack} reportDate={report.datetime} />
            <main className="flex-1 pb-24 sm:pb-20 print:pb-0">
                <ReportDetailContent report={report} patient={patient} alertas={alertas} />
            </main>
            <BottomNavBar onNavigate={onNavigate} currentPage={currentPage} />
            <ReportDetailFooter />
        </div>
    );
};

export default ReportDetailPage;
