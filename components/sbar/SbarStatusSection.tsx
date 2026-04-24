import React from 'react';

type PatientStatus = 'estavel' | 'instavel' | 'em_risco';

const statusConfig: Record<PatientStatus, {
    label: string;
    dot: string;
    badge: string;
    border: string;
    glow: string;
}> = {
    estavel:  { label: 'Estável',  dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 text-emerald-300', border: 'border-emerald-500/40', glow: 'shadow-emerald-500/20' },
    instavel: { label: 'Instável', dot: 'bg-amber-400',   badge: 'bg-amber-500/10 text-amber-300',     border: 'border-amber-500/40',   glow: 'shadow-amber-500/20' },
    em_risco: { label: 'Em Risco', dot: 'bg-red-400',     badge: 'bg-red-500/10 text-red-300',         border: 'border-red-500/40',     glow: 'shadow-red-500/20' },
};

interface SbarStatusSectionProps {
    currentStatus: PatientStatus | null;
}

const SbarStatusSection: React.FC<SbarStatusSectionProps> = ({ currentStatus }) => {
    const config = currentStatus ? statusConfig[currentStatus] : null;

    return (
        <div className={`rounded-xl border bg-gray-900/60 overflow-hidden ${config ? config.border : 'border-gray-800'}`}>
            <p className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                Status do Paciente
            </p>
            <div className="px-4 py-4 flex items-center gap-3">
                {config ? (
                    <>
                        <span className="relative flex h-3 w-3 shrink-0">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${config.dot}`} />
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${config.dot}`} />
                        </span>
                        <span className={`text-lg font-bold ${config.badge.split(' ')[1]}`}>
                            {config.label}
                        </span>
                    </>
                ) : (
                    <span className="text-sm text-gray-500">Não definido</span>
                )}
            </div>
        </div>
    );
};

export default SbarStatusSection;