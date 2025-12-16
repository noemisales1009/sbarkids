
import React from 'react';

interface SbarSectionProps {
    title: string;
    placeholder: string;
    value: string;
    onValueChange: (value: string) => void;
    isReadOnly?: boolean;
    authorName?: string | null;
    updatedAt?: string | null;
}

const SbarSection: React.FC<SbarSectionProps> = ({ 
    title, 
    placeholder, 
    value, 
    onValueChange,
    isReadOnly = false,
    authorName,
    updatedAt
}) => {
    return (
        <div className={`flex flex-col rounded-xl border ${isReadOnly ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800">
                <p className="text-gray-900 dark:text-white text-sm sm:text-base font-medium leading-normal">{title}</p>
                
                {/* Exibição de autoria para campos colaborativos ou somente leitura */}
                {authorName && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-xs sm:text-sm">history</span>
                        <div className="flex flex-col sm:flex-row sm:gap-1 text-xs text-slate-600 dark:text-slate-300">
                            <span className="font-semibold truncate">{authorName}</span>
                            {updatedAt && (
                                <>
                                    <span className="hidden sm:inline text-slate-400">•</span>
                                    <span className="font-normal text-slate-500 dark:text-slate-400 text-xs">{updatedAt}</span>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="p-3 sm:p-4">
                <label className="flex flex-col w-full">
                    <textarea
                        className={`form-input flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 border focus:border-primary min-h-24 sm:min-h-28 lg:min-h-32 text-sm sm:text-base font-normal leading-normal transition-colors
                            ${isReadOnly 
                                ? 'bg-transparent border-transparent cursor-not-allowed resize-none text-slate-600 dark:text-slate-400 pl-0' 
                                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary placeholder:text-gray-500 dark:placeholder:text-gray-400 p-2 sm:p-3'
                            }`}
                        placeholder={isReadOnly ? "Sem informações registradas." : placeholder}
                        value={value}
                        onChange={(e) => !isReadOnly && onValueChange(e.target.value)}
                        readOnly={isReadOnly}
                    ></textarea>
                </label>
            </div>
        </div>
    );
};

export default SbarSection;
