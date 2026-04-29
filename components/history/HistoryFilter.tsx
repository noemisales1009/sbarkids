import React from 'react';

interface HistoryFilterProps {
  startDate: string;
  endDate: string;
  selectedCategories: Record<string, boolean>;
  onDateChange: (field: 'start' | 'end', value: string) => void;
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
  onGeneratePDF: () => void;
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

const HistoryFilter: React.FC<HistoryFilterProps> = ({
  startDate,
  endDate,
  selectedCategories,
  onDateChange,
  onCategoryChange,
  onClearFilters,
  onGeneratePDF
}) => {
  return (
    <div className="bg-white dark:bg-[#1A1F2E] p-4 rounded-lg mb-4 border border-gray-200 dark:border-gray-800">
      <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-4 text-sm">Filtros</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Data Inicial
          </label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onDateChange('start', e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#131722] border border-gray-300 dark:border-gray-700 rounded text-gray-800 dark:text-gray-200 text-sm px-3 py-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Data Final
          </label>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => onDateChange('end', e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#131722] border border-gray-300 dark:border-gray-700 rounded text-gray-800 dark:text-gray-200 text-sm px-3 py-2.5 focus:border-blue-500 focus:outline-none"
            />
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
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          Gerar PDF
        </button>
      </div>
    </div>
  );
};

export default HistoryFilter;
