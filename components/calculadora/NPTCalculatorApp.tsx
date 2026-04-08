
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  WarningIcon, PrintIcon, UserIcon, ClipboardIcon,
  CalculatorIcon, ScaleIcon, BeakerIcon, DropletIcon,
  CubeIcon, SparklesIcon, FireIcon, InformationCircleIcon, DocumentTextIcon
} from './icons';
import { PDFReport } from './PDFReport';
import type { AlternativeCalculations, OsmolarityCalculations } from './PDFReport';
import { saveNPTCalculation } from '../../services/nptDatabaseService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Tipo para opções de etapas NPT
type NPTStages = 1 | 2 | 4;
const NPT_STAGES_HOURS: Record<NPTStages, number> = {
    1: 24, // 1 etapa = 24h
    2: 12, // 2 etapas = 12h cada
    4: 6   // 4 etapas = 6h cada
};

// Constantes de concentração para eletrólitos
const NACL_CONCENTRATION_MEQ_PER_ML = 3.4; // NaCl 20%
const KCL_CONCENTRATION_MEQ_PER_ML = 1.34; // KCl 10%
const CALCIUM_GLUCONATE_CONCENTRATION_MEQ_PER_ML = 0.45; // Gluconato de Cálcio 10%
const MAGNESIUM_SULFATE_CONCENTRATION_MEQ_PER_ML = 4; // Sulfato de Magnésio 50%
const POTASSIUM_PHOSPHATE_CONCENTRATION_MEQ_PER_ML = 2; // Fosfato Ácido de Potássio
const SODIUM_GLYCEROPHOSPHATE_CONCENTRATION_MEQ_PER_ML = 1; // Glicerofosfato de Sódio

// Limites de segurança para precipitação
const MAX_CALCIUM_CONCENTRATION_MEQ_PER_LITER = 10; // máximo de Ca em mEq/L
const MAX_DIVALENT_TRIVALENT_CATIONS_MEQ_PER_LITER = 16; // máximo de Ca + Mg em mEq/L
const MAX_CALCIUM_VOLUME_PERCENTAGE = 2.2; // máximo de % do volume total para gluconato de Ca
const MIN_PHOSPHORUS_CALCIUM_RATIO = 4.4; // proporção mínima: Volume Ca / Volume P

// Tipagem para os dados do relatório, para ser usada por ambos os componentes de PDF
type ReportData = ReturnType<typeof useAppCalculations>['reportData'];

interface PharmacyPrescriptionProps {
    reportData: ReportData;
    nptStages: NPTStages;
}

