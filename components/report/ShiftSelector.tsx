import React from 'react';

interface ShiftSelectorProps {
  selectedShifts: {
    morning: boolean;
    afternoon: boolean;
    night: boolean;
  };
  onShiftToggle: (shift: 'morning' | 'afternoon' | 'night') => void;
  onPrint: () => void;
}

const ShiftSelector: React.FC<ShiftSelectorProps> = ({ selectedShifts, onShiftToggle, onPrint }) => {
  return (
    <div className="mb-6 print:hidden">
      <div className="bg-gray-800 rounded-lg p-4 space-y-4">
        <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined">schedule</span>
          Selecione os Turnos para Imprimir
        </h3>
        
        <div className="grid grid-cols-3 gap-2">
          {/* Manhã */}
          <label className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
            <input
              type="checkbox"
              checked={selectedShifts.morning}
              onChange={() => onShiftToggle('morning')}
              className="w-4 h-4 rounded accent-blue-500"
            />
            <span className="text-white font-medium text-sm">🌅 Manhã</span>
          </label>

          {/* Tarde */}
          <label className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
            <input
              type="checkbox"
              checked={selectedShifts.afternoon}
              onChange={() => onShiftToggle('afternoon')}
              className="w-4 h-4 rounded accent-blue-500"
            />
            <span className="text-white font-medium text-sm">☀️ Tarde</span>
          </label>

          {/* Noite */}
          <label className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
            <input
              type="checkbox"
              checked={selectedShifts.night}
              onChange={() => onShiftToggle('night')}
              className="w-4 h-4 rounded accent-blue-500"
            />
            <span className="text-white font-medium text-sm">🌙 Noite</span>
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            onClick={onPrint}
          >
            <span className="material-symbols-outlined">print</span>
            <span>Imprimir Selecionados</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftSelector;
