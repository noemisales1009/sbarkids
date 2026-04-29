import React, { useState, useEffect } from 'react';
import { CurrentPage, Patient } from '../types';
import { GlobalReportItem } from '../types/reports';
import BottomNavBar from '../components/patients/BottomNavBar';
import DesktopLayout from '../components/layout/DesktopLayout';
import ReportsFiltersPanel from '../components/reports/ReportsFiltersPanel';
import ReportCard from '../components/reports/ReportCard';
import PrintableContent from '../components/reports/PrintableContent';
import { supabase } from '../lib/supabase';
import { alertasService, Alerta } from '../services/alertasService';
import { useToast } from '../components/Toast';
import { buildReportHtml, openPrintWindow } from '../utils/reportPrintUtils';

interface ReportsPageProps {
  onNavigate: (page: CurrentPage) => void;
  currentPage: CurrentPage;
  onSelectReportContext?: (patient: Patient, report: any) => void;
}

const CACHE_TIME = 120000;
const PAGE_SIZE = 20;

const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate, currentPage }) => {
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedPatientIds, setSelectedPatientIds] = useState<Set<string>>(new Set());
  const [patientSearch, setPatientSearch] = useState('');
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [reports, setReports] = useState<GlobalReportItem[]>([]);
  const [alertasPorPaciente, setAlertasPorPaciente] = useState<Record<string, Alerta[]>>({});
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(0);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const now = Date.now();
    if (reports.length === 0 || now - lastFetch > CACHE_TIME) {
      loadReports();
    } else {
      setLoading(false);
    }
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setLastFetch(Date.now());

      const { data: roundsData, error } = await supabase
        .from('clinical_rounds_simple')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      if (!roundsData || roundsData.length === 0) {
        setReports([]);
        setLoading(false);
        return;
      }

      const patientIds = [...new Set(roundsData.map((r) => r.patient_id))];
      const { data: patientsData } = await supabase
        .from('patients')
        .select('*')
        .in('id', patientIds)
        .is('archived_at', null);

      const patientMap = new Map(patientsData?.map((p) => [p.id, p]) || []);

      const allReports: GlobalReportItem[] = roundsData
        .map((round: any) => {
          const patient = patientMap.get(round.patient_id);
          if (!patient) return null;

          const datetime = new Date(round.created_at).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          });

          const author =
            round.assessment_morning_saved_by_name ||
            round.assessment_afternoon_saved_by_name ||
            round.assessment_night_saved_by_name ||
            round.recommendation_morning_saved_by_name ||
            round.recommendation_afternoon_saved_by_name ||
            round.recommendation_night_saved_by_name ||
            'Não informado';

          return {
            id: round.id,
            patient: patient as Patient,
            datetime,
            status: patient.status || 'estavel',
            author,
            assessment: {
              morning: round.assessment_morning || '',
              afternoon: round.assessment_afternoon || '',
              night: round.assessment_night || '',
            },
            assessmentBy: {
              morning: round.assessment_morning_saved_by_name || '',
              afternoon: round.assessment_afternoon_saved_by_name || '',
              night: round.assessment_night_saved_by_name || '',
            },
            recommendation: {
              morning: round.recommendation_morning || '',
              afternoon: round.recommendation_afternoon || '',
              night: round.recommendation_night || '',
            },
            recommendationBy: {
              morning: round.recommendation_morning_saved_by_name || '',
              afternoon: round.recommendation_afternoon_saved_by_name || '',
              night: round.recommendation_night_saved_by_name || '',
            },
          };
        })
        .filter((item): item is GlobalReportItem => item !== null);

      setReports(allReports);

      const uniquePatientIds = [...new Set(allReports.map((r) => r.patient.id))];
      const alertasResults = await Promise.all(
        uniquePatientIds.map((id) => alertasService.getAlertas(id).catch(() => [] as Alerta[])),
      );
      const alertasMap: Record<string, Alerta[]> = {};
      uniquePatientIds.forEach((id, i) => { alertasMap[id] = alertasResults[i]; });
      setAlertasPorPaciente(alertasMap);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = React.useMemo(() => reports.filter((item) => {
    const itemStatus = (item.status || '').toLowerCase();
    const matchesStatus = statusFilter ? itemStatus === statusFilter.toLowerCase() : true;
    const itemDate = item.datetime.split(',')[0].trim();
    const filterDate = dateFilter ? dateFilter.split('-').reverse().join('/') : '';
    const matchesDate = filterDate ? itemDate === filterDate : true;
    const matchesPatient = selectedPatientIds.size === 0 || selectedPatientIds.has(item.patient.id);
    return matchesStatus && matchesDate && matchesPatient;
  }), [reports, statusFilter, dateFilter, selectedPatientIds]);

  // Resetar paginação quando filtros mudam
  React.useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [statusFilter, dateFilter, selectedPatientIds]);

  const visibleReports = filteredReports.slice(0, displayCount);
  const hasMore = displayCount < filteredReports.length;

  const uniquePatients = React.useMemo(() => {
    const map = new Map<string, Patient>();
    for (const r of reports) {
      if (!map.has(r.patient.id)) map.set(r.patient.id, r.patient);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [reports]);

  const filteredUniquePatients = React.useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    return q ? uniquePatients.filter((p) => p.name.toLowerCase().includes(q)) : uniquePatients;
  }, [uniquePatients, patientSearch]);

  const togglePatientSelection = (id: string) => {
    const next = new Set(selectedPatientIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedPatientIds(next);
  };

  const toggleAllPatients = () => {
    if (selectedPatientIds.size === filteredUniquePatients.length && filteredUniquePatients.length > 0) {
      setSelectedPatientIds(new Set());
    } else {
      setSelectedPatientIds(new Set(filteredUniquePatients.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedReports);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedReports(next);
  };

  const toggleSelectAll = () => {
    if (selectedReports.size === filteredReports.length) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(filteredReports.map((r) => r.id)));
    }
  };

  const handlePrint = () => {
    if (selectedReports.size === 0) {
      showToast('Selecione pelo menos um relatório para imprimir.', 'warning');
      return;
    }
    const items = filteredReports.filter((r) => selectedReports.has(r.id));
    const body = items
      .map((item, idx) => buildReportHtml(item, idx === items.length - 1, alertasPorPaciente))
      .join('');
    openPrintWindow(body);
  };

  const content = (
    <div className="flex flex-col gap-4 screen-only">
      <ReportsFiltersPanel
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        selectedPatientIds={selectedPatientIds}
        patientSearch={patientSearch}
        setPatientSearch={setPatientSearch}
        patientDropdownOpen={patientDropdownOpen}
        setPatientDropdownOpen={setPatientDropdownOpen}
        uniquePatients={uniquePatients}
        filteredUniquePatients={filteredUniquePatients}
        toggleAllPatients={toggleAllPatients}
        togglePatientSelection={togglePatientSelection}
      />

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedReports.size === filteredReports.length && filteredReports.length > 0}
            onChange={toggleSelectAll}
            className="rounded border-gray-300 text-primary focus:ring-primary size-5"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedReports.size} selecionado(s)
          </span>
        </div>
        <button
          onClick={handlePrint}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow transition-colors ${
            selectedReports.size > 0
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-lg">print</span>
          Imprimir Seleção
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando relatórios...</p>
          </div>
        ) : filteredReports.length > 0 ? (
          <>
            {visibleReports.map((item) => (
              <ReportCard
                key={item.id}
                item={item}
                isSelected={selectedReports.has(item.id)}
                alertas={alertasPorPaciente[item.patient.id] || []}
                onToggle={() => toggleSelect(item.id)}
              />
            ))}
            {hasMore && (
              <button
                onClick={() => setDisplayCount((c) => c + PAGE_SIZE)}
                className="w-full py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Carregar mais ({filteredReports.length - displayCount} restantes)
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2">filter_list_off</span>
            <p>Nenhum relatório encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <PrintableContent
        items={filteredReports.filter((r) => selectedReports.has(r.id))}
        alertasPorPaciente={alertasPorPaciente}
      />

      {/* Mobile */}
      <div className="w-full overflow-x-hidden sm:hidden bg-background-light dark:bg-background-dark min-h-screen screen-only">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-background-light/80 p-4 pb-3 backdrop-blur-sm dark:bg-background-dark/80 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Todos os Relatórios</h1>
          <div className="size-8" />
        </header>
        <main className="grow px-4 pt-4 pb-28">{content}</main>
        <BottomNavBar onNavigate={onNavigate} currentPage={currentPage} />
      </div>

      {/* Desktop */}
      <div className="screen-only w-full">
        <DesktopLayout currentPage={currentPage} onNavigate={onNavigate}>
          <div className="screen-only">
            <header className="pb-5 border-b border-slate-200 dark:border-slate-800 mb-6">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Relatórios Gerais</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Visualize, selecione e imprima os SBARs de todos os pacientes.
              </p>
            </header>
            {content}
          </div>
        </DesktopLayout>
      </div>
    </>
  );
};

export default ReportsPage;
