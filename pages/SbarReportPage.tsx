import React, { useState, useEffect } from 'react';
import { Patient, CurrentPage } from '../types';
import SbarHeader from '../components/sbar/SbarHeader';
import PatientInfoHeader from '../components/sbar/PatientInfoHeader';
import SbarSection from '../components/sbar/SbarSection';
import SbarFooter from '../components/sbar/SbarFooter';
import SbarStatusSection from '../components/sbar/SbarStatusSection';
import SbarReadonlySection from '../components/sbar/SbarReadonlySection';
import DiagnosticsEditor from '../components/sbar/DiagnosticsEditor';
import SuportesVentilatoriosSection from '../components/sbar/SuportesVentilatoriosSection';
import ComorbidadesSection from '../components/sbar/ComorbidadesSection';
import BackgroundEditor from '../components/sbar/BackgroundEditor';
import AlertasDisplay from '../components/sbar/AlertasDisplay';
import BottomNavBar from '../components/patients/BottomNavBar';
import AssessmentPlan from '../components/sbar/AssessmentPlan';
import RecommendationPlan from '../components/sbar/RecommendationPlan';
import { clinicalRoundsService } from '../services/clinicalRoundsService';
import { recommendationService, ClinicalRoundRecommendation } from '../services/recommendationService';
import { assessmentService, ClinicalRoundAssessment } from '../services/assessmentService';
import { auditLogService } from '../services/auditLogService';
import { userService } from '../services/userService';
import { alertasService, Alerta } from '../services/alertasService';
import { patientService } from '../services/patientService';
import { patientsService } from '../services/patientsService';

interface SbarReportPageProps {
    patient: Patient;
    onBack: () => void;
    onNavigate: (page: CurrentPage) => void;
    currentPage: CurrentPage;
}

// Interface para campos de texto que rastreiam o autor
export interface SbarFieldData {
    text: string;
    authorId: string | null;
    authorName: string | null;
    updatedAt: string | null;
}

const MOCK_OTHER_USER = {
    id: 'user-2',
    name: 'Dr. Gregory House'
};

