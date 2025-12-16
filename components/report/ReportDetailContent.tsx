
import React from 'react';
import { HistoryItemData } from '../../types';
import { HISTORY_STATUS_CONFIG } from '../../utils/constants';

interface ReportDetailContentProps {
    report: HistoryItemData;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-900/70 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <h3 className="p-3 sm:p-4 text-gray-900 dark:text-white text-sm sm:text-base font-semibold leading-normal border-b border-slate-200 dark:border-slate-800">{title}</h3>
        <div className="p-3 sm:p-4 text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed space-y-2">
            {children}
        </div>
    </div>
);

const ShiftContent: React.FC<{ shift: string; content: string }> = ({ shift, content }) => {
    if (!content) return null;
    return (
        <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{shift}</h4>
            <p>{content}</p>
        </div>
    );
};

const ReportDetailContent: React.FC<ReportDetailContentProps> = ({ report }) => {
    const config = HISTORY_STATUS_CONFIG[report.status];

    return (
        <div className="p-3 sm:p-4 lg:p-6 flex flex-col gap-3 sm:gap-4 lg:gap-6">
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Status do Relatório</p>
                <div className="flex items-center gap-2">
                     <span className={`material-symbols-outlined ${config.textColor}`}>{config.icon}</span>
                     <p className={`text-base sm:text-lg font-bold ${config.textColor}`}>{report.status}</p>
                </div>
                 <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">Registrado por</p>
                 <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">{report.author}</p>
            </div>
            
            <Section title="S - Situação">
                <p>{report.sbar.situation}</p>
            </Section>

            <Section title="B - Breve Histórico">
                <p>{report.sbar.background}</p>
            </Section>

            <Section title="A - Assessment (Avaliação)">
                <ShiftContent shift="Manhã" content={report.sbar.assessment.morning} />
                <ShiftContent shift="Tarde" content={report.sbar.assessment.afternoon} />
                <ShiftContent shift="Noite" content={report.sbar.assessment.night} />
            </Section>

            <Section title="R - Recomendação">
                <ShiftContent shift="Manhã" content={report.sbar.recommendation.morning} />
                <ShiftContent shift="Tarde" content={report.sbar.recommendation.afternoon} />
                <ShiftContent shift="Noite" content={report.sbar.recommendation.night} />
            </Section>
        </div>
    );
};

export default ReportDetailContent;
