
import React from 'react';
import { HistoryItemData } from '../../types';
import { HISTORY_STATUS_CONFIG } from '../../utils/constants';
import { Patient } from '../patients/PatientCard';

interface ReportDetailContentProps {
    report: HistoryItemData;
    patient: Patient;
}

const Section: React.FC<{ title: string; children: React.ReactNode; icon?: string }> = ({ title, children, icon }) => (
    <div className="overflow-hidden mb-6 print:mb-4">
        <div className="p-3 bg-gray-800 print:bg-white print:border-b print:border-gray-300">
            <h3 className="text-white print:text-black text-base font-bold flex items-center gap-2">
                {icon && <span className="material-symbols-outlined text-xl print:text-gray-700">{icon}</span>}
                {title}
            </h3>
        </div>
        <div className="p-4 text-gray-300 print:text-black text-sm leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

const ShiftContent: React.FC<{ shift: string; content: string; emoji: string }> = ({ shift, content, emoji }) => {
    if (!content) return null;
    return (
        <div className="bg-gray-900 p-3 print:bg-white print:border print:border-gray-200">
            <h4 className="font-semibold text-blue-400 print:text-gray-700 mb-2 flex items-center gap-2">
                <span>{emoji}</span>
                {shift}
            </h4>
            <p className="whitespace-pre-wrap text-gray-300 print:text-black">{content}</p>
        </div>
    );
};

const ReportDetailContent: React.FC<ReportDetailContentProps> = ({ report, patient }) => {
    const config = HISTORY_STATUS_CONFIG[report.status];

    return (
        <div className="flex flex-col bg-gray-900 print:bg-white min-h-screen">
            {/* Cabeçalho Institucional - Apenas na impressão */}
            <div className="hidden print:block bg-white p-4 text-center border-b-4 border-teal-500">
                <div className="flex justify-center items-center gap-6 mb-3">
                    <div className="text-teal-600 font-bold text-sm">INSTITUTO ACQUA</div>
                    <div className="text-yellow-500 font-bold text-sm">GOVERNO DO MARANHÃO</div>
                    <div className="text-gray-700 font-bold text-sm">SES</div>
                </div>
                <h1 className="text-teal-600 text-2xl font-bold mb-1">Hospital Infantil Dr. Juvêncio Mattos</h1>
                <p className="text-gray-600 text-sm">Rua São Pantaleão S/N - Centro</p>
                <p className="text-gray-600 text-sm">São Luís - MA - CEP: 6505-460</p>
            </div>

            <div className="flex-1 p-4 print:p-6 print:bg-white">
                {/* Botão Imprimir - Visível apenas em mobile/tablet */}
                <div className="mb-4 sm:hidden print:hidden">
                    <button 
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        onClick={() => window.print()}
                    >
                        <span className="material-symbols-outlined">print</span>
                        <span>Imprimir Relatório</span>
                    </button>
                </div>

                {/* Card com informações do Paciente */}
                <div className="flex flex-col gap-2 bg-gray-800 print:bg-white print:border print:border-gray-300 p-4 mb-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400 print:text-gray-700">person</span>
                        <p className="text-lg font-bold text-white print:text-black">{patient.name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 print:text-gray-700">
                        <span className="material-symbols-outlined text-base print:text-gray-700">bed</span>
                        <p className="text-gray-300 print:text-black">Leito: {patient.bed_number}</p>
                    </div>
                </div>
                
                {/* Card de Status */}
                <div className="flex flex-col gap-3 bg-gray-800 print:bg-white print:border print:border-gray-300 p-4 mb-6">
                    <div className="flex items-center gap-2">
                         <span className={`material-symbols-outlined ${config.textColor} print:text-gray-700`}>{config.icon}</span>
                         <p className={`text-lg font-bold ${config.textColor} print:text-black`}>{report.status}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 print:text-gray-700">
                        <span className="material-symbols-outlined text-base print:text-gray-700">person</span>
                        <p className="text-gray-300 font-medium print:text-black">Médico: {report.author}</p>
                    </div>
                </div>

                {/* A - Assessment */}
                <Section title="A - Assessment (Avaliação)" icon="assessment">
                    <ShiftContent shift="Manhã" content={report.sbar.assessment.morning} emoji="🌅" />
                    <ShiftContent shift="Tarde" content={report.sbar.assessment.afternoon} emoji="☀️" />
                    <ShiftContent shift="Noite" content={report.sbar.assessment.night} emoji="🌙" />
                    {!report.sbar.assessment.morning && !report.sbar.assessment.afternoon && !report.sbar.assessment.night && (
                        <p className="text-gray-500 print:text-gray-600 italic">Nenhuma avaliação registrada</p>
                    )}
                </Section>

                {/* R - Recomendação */}
                <Section title="R - Recomendação / Plano" icon="assignment">
                    <ShiftContent shift="Manhã" content={report.sbar.recommendation.morning} emoji="🌅" />
                    <ShiftContent shift="Tarde" content={report.sbar.recommendation.afternoon} emoji="☀️" />
                    <ShiftContent shift="Noite" content={report.sbar.recommendation.night} emoji="🌙" />
                    {!report.sbar.recommendation.morning && !report.sbar.recommendation.afternoon && !report.sbar.recommendation.night && (
                        <p className="text-gray-500 print:text-gray-600 italic">Nenhuma recomendação registrada</p>
                    )}
                </Section>
            </div>
        </div>
    );
};

export default ReportDetailContent;