const PharmacyPrescription: React.FC<PharmacyPrescriptionProps> = ({ reportData, nptStages }) => {
    const {
        patientName, dateOfBirth, weight,
        totalComponentVolume, proteinConcentration, lipidConcentration,
        aminoAcidCalculations, lipidCalculations,
        glucoseCalculations, glucoseMixtureCalculations,
        electrolyteCalculations, phosphorusCalculations, phosphorusSource,
        oligoelementosVolume, vitaminsVolume,
        osmolarityCalculations, finalGlucoseConcentrationInBag,
        totalCalories, caloricDistribution,
        aminoAcidDose, lipidDose, sodiumDose, potassiumDose,
        calciumDose, magnesiumDose, phosphorusDose,
        calorieNitrogenRatio
    } = reportData;

    const generatedDate = new Date().toLocaleDateString('pt-BR');
    const formattedDob = dateOfBirth ? new Date(dateOfBirth.replace(/-/g, '/')).toLocaleDateString('pt-BR') : 'Não informado';

    const volumePerBag = totalComponentVolume / nptStages;
    const infusionHours = NPT_STAGES_HOURS[nptStages];

    const renderBagContent = (bagNumber: number | null) => {
        const isSingleBag = nptStages === 1;
        const totalVolume = volumePerBag;
        const infusionTime = infusionHours;
        const infusionRate = totalVolume > 0 && infusionTime > 0 ? totalVolume / infusionTime : 0;
        const getVolume = (initialVolume: number) => initialVolume / nptStages;
        const phosphorusSourceName = phosphorusSource === 'sodium' ? 'Glicerofosfato de Sódio' : 'Fosfato Ácido de Potássio';

        // Determina volumes de P e Ca baseados na necessidade de separação (fosfato de K)
        // Em etapas pares: bolsas ímpares recebem P (sem Ca), bolsas pares recebem Ca (sem P)
        const needsPhosphateSeparation = phosphorusSource === 'potassium' && nptStages >= 2;
        const isOddBag = bagNumber !== null && bagNumber % 2 === 1;
        const isEvenBag = bagNumber !== null && bagNumber % 2 === 0;
        const pVolume = (needsPhosphateSeparation && isEvenBag) ? 0 : getVolume(phosphorusCalculations.volume);
        const caVolume = (needsPhosphateSeparation && isOddBag) ? 0 : getVolume(electrolyteCalculations.calciumVolume);

        return (
            <div className="border border-gray-400 p-1 rounded-lg">
                <h3 className="text-lg font-bold text-center mb-2 font-sans">
                    {nptStages === 1 ? 'Prescrição NPT - Etapa Única (24h)' : `Prescrição NPT - Etapa ${bagNumber} de ${nptStages} (${infusionHours}h)`}
                </h3>
                <div className="grid grid-cols-2 gap-x-4 text-sm mb-2 font-sans">
                    <p><strong>Paciente:</strong> {patientName}</p>
                    <p><strong>Data Nasc:</strong> {formattedDob}</p>
                    <p><strong>Peso:</strong> {weight} kg</p>
                    <p><strong>Data:</strong> {generatedDate}</p>
                </div>

                <div className="font-mono text-sm space-y-0.5">
                    <p>{`Aminoácidos ${proteinConcentration}% --- ${getVolume(aminoAcidCalculations.volume).toFixed(1)} mL`}</p>
                    <p>{`Lipídeos ${lipidConcentration}% --- ${getVolume(lipidCalculations.volume).toFixed(1)} mL`}</p>
                    {glucoseMixtureCalculations.isPossible && (
                        <>
                            <p>{`Glicose ${glucoseMixtureCalculations.concentration1}% --- ${getVolume(glucoseMixtureCalculations.volumeC1).toFixed(1)} mL`}</p>
                            <p>{`Glicose ${glucoseMixtureCalculations.concentration2}% --- ${getVolume(glucoseMixtureCalculations.volumeC2).toFixed(1)} mL`}</p>
                        </>
                    )}
                    <p>{`NaCl 20% --- ${getVolume(electrolyteCalculations.sodiumVolume).toFixed(1)} mL`}</p>
                    <p>{`KCl 10% --- ${getVolume(electrolyteCalculations.potassiumVolume).toFixed(1)} mL`}</p>
                    <p>{`${phosphorusSourceName} --- ${pVolume.toFixed(1)} mL`}</p>
                    <p>{`Gluconato de Cálcio 10% --- ${caVolume.toFixed(1)} mL`}</p>
                    <p>{`Sulfato de Magnésio 50% --- ${getVolume(electrolyteCalculations.magnesiumVolume).toFixed(1)} mL`}</p>
                    <p>{`Oligoelementos --- ${getVolume(oligoelementosVolume).toFixed(1)} mL`}</p>
                    <p>{`Vitaminas (Frutovitam) --- ${getVolume(vitaminsVolume).toFixed(1)} mL`}</p>
                </div>

                <div className="mt-2 pt-1.5 border-t-2 border-black font-bold grid grid-cols-2 gap-4 font-sans">
                    <p>Volume Total: {totalVolume.toFixed(1)} mL</p>
                    <p className="text-right">Vazão: {infusionRate.toFixed(1)} mL/h</p>
                </div>
            </div>
        );
    };

    return (
        <div id="pharmacy-prescription" className="bg-white font-serif text-black">
            <div className="p-8" style={{ width: '210mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <header className="text-center mb-4">
                    <h1 className="text-2xl font-bold">Prescrição para Manipulação de NPT</h1>
                </header>

                <main className="grow flex flex-col justify-start gap-y-6">
                    {nptStages === 1 ? (
                        renderBagContent(null)
                    ) : (
                        <>
                            {Array.from({ length: nptStages }, (_, i) => (
                                <div key={i}>
                                    {renderBagContent(i + 1)}
                                </div>
                            ))}
                        </>
                    )}
                </main>

                <footer className="mt-auto pt-2 text-xs font-sans">
                    <h4 className="font-bold text-center mb-2 text-sm border-t-2 border-black pt-2">PARÂMETROS PRESCRITOS & INDICADORES</h4>

                    <div className="grid grid-cols-4 gap-y-1 gap-x-2 mb-3 border-b border-gray-300 pb-2">
                        <p><strong>Aminoácidos:</strong> {aminoAcidDose} g/kg</p>
                        <p><strong>Lipídeos:</strong> {lipidDose} g/kg</p>
                        <p><strong>Sódio:</strong> {sodiumDose} mEq/100mL</p>
                        <p><strong>Potássio:</strong> {potassiumDose} mEq/100mL</p>
                        <p><strong>Cálcio:</strong> {calciumDose} mEq/kg</p>
                        <p><strong>Magnésio:</strong> {magnesiumDose} mEq/kg</p>
                        <p><strong>Fósforo:</strong> {phosphorusDose} mEq/kg</p>
                        <p><strong>Cal/gN:</strong> {calorieNitrogenRatio}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 mb-2">
                        <div>
                            <p><strong>Osmolaridade:</strong> {osmolarityCalculations.totalOsmolarity.toFixed(0)} mOsm/L</p>
                            <p className="font-bold mt-1">
                                RECOMENDAÇÃO DE ACESSO: {osmolarityCalculations.isPeripheralRouteWarning ? 'CENTRAL' : 'PERIFÉRICO'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p><strong>Conc. Glicose:</strong> {finalGlucoseConcentrationInBag.toFixed(1)}%</p>
                            <p><strong>TIG:</strong> {glucoseCalculations.tig.toFixed(2)} mg/kg/min</p>
                            <p><strong>Calorias:</strong> {totalCalories.toFixed(0)} kcal</p>
                        </div>
                    </div>

                    <div className="text-center pt-1 text-[10px] text-gray-600">
                         Distribuição Calórica: Proteínas {caloricDistribution.protein.toFixed(0)}% | Lipídeos {caloricDistribution.lipid.toFixed(0)}% | Glicose {caloricDistribution.glucose.toFixed(0)}%
                    </div>

                    <div className="text-center pt-8">
                        <p className="inline-block border-t-2 border-black px-12 py-1">Assinatura e Carimbo do Médico</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};


const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-4">
    {icon}
    <h2 className="text-xl font-bold text-slate-700">{title}</h2>
  </div>
);

const SummaryCard: React.FC<{ icon: React.ReactNode; label: string; value: string; unit: string; className?: string }> = ({ icon, label, value, unit, className }) => (
  <div className={`bg-slate-50/80 rounded-xl p-3 flex items-center gap-2 transition-all duration-300 ring-1 ring-slate-200/80 min-w-0 ${className}`}>
    <div className="shrink-0 hidden sm:block">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
      <p className="text-xl font-bold text-slate-800 tracking-tight">
        {value}
        <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>
      </p>
    </div>
  </div>
);

const NutrientResultCard: React.FC<{ icon: React.ReactNode; title: string; borderColor: string; children: React.ReactNode }> = ({ icon, title, borderColor, children }) => (
    <div className={`bg-white rounded-xl shadow-sm border-t-4 ${borderColor} p-4 flex flex-col`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-bold text-lg text-slate-700">{title}</h3>
      </div>
      <div className="space-y-2 grow">{children}</div>
    </div>
);


const NutrientDetailRow: React.FC<{ label: string; value: string | React.ReactNode; unit: string }> = ({ label, value, unit }) => (
  <div className="flex justify-between items-baseline border-b border-slate-100 py-1.5">
    <p className="text-sm text-slate-600">{label}</p>
    <p className="text-base font-semibold text-slate-800">
      {value} <span className="text-sm font-normal text-slate-500">{unit}</span>
    </p>
  </div>
);

const ClickToEditInput: React.FC<{
  label: string;
  value: number;
  onSave: (value: number) => void;
  unit: string;
}> = ({ label, value, onSave, unit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setCurrentValue(String(value));
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const numValue = parseFloat(currentValue);
    if (!isNaN(numValue) && numValue !== value) {
      onSave(numValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setCurrentValue(String(value));
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const re = /^[0-9]*\.?[0-9]*$/;
    if (e.target.value === '' || re.test(e.target.value)) {
       setCurrentValue(e.target.value);
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={currentValue}
          onChange={handleChange}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full bg-white text-slate-800 p-2 border border-indigo-500 rounded-md shadow-sm ring-2 ring-indigo-500 sm:text-sm transition-all duration-200"
          placeholder="0"
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="w-full h-10 flex items-center bg-white text-slate-800 p-2 border border-slate-300 rounded-md cursor-pointer hover:bg-slate-50 transition-colors duration-200"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setIsEditing(true);}}
        >
          <span>{value}</span>
          {unit && <span className="text-xs text-slate-500 ml-2">{unit}</span>}
        </div>
      )}
    </div>
  );
};

const useAppCalculations = (
    patientName: string,
    dateOfBirth: string,
    weight: number,
    aminoAcidDose: number,
    lipidDose: number,
    calorieNitrogenRatio: number,
    hydrationTarget: number,
    proteinConcentration: number,
    lipidConcentration: number,
    glucoseSources: [number, number],
    sodiumDose: number,
    potassiumDose: number,
    calciumDose: number,
    magnesiumDose: number,
    phosphorusDose: number,
    phosphorusSource: 'sodium' | 'potassium'
) => {
    const bodySurfaceArea = useMemo(() => {
      if (weight <= 0) return 0;
      return ((weight * 4) + 7) / (weight + 90);
    }, [weight]);

    const hydrationByBSA = useMemo(() => bodySurfaceArea * hydrationTarget, [bodySurfaceArea, hydrationTarget]);
    const aminoAcidCalculations = useMemo(() => {
        const totalGrams = weight * aminoAcidDose;
        const volume = proteinConcentration > 0 ? (totalGrams * 100) / proteinConcentration : 0;
        const calories = totalGrams * 4;
        const nitrogen = totalGrams / 6.25;
        return { totalGrams, volume, calories, nitrogen };
    }, [weight, aminoAcidDose, proteinConcentration]);

    const lipidCalculations = useMemo(() => {
        const totalGrams = weight * lipidDose;
        const volume = lipidConcentration > 0 ? (totalGrams * 100) / lipidConcentration : 0;
        const calories = totalGrams * 10;
        return { totalGrams, volume, calories };
    }, [weight, lipidDose, lipidConcentration]);

    const phosphorusCalculations = useMemo(() => {
      const totalMEq = weight * phosphorusDose;
      let volume = 0;
      let providedSodium = 0;
      let providedPotassium = 0;

      if (phosphorusSource === 'sodium') {
          volume = totalMEq / 1;
          providedSodium = totalMEq * 2;
      } else {
          volume = totalMEq / 2;
          providedPotassium = totalMEq;
      }
      return { totalMEq, volume, providedSodium, providedPotassium };
    }, [weight, phosphorusDose, phosphorusSource]);

    const electrolyteCalculations = useMemo(() => {
        const prescribedSodium = (sodiumDose * hydrationByBSA) / 100;
        const netSodiumToAdd = prescribedSodium - (phosphorusSource === 'sodium' ? phosphorusCalculations.providedSodium : 0);
        const sodiumVolume = netSodiumToAdd > 0 ? netSodiumToAdd / NACL_CONCENTRATION_MEQ_PER_ML : 0;

        const prescribedPotassium = (potassiumDose * hydrationByBSA) / 100;
        const netPotassiumToAdd = prescribedPotassium - (phosphorusSource === 'potassium' ? phosphorusCalculations.providedPotassium : 0);
        const potassiumVolume = netPotassiumToAdd > 0 ? netPotassiumToAdd / KCL_CONCENTRATION_MEQ_PER_ML : 0;

        const totalCalcium = weight * calciumDose;
        const calciumVolume = totalCalcium / CALCIUM_GLUCONATE_CONCENTRATION_MEQ_PER_ML;

        const totalMagnesium = weight * magnesiumDose;
        const magnesiumVolume = totalMagnesium / MAGNESIUM_SULFATE_CONCENTRATION_MEQ_PER_ML;

        const totalElectrolyteVolume = sodiumVolume + potassiumVolume + calciumVolume + magnesiumVolume + phosphorusCalculations.volume;

        return {
            prescribedSodium, netSodiumToAdd, sodiumVolume,
            prescribedPotassium, netPotassiumToAdd, potassiumVolume,
            totalCalcium, calciumVolume,
            totalMagnesium, magnesiumVolume,
            totalElectrolyteVolume
        };
    }, [weight, sodiumDose, potassiumDose, calciumDose, magnesiumDose, phosphorusSource, phosphorusCalculations, hydrationByBSA]);

    const oligoelementosVolume = useMemo(() => weight > 10 ? 4 : (weight >= 2 ? 2 : 1), [weight]);
    const vitaminsVolume = useMemo(() => weight * 0.3, [weight]);

    const nonGlucoseVolume = useMemo(() =>
        aminoAcidCalculations.volume +
        lipidCalculations.volume +
        electrolyteCalculations.totalElectrolyteVolume +
        oligoelementosVolume +
        vitaminsVolume,
      [aminoAcidCalculations.volume, lipidCalculations.volume, electrolyteCalculations.totalElectrolyteVolume, oligoelementosVolume, vitaminsVolume]
    );

    const volumeToComplete = useMemo(() => hydrationByBSA - nonGlucoseVolume, [hydrationByBSA, nonGlucoseVolume]);

    const glucoseCalculations = useMemo(() => {
        if (aminoAcidCalculations.nitrogen <= 0) return { totalGrams: 0, calories: 0, tig: 0 };
        const targetNonProteinCalories = aminoAcidCalculations.nitrogen * calorieNitrogenRatio;
        const glucoseCalories = targetNonProteinCalories - lipidCalculations.calories;
        const totalGrams = glucoseCalories > 0 ? glucoseCalories / 3.4 : 0;
        const tig = (totalGrams * 1000) / (weight * 1440);
        return { totalGrams, calories: glucoseCalories > 0 ? glucoseCalories : 0, tig };
    }, [aminoAcidCalculations.nitrogen, calorieNitrogenRatio, lipidCalculations.calories, weight]);

    const totalComponentVolume = useMemo(() => nonGlucoseVolume + (volumeToComplete > 0 ? volumeToComplete : 0), [nonGlucoseVolume, volumeToComplete]);

    const finalAminoAcidConcentrationInBag = useMemo(() =>
        totalComponentVolume > 0 ? (aminoAcidCalculations.totalGrams / totalComponentVolume) * 100 : 0,
    [aminoAcidCalculations.totalGrams, totalComponentVolume]);

    const finalGlucoseConcentrationInBag = useMemo(() =>
        totalComponentVolume > 0 ? (glucoseCalculations.totalGrams / totalComponentVolume) * 100 : 0,
    [glucoseCalculations.totalGrams, totalComponentVolume]);

    const glucoseMixtureTargetConcentration = useMemo(() =>
        volumeToComplete > 0 ? (glucoseCalculations.totalGrams / volumeToComplete) * 100 : 0,
    [glucoseCalculations.totalGrams, volumeToComplete]);

    const glucoseMixtureCalculations = useMemo(() => {
      const [c1, c2] = glucoseSources;
      const C1 = Math.min(c1, c2);
      const C2 = Math.max(c1, c2);
      const Cf = glucoseMixtureTargetConcentration;
      const Vf = volumeToComplete;
      const isPossible = Vf > 0 && Cf >= C1 && Cf <= C2;

      if (!isPossible) return { volumeC1: 0, volumeC2: 0, concentration1: C1, concentration2: C2, isPossible };

      const volumeC2 = Vf * (Cf - C1) / (C2 - C1);
      const volumeC1 = Vf - volumeC2;
      return { volumeC1, volumeC2, concentration1: C1, concentration2: C2, isPossible };
    }, [glucoseMixtureTargetConcentration, volumeToComplete, glucoseSources]);

    const totalCalories = useMemo(() => aminoAcidCalculations.calories + lipidCalculations.calories + glucoseCalculations.calories, [aminoAcidCalculations, lipidCalculations, glucoseCalculations]);

    const caloricDistribution = useMemo(() => {
        if (totalCalories <= 0) return { protein: 0, lipid: 0, glucose: 0, warnings: [] };
        const proteinPct = (aminoAcidCalculations.calories / totalCalories) * 100;
        const lipidPct = (lipidCalculations.calories / totalCalories) * 100;
        const glucosePct = (glucoseCalculations.calories / totalCalories) * 100;
        const warnings: string[] = [];
        if (proteinPct < 10 || proteinPct > 15) warnings.push(`Proteínas (${proteinPct.toFixed(0)}%) está fora do ideal (10-15%).`);
        if (lipidPct < 25 || lipidPct > 35) warnings.push(`Lipídeos (${lipidPct.toFixed(0)}%) está fora do ideal (25-35%).`);
        if (glucosePct < 50 || glucosePct > 60) warnings.push(`Glicose (${glucosePct.toFixed(0)}%) está fora do ideal (50-60%).`);
        return { protein: proteinPct, lipid: lipidPct, glucose: glucosePct, warnings };
    }, [totalCalories, aminoAcidCalculations.calories, lipidCalculations.calories, glucoseCalculations.calories]);

    const osmolarityCalculations = useMemo(() => {
        const osm_AA = finalAminoAcidConcentrationInBag * 100;
        const osm_Glucose = finalGlucoseConcentrationInBag * 50;
        const osm_Lipids = lipidCalculations.totalGrams * 0.71;
        const osm_Sodium = electrolyteCalculations.prescribedSodium * 2;
        const osm_Potassium = electrolyteCalculations.prescribedPotassium * 2;
        const osm_Magnesium = electrolyteCalculations.totalMagnesium * 1;
        const osm_Calcium = electrolyteCalculations.totalCalcium * 1.4;
        const totalOsmolarity = osm_AA + osm_Glucose + osm_Lipids + osm_Sodium + osm_Potassium + osm_Magnesium + osm_Calcium;
        return { totalOsmolarity, isPeripheralRouteWarning: totalOsmolarity > 900, components: { osm_AA, osm_Glucose, osm_Lipids, osm_Sodium, osm_Potassium, osm_Magnesium, osm_Calcium } };
    }, [finalAminoAcidConcentrationInBag, finalGlucoseConcentrationInBag, lipidCalculations.totalGrams, electrolyteCalculations]);

    const precipitationWarnings = useMemo(() => {
        const warnings: string[] = [];

        // ====== REGRAS APENAS PARA FOSFATO ÁCIDO DE POTÁSSIO ======
        if (phosphorusSource === 'potassium') {
            const isTwoBags = totalComponentVolume > 500 || phosphorusSource === 'potassium';
            const volumePerBag = isTwoBags ? totalComponentVolume / 2 : totalComponentVolume;

            if (volumePerBag <= 0) return [];

            const calciumVolumePerBag = isTwoBags ? electrolyteCalculations.calciumVolume / 2 : electrolyteCalculations.calciumVolume;
            const phosphorusVolumePerBag = isTwoBags ? phosphorusCalculations.volume / 2 : phosphorusCalculations.volume;

            // Rule 1: Calcium volume should not exceed 2.2% of total volume per bag
            const calciumPercentage = (calciumVolumePerBag / volumePerBag) * 100;
            if (calciumPercentage > MAX_CALCIUM_VOLUME_PERCENTAGE) {
                warnings.push(`⚠️ Volume de Gluconato de Cálcio (${calciumPercentage.toFixed(1)}%) excede o limite de ${MAX_CALCIUM_VOLUME_PERCENTAGE}% do volume da bolsa. Risco de precipitação com Fosfato Ácido de Potássio.`);
            }

            // Rule 2: Phosphorus volume vs Calcium volume ratio
            // Volume de P não deve exceder Volume de Ca / 4,4
            if (calciumVolumePerBag > 0 && phosphorusVolumePerBag > (calciumVolumePerBag / MIN_PHOSPHORUS_CALCIUM_RATIO)) {
                warnings.push(`⚠️ Proporção de volume Fósforo/Cálcio está fora da faixa de segurança (Volume P deve ser ≤ Volume Ca / ${MIN_PHOSPHORUS_CALCIUM_RATIO}). Risco de precipitação.`);
            }

            // Rule 3: Calcium concentration should not exceed 10 mEq/L
            const calciumConcentrationInBag = (electrolyteCalculations.totalCalcium / volumePerBag) * 1000; // convertendo para mEq/L
            if (calciumConcentrationInBag > MAX_CALCIUM_CONCENTRATION_MEQ_PER_LITER) {
                warnings.push(`⚠️ Concentração de Cálcio (${calciumConcentrationInBag.toFixed(2)} mEq/L) excede o limite máximo de ${MAX_CALCIUM_CONCENTRATION_MEQ_PER_LITER} mEq/L. Risco de precipitação.`);
            }

            // Rule 4: Sum of divalent and trivalent cations (Ca + Mg) should remain below 16 mEq/L
            const totalDivalentTrivalentCations = electrolyteCalculations.totalCalcium + electrolyteCalculations.totalMagnesium;
            const divalentTrivalentConcentration = (totalDivalentTrivalentCations / volumePerBag) * 1000; // convertendo para mEq/L
            if (divalentTrivalentConcentration >= MAX_DIVALENT_TRIVALENT_CATIONS_MEQ_PER_LITER) {
                warnings.push(`⚠️ Concentração de cátions divalentes/trivalentes (Ca + Mg: ${divalentTrivalentConcentration.toFixed(2)} mEq/L) deve permanecer abaixo de ${MAX_DIVALENT_TRIVALENT_CATIONS_MEQ_PER_LITER} mEq/L.`);
            }
        }

        return warnings;
    }, [totalComponentVolume, phosphorusSource, electrolyteCalculations.calciumVolume, electrolyteCalculations.totalCalcium, electrolyteCalculations.magnesiumVolume, electrolyteCalculations.totalMagnesium, phosphorusCalculations.volume]);

    const electrolyteConcentrations = useMemo(() => {
        const volumePerBag = (totalComponentVolume > 500 || phosphorusSource === 'potassium') ? totalComponentVolume / 2 : totalComponentVolume;

        if (volumePerBag <= 0) {
            return {
                calciumConcentrationMeqPerLiter: 0,
                magnesiumConcentrationMeqPerLiter: 0,
                divalentTrivalentCationsConcentration: 0
            };
        }

        // Converter volumes para concentrações em mEq/L
        const calciumConcentrationMeqPerLiter = (electrolyteCalculations.totalCalcium / volumePerBag) * 1000;
        const magnesiumConcentrationMeqPerLiter = (electrolyteCalculations.totalMagnesium / volumePerBag) * 1000;
        const divalentTrivalentCationsConcentration = ((electrolyteCalculations.totalCalcium + electrolyteCalculations.totalMagnesium) / volumePerBag) * 1000;

        return {
            calciumConcentrationMeqPerLiter,
            magnesiumConcentrationMeqPerLiter,
            divalentTrivalentCationsConcentration
        };
    }, [totalComponentVolume, phosphorusSource, electrolyteCalculations.totalCalcium, electrolyteCalculations.totalMagnesium]);

    const alternativeCalculations = useMemo(() => {
      const alternativeSource: 'sodium' | 'potassium' = phosphorusSource === 'sodium' ? 'potassium' : 'sodium';
      const totalMEq = weight * phosphorusDose;
      const altPhosphorus = { totalMEq, volume: 0, providedSodium: 0, providedPotassium: 0 };

      if (alternativeSource === 'sodium') {
          altPhosphorus.volume = totalMEq / 1;
          altPhosphorus.providedSodium = totalMEq * 2;
      } else {
          altPhosphorus.volume = totalMEq / 2;
          altPhosphorus.providedPotassium = totalMEq;
      }

      const prescribedSodium = (sodiumDose * hydrationByBSA) / 100;
      const netSodiumToAdd = prescribedSodium - (alternativeSource === 'sodium' ? altPhosphorus.providedSodium : 0);
      const sodiumVolume = netSodiumToAdd > 0 ? netSodiumToAdd / NACL_CONCENTRATION_MEQ_PER_ML : 0;
      const prescribedPotassium = (potassiumDose * hydrationByBSA) / 100;
      const netPotassiumToAdd = prescribedPotassium - (alternativeSource === 'potassium' ? altPhosphorus.providedPotassium : 0);
      const potassiumVolume = netPotassiumToAdd > 0 ? netPotassiumToAdd / KCL_CONCENTRATION_MEQ_PER_ML : 0;
      const totalCalcium = weight * calciumDose;
      const calciumVolume = totalCalcium / CALCIUM_GLUCONATE_CONCENTRATION_MEQ_PER_ML;
      const totalMagnesium = weight * magnesiumDose;
      const magnesiumVolume = totalMagnesium / MAGNESIUM_SULFATE_CONCENTRATION_MEQ_PER_ML;
      const totalElectrolyteVolume = sodiumVolume + potassiumVolume + calciumVolume + magnesiumVolume + altPhosphorus.volume;

      return {
        phosphorusSource: alternativeSource,
        phosphorusCalculations: altPhosphorus,
        electrolyteCalculations: {
          prescribedSodium, netSodiumToAdd, sodiumVolume,
          prescribedPotassium, netPotassiumToAdd, potassiumVolume,
          totalCalcium, calciumVolume, totalMagnesium, magnesiumVolume,
          totalElectrolyteVolume
        }
      };
    }, [weight, phosphorusDose, sodiumDose, potassiumDose, calciumDose, magnesiumDose, phosphorusSource, hydrationByBSA]);

    return {
        reportData: {
            // patient data and basic calculations
            patientName,
            dateOfBirth,
            weight, bodySurfaceArea, hydrationByBSA, totalComponentVolume, volumeToComplete, totalCalories,
            // prescription parameters
            aminoAcidDose, proteinConcentration, lipidDose, lipidConcentration, calorieNitrogenRatio, hydrationTarget,
            sodiumDose, potassiumDose, calciumDose, magnesiumDose, phosphorusDose, phosphorusSource,
            // detailed calculations
            aminoAcidCalculations, lipidCalculations, glucoseCalculations, electrolyteCalculations, phosphorusCalculations,
            finalAminoAcidConcentrationInBag, finalGlucoseConcentrationInBag, glucoseMixtureTargetConcentration, glucoseMixtureCalculations,
            caloricDistribution, osmolarityCalculations, alternativeCalculations,
            oligoelementosVolume, vitaminsVolume,
            electrolyteConcentrations,
            precipitationWarnings,
        }
    };
};

// User info passed from SBAR Kids (replaces useAuth)
interface UserInfo {
    id: string;
    name: string;
}

interface NPTCalculatorAppProps {
    userInfo: UserInfo;
    initialPatient?: {
        id?: string;
        name: string;
        dob: string;
        peso?: number | null;
    } | null;
    onChangePatient?: () => void;
    onCalculationSaved?: () => void;
}

const NPTCalculatorApp: React.FC<NPTCalculatorAppProps> = ({ userInfo, initialPatient, onChangePatient, onCalculationSaved }) => {
    const user = userInfo;
    const [isPrinting, setIsPrinting] = useState(false);
    const [isPrintingPrescription, setIsPrintingPrescription] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Estado para os dados do paciente - carrega do initialPatient se fornecido
    const [patientName, setPatientName] = useState(initialPatient?.name || 'John Doe');
    const [dateOfBirth, setDateOfBirth] = useState(initialPatient?.dob || '2023-01-01');
    const [weight, setWeight] = useState(initialPatient?.peso ? Number(initialPatient.peso) : 10); // kg

    // Estado para os parâmetros da prescrição
    const [aminoAcidDose, setAminoAcidDose] = useState(2.0); // g/kg
    const [lipidDose, setLipidDose] = useState(2.5); // g/kg
    const [calorieNitrogenRatio, setCalorieNitrogenRatio] = useState(150); // Relação Cal/gN
    const [hydrationTarget, setHydrationTarget] = useState(1500); // mL/m²

    const [proteinConcentration, setProteinConcentration] = useState(10); // %
    const [lipidConcentration, setLipidConcentration] = useState(20); // %
    const [glucoseSources, setGlucoseSources] = useState<[number, number]>([5, 50]);

    // Estado para os eletrólitos
    const [sodiumDose, setSodiumDose] = useState(2.0); // mEq/100mL
    const [potassiumDose, setPotassiumDose] = useState(2.0); // mEq/100mL
    const [calciumDose, setCalciumDose] = useState(1.0); // mEq/kg
    const [magnesiumDose, setMagnesiumDose] = useState(0.5); // mEq/kg
    const [phosphorusDose, setPhosphorusDose] = useState(0.5); // mEq/kg
    const [phosphorusSource, setPhosphorusSource] = useState<'sodium' | 'potassium'>('sodium');
    const [nptStages, setNptStages] = useState<NPTStages>(2); // Padrão: 2 etapas (12h cada)

    // Atualiza os dados quando o paciente inicial mudar
    useEffect(() => {
        if (initialPatient) {
            setPatientName(initialPatient.name);
            setDateOfBirth(initialPatient.dob);
            if (initialPatient.peso) {
                setWeight(Number(initialPatient.peso));
            }
        }
    }, [initialPatient]);

    const { reportData } = useAppCalculations(
        patientName,
        dateOfBirth,
        weight, aminoAcidDose, lipidDose, calorieNitrogenRatio, hydrationTarget,
        proteinConcentration, lipidConcentration, glucoseSources,
        sodiumDose, potassiumDose, calciumDose, magnesiumDose, phosphorusDose, phosphorusSource
    );

    const {
      bodySurfaceArea, hydrationByBSA, totalComponentVolume, volumeToComplete, totalCalories,
      aminoAcidCalculations, lipidCalculations, glucoseCalculations, electrolyteCalculations,
      phosphorusCalculations, finalAminoAcidConcentrationInBag, finalGlucoseConcentrationInBag,
      glucoseMixtureTargetConcentration, glucoseMixtureCalculations, caloricDistribution,
      osmolarityCalculations, oligoelementosVolume, vitaminsVolume, electrolyteConcentrations,
      precipitationWarnings,
    } = reportData;

    const generatePdfFromElement = async (elementId: string, setPrintingState: (isPrinting: boolean) => void) => {
        const reportElement = document.getElementById(elementId);
        if (!reportElement) {
            alert('Elemento do relatório não encontrado.');
            return;
        }

        setPrintingState(true);

        // Temporarily move the offscreen container into view for html2canvas
        const offscreenContainer = reportElement.closest('.report-container-offscreen') as HTMLElement | null;
        if (offscreenContainer) {
            offscreenContainer.style.left = '0';
            offscreenContainer.style.visibility = 'hidden';
            offscreenContainer.style.zIndex = '-1';
        }

        try {
            // Wait for layout to settle
            await new Promise(resolve => setTimeout(resolve, 100));

            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pages = reportElement.querySelectorAll<HTMLElement>(':scope > div');

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const canvas = await html2canvas(page, { scale: 2, useCORS: true, logging: false });
                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            }

            const blobUrl = pdf.output('bloburl');
            const newWindow = window.open(blobUrl, '_blank');
            if (!newWindow) {
                // Fallback se popup for bloqueado
                pdf.save('relatorio-npt.pdf');
            }
        } catch (error) {
            console.error("Erro ao gerar o PDF:", error);
            alert('Ocorreu um erro ao gerar o PDF.');
        } finally {
            // Restore offscreen positioning
            if (offscreenContainer) {
                offscreenContainer.style.left = '-9999px';
                offscreenContainer.style.visibility = '';
                offscreenContainer.style.zIndex = '';
            }
            setPrintingState(false);
        }
    };

    const handleSaveCalculation = async () => {
        if (!initialPatient?.id || !user) {
            setSaveMessage({ type: 'error', text: 'Paciente ou usuário não identificado' });
            return;
        }

        setIsSaving(true);
        setSaveMessage(null);

        try {
            const infusionHours = NPT_STAGES_HOURS[nptStages];
            const volumePerBag = totalComponentVolume / nptStages;
            const infusionRate = volumePerBag > 0 && infusionHours > 0 ? volumePerBag / infusionHours : 0;

            await saveNPTCalculation({
                patient_id: initialPatient.id,
                user_id: user.id,
                weight,
                date_of_birth: dateOfBirth,
                amino_acid_dose: aminoAcidDose,
                lipid_dose: lipidDose,
                calorie_nitrogen_ratio: calorieNitrogenRatio,
                hydration_target: hydrationTarget,
                protein_concentration: proteinConcentration,
                lipid_concentration: lipidConcentration,
                glucose_source_1: glucoseSources[0],
                glucose_source_2: glucoseSources[1],
                sodium_dose: sodiumDose,
                potassium_dose: potassiumDose,
                calcium_dose: calciumDose,
                magnesium_dose: magnesiumDose,
                phosphorus_dose: phosphorusDose,
                phosphorus_source: phosphorusSource,
                npt_stages: nptStages,
                total_volume: totalComponentVolume,
                total_calories: totalCalories,
                glucose_concentration_final: finalGlucoseConcentrationInBag,
                osmolarity: osmolarityCalculations.totalOsmolarity,
                peripheral_route_warning: osmolarityCalculations.isPeripheralRouteWarning,
                // Volumes da prescrição da farmácia
                amino_acid_volume: aminoAcidCalculations.volume,
                lipid_volume: lipidCalculations.volume,
                glucose_volume_1: glucoseMixtureCalculations.isPossible ? glucoseMixtureCalculations.volumeC1 : 0,
                glucose_volume_2: glucoseMixtureCalculations.isPossible ? glucoseMixtureCalculations.volumeC2 : 0,
                nacl_volume: electrolyteCalculations.sodiumVolume,
                kcl_volume: electrolyteCalculations.potassiumVolume,
                phosphorus_volume: phosphorusCalculations.volume,
                calcium_volume: electrolyteCalculations.calciumVolume,
                magnesium_volume: electrolyteCalculations.magnesiumVolume,
                oligoelementos_volume: oligoelementosVolume,
                vitamins_volume: vitaminsVolume,
                volume_per_bag: volumePerBag,
                infusion_rate: infusionRate,
                tig: glucoseCalculations.tig,
                access_recommendation: osmolarityCalculations.isPeripheralRouteWarning ? 'CENTRAL' : 'PERIFERICO',
                caloric_dist_protein: caloricDistribution.protein,
                caloric_dist_lipid: caloricDistribution.lipid,
                caloric_dist_glucose: caloricDistribution.glucose,
            } as any);

            setSaveMessage({ type: 'success', text: 'Cálculo salvo com sucesso!' });

            // Limpa a mensagem após 3 segundos
            setTimeout(() => setSaveMessage(null), 3000);

            // Notifica o componente pai para atualizar o histórico
            if (onCalculationSaved) {
                onCalculationSaved();
            }
        } catch (error) {
            console.error('Erro ao salvar cálculo:', error);
            setSaveMessage({ type: 'error', text: 'Erro ao salvar. Tente novamente.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrintReport = () => generatePdfFromElement('pdf-report', setIsPrinting);
    const handlePrintPrescription = async () => {
        // Salva no Supabase antes de gerar o PDF (não bloqueia o PDF se falhar)
        if (initialPatient?.id && user) {
            try {
                await handleSaveCalculation();
            } catch (err) {
                console.warn('Erro ao salvar, mas o PDF será gerado:', err);
            }
        }
        await generatePdfFromElement('pharmacy-prescription', setIsPrintingPrescription);
    };

    const handleReset = () => {
        setPatientName(''); setDateOfBirth(''); setWeight(10);
        setAminoAcidDose(2.0); setLipidDose(2.5); setCalorieNitrogenRatio(150);
        setHydrationTarget(1500); setProteinConcentration(10); setLipidConcentration(20);
        setSodiumDose(2.0); setPotassiumDose(2.0); setCalciumDose(1.0);
        setMagnesiumDose(0.5); setPhosphorusDose(0.5); setPhosphorusSource('sodium');
        setGlucoseSources([5, 50]);
    };

    return (
        <div>
            <div className="min-h-screen bg-slate-100 p-2 sm:p-3 hide-on-print overflow-x-hidden">
                <header className="max-w-full mx-auto mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <CalculatorIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Calculadora NPT KIDS</h1>
                            <p className="text-sm text-slate-500">Nutrição Parenteral Total Pediátrica</p>
                        </div>
                    </div>
                </header>

                <main className="max-w-full mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Coluna de Controles (Esquerda) */}
                    <div className="space-y-6">
                        {/* Card: Dados do Paciente */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <SectionHeader icon={<UserIcon className="w-6 h-6 text-indigo-500" />} title="Dados do Paciente" />
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Nome</label>
                                    <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full bg-white text-slate-800 p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Data de Nasc.</label>
                                        <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full bg-white text-slate-800 p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                    </div>
                                    <div>
                                      <ClickToEditInput label="Peso (kg)" value={weight} onSave={setWeight} unit="kg" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card: Parâmetros de Prescrição */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <SectionHeader icon={<ClipboardIcon className="w-6 h-6 text-indigo-500" />} title="Parâmetros de Prescrição" />
                            <div className="grid grid-cols-2 gap-4">
                                <ClickToEditInput label="Dose AA (g/kg)" value={aminoAcidDose} onSave={setAminoAcidDose} unit="g/kg" />
                                <ClickToEditInput label="Dose Lipídeos (g/kg)" value={lipidDose} onSave={setLipidDose} unit="g/kg" />
                                <ClickToEditInput label="Relação Cal/gN" value={calorieNitrogenRatio} onSave={setCalorieNitrogenRatio} unit="" />
                                <ClickToEditInput label="Meta hídrica (mL/m²)" value={hydrationTarget} onSave={setHydrationTarget} unit="mL/m²" />
                                <ClickToEditInput label="Concentração AA (%)" value={proteinConcentration} onSave={setProteinConcentration} unit="%" />
                                <ClickToEditInput label="Concentração Lipídeos (%)" value={lipidConcentration} onSave={setLipidConcentration} unit="%" />
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                                <ClickToEditInput label="Dose Sódio (mEq/100mL)" value={sodiumDose} onSave={setSodiumDose} unit="mEq/100mL" />
                                <ClickToEditInput label="Dose Potássio (mEq/100mL)" value={potassiumDose} onSave={setPotassiumDose} unit="mEq/100mL" />
                                <ClickToEditInput label="Dose Cálcio (mEq/kg)" value={calciumDose} onSave={setCalciumDose} unit="mEq/kg" />
                                <ClickToEditInput label="Dose Magnésio (mEq/kg)" value={magnesiumDose} onSave={setMagnesiumDose} unit="mEq/kg" />
                                <ClickToEditInput label="Dose Fósforo (mEq/kg)" value={phosphorusDose} onSave={setPhosphorusDose} unit="mEq/kg" />
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Fonte de Fósforo</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="phosphorusSource" value="sodium" checked={phosphorusSource === 'sodium'} onChange={() => setPhosphorusSource('sodium')} className="h-4 w-4 appearance-auto accent-indigo-600" />
                                        <span className="text-sm text-slate-600">Glicerofosfato de Sódio</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="phosphorusSource" value="potassium" checked={phosphorusSource === 'potassium'} onChange={() => setPhosphorusSource('potassium')} className="h-4 w-4 appearance-auto accent-indigo-600" />
                                        <span className="text-sm text-slate-600">Fosfato Ácido de Potássio</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-200">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Etapas de NPT</label>
                                <div className="flex flex-col space-y-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="nptStages" value="1"
                                            checked={nptStages === 1}
                                            onChange={() => setNptStages(1)}
                                            className="h-4 w-4 appearance-auto accent-indigo-600" />
                                        <span className="text-sm text-slate-600">1 Etapa (24/24h)</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="nptStages" value="2"
                                            checked={nptStages === 2}
                                            onChange={() => setNptStages(2)}
                                            className="h-4 w-4 appearance-auto accent-indigo-600" />
                                        <span className="text-sm text-slate-600">2 Etapas (12/12h)</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="nptStages" value="4"
                                            checked={nptStages === 4}
                                            onChange={() => setNptStages(4)}
                                            className="h-4 w-4 appearance-auto accent-indigo-600" />
                                        <span className="text-sm text-slate-600">4 Etapas (6/6h)</span>
                                    </label>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-200">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Opções para Mistura de Glicose</label>
                                <div className="flex flex-col space-y-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="glucoseMixture" value="5-50"
                                            checked={glucoseSources.includes(5) && glucoseSources.includes(50)}
                                            onChange={() => setGlucoseSources([5, 50])}
                                            className="h-4 w-4 appearance-auto accent-indigo-600" />
                                        <span className="text-sm text-slate-600">Glicose 5% e 50%</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="glucoseMixture" value="5-25"
                                            checked={glucoseSources.includes(5) && glucoseSources.includes(25)}
                                            onChange={() => setGlucoseSources([5, 25])}
                                            className="h-4 w-4 appearance-auto accent-indigo-600" />
                                        <span className="text-sm text-slate-600">Glicose 5% e 25%</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="glucoseMixture" value="25-50"
                                            checked={glucoseSources.includes(25) && glucoseSources.includes(50)}
                                            onChange={() => setGlucoseSources([25, 50])}
                                            className="h-4 w-4 appearance-auto accent-indigo-600" />
                                        <span className="text-sm text-slate-600">Glicose 25% e 50%</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleSaveCalculation}
                                disabled={isSaving || !initialPatient?.id || !user}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                💾
                                {isSaving ? 'Salvando...' : 'Salvar Cálculo'}
                            </button>
                            {saveMessage && (
                                <div className={`text-sm p-2 rounded ${saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    {saveMessage.text}
                                </div>
                            )}
                            <button
                                onClick={handlePrintPrescription}
                                disabled={isPrintingPrescription}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <DocumentTextIcon />
                                {isPrintingPrescription ? 'Gerando...' : 'Gerar Prescrição (Farmácia)'}
                            </button>
                            <div className="flex items-center justify-between gap-4">
                                <button
                                    onClick={handlePrintReport}
                                    disabled={isPrinting}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PrintIcon />
                                    {isPrinting ? 'Gerando...' : 'Relatório Detalhado'}
                                </button>
                                <button onClick={handleReset} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
                                    Resetar
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Coluna de Resultados (Direita) */}
                    <div className="space-y-6">
                        {/* Resumo */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <SectionHeader icon={<CalculatorIcon className="w-6 h-6 text-indigo-500" />} title="Resumo da Prescrição" />
                            <div className="grid grid-cols-2 gap-3">
                              <SummaryCard icon={<ScaleIcon className="w-8 h-8 text-sky-500" />} label="Superfície Corporal (Haycock)" value={bodySurfaceArea.toFixed(2)} unit="m²"/>
                              <SummaryCard icon={<DropletIcon className="w-8 h-8 text-blue-500" />} label="Meta Hídrica Total" value={hydrationByBSA.toFixed(0)} unit="mL" />
                              <SummaryCard icon={<BeakerIcon className="w-8 h-8 text-teal-500" />} label="Volume a Completar" value={volumeToComplete.toFixed(0)} unit="mL" />
                              <SummaryCard icon={<CubeIcon className="w-8 h-8 text-slate-500" />} label="Volume Total (Componentes)" value={totalComponentVolume.toFixed(0)} unit="mL" />
                              <SummaryCard icon={<FireIcon className="w-8 h-8 text-orange-500" />} label="Kcal Totais" value={totalCalories.toFixed(0)} unit="kcal" />
                              <SummaryCard icon={<SparklesIcon className="w-8 h-8 text-purple-500" />} label="Osmolaridade Estimada" value={osmolarityCalculations.totalOsmolarity.toFixed(0)} unit="mOsm/L" />
                            </div>
                        </div>
                        {/* Alertas */}
                        {precipitationWarnings.length > 0 && (
                            <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 p-4 rounded-md shadow-sm" role="alert">
                                <div className="flex">
                                    <div className="py-1"><WarningIcon className="h-6 w-6 text-amber-500 mr-4"/></div>
                                    <div>
                                        <p className="font-bold">Alerta: Risco de Precipitação de Fosfato de Cálcio</p>
                                        <ul className="text-sm list-disc list-inside mt-1 space-y-1">
                                            {precipitationWarnings.map((warning, index) => <li key={index}>{warning}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                        {caloricDistribution.warnings.length > 0 && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md shadow-sm" role="alert">
                                <div className="flex">
                                    <div className="py-1"><InformationCircleIcon className="h-6 w-6 text-blue-500 mr-4"/></div>
                                    <div>
                                        <p className="font-bold">Sugestão de Distribuição Calórica</p>
                                        <ul className="text-sm list-disc list-inside mt-1 space-y-1">
                                            {caloricDistribution.warnings.map((warning, index) => <li key={index}>{warning}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Macronutrientes */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <NutrientResultCard icon={<UserIcon className="w-6 h-6 text-green-500"/>} title="Aminoácidos" borderColor="border-green-500">
                              <NutrientDetailRow label="Gramas Totais" value={aminoAcidCalculations.totalGrams.toFixed(1)} unit="g" />
                              <NutrientDetailRow label="Volume" value={aminoAcidCalculations.volume.toFixed(0)} unit="mL" />
                              <NutrientDetailRow label="Calorias" value={aminoAcidCalculations.calories.toFixed(0)} unit="kcal" />
                              <NutrientDetailRow label="% Calórico Total" value={caloricDistribution.protein.toFixed(0)} unit="%" />
                              <NutrientDetailRow label="Nitrogênio (g de N)" value={aminoAcidCalculations.nitrogen.toFixed(1)} unit="g" />
                              <NutrientDetailRow label="Conc. Final (Bolsa)" value={finalAminoAcidConcentrationInBag.toFixed(1)} unit="%" />
                            </NutrientResultCard>
                            <NutrientResultCard icon={<DropletIcon className="w-6 h-6 text-yellow-500"/>} title="Lipídeos" borderColor="border-yellow-500">
                              <NutrientDetailRow label="Gramas Totais" value={lipidCalculations.totalGrams.toFixed(1)} unit="g" />
                              <NutrientDetailRow label="Volume" value={lipidCalculations.volume.toFixed(0)} unit="mL" />
                              <NutrientDetailRow label="Calorias (10 kcal/g)" value={lipidCalculations.calories.toFixed(0)} unit="kcal" />
                               <NutrientDetailRow label="% Calórico Total" value={caloricDistribution.lipid.toFixed(0)} unit="%" />
                            </NutrientResultCard>
                            <NutrientResultCard icon={<CubeIcon className="w-6 h-6 text-blue-500"/>} title="Glicose" borderColor="border-blue-500">
                              <NutrientDetailRow label="Gramas Totais" value={glucoseCalculations.totalGrams.toFixed(1)} unit="g" />
                              <NutrientDetailRow label="Calorias" value={glucoseCalculations.calories.toFixed(0)} unit="kcal" />
                               <NutrientDetailRow label="% Calórico Total" value={caloricDistribution.glucose.toFixed(0)} unit="%" />
                              <NutrientDetailRow label="TIG" value={glucoseCalculations.tig.toFixed(2)} unit="mg/kg/min" />
                              <NutrientDetailRow label="Conc. p/ Mistura" value={glucoseMixtureTargetConcentration.toFixed(1)} unit="%" />
                              <NutrientDetailRow label="Conc. Final (Bolsa)" value={finalGlucoseConcentrationInBag.toFixed(1)} unit="%" />
                               {volumeToComplete > 0 ? (
                                <div className="pt-2 mt-2 border-t border-slate-200">
                                  <p className="text-xs font-semibold text-slate-500 mb-1">Preparo da Solução de Glicose:</p>
                                  {glucoseMixtureCalculations.isPossible ? (
                                    <>
                                      <NutrientDetailRow label={`Volume Glicose ${glucoseMixtureCalculations.concentration1}%`} value={glucoseMixtureCalculations.volumeC1.toFixed(1)} unit="mL" />
                                      <NutrientDetailRow label={`Volume Glicose ${glucoseMixtureCalculations.concentration2}%`} value={glucoseMixtureCalculations.volumeC2.toFixed(1)} unit="mL" />
                                    </>
                                  ) : (
                                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded-md mt-1">
                                      Não é possível atingir {glucoseMixtureTargetConcentration.toFixed(1)}% com as fontes de {glucoseMixtureCalculations.concentration1}% e {glucoseMixtureCalculations.concentration2}%.
                                    </div>
                                  )}
                                </div>
                              ) : null}
                            </NutrientResultCard>
                        </div>

                        {/* Eletrólitos */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                          <SectionHeader icon={<SparklesIcon className="w-6 h-6 text-indigo-500" />} title="Eletrólitos, Oligoelementos & Vitaminas" />
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                              {/* Fósforo */}
                              <div className="space-y-1">
                                  <h3 className="font-bold text-slate-700">FÓSFORO</h3>
                                  <NutrientDetailRow label="Fonte" value={<span className="font-semibold text-xs">{phosphorusSource === 'sodium' ? 'Glicerofosfato de Sódio' : 'Fosfato Ácido de Potássio'}</span>} unit="" />
                                  <NutrientDetailRow label="Dose Total" value={phosphorusCalculations.totalMEq.toFixed(1)} unit="mEq" />
                                  <NutrientDetailRow label="Volume Fonte" value={phosphorusCalculations.volume.toFixed(1)} unit="mL" />
                              </div>
                              {/* Sódio */}
                              <div className="space-y-1">
                                  <h3 className="font-bold text-slate-700">SÓDIO</h3>
                                  <NutrientDetailRow label="Sódio Prescrito" value={electrolyteCalculations.prescribedSodium.toFixed(1)} unit="mEq" />
                                  {phosphorusSource === 'sodium' && <NutrientDetailRow label="(-) Sódio da Fonte" value={phosphorusCalculations.providedSodium.toFixed(1)} unit="mEq" />}
                                  <NutrientDetailRow label="Dose Ajustada" value={electrolyteCalculations.netSodiumToAdd.toFixed(1)} unit="mEq" />
                                  <NutrientDetailRow label="Volume (NaCl 20%)" value={electrolyteCalculations.sodiumVolume.toFixed(1)} unit="mL" />
                              </div>
                              {/* Potássio */}
                              <div className="space-y-1">
                                  <h3 className="font-bold text-slate-700">POTÁSSIO</h3>
                                  <NutrientDetailRow label="Potássio Prescrito" value={electrolyteCalculations.prescribedPotassium.toFixed(1)} unit="mEq" />
                                  {phosphorusSource === 'potassium' && <NutrientDetailRow label="(-) Potássio da Fonte" value={phosphorusCalculations.providedPotassium.toFixed(1)} unit="mEq" />}
                                  <NutrientDetailRow label="Dose Ajustada" value={electrolyteCalculations.netPotassiumToAdd.toFixed(1)} unit="mEq" />
                                  <NutrientDetailRow label="Volume (KCl 10%)" value={electrolyteCalculations.potassiumVolume.toFixed(1)} unit="mL" />
                              </div>
                              {/* Cálcio e Magnésio */}
                              <div className="space-y-1">
                                  <h3 className="font-bold text-slate-700">CÁLCIO</h3>
                                  <NutrientDetailRow label="Dose" value={electrolyteCalculations.totalCalcium.toFixed(1)} unit="mEq" />
                                  <NutrientDetailRow label="Volume" value={electrolyteCalculations.calciumVolume.toFixed(1)} unit="mL" />
                              </div>
                              <div className="space-y-1">
                                  <h3 className="font-bold text-slate-700">MAGNÉSIO</h3>
                                  <NutrientDetailRow label="Dose" value={electrolyteCalculations.totalMagnesium.toFixed(1)} unit="mEq" />
                                  <NutrientDetailRow label="Volume" value={electrolyteCalculations.magnesiumVolume.toFixed(1)} unit="mL" />
                              </div>
                              <div className="space-y-1">
                                  <h3 className="font-bold text-slate-700">OLIGOELEMENTOS</h3>
                                  <NutrientDetailRow label="Volume" value={oligoelementosVolume.toFixed(1)} unit="mL" />
                              </div>
                              <div className="space-y-1">
                                  <h3 className="font-bold text-slate-700">VITAMINAS (FRUTOVITAM)</h3>
                                  <NutrientDetailRow label="Volume" value={vitaminsVolume.toFixed(1)} unit="mL" />
                              </div>
                          </div>
                        </div>

                        {/* Avisos */}
                        {volumeToComplete < 0 && (
                            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow" role="alert">
                                <div className="flex">
                                    <div className="py-1"><WarningIcon className="h-6 w-6 text-yellow-500 mr-4"/></div>
                                    <div>
                                        <p className="font-bold">Atenção: Volume Excedido</p>
                                        <p className="text-sm">O volume total dos componentes ({totalComponentVolume.toFixed(0)} mL) ultrapassou a meta hídrica ({hydrationByBSA.toFixed(0)} mL). Ajuste as doses ou concentrações.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {osmolarityCalculations.isPeripheralRouteWarning && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow" role="alert">
                                <div className="flex">
                                    <div className="py-1"><WarningIcon className="h-6 w-6 text-red-500 mr-4"/></div>
                                    <div>
                                        <p className="font-bold">Atenção: Osmolaridade Elevada</p>
                                        <p className="text-sm">A osmolaridade ({osmolarityCalculations.totalOsmolarity.toFixed(0)} mOsm/L) é superior a 900 mOsm/L. Recomenda-se o uso de acesso venoso central.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                <footer className="mt-16 py-6 text-center text-slate-400 text-sm border-t border-slate-200">
                    <p>Idealizado por Dra. Lélia Braga / Criado por Noemi Sales</p>
                </footer>
            </div>

            <div className="report-container-offscreen">
              <PDFReport reportData={reportData} nptStages={nptStages} />
              <PharmacyPrescription reportData={reportData} nptStages={nptStages} />
            </div>
        </div>
    );
};

export default NPTCalculatorApp;
