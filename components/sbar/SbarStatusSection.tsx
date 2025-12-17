import React from 'react';

type PatientStatus = 'estavel' | 'instavel' | 'em_risco';

const statusOptions: PatientStatus[] = ['estavel', 'instavel', 'em_risco'];

const statusConfig: Record<PatientStatus, { icon: string; bgColor: string; textColor: string; label: string; }> = {
    'estavel': { icon: 'check_circle', bgColor: 'bg-green-100', textColor: 'text-green-700', label: 'Estável' },
    'instavel': { icon: 'warning', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', label: 'Instável' },
    'em_risco': { icon: 'error', bgColor: 'bg-red-100', textColor: 'text-red-700', label: 'Em Risco' },
};

interface SbarStatusSectionProps {
    currentStatus: PatientStatus | null;
    onStatusChange: (status: PatientStatus) => void;
}

const SbarStatusSection: React.FC<SbarStatusSectionProps> = ({ currentStatus, onStatusChange }) => {
    
    const config = currentStatus ? statusConfig[currentStatus] : null;

    return (
        <div className="flex flex-col rounded-xl border border-gray-800 bg-gray-900/50">
            <p className="p-4 text-white text-base font-medium leading-normal border-b border-gray-800">Status do Paciente</p>
            <div className="p-4 space-y-4">
                <div className="w-full">
                     <select
                        value={currentStatus || ''}
                        onChange={(e) => onStatusChange(e.target.value as PatientStatus)}
                        className="form-select w-full h-11 rounded-lg border-gray-700 bg-gray-800 text-white focus:ring-primary focus:border-primary"
                    >
                        <option value="" disabled>Selecione um status</option>
                        {statusOptions.map(option => (
                            <option key={option} value={option}>{statusConfig[option].label}</option>
                        ))}
                    </select>
                </div>
                 {config && currentStatus && (
                     <div className="flex items-center gap-3 rounded-lg bg-gray-800 p-3 mt-2">
                        <div className={`flex shrink-0 items-center justify-center rounded-lg size-10 ${config.bgColor}`}>
                            <span className={`material-symbols-outlined ${config.textColor}`}>{config.icon}</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-400">Status Atual</p>
                            <p className={`text-base font-bold ${config.textColor}`}>{config.label}</p>
                        </div>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default SbarStatusSection;