
import React from 'react';

const ReportDetailFooter: React.FC = () => {
    return (
        <>
            <footer className="fixed bottom-0 z-10 w-full bg-gray-900 backdrop-blur-sm p-4 border-t border-gray-800 print:hidden">
                <div className="flex justify-center">
                    <button 
                        className="flex min-w-50 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold leading-normal tracking-[0.015em] gap-2 transition-colors"
                        onClick={() => window.print()}
                    >
                        <span className="material-symbols-outlined">print</span>
                        <span className="truncate">Imprimir</span>
                    </button>
                </div>
            </footer>
            
            {/* Rodapé SBAR KIDS - Apenas na impressão */}
            <div className="hidden print:block bg-white p-4 text-center border-t-2 border-gray-300">
                <p className="text-teal-600 text-lg font-bold">SBAR KIDS</p>
            </div>
        </>
    );
};

export default ReportDetailFooter;