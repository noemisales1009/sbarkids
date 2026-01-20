
import React from 'react';
import { HistoryItemData, HistoryStatus } from '../../types';
import { HISTORY_STATUS_CONFIG } from '../../utils/constants';

interface HistoryItemProps {
    item: HistoryItemData;
    onSelectReport: (report: HistoryItemData) => void;
    selectable?: boolean;
    selected?: boolean;
    onToggleSelect?: (e: React.MouseEvent) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onSelectReport, selectable = false, selected = false, onToggleSelect }) => {
    const config = HISTORY_STATUS_CONFIG[item.status];
    
    // Determinar cor da borda baseado no status real (estavel/instavel/em_risco)
    const getBorderColor = () => {
        // Mapear status exibido para status real do banco
        if (item.status === 'Normal') return 'border-green-500'; // estavel
        if (item.status === 'Urgente') return 'border-yellow-500'; // instavel
        if (item.status === 'Atenção') return 'border-red-500'; // em_risco
        return 'border-gray-300 dark:border-gray-600'; // padrão
    };

    return (
        <div 
            className={`flex cursor-pointer items-center gap-2 sm:gap-3 lg:gap-4 rounded-lg bg-white p-2 sm:p-3 lg:p-4 shadow-sm transition-all hover:bg-gray-50 dark:bg-gray-800/50 dark:hover:bg-gray-800 border-2 ${selected ? 'border-primary ring-1 ring-primary' : getBorderColor()}`}
            onClick={() => onSelectReport(item)}
        >
            {selectable && (
                <div className="shrink-0" onClick={(e) => { e.stopPropagation(); onToggleSelect && onToggleSelect(e); }}>
                    <div className={`flex items-center justify-center size-5 sm:size-6 rounded border ${selected ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                        {selected && <span className="material-symbols-outlined text-white text-sm sm:text-base">check</span>}
                    </div>
                </div>
            )}

            <div className={`flex shrink-0 items-center justify-center rounded-lg size-10 sm:size-12 lg:size-14 ${config.bgColor}`}>
                <span className={`material-symbols-outlined ${config.textColor}`} style={{ fontSize: 'clamp(20px, 5vw, 28px)' }}>{config.icon}</span>
            </div>
            <div className="flex flex-1 flex-col justify-center min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                    <div className="min-w-0">
                        {item.patientName && (
                             <p className="text-xs sm:text-sm font-bold text-primary mb-0.5 truncate">{item.patientName}</p>
                        )}
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">{item.datetime}</p>
                    </div>
                </div>
                <p className={`text-xs sm:text-sm font-normal ${config.textColor} mt-1 hidden sm:block`}>Status: {item.status}</p>
                <p className="mt-1 text-xs sm:text-sm font-normal text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>
            </div>
            <div className="shrink-0 hidden sm:block">
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500" style={{ fontSize: '20px' }}>chevron_right</span>
            </div>
        </div>
    );
};

export default HistoryItem;
