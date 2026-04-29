import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Patient, CurrentPage } from '../types';
import SbarStatusSection from '../components/sbar/SbarStatusSection';
import ComorbidadesSection from '../components/sbar/ComorbidadesSection';
import BackgroundEditor from '../components/sbar/BackgroundEditor';
import AssessmentSimple from '../components/sbar/AssessmentSimple';
import PatientHeaderCard from '../components/sbar/PatientHeaderCard';
import AlertasPanel from '../components/sbar/AlertasPanel';
import BottomNavBar from '../components/patients/BottomNavBar';
import SbarFooter from '../components/sbar/SbarFooter';
import { DiagnosticoSelector } from '../components/sbar/index';
import { userService } from '../services/userService';
import { patientsService } from '../services/patientsService';
import { diagnosticosSelecionadosService } from '../services/diagnosticosSelecionadosService';
import { useToast } from '../components/Toast';

interface SbarReportPageProps {
  patient?: Patient;
  onBack: () => void;
  onNavigate: (page: CurrentPage) => void;
  currentPage: CurrentPage;
}

const SbarReportPage: React.FC<SbarReportPageProps> = ({ patient: patientProp, onBack, onNavigate, currentPage }) => {
  const { patientId: urlPatientId } = useParams<{ patientId: string }>();
  const { showLoading, hideLoading } = useToast();

  const [patient, setPatient] = useState<Patient | null>(patientProp || null);
  const [patientLoading, setPatientLoading] = useState(!patientProp && !!urlPatientId);
  const [status, setStatus] = useState<'estavel' | 'instavel' | 'em_risco' | null>(null);
  const [currentRoundId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState('Dr. Usuário');
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carrega paciente pelo URL quando não veio como prop (ex: F5 ou bookmark)
  useEffect(() => {
    if (patientProp) {
      setPatient(patientProp);
      return;
    }
    if (!urlPatientId) return;

    let cancelled = false;
    setPatientLoading(true);
    patientsService.getPatient(urlPatientId).then((p) => {
      if (!cancelled) {
        setPatient(p);
        setPatientLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setPatientLoading(false);
    });
    return () => { cancelled = true; };
  }, [patientProp, urlPatientId]);

  useEffect(() => {
    if (!patient) return;
    let cancelled = false;
    const loadInitialData = async () => {
      showLoading('Carregando ficha...');
      try {
        await Promise.all([
          userService.getCurrentUser()
            .then((userData) => { if (!cancelled) setCurrentUserName(userData?.name || 'Dr. Usuário'); })
            .catch(() => { if (!cancelled) setCurrentUserName('Dr. Usuário'); }),

          patientsService.getPatient(patient.id)
            .then((patientData) => {
              if (!cancelled && patientData?.status) {
                setStatus(patientData.status as 'estavel' | 'instavel' | 'em_risco');
              }
            })
            .catch(() => {}),
        ]);
      } finally {
        if (!cancelled) hideLoading();
      }
    };
    loadInitialData();
    return () => { cancelled = true; };
  }, [patient?.id]);

  useEffect(() => {
    if (!status || !patient) return;
    const timeout = setTimeout(() => {
      patientsService.updatePatient(patient.id, { status }).catch(() => {});
    }, 500);
    return () => clearTimeout(timeout);
  }, [status, patient?.id]);

  const handleDiagnosticoSave = async (diagnosticos: any[]) => {
    if (!patient) return;
    const principais = diagnosticos.filter((d) => d.tipo === 'principal');
    const secundarios = diagnosticos.filter((d) => d.tipo === 'secundario');
    if (principais.length > 0) {
      const ok = await diagnosticosSelecionadosService.saveDiagnosticos(patient.id, 1, principais);
      if (!ok) throw new Error('Erro ao salvar diagnósticos principais');
    }
    if (secundarios.length > 0) {
      const ok = await diagnosticosSelecionadosService.saveDiagnosticos(patient.id, 2, secundarios);
      if (!ok) throw new Error('Erro ao salvar diagnósticos secundários');
    }
  };

  const showSaveMessage = (message: string) => {
    setSaveMessage({ type: message.includes('✅') ? 'success' : 'error', text: message });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  if (patientLoading || !patient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <main className="flex-1 pb-32 sm:pb-20">
        <div className="flex flex-col p-4 gap-4">
          <PatientHeaderCard patient={patient} onBack={onBack} />

          <SbarStatusSection currentStatus={status} />

          <ComorbidadesSection patientId={patient.id} comorbidade={patient.comorbidade} />

          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">S - Situação</h3>
            <DiagnosticoSelector
              pacienteId={patient.id}
              onSaveMessage={showSaveMessage}
              onSave={handleDiagnosticoSave}
            />
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">B - Breve Histórico</h3>
            <BackgroundEditor patientId={patient.id} />
          </div>

          <AssessmentSimple
            patientId={patient.id}
            roundId={currentRoundId || undefined}
            currentUserName={currentUserName}
            onSaved={showSaveMessage}
          />

          <AlertasPanel
            patientId={patient.id}
            patientName={patient.name}
            roundId={currentRoundId || undefined}
          />

          {saveMessage && (
            <div
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-4 rounded-xl shadow-2xl font-semibold text-white text-sm flex items-center gap-3 animate-slide-in ${
                saveMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'
              }`}
            >
              {saveMessage.text}
            </div>
          )}
        </div>
      </main>

      <BottomNavBar onNavigate={onNavigate} currentPage={currentPage} />
      <SbarFooter onBack={onBack} />
    </div>
  );
};

export default SbarReportPage;
