import React from 'react';

interface SbarReadonlySectionProps {
    title: string;
    content: string;
}

const SbarReadonlySection: React.FC<SbarReadonlySectionProps> = ({ title, content }) => {
    return (
        <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <p className="text-gray-900 dark:text-white text-base font-medium leading-normal">{title}</p>
                <span className="inline-flex items-center rounded-md bg-gray-200 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-500/10">
                    Registro Base
                </span>
            </div>
            <div className="p-4">
                <p className="text-gray-700 dark:text-gray-300 text-base font-normal leading-relaxed">
                    {content || "Sem informações registradas."}
                </p>
            </div>
        </div>
    );
};

export default SbarReadonlySection;