const SbarReportPage: React.FC<SbarReportPageProps> = ({ patient, onBack, onNavigate, currentPage }) => {
    // ID do usuário (você pode pegar do Supabase Auth)
    const CURRENT_USER_ID = 'user-1';
    const [status, setStatus] = useState<'estavel' | 'instavel' | 'em_risco' | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
    const [assessmentStatus, setAssessmentStatus] = useState<ClinicalRoundAssessment | null>(null);
    const [recommendationStatus, setRecommendationStatus] = useState<ClinicalRoundRecommendation | null>(null);
    const [selectedShift, setSelectedShift] = useState<'morning' | 'afternoon' | 'night'>('morning');
    const [currentUserName, setCurrentUserName] = useState<string>('Dr. Usuário');
    const [alertas, setAlertas] = useState<Alerta[]>([]);

    // Buscar nome do usuário autenticado
    useEffect(() => {
        const loadCurrentUser = async () => {
            console.log('🔍 Carregando dados do usuário autenticado...');
            try {
                // 1. Tenta userService.getCurrentUser() que chama o auth
                const userData = await userService.getCurrentUser();
                console.log('✅ userService.getCurrentUser() retornou:', userData);
                
                if (userData?.name) {
                    console.log(`✅ Nome encontrado: "${userData.name}"`);
                    setCurrentUserName(userData.name);
                    localStorage.setItem('currentUserName', userData.name);
                    return;
                }
                
                console.log('❌ Usuário sem name definido, tentando fallbacks...');
                
                // 2. Fallback: localStorage
                const savedName = localStorage.getItem('currentUserName');
                if (savedName && savedName !== 'Médico') {
                    console.log(`✅ Recuperado do localStorage: "${savedName}"`);
                    setCurrentUserName(savedName);
                    return;
                }
                
                // 3. Fallback final: usar padrão
                console.log('❌ Nenhum nome encontrado, usando padrão');
                setCurrentUserName('Dr. Usuário');
            } catch (error) {
                console.error('❌ ERRO ao carregar usuário:', error);
                // Tenta localStorage mesmo depois de erro
                const savedName = localStorage.getItem('currentUserName');
                if (savedName && savedName !== 'Médico') {
                    console.log(`📦 Usando fallback localStorage: "${savedName}"`);
                    setCurrentUserName(savedName);
                } else {
                    console.log('📦 Usando fallback padrão');
                    setCurrentUserName('Dr. Usuário');
                }
            }
        };
        loadCurrentUser();
    }, []);

    // Carregar alertas quando a página carrega
    useEffect(() => {
        const loadAlertas = async () => {
            console.log('📍 Carregando alertas do paciente:', patient.id);
            try {
                const alertasData = await alertasService.getAlertas(patient.id);
                console.log('✅ Alertas carregados:', alertasData);
                setAlertas(alertasData);
            } catch (error) {
                console.error('❌ Erro ao carregar alertas:', error);
                setAlertas([]);
            }
        };
        loadAlertas();
    }, [patient.id]);

    // Salvar status automaticamente quando o paciente é selecionado
    useEffect(() => {
        if (!status) return;

        const saveStatus = async () => {
            try {
                console.log('💾 Salvando status do paciente:', status);
                await patientsService.updatePatient(patient.id, { status });
                console.log('✅ Status salvo com sucesso:', status);
            } catch (error) {
                console.error('❌ Erro ao salvar status:', error);
            }
        };

        // Aguardar um pouco para que o usuário tenha confirmado o status
        const saveTimeout = setTimeout(saveStatus, 500);
        
        return () => clearTimeout(saveTimeout);
    }, [status, patient.id]);

    // Carregar status do paciente quando a página carrega
    useEffect(() => {
        const loadPatientStatus = async () => {
            console.log('📍 Carregando status do paciente:', patient.id);
            try {
                // Buscar o paciente completo do Supabase para pegar o status
                const patientData = await patientsService.getPatient(patient.id);
                console.log('✅ Dados do paciente carregados:', patientData);
                if (patientData?.status) {
                    console.log('✅ Status do paciente carregado:', patientData.status);
                    setStatus(patientData.status as 'estavel' | 'instavel' | 'em_risco');
                }
            } catch (error) {
                console.error('❌ Erro ao carregar status do paciente:', error);
            }
        };
        loadPatientStatus();
    }, [patient.id]);

    // NÃO criar round automaticamente - apenas quando houver dados para salvar
    // Isso evita a criação de relatórios vazios
    /* useEffect(() => {
        if (currentRoundId) return; // Já existe um round

        const loadOrCreateRound = async () => {
            console.log('🔍 Procurando ou criando round do dia para paciente:', patient.id);
            try {
                // Busca ou cria automaticamente o round do dia atual (horário de São Paulo)
                const todayRound = await clinicalRoundsService.getOrCreateTodayRound(patient.id, CURRENT_USER_ID);
                
                if (todayRound) {
                    console.log('✅ Round do dia:', todayRound.id, '(criado em:', todayRound.created_at, ')');
                    setCurrentRoundId(todayRound.id);
                } else {
                    console.error('❌ Não foi possível obter/criar round do dia');
                }
            } catch (error) {
                console.error('❌ Erro ao carregar/criar round do dia:', error);
            }
        };

        loadOrCreateRound();
    }, [patient.id]); */

    // Função auxiliar para criar round sob demanda
    const ensureRoundExists = async (): Promise<string | null> => {
        if (currentRoundId) return currentRoundId;
        
        console.log('🔍 Criando round do dia para paciente:', patient.id);
        try {
            const todayRound = await clinicalRoundsService.getOrCreateTodayRound(patient.id, CURRENT_USER_ID);
            if (todayRound) {
                console.log('✅ Round criado:', todayRound.id);
                setCurrentRoundId(todayRound.id);
                return todayRound.id;
            }
            return null;
        } catch (error) {
            console.error('❌ Erro ao criar round:', error);
            return null;
        }
    };

    // Carregar dados salvos quando o round é criado
    useEffect(() => {
        if (!currentRoundId) return;

        const loadSavedData = async () => {
            try {
                console.log('Carregando dados salvos do round:', currentRoundId);
                
                // Carregar o round completo para pegar o status
                const round = await clinicalRoundsService.getRoundById(currentRoundId);
                console.log('Round carregado:', round);
                if (round?.status) {
                    console.log('Status carregado:', round.status);
                    setStatus(round.status);
                }
                
                // Carregar Assessment
                const assessment = await assessmentService.getAssessmentByRound(currentRoundId);
                console.log('Assessment carregado:', assessment);
                if (assessment) {
                    setAssessmentStatus(assessment);
                    // Preencher os turnos com dados salvos
                    if (assessment.morning_data) {
                        console.log('Preenchendo Assessment Morning:', assessment.morning_data);
                        setAssessmentMorning(assessment.morning_data as any);
                    }
                    if (assessment.afternoon_data) {
                        console.log('Preenchendo Assessment Afternoon:', assessment.afternoon_data);
                        setAssessmentAfternoon(assessment.afternoon_data as any);
                    }
                    if (assessment.night_data) {
                        console.log('Preenchendo Assessment Night:', assessment.night_data);
                        setAssessmentNight(assessment.night_data as any);
                    }
                }

                // Carregar Recommendation
                const recommendation = await recommendationService.getRecommendationByRound(currentRoundId);
                console.log('Recommendation carregado:', recommendation);
                if (recommendation) {
                    setRecommendationStatus(recommendation);
                    // Preencher os turnos com dados salvos
                    if (recommendation.morning_data) {
                        console.log('Preenchendo Recommendation Morning:', recommendation.morning_data);
                        setRecommendationMorning(recommendation.morning_data as any);
                    }
                    if (recommendation.afternoon_data) {
                        console.log('Preenchendo Recommendation Afternoon:', recommendation.afternoon_data);
                        setRecommendationAfternoon(recommendation.afternoon_data as any);
                    }
                    if (recommendation.night_data) {
                        console.log('Preenchendo Recommendation Night:', recommendation.night_data);
                        setRecommendationNight(recommendation.night_data as any);
                    }
                }

                console.log('Dados carregados com sucesso');
            } catch (error) {
                console.error('Erro ao carregar dados salvos:', error);
            }
        };

        loadSavedData();
    }, [currentRoundId]);

    // Mock initial state
    // Situation created by someone else (Now Editable by anyone)
    const [situation, setSituation] = useState<SbarFieldData>({
        text: '',
        authorId: null,
        authorName: null,
        updatedAt: null
    });

    // Background created by current user (Editable)
    const [background, setBackground] = useState<SbarFieldData>({
        text: 'Histórico de asma brônquica desde a infância. Nega alergias medicamentosas conhecidas.',
        authorId: CURRENT_USER_ID,
        authorName: currentUserName,
        updatedAt: 'Hoje, 09:00'
    });

    // Assessment with mixed authorship (Shift locked)
    const [assessment, setAssessment] = useState<Record<string, SbarFieldData>>({
        morning: { 
            text: 'Murmúrios vesiculares diminuídos globalmente, com sibilos esparsos. SatO2 94% em AA.',
            authorId: MOCK_OTHER_USER.id,
            authorName: MOCK_OTHER_USER.name,
            updatedAt: '09:15'
        },
        afternoon: { 
            text: '', 
            authorId: null, 
            authorName: null, 
            updatedAt: null 
        },
        night: { 
            text: '', 
            authorId: null, 
            authorName: null, 
            updatedAt: null 
        }
    });

    // Assessment Plan (New structure with shifts)
    const [assessmentMorning, setAssessmentMorning] = useState({
        respiratorio: '',
        hemodinamico: '',
        neurologico: '',
        renal: '',
        infeccioso: '',
        observacoes: ''
    });

    const [assessmentAfternoon, setAssessmentAfternoon] = useState({
        respiratorio: '',
        hemodinamico: '',
        neurologico: '',
        renal: '',
        infeccioso: '',
        observacoes: ''
    });

    const [assessmentNight, setAssessmentNight] = useState({
        respiratorio: '',
        hemodinamico: '',
        neurologico: '',
        renal: '',
        infeccioso: '',
        observacoes: ''
    });

    // Recommendation Plan (New structure with shifts)
    const [recommendationMorning, setRecommendationMorning] = useState({
        respiratorio: '',
        hemodinamico: '',
        neurologico: '',
        deliriumPrevencao: '',
        metabolicoRenal: '',
        exames: '',
        pendencias: ''
    });

    const [recommendationAfternoon, setRecommendationAfternoon] = useState({
        respiratorio: '',
        hemodinamico: '',
        neurologico: '',
        deliriumPrevencao: '',
        metabolicoRenal: '',
        exames: '',
        pendencias: ''
    });

    const [recommendationNight, setRecommendationNight] = useState({
        respiratorio: '',
        hemodinamico: '',
        neurologico: '',
        deliriumPrevencao: '',
        metabolicoRenal: '',
        exames: '',
        pendencias: ''
    });

    // Helper to update simple sections (Shared/Collaborative Logic)
    const handleSectionChange = (
        setter: React.Dispatch<React.SetStateAction<SbarFieldData>>,
        currentValue: SbarFieldData,
        newText: string
    ) => {
        setter({
            ...currentValue,
            text: newText,
            authorId: CURRENT_USER_ID, // Update to current user on edit
            authorName: currentUserName,
            updatedAt: 'Agora'
        });
    };

    // Helper to update shift sections (Shift Logic)

    // Função para salvar o Round completo
    const handleSaveRound = async () => {
        try {
            setSaving(true);
            setSaveMessage(null);

            const roundData = {
                patient_id: patient.id,
                created_by: null,
                
                // S - Situação (salvando apenas a descrição clínica)
                s_clinical_status: status || null,
                
                // R - Recomendação (salvando os 3 turnos como JSON)
                r_exams_evaluations_requests: {
                    morning: recommendationMorning,
                    afternoon: recommendationAfternoon,
                    night: recommendationNight
                } as Record<string, unknown>
            };

            const result = await clinicalRoundsService.createRound(roundData);
            
            if (result) {
                setCurrentRoundId(result.id);
                setSaveMessage({
                    type: 'success',
                    text: 'Round criado com sucesso! Agora salve cada turno separadamente.'
                });
                setTimeout(() => setSaveMessage(null), 3000);
            } else {
                setSaveMessage({
                    type: 'error',
                    text: 'Erro ao salvar o round'
                });
            }
        } catch (error) {
            console.error('Erro ao salvar round:', error);
            setSaveMessage({
                type: 'error',
                text: 'Erro ao salvar o round'
            });
        } finally {
            setSaving(false);
        }
    };

    // Função para salvar um turno de Assessment específico
    const handleSaveAssessmentShift = async (shift: 'morning' | 'afternoon' | 'night') => {
        if (!currentRoundId) {
            setSaveMessage({
                type: 'error',
                text: 'Crie o round primeiro antes de salvar os turnos'
            });
            return;
        }

        try {
            const shiftData = shift === 'morning' 
                ? assessmentMorning 
                : shift === 'afternoon' 
                ? assessmentAfternoon 
                : assessmentNight;

            const success = await assessmentService.saveShiftAssessment(
                patient.id,
                currentRoundId,
                shift,
                shiftData,
                CURRENT_USER_ID,
                currentUserName
            );

            if (success) {
                const updated = await assessmentService.getAssessmentByRound(currentRoundId);
                setAssessmentStatus(updated);

                setSaveMessage({
                    type: 'success',
                    text: `Avaliação do turno ${shift === 'morning' ? 'da manhã' : shift === 'afternoon' ? 'da tarde' : 'da noite'} salva com sucesso!`
                });
                setTimeout(() => setSaveMessage(null), 3000);
            } else {
                setSaveMessage({
                    type: 'error',
                    text: 'Erro ao salvar a avaliação'
                });
            }
        } catch (error) {
            console.error('Erro ao salvar avaliação:', error);
            setSaveMessage({
                type: 'error',
                text: 'Erro ao salvar a avaliação'
            });
        }
    };

    // Função para salvar um turno de Recommendation específico
    const handleSaveRecommendationShift = async (shift: 'morning' | 'afternoon' | 'night') => {
        if (!currentRoundId) {
            setSaveMessage({
                type: 'error',
                text: 'Crie o round primeiro antes de salvar os turnos'
            });
            return;
        }

        try {
            const shiftData = shift === 'morning' 
                ? recommendationMorning 
                : shift === 'afternoon' 
                ? recommendationAfternoon 
                : recommendationNight;

            const success = await recommendationService.saveShiftRecommendation(
                patient.id,
                currentRoundId,
                shift,
                shiftData,
                CURRENT_USER_ID,
                currentUserName
            );

            if (success) {
                const updated = await recommendationService.getRecommendationByRound(currentRoundId);
                setRecommendationStatus(updated);

                setSaveMessage({
                    type: 'success',
                    text: `Recomendação do turno ${shift === 'morning' ? 'da manhã' : shift === 'afternoon' ? 'da tarde' : 'da noite'} salva com sucesso!`
                });
                setTimeout(() => setSaveMessage(null), 3000);
            } else {
                setSaveMessage({
                    type: 'error',
                    text: 'Erro ao salvar a recomendação'
                });
            }
        } catch (error) {
            console.error('Erro ao salvar recomendação:', error);
            setSaveMessage({
                type: 'error',
                text: 'Erro ao salvar a recomendação'
            });
        }
    };

    // Função para salvar AMBAS as seções (Assessment e Recomendação) para um turno específico
    const handleSaveAssessmentAndRecommendation = async () => {
        console.log('=== INICIANDO SALVAMENTO SBAR ===');
        console.log('Round ID:', currentRoundId);
        console.log('Turno selecionado:', selectedShift);
        
        if (!currentRoundId) {
            setSaveMessage({
                type: 'error',
                text: 'Crie o round primeiro antes de salvar os turnos'
            });
            return;
        }

        try {
            setSaving(true);
            setSaveMessage(null);

            const assessmentData = selectedShift === 'morning' 
                ? assessmentMorning 
                : selectedShift === 'afternoon' 
                ? assessmentAfternoon 
                : assessmentNight;

            const recommendationData = selectedShift === 'morning' 
                ? recommendationMorning 
                : selectedShift === 'afternoon' 
                ? recommendationAfternoon 
                : recommendationNight;

            console.log('Dados de Assessment a salvar:', assessmentData);
            console.log('Dados de Recommendation a salvar:', recommendationData);

            // Salva Assessment
            const assessmentSuccess = await assessmentService.saveShiftAssessment(
                patient.id,
                currentRoundId,
                selectedShift,
                assessmentData,
                CURRENT_USER_ID,
                currentUserName
            );
            console.log('Assessment salvo com sucesso?', assessmentSuccess);

            // Salva Recommendation
            const recommendationSuccess = await recommendationService.saveShiftRecommendation(
                patient.id,
                currentRoundId,
                selectedShift,
                recommendationData,
                CURRENT_USER_ID,
                currentUserName
            );

            if (assessmentSuccess && recommendationSuccess) {
                const updatedAssessment = await assessmentService.getAssessmentByRound(currentRoundId);
                const updatedRecommendation = await recommendationService.getRecommendationByRound(currentRoundId);
                
                setAssessmentStatus(updatedAssessment);
                setRecommendationStatus(updatedRecommendation);

                // Salvar o status se foi alterado
                if (status) {
                    console.log('Salvando status:', status);
                    await clinicalRoundsService.updateRound(currentRoundId, { status });
                    // Também salva na tabela patients para refletir o status
                    await patientService.updatePatientStatus(patient.id, status);
                    console.log('✅ Status atualizado na tabela patients');
                }

                // Registrar no histórico de auditoria
                await auditLogService.logSave(
                    currentRoundId,
                    patient.id,
                    selectedShift,
                    'assessment',
                    assessmentData,
                    null,
                    currentUserName
                );

                await auditLogService.logSave(
                    currentRoundId,
                    patient.id,
                    selectedShift,
                    'recommendation',
                    recommendationData,
                    null,
                    currentUserName
                );

                const shiftName = selectedShift === 'morning' 
                    ? 'da manhã' 
                    : selectedShift === 'afternoon' 
                    ? 'da tarde' 
                    : 'da noite';

                setSaveMessage({
                    type: 'success',
                    text: `✅ Avaliação e Recomendação do turno ${shiftName} salvas com sucesso!`
                });
                setTimeout(() => setSaveMessage(null), 3000);
            } else {
                setSaveMessage({
                    type: 'error',
                    text: 'Erro ao salvar avaliação ou recomendação'
                });
            }
        } catch (error) {
            console.error('Erro ao salvar avaliação e recomendação:', error);
            setSaveMessage({
                type: 'error',
                text: 'Erro ao salvar avaliação e recomendação'
            });
        } finally {
            setSaving(false);
        }
    };
    
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-gray-950">
            <main className="flex-1 pb-32 sm:pb-20">
                <div className="flex flex-col p-4 gap-4">
                    {/* Informações do Paciente */}
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h1 className="text-white text-2xl font-bold">{patient.name}</h1>
                                <p className="text-gray-400 text-sm mt-1">Leito {patient.bed_number}</p>
                            </div>
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">arrow_back</span>
                                    Voltar
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="bg-gray-800 p-2 rounded-lg">
                                <p className="text-gray-400 text-xs mb-1">Idade</p>
                                <p className="text-white text-sm font-semibold">
                                    {(() => {
                                        const birthDate = new Date(patient.dob);
                                        const today = new Date();
                                        let age = today.getFullYear() - birthDate.getFullYear();
                                        const m = today.getMonth() - birthDate.getMonth();
                                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                                        return age;
                                    })()} anos
                                </p>
                            </div>
                            
                            <div className="bg-gray-800 p-2 rounded-lg">
                                <p className="text-gray-400 text-xs mb-1">Dias Int.</p>
                                <p className="text-white text-sm font-semibold">
                                    {(() => {
                                        if (!patient.dt_internacao) return '0 dias';
                                        const admissionDate = new Date(patient.dt_internacao + 'T00:00:00');
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const diffTime = today.getTime() - admissionDate.getTime();
                                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                        return `${diffDays >= 0 ? diffDays : 0} dias`;
                                    })()}
                                </p>
                            </div>
                            
                            <div className="bg-gray-800 p-2 rounded-lg">
                                <p className="text-gray-400 text-xs mb-1">Nascimento</p>
                                <p className="text-white text-sm font-semibold">
                                    {new Date(patient.dob).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                            
                            <div className="bg-gray-800 p-2 rounded-lg">
                                <p className="text-gray-400 text-xs mb-1">Admissão</p>
                                <p className="text-white text-sm font-semibold">
                                    {patient.dt_internacao ? new Date(patient.dt_internacao).toLocaleDateString('pt-BR') : '-'}
                                </p>
                            </div>
                            
                            <div className="bg-gray-800 p-2 rounded-lg">
                                <p className="text-gray-400 text-xs mb-1">Peso</p>
                                <p className="text-white text-sm font-semibold">
                                    {patient.peso ? `${patient.peso} kg` : '-'}
                                </p>
                            </div>
                            
                            <div className="bg-gray-800 p-2 rounded-lg">
                                <p className="text-gray-400 text-xs mb-1">Mãe</p>
                                <p className="text-white text-sm font-semibold truncate">
                                    {patient.mother_name || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <SbarStatusSection 
                        currentStatus={status} 
                        onStatusChange={setStatus}
                    />

                    {/* Suportes Ventilatórios */}
                    <SuportesVentilatoriosSection patientId={patient.id} />

                    {/* Comorbidades */}
                    <ComorbidadesSection patientId={patient.id} />

                    {/* Editor de Diagnósticos */}
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                        <h3 className="text-lg font-bold text-white mb-4">S - Situação</h3>
                        <DiagnosticsEditor patientId={patient.id} />
                    </div>
                    {/* Background Editor - Medicações, Dispositivos, Culturas, Procedimentos */}
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                        <h3 className="text-lg font-bold text-white mb-4">B - Breve Histórico</h3>
                        <BackgroundEditor patientId={patient.id} />
                    </div>

                    <AssessmentPlan
                        morning={assessmentMorning}
                        afternoon={assessmentAfternoon}
                        night={assessmentNight}
                        currentUserId={CURRENT_USER_ID}
                        currentUserName={currentUserName}
                        roundId={currentRoundId || undefined}
                        patientId={patient.id}
                        shiftStatus={assessmentStatus}
                        selectedShift={selectedShift}
                        onShiftChange={setSelectedShift}
                        onMorningChange={(key, value) => 
                            setAssessmentMorning({ ...assessmentMorning, [key]: value })
                        }
                        onAfternoonChange={(key, value) => 
                            setAssessmentAfternoon({ ...assessmentAfternoon, [key]: value })
                        }
                        onNightChange={(key, value) => 
                            setAssessmentNight({ ...assessmentNight, [key]: value })
                        }
                        onSaved={(message) => setSaveMessage({ type: message.includes('✅') ? 'success' : 'error', text: message })}
                    />

                    {/* Alertas do Paciente */}
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                        <AlertasDisplay patientId={patient.id} alertas={alertas} />
                    </div>

                    {/* Recomendação / Plano */}
                    <RecommendationPlan
                        morning={recommendationMorning}
                        afternoon={recommendationAfternoon}
                        night={recommendationNight}
                        currentUserId={CURRENT_USER_ID}
                        currentUserName={currentUserName}
                        roundId={currentRoundId || undefined}
                        patientId={patient.id}
                        shiftStatus={recommendationStatus}
                        selectedShift={selectedShift}
                        onShiftChange={setSelectedShift}
                        onMorningChange={(key, value) => 
                            setRecommendationMorning({ ...recommendationMorning, [key]: value })
                        }
                        onAfternoonChange={(key, value) => 
                            setRecommendationAfternoon({ ...recommendationAfternoon, [key]: value })
                        }
                        onNightChange={(key, value) => 
                            setRecommendationNight({ ...recommendationNight, [key]: value })
                        }
                        onSaved={(message) => setSaveMessage({ type: message.includes('✅') ? 'success' : 'error', text: message })}
                    />

                    {/* Botão Unificado para Salvar Avaliação e Recomendação */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSaveAssessmentAndRecommendation}
                            disabled={saving}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center gap-2 text-lg"
                        >
                            {saving ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <span>💾</span>
                                    Salvar SBAR
                                </>
                            )}
                        </button>
                    </div>

                    {/* Mensagem de status */}
                    {saveMessage && (
                        <div className={`p-4 rounded-lg font-semibold text-white ${
                            saveMessage.type === 'success' 
                                ? 'bg-green-500' 
                                : 'bg-red-500'
                        }`}>
                            {saveMessage.text}
                        </div>
                    )}
                </div>
            </main>
            <BottomNavBar onNavigate={onNavigate} currentPage={currentPage} />
            <SbarFooter onBack={onBack} />
        </div>
    );
}

export default SbarReportPage;
