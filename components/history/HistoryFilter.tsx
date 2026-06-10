import React from 'react';

export type PdfShift = 'all' | 'morning' | 'afternoon' | 'night';

interface HistoryFilterProps {
  startDate: string;
  endDate: string;
  selectedCategories: Record<string, boolean>;
  onDateChange: (field: 'start' | 'end', value: string) => void;
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
  onGeneratePDF: () => void;
  pdfDate: string;
  onPdfDateChange: (date: string) => void;
  pdfShift: PdfShift;
  onPdfShiftChange: (shift: PdfShift) => void;
}

export const HISTORY_CATEGORIES = [
  'Dispositivos',
  'Medicações',
  'Exames',
  'Cirúrgico',
  'Escalas',
  'Diagnósticos',
  'Diurese',
  'Balanço Hídrico',
  'Dietas',
  'Alertas',
  'Comorbidades',
  'Completações'
] as const;

export type HistoryCategory = typeof HISTORY_CATEGORIES[number];

const SHIFT_OPTIONS: { value: PdfShift; label: string }[] = [
  { value: 'all',       label: 'Todos os turnos' },
  { value: 'morning',   label: '🌅 Manhã' },
  { value: 'afternoon', label: '☀️ Tarde' },
  { value: 'night',     label: '🌙 Noite' },
];

const HistoryFilter: React.FC<HistoryFilterProps> = ({
  startDate,
  endDate,
  onDateChange,
  onClearFilters,
  onGeneratePDF,
  pdfDate,
  onPdfDateChange,
  pdfShift,
  onPdfShiftChange
}) => {
  return (
    <div className="bg-white dark:bg-[#1A1F2E] p-4 rounded-lg mb-4 border border-gray-200 dark:border-gray-800">
      <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-4 text-sm">Filtros</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Data Inicial
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onDateChange('start', e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#131722] border border-gray-300 dark:border-gray-700 rounded text-gray-800 dark:text-gray-200 text-sm px-3 py-2.5 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Data Final
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onDateChange('end', e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#131722] border border-gray-300 dark:border-gray-700 rounded text-gray-800 dark:text-gray-200 text-sm px-3 py-2.5 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Seletor de data e turno do PDF */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <label className="block text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wide">
          📄 Configurar PDF
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-blue-600 dark:text-blue-400 mb-1">Dia</label>
            <input
              type="date"
              value={pdfDate}
              max={new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })}
              onChange={(e) => onPdfDateChange(e.target.value)}
              className="w-full bg-white dark:bg-[#131722] border border-blue-300 dark:border-blue-700 rounded text-gray-800 dark:text-gray-200 text-sm px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-blue-600 dark:text-blue-400 mb-1">Turno</label>
            <select
              value={pdfShift}
              onChange={(e) => onPdfShiftChange(e.target.value as PdfShift)}
              className="w-full bg-white dark:bg-[#131722] border border-blue-300 dark:border-blue-700 rounded text-gray-800 dark:text-gray-200 text-sm px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              {SHIFT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onClearFilters}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-white/5"
        >
          Limpar Filtros
        </button>
        <button
          onClick={onGeneratePDF}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Gerar PDF
        </button>
      </div>
    </div>
  );
};

export default HistoryFilter;
