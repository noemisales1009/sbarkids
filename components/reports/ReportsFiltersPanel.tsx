import React from 'react';
import { Patient } from '../../types';

interface ReportsFiltersPanelProps {
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  dateFilter: string;
  setDateFilter: (v: string) => void;
  selectedPatientIds: Set<string>;
  patientSearch: string;
  setPatientSearch: (v: string) => void;
  patientDropdownOpen: boolean;
  setPatientDropdownOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  uniquePatients: Patient[];
  filteredUniquePatients: Patient[];
  toggleAllPatients: () => void;
  togglePatientSelection: (id: string) => void;
}

const ReportsFiltersPanel: React.FC<ReportsFiltersPanelProps> = ({
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  selectedPatientIds,
  patientSearch,
  setPatientSearch,
  patientDropdownOpen,
  setPatientDropdownOpen,
  uniquePatients,
  filteredUniquePatients,
  toggleAllPatients,
  togglePatientSelection,
}) => (
  <div className="flex flex-col gap-3 bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
          Filtrar por Status
        </label>
        <select
          className="w-full h-11 rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos os Status</option>
          <option value="estavel">Estável</option>
          <option value="instavel">Instável</option>
          <option value="em_risco">Em risco</option>
        </select>
      </div>
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
          Filtrar por Data
        </label>
        <input
          type="date"
          className="w-full h-11 rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>
    </div>

    <div className="relative">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
        Filtrar por Paciente
      </label>
      <button
        type="button"
        onClick={() => setPatientDropdownOpen((v) => !v)}
        className="w-full h-11 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-left text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <span>
          {selectedPatientIds.size === 0
            ? 'Todos os pacientes'
            : `${selectedPatientIds.size} paciente(s) selecionado(s)`}
        </span>
        <span className="text-gray-400">{patientDropdownOpen ? '▲' : '▼'}</span>
      </button>

      {patientDropdownOpen && (
        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Buscar paciente por nome..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {uniquePatients.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">Nenhum paciente disponível</div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={toggleAllPatients}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-primary hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
                >
                  {selectedPatientIds.size === filteredUniquePatients.length && filteredUniquePatients.length > 0
                    ? 'Desmarcar todos'
                    : 'Selecionar todos'}
                </button>
                {filteredUniquePatients.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center">Nenhum paciente encontrado</div>
                ) : (
                  filteredUniquePatients.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPatientIds.has(p.id)}
                        onChange={() => togglePatientSelection(p.id)}
                        className="h-4 w-4 appearance-auto accent-primary"
                      />
                      <span className="text-gray-900 dark:text-white flex-1">{p.name}</span>
                      {p.bed_number != null && (
                        <span className="text-xs text-gray-500">Leito {p.bed_number}</span>
                      )}
                    </label>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default ReportsFiltersPanel;
