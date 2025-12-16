
import React from 'react';

const ReportDetailFooter: React.FC = () => {
    return (
        <footer className="fixed bottom-0 z-10 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-1 gap-3 flex-wrap justify-stretch">
                <button 
                    className="flex flex-1 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary/20 text-primary text-base font-bold leading-normal tracking-[0.015em] gap-2 transition-colors hover:bg-primary/30"
                    onClick={() => window.print()}
                >
                    <span className="material-symbols-outlined">print</span>
                    <span className="truncate">Imprimir</span>
                </button>
                <button className="flex flex-1 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] gap-2 transition-colors hover:bg-primary/90">
                    <span className="material-symbols-outlined">content_copy</span>
                    <span className="truncate">Usar como Base</span>
                </button>
            </div>
        </footer>
    );
};

export default ReportDetailFooter;