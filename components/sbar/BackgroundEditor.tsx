import React, { useState, useEffect } from 'react';
import {
  backgroundService,
  Medicacao,
  Dispositivo,
  Cultura,
  Procedimento,
  Exame,
  Dieta,
} from '../../services/backgroundService';
import { balanceHidricoService, BalancoHidrico } from '../../services/balanceHidricoService';
import { diureseService, Diurese } from '../../services/diureseService';
import { aportesService, AportesPaciente } from '../../services/aportesService';
import { scalesService, ScaleScore } from '../../services/scalesService';
import { examesImagemService } from '../../services/examesImagemService';
import { pareceresService } from '../../services/pareceresService';
import { ExameImagem, Parecer } from '../../types';

import MedicacoesTab from './background/tabs/MedicacoesTab';
import DispositivosTab from './background/tabs/DispositivosTab';
import CulturasTab from './background/tabs/CulturasTab';
import ProcedimentosTab from './background/tabs/ProcedimentosTab';
import ExamesTab from './background/tabs/ExamesTab';
import DietasTab from './background/tabs/DietasTab';
import BalancoHidricoTab from './background/tabs/BalancoHidricoTab';
import EscalasTab from './background/tabs/EscalasTab';
import AportesTab from './background/tabs/AportesTab';
import DiureseTab from './background/tabs/DiureseTab';
import PareceresTab from './background/tabs/PareceresTab';
import ExamesImagemTab from './background/tabs/ExamesImagemTab';

interface BackgroundEditorProps {
  patientId: string;
}

type ActiveTab =
  | 'medicacoes'
  | 'dispositivos'
  | 'culturas'
  | 'procedimentos'
  | 'exames'
  | 'dietas'
  | 'balancoHidrico'
  | 'diurese'
  | 'aportes'
  | 'escalas'
  | 'pareceres'
  | 'examesImagem'
  | null;

interface CategoryCardProps {
  icon: string;
  title: string;
  count: number;
  gradient: string;
  isActive: boolean;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ icon, title, count, gradient, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`relative rounded-2xl p-4 text-left text-white bg-linear-to-br ${gradient} shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl ${
      isActive ? 'ring-4 ring-white/60 scale-[1.02]' : 'ring-0'
    }`}
  >
    <div className="flex items-start justify-between mb-3">
      <span className="text-3xl drop-shadow-sm">{icon}</span>
      {count > 0 && (
        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-white/25 backdrop-blur text-white text-xs font-bold">
          {count}
        </span>
      )}
    </div>
    <p className="text-sm font-bold leading-tight">{title}</p>
  </button>
);

const CATEGORY_TITLES: Record<NonNullable<ActiveTab>, string> = {
  medicacoes: '💊 Medicações',
  dispositivos: '🔧 Dispositivos',
  culturas: '🧬 Culturas',
  procedimentos: '⚕️ Procedimentos',
  exames: '🔬 Exames',
  dietas: '🍽️ Dietas',
  balancoHidrico: '💧 Balanço Hídrico',
  diurese: '💦 Diurese',
  aportes: '💉 Aportes',
  escalas: '📊 Escalas',
  pareceres: '📋 Pareceres',
  examesImagem: '📷 Imagem',
};

