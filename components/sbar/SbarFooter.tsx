
import React from 'react';

interface SbarFooterProps {
    onBack: () => void;
}

const SbarFooter: React.FC<SbarFooterProps> = ({ onBack }) => {
    return (
        <footer className="sticky bottom-0 z-10 mt-auto bg-background-light dark:bg-background-dark p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-1 gap-3 flex-wrap justify-stretch">
                <button 
                    className="flex flex-1 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white text-base font-bold leading-normal tracking-[0.015em]"
                    onClick={onBack}
                >
                    <span className="truncate">Cancelar</span>
                </button>
                <button className="flex flex-1 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em]">
                    <span className="truncate">Salvar Relatório</span>
                </button>
            </div>
        </footer>
    );
};

export default SbarFooter;
