
import React from 'react';

const FloatingActionButton: React.FC = () => {
    return (
        <div className="fixed bottom-24 right-4 z-20">
            <button className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg" aria-label="Adicionar Novo Paciente">
                <span className="material-symbols-outlined text-3xl">add</span>
            </button>
        </div>
    );
};

export default FloatingActionButton;