const BackgroundEditor: React.FC<BackgroundEditorProps> = ({ patientId }) => {
  const [medicacoes, setMedicacoes] = useState<Medicacao[]>([]);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [culturas, setCulturas] = useState<Cultura[]>([]);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [exames, setExames] = useState<Exame[]>([]);
  const [dietas, setDietas] = useState<Dieta[]>([]);
  const [balanceHidrico, setBalanceHidrico] = useState<BalancoHidrico[]>([]);
  const [diurese, setDiurese] = useState<Diurese[]>([]);
  const [aportes, setAportes] = useState<AportesPaciente[]>([]);
  const [scaleScores, setScaleScores] = useState<ScaleScore[]>([]);
  const [pareceres, setPareceres] = useState<Parecer[]>([]);
  const [examesImagem, setExamesImagem] = useState<ExameImagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>(null);

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meds, devs, cults, procs, exs, diets, bhidricos, diur, aports, scales, parecsList, exImgList] =
        await Promise.all([
          backgroundService.getMedicacoes(patientId),
          backgroundService.getDispositivos(patientId),
          backgroundService.getCulturas(patientId),
          backgroundService.getProcedimentos(patientId),
          backgroundService.getExames(patientId),
          backgroundService.getDietas(patientId),
          balanceHidricoService.getBalanceHidrico(patientId),
          diureseService.getDiurese(patientId),
          aportesService.getAportes(patientId),
          scalesService.getScaleScores(patientId),
          pareceresService.getAll(patientId).catch(() => [] as Parecer[]),
          examesImagemService.getAll(patientId).catch(() => [] as ExameImagem[]),
        ]);

      setMedicacoes(meds);
      setDispositivos(devs);
      setCulturas(cults);
      setProcedimentos(procs);
      setExames(exs);
      setDietas(diets);
      setBalanceHidrico(bhidricos);
      setDiurese(diur);
      setAportes(aports);
      setScaleScores(scales);
      setPareceres(parecsList);
      setExamesImagem(exImgList);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-4 bg-gray-200 dark:bg-gray-700 animate-pulse h-[88px]" />
          ))
        ) : (
          <>
            <CategoryCard icon="💊" title="Medicações" count={medicacoes.length} gradient="from-blue-500 to-blue-700" isActive={activeTab === 'medicacoes'} onClick={() => setActiveTab('medicacoes')} />
            <CategoryCard icon="🔧" title="Dispositivos" count={dispositivos.length} gradient="from-emerald-500 to-green-700" isActive={activeTab === 'dispositivos'} onClick={() => setActiveTab('dispositivos')} />
            <CategoryCard icon="🧬" title="Culturas" count={culturas.length} gradient="from-purple-500 to-fuchsia-700" isActive={activeTab === 'culturas'} onClick={() => setActiveTab('culturas')} />
            <CategoryCard icon="⚕️" title="Procedimentos" count={procedimentos.length} gradient="from-orange-500 to-red-600" isActive={activeTab === 'procedimentos'} onClick={() => setActiveTab('procedimentos')} />
            <CategoryCard icon="🔬" title="Exames" count={exames.length} gradient="from-teal-500 to-cyan-700" isActive={activeTab === 'exames'} onClick={() => setActiveTab('exames')} />
            <CategoryCard icon="🍽️" title="Dietas" count={dietas.length} gradient="from-amber-500 to-yellow-600" isActive={activeTab === 'dietas'} onClick={() => setActiveTab('dietas')} />
            <CategoryCard icon="💧" title="Balanço Hídrico" count={balanceHidrico.length} gradient="from-sky-500 to-blue-700" isActive={activeTab === 'balancoHidrico'} onClick={() => setActiveTab('balancoHidrico')} />
            <CategoryCard icon="💦" title="Diurese" count={diurese.length} gradient="from-pink-500 to-rose-700" isActive={activeTab === 'diurese'} onClick={() => setActiveTab('diurese')} />
            <CategoryCard icon="💉" title="Aportes" count={aportes.length} gradient="from-indigo-500 to-violet-700" isActive={activeTab === 'aportes'} onClick={() => setActiveTab('aportes')} />
            <CategoryCard icon="📊" title="Escalas" count={scaleScores.length} gradient="from-violet-500 to-purple-700" isActive={activeTab === 'escalas'} onClick={() => setActiveTab('escalas')} />
            <CategoryCard icon="📋" title="Pareceres" count={pareceres.length} gradient="from-pink-500 to-red-500" isActive={activeTab === 'pareceres'} onClick={() => setActiveTab('pareceres')} />
            <CategoryCard icon="📷" title="Exames de Imagem" count={examesImagem.length} gradient="from-purple-500 to-violet-600" isActive={activeTab === 'examesImagem'} onClick={() => setActiveTab('examesImagem')} />
          </>
        )}
      </div>

      {activeTab && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setActiveTab(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {CATEGORY_TITLES[activeTab]}
              </h3>
              <button
                onClick={() => setActiveTab(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {activeTab === 'medicacoes' && <MedicacoesTab medicacoes={medicacoes} />}
              {activeTab === 'dispositivos' && <DispositivosTab dispositivos={dispositivos} />}
              {activeTab === 'culturas' && <CulturasTab culturas={culturas} />}
              {activeTab === 'procedimentos' && <ProcedimentosTab procedimentos={procedimentos} />}
              {activeTab === 'exames' && <ExamesTab exames={exames} />}
              {activeTab === 'dietas' && <DietasTab dietas={dietas} />}
              {activeTab === 'balancoHidrico' && <BalancoHidricoTab balanceHidrico={balanceHidrico} />}
              {activeTab === 'escalas' && <EscalasTab scaleScores={scaleScores} />}
              {activeTab === 'aportes' && <AportesTab aportes={aportes} />}
              {activeTab === 'diurese' && <DiureseTab diurese={diurese} />}
              {activeTab === 'pareceres' && <PareceresTab pareceres={pareceres} />}
              {activeTab === 'examesImagem' && <ExamesImagemTab examesImagem={examesImagem} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundEditor;
