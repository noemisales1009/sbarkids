


import React from 'react';

// fix: Exported ElectrolyteCalculations type
export type ElectrolyteCalculations = {
    prescribedSodium: number;
    netSodiumToAdd: number;
    sodiumVolume: number;
    prescribedPotassium: number;
    // fix: Corrected duplicate property `netSodiumToAdd` to `netPotassiumToAdd`.
    netPotassiumToAdd: number;
    potassiumVolume: number;
    totalCalcium: number;
    calciumVolume: number;
    totalMagnesium: number;
    magnesiumVolume: number;
    totalElectrolyteVolume: number;
};

// fix: Exported PhosphorusCalculations type
export type PhosphorusCalculations = {
  totalMEq: number;
  volume: number;
  providedSodium: number;
  providedPotassium: number;
};

// fix: Added and exported AlternativeCalculations type
export type AlternativeCalculations = {
  phosphorusSource: 'sodium' | 'potassium';
  phosphorusCalculations: PhosphorusCalculations;
  electrolyteCalculations: ElectrolyteCalculations;
};

export type OsmolarityCalculations = {
  totalOsmolarity: number;
  isPeripheralRouteWarning: boolean;
  components: {
    osm_AA: number;
    osm_Glucose: number;
    osm_Lipids: number;
    osm_Sodium: number;
    osm_Potassium: number;
    osm_Magnesium: number;
    osm_Calcium: number;
  };
};

export type CaloricDistribution = {
    protein: number;
    lipid: number;
    glucose: number;
    warnings: string[];
};

// Define a type for the component props
interface PDFReportProps {
  reportData: {
    patientName: string;
    dateOfBirth: string;
    weight: number;
    bodySurfaceArea: number;
    hydrationTarget: number;
    hydrationByBSA: number;
    totalComponentVolume: number;
    volumeToComplete: number;
    aminoAcidDose: number;
    proteinConcentration: number;
    aminoAcidCalculations: {
      totalGrams: number;
      volume: number;
      calories: number;
      nitrogen: number;
    };
    finalAminoAcidConcentrationInBag: number;
    lipidDose: number;
    lipidConcentration: number;
    lipidCalculations: {
      totalGrams: number;
      volume: number;
      calories: number;
    };
    calorieNitrogenRatio: number;
    glucoseCalculations: {
        totalGrams: number;
        calories: number;
        tig: number;
    };
    totalCalories: number;
    glucoseMixtureTargetConcentration: number;
    finalGlucoseConcentrationInBag: number;
    glucoseMixtureCalculations: {
      volumeC1: number;
      volumeC2: number;
      concentration1: number;
      concentration2: number;
      isPossible: boolean;
    };
    caloricDistribution: CaloricDistribution;
    sodiumDose: number;
    potassiumDose: number;
    calciumDose: number;
    magnesiumDose: number;
    phosphorusDose: number;
    electrolyteCalculations: ElectrolyteCalculations;
    phosphorusSource: 'sodium' | 'potassium';
    phosphorusCalculations: PhosphorusCalculations;
    alternativeCalculations: AlternativeCalculations;
    osmolarityCalculations: OsmolarityCalculations;
    oligoelementosVolume: number;
    vitaminsVolume: number;
    precipitationWarnings: string[];
  };
  nptStages?: 1 | 2 | 4;
}

const ReportRow: React.FC<{ label: string; value: string | number; unit?: string }> = ({ label, value, unit }) => (
    <div className="flex justify-between items-center py-0 border-b border-gray-200 text-xs">
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-xs font-semibold text-gray-900">{value} {unit}</p>
    </div>
);


export const PDFReport: React.FC<PDFReportProps> = ({ reportData, nptStages = 2 }) => {
  const {
    patientName,
    dateOfBirth,
    weight,
    bodySurfaceArea,
    hydrationTarget,
    hydrationByBSA,
    totalComponentVolume,
    volumeToComplete,
    aminoAcidDose,
    proteinConcentration,
    aminoAcidCalculations,
    finalAminoAcidConcentrationInBag,
    lipidDose,
    lipidConcentration,
    lipidCalculations,
    calorieNitrogenRatio,
    glucoseCalculations,
    totalCalories,
    glucoseMixtureTargetConcentration,
    finalGlucoseConcentrationInBag,
    glucoseMixtureCalculations,
    caloricDistribution,
    sodiumDose,
    potassiumDose,
    calciumDose,
    magnesiumDose,
    phosphorusDose,
    electrolyteCalculations,
    phosphorusSource,
    phosphorusCalculations,
    alternativeCalculations,
    osmolarityCalculations,
    oligoelementosVolume,
    vitaminsVolume,
    precipitationWarnings,
  } = reportData;

  const generatedDate = new Date().toLocaleDateString('pt-BR');

  // Formata a data de nascimento para evitar problemas de fuso horário
  const formattedDob = dateOfBirth
    ? new Date(dateOfBirth.replace(/-/g, '/')).toLocaleDateString('pt-BR')
    : 'Não informado';

  const phosphorusSourceName = phosphorusSource === 'sodium' ? 'Glicerofosfato de Sódio' : 'Fosfato Ácido de Potássio';

  const sodiumScenario = phosphorusSource === 'sodium'
    ? { phosphorus: phosphorusCalculations, electrolytes: electrolyteCalculations }
    : { phosphorus: alternativeCalculations.phosphorusCalculations, electrolytes: alternativeCalculations.electrolyteCalculations };

  const potassiumScenario = phosphorusSource === 'potassium'
    ? { phosphorus: phosphorusCalculations, electrolytes: electrolyteCalculations }
    : { phosphorus: alternativeCalculations.phosphorusCalculations, electrolytes: alternativeCalculations.electrolyteCalculations };

  const commonFooter = (
    <footer className="text-center text-gray-500 text-xs mt-auto pt-4 border-t border-gray-200">
        <p>Este é um protótipo para fins educacionais e não substitui protocolos institucionais. Os cálculos devem ser verificados por um profissional qualificado antes da administração.</p>
    </footer>
  );

  return (
    <div id="pdf-report" className="bg-white font-sans text-gray-800">
        {/* Page 1: Resumo e Macronutrientes Principais */}
        <div className="p-6" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <header className="text-center mb-4 border-b-2 border-gray-800 pb-2">
                <h1 className="text-2xl font-bold text-gray-900">Relatório de Nutrição Parenteral</h1>
                <p className="text-xs text-gray-500 mt-1">Gerado em: {generatedDate}</p>
            </header>

            <section className="mb-3">
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">Dados do Paciente</h2>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    <p><span className="font-semibold">Nome:</span> {patientName || 'Não informado'}</p>
                    <p><span className="font-semibold">Data de Nascimento:</span> {formattedDob}</p>
                    <p><span className="font-semibold">Peso:</span> {weight} kg</p>
                    <p><span className="font-semibold">Etapas de NPT:</span> {nptStages === 1 ? '1 (24/24h)' : nptStages === 2 ? '2 (12/12h)' : '4 (6/6h)'}</p>
                </div>
            </section>

            {precipitationWarnings.length > 0 && (
                <section className="mb-3">
                    <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2 text-amber-700">Alertas de Segurança</h2>
                    <div className="p-2 bg-amber-50 border border-amber-300 text-amber-800 rounded-md text-xs space-y-1">
                        <p className="font-bold">Risco de Precipitação de Fosfato de Cálcio:</p>
                        <ul className="list-disc list-inside text-xs">
                            {precipitationWarnings.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                    </div>
                </section>
            )}

            <section className="mb-3">
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">Resumo da Prescrição</h2>
                <div className="space-y-0 text-xs">
                    <ReportRow label="Etapas de NPT" value={nptStages === 1 ? '1 (24/24h)' : nptStages === 2 ? '2 (12/12h)' : '4 (6/6h)'} />
                    <ReportRow label={`Superfície Corporal (SC - Haycock)`} value={bodySurfaceArea.toFixed(2)} unit="m²" />
                    <ReportRow label="Meta Hídrica (Dose)" value={hydrationTarget} unit="mL/m²" />
                    <ReportRow label="Meta Hídrica Total" value={hydrationByBSA.toFixed(0)} unit="mL" />
                    <ReportRow label="Volume dos Componentes" value={totalComponentVolume.toFixed(0)} unit="mL" />
                    <ReportRow label="Volume a Completar (com Glicose)" value={volumeToComplete.toFixed(0)} unit="mL" />
                    <ReportRow label="Relação Cal-NP/gN Alvo" value={calorieNitrogenRatio} />
                    <ReportRow label="Calorias Totais" value={totalCalories.toFixed(0)} unit="kcal" />
                    <ReportRow label="Osmolaridade Estimada" value={osmolarityCalculations.totalOsmolarity.toFixed(0)} unit="mOsm/L" />
                </div>
            </section>

            <main className="grow">
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">Detalhamento dos Macronutrientes</h2>
                <div className="grid grid-cols-2 gap-4 text-xs">
                    {/* Aminoácidos */}
                    <div>
                        <h3 className="text-base font-bold text-gray-800 mb-1">Aminoácidos</h3>
                        <div className="space-y-0 bg-gray-50 p-2 rounded-md border border-gray-200">
                            <ReportRow label="Dose" value={`${aminoAcidDose} g/kg`} />
                            <ReportRow label="Concentração" value={`${proteinConcentration} %`} />
                            <ReportRow label="Gramas Totais" value={aminoAcidCalculations.totalGrams.toFixed(1)} unit="g" />
                            <ReportRow label="Volume" value={aminoAcidCalculations.volume.toFixed(0)} unit="mL" />
                            <ReportRow label="Calorias" value={aminoAcidCalculations.calories.toFixed(0)} unit="kcal" />
                            <ReportRow label="Nitrogênio (g de N)" value={aminoAcidCalculations.nitrogen.toFixed(1)} unit="g" />
                            <ReportRow label="Concentração Final na Bolsa" value={finalAminoAcidConcentrationInBag.toFixed(1)} unit="%" />
                        </div>
                    </div>
                    {/* Lipídeos */}
                    <div>
                        <h3 className="text-base font-bold text-gray-800 mb-1">Lipídeos</h3>
                        <div className="space-y-0 bg-gray-50 p-2 rounded-md border border-gray-200">
                            <ReportRow label="Dose" value={`${lipidDose} g/kg`} />
                            <ReportRow label="Concentração" value={`${lipidConcentration} %`} />
                            <ReportRow label="Gramas Totais" value={lipidCalculations.totalGrams.toFixed(1)} unit="g" />
                            <ReportRow label="Volume" value={lipidCalculations.volume.toFixed(0)} unit="mL" />
                            <ReportRow label={`Calorias (10 kcal/g)`} value={lipidCalculations.calories.toFixed(0)} unit="kcal" />
                        </div>
                    </div>
                </div>
            </main>
            {commonFooter}
        </div>

        {/* Page 2: Glicose e Eletrólitos */}
        <div className="p-6" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <header className="text-center mb-4 border-b-2 border-gray-800 pb-2">
                <h1 className="text-2xl font-bold text-gray-900">Relatório de Nutrição Parenteral</h1>
                <p className="text-xs text-gray-500 mt-1">Detalhamento de Componentes (Continuação)</p>
            </header>

            <main className="grow grid grid-cols-2 gap-4 text-xs">
                {/* Glicose */}
                 <div className="space-y-2">
                    <div>
                        <h3 className="text-base font-bold text-gray-800 mb-1">Glicose</h3>
                        <div className="space-y-0 bg-gray-50 p-2 rounded-md border border-gray-200">
                            <ReportRow label="Gramas Totais" value={glucoseCalculations.totalGrams.toFixed(1)} unit="g" />
                            <ReportRow label="Volume da Solução" value={volumeToComplete.toFixed(1)} unit="mL" />
                            <ReportRow label="Calorias" value={glucoseCalculations.calories.toFixed(0)} unit="kcal" />
                            <ReportRow label="Taxa de Infusão de Glicose (TIG)" value={glucoseCalculations.tig.toFixed(2)} unit="mg/kg/min" />
                            <ReportRow label="Concentração para Mistura" value={glucoseMixtureTargetConcentration.toFixed(1)} unit="%" />
                            <ReportRow label="Concentração Final na Bolsa" value={finalGlucoseConcentrationInBag.toFixed(1)} unit="%" />
                            {volumeToComplete > 0 && (
                              <div className="pt-1.5 mt-1.5 border-t border-gray-200">
                                <h4 className="font-semibold text-sm text-gray-700 pb-1">Preparo da Solução Final</h4>
                                {glucoseMixtureCalculations.isPossible ? (
                                    <>
                                        <ReportRow label={`Volume Glicose ${glucoseMixtureCalculations.concentration1}%`} value={glucoseMixtureCalculations.volumeC1.toFixed(1)} unit="mL" />
                                        <ReportRow label={`Volume Glicose ${glucoseMixtureCalculations.concentration2}%`} value={glucoseMixtureCalculations.volumeC2.toFixed(1)} unit="mL" />
                                    </>
                                ) : (
                                    <p className="text-xs text-red-700">Não é possível atingir {glucoseMixtureTargetConcentration.toFixed(1)}% com as fontes de glicose selecionadas.</p>
                                )}
                              </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Eletrólitos */}
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Eletrólitos, Oligoelementos & Vitaminas</h3>
                     <div className="bg-gray-50 p-3 rounded-md border border-gray-200 space-y-2">
                        <div>
                            <h4 className="font-semibold text-sm text-gray-700 pb-1">Fósforo</h4>
                            <ReportRow label="Fonte Selecionada" value={phosphorusSourceName} />
                            <ReportRow label="Fósforo Total" value={phosphorusCalculations.totalMEq.toFixed(1)} unit="mEq" />
                            <ReportRow label="Volume da Fonte" value={phosphorusCalculations.volume.toFixed(1)} unit="mL"/>
                        </div>
                        <div className="pt-1.5 border-t border-gray-200">
                            <h4 className="font-semibold text-sm text-gray-700 pb-1">Sódio</h4>
                            <ReportRow label="Sódio Prescrito" value={electrolyteCalculations.prescribedSodium.toFixed(1)} unit="mEq" />
                            {phosphorusSource === 'sodium' && <ReportRow label="(-) Sódio da Fonte" value={phosphorusCalculations.providedSodium.toFixed(1)} unit="mEq"/>}
                            <ReportRow label="Dose Ajustada" value={electrolyteCalculations.netSodiumToAdd.toFixed(1)} unit="mEq" />
                            <ReportRow label="Volume (NaCl 20%)" value={electrolyteCalculations.sodiumVolume.toFixed(1)} unit="mL" />
                        </div>
                        <div className="pt-1.5 border-t border-gray-200">
                           <h4 className="font-semibold text-sm text-gray-700 pb-1">Potássio</h4>
                           <ReportRow label="Potássio Prescrito" value={electrolyteCalculations.prescribedPotassium.toFixed(1)} unit="mEq" />
                           {phosphorusSource === 'potassium' && <ReportRow label="(-) Potássio da Fonte" value={phosphorusCalculations.providedPotassium.toFixed(1)} unit="mEq"/>}
                           <ReportRow label="Dose Ajustada" value={electrolyteCalculations.netPotassiumToAdd.toFixed(1)} unit="mEq" />
                           <ReportRow label="Volume (KCl 10%)" value={electrolyteCalculations.potassiumVolume.toFixed(1)} unit="mL" />
                        </div>
                         <div className="pt-1.5 border-t border-gray-200">
                            <h4 className="font-semibold text-sm text-gray-700 pb-1">Cálcio & Magnésio</h4>
                             <ReportRow label="Cálcio Total" value={electrolyteCalculations.totalCalcium.toFixed(1)} unit="mEq" />
                             <ReportRow label="Volume Cálcio (Gluconato 10%)" value={electrolyteCalculations.calciumVolume.toFixed(1)} unit="mL" />
                             <ReportRow label="Magnésio Total" value={electrolyteCalculations.totalMagnesium.toFixed(1)} unit="mEq" />
                             <ReportRow label="Volume Magnésio (Sulfato 50%)" value={electrolyteCalculations.magnesiumVolume.toFixed(1)} unit="mL" />
                        </div>
                         <div className="pt-1.5 border-t border-gray-200">
                            <h4 className="font-semibold text-sm text-gray-700 pb-1">Oligoelementos</h4>
                             <ReportRow label="Volume" value={oligoelementosVolume.toFixed(1)} unit="mL" />
                        </div>
                        <div className="pt-1.5 border-t border-gray-200">
                            <h4 className="font-semibold text-sm text-gray-700 pb-1">Vitaminas (Frutovitam)</h4>
                             <ReportRow label="Volume" value={vitaminsVolume.toFixed(1)} unit="mL" />
                        </div>
                    </div>
                </div>
            </main>
            {commonFooter}
        </div>


        {/* Page 3: Análises */}
        <div className="p-8" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <header className="text-center mb-8 border-b-2 border-gray-800 pb-4">
                <h1 className="text-3xl font-bold text-gray-900">Análise de Cálculos</h1>
                <p className="text-sm text-gray-500 mt-1">Distribuição Calórica, Osmolaridade & Fontes de Fósforo</p>
            </header>

            <main className="grow">
                 <section className="mb-6">
                    <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Análise da Distribuição Calórica</h2>
                    <div className="space-y-1 text-sm bg-gray-50 p-3 rounded-md border border-gray-200">
                        <ReportRow label="Calorias de Proteínas" value={`${caloricDistribution.protein.toFixed(1)} %`} />
                        <ReportRow label="Calorias de Lipídeos" value={`${caloricDistribution.lipid.toFixed(1)} %`} />
                        <ReportRow label="Calorias de Glicose" value={`${caloricDistribution.glucose.toFixed(1)} %`} />
                    </div>
                    {caloricDistribution.warnings.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-md text-xs space-y-1">
                            <p className="font-bold">Avisos sobre a distribuição:</p>
                            <ul className="list-disc list-inside">
                                {caloricDistribution.warnings.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                        </div>
                    )}
                </section>

                 <section className="mb-6">
                    <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Detalhamento da Osmolaridade</h2>
                    <div className="space-y-1 text-sm bg-gray-50 p-3 rounded-md border border-gray-200">
                        <ReportRow label="Aminoácidos (Conc. Final % x 100)" value={osmolarityCalculations.components.osm_AA.toFixed(0)} />
                        <ReportRow label="Glicose (Conc. Final % x 50)" value={osmolarityCalculations.components.osm_Glucose.toFixed(0)} />
                        <ReportRow label="Lipídeos (Gramas x 0.71)" value={osmolarityCalculations.components.osm_Lipids.toFixed(0)} />
                        <ReportRow label="Sódio (mEq Total x 2)" value={osmolarityCalculations.components.osm_Sodium.toFixed(0)} />
                        <ReportRow label="Potássio (mEq Total x 2)" value={osmolarityCalculations.components.osm_Potassium.toFixed(0)} />
                        <ReportRow label="Magnésio (mEq Total x 1)" value={osmolarityCalculations.components.osm_Magnesium.toFixed(0)} />
                        <ReportRow label="Cálcio (mEq Total x 1.4)" value={osmolarityCalculations.components.osm_Calcium.toFixed(0)} />
                        <div className="!mt-2 !pt-2 border-t font-bold">
                            <ReportRow label="OSMOLARIDADE TOTAL ESTIMADA" value={osmolarityCalculations.totalOsmolarity.toFixed(0)} unit="mOsm/L" />
                        </div>
                    </div>
                    {osmolarityCalculations.isPeripheralRouteWarning && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-800 rounded-md text-xs">
                            <p className="font-bold">Atenção: Osmolaridade Elevada</p>
                            <p>A osmolaridade de {osmolarityCalculations.totalOsmolarity.toFixed(0)} mOsm/L é superior a 900 mOsm/L, indicando a necessidade de acesso venoso central.</p>
                        </div>
                    )}
                </section>

                <div className="grid grid-cols-2 gap-8 pt-4">
                    {/* Column 1: Glicerofosfato */}
                    <div>
                        <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Cenário: Glicerofosfato de Sódio</h2>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-4 text-sm">
                            <div>
                                <h4 className="font-semibold text-base text-gray-700 pb-1">Fósforo</h4>
                                <ReportRow label="Dose Total" value={sodiumScenario.phosphorus.totalMEq.toFixed(1)} unit="mEq" />
                                <ReportRow label="Volume da Fonte" value={sodiumScenario.phosphorus.volume.toFixed(1)} unit="mL" />
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                                <h4 className="font-semibold text-base text-gray-700 pb-1">Sódio</h4>
                                <ReportRow label="Sódio Prescrito" value={sodiumScenario.electrolytes.prescribedSodium.toFixed(1)} unit="mEq" />
                                <ReportRow label="(-) Sódio da Fonte" value={sodiumScenario.phosphorus.providedSodium.toFixed(1)} unit="mEq" />
                                <ReportRow label="Dose Ajustada" value={sodiumScenario.electrolytes.netSodiumToAdd.toFixed(1)} unit="mEq" />
                                <ReportRow label="Volume (NaCl 20%)" value={sodiumScenario.electrolytes.sodiumVolume.toFixed(1)} unit="mL" />
                            </div>
                             <div className="pt-3 border-t border-gray-200 opacity-50">
                                <h4 className="font-semibold text-base text-gray-700 pb-1">Potássio (Não afetado)</h4>
                                <ReportRow label="Dose Ajustada" value={sodiumScenario.electrolytes.netPotassiumToAdd.toFixed(1)} unit="mEq" />
                                <ReportRow label="Volume (KCl 10%)" value={sodiumScenario.electrolytes.potassiumVolume.toFixed(1)} unit="mL" />
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Fosfato Ácido de Potássio */}
                    <div>
                        <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Cenário: Fosfato Ácido de Potássio</h2>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-4 text-sm">
                            <div>
                                <h4 className="font-semibold text-base text-gray-700 pb-1">Fósforo</h4>
                                <ReportRow label="Dose Total" value={potassiumScenario.phosphorus.totalMEq.toFixed(1)} unit="mEq" />
                                <ReportRow label="Volume da Fonte" value={potassiumScenario.phosphorus.volume.toFixed(1)} unit="mL" />
                            </div>
                            <div className="pt-3 border-t border-gray-200 opacity-50">
                                <h4 className="font-semibold text-base text-gray-700 pb-1">Sódio (Não afetado)</h4>
                                <ReportRow label="Dose Ajustada" value={potassiumScenario.electrolytes.netSodiumToAdd.toFixed(1)} unit="mEq" />
                                <ReportRow label="Volume (NaCl 20%)" value={potassiumScenario.electrolytes.sodiumVolume.toFixed(1)} unit="mL" />
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                                <h4 className="font-semibold text-base text-gray-700 pb-1">Potássio</h4>
                                <ReportRow label="Potássio Prescrito" value={potassiumScenario.electrolytes.prescribedPotassium.toFixed(1)} unit="mEq" />
                                <ReportRow label="(-) Potássio da Fonte" value={potassiumScenario.phosphorus.providedPotassium.toFixed(1)} unit="mEq" />
                                <ReportRow label="Dose Ajustada" value={potassiumScenario.electrolytes.netPotassiumToAdd.toFixed(1)} unit="mEq" />
                                <ReportRow label="Volume (KCl 10%)" value={potassiumScenario.electrolytes.potassiumVolume.toFixed(1)} unit="mL" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="text-center text-gray-500 text-xs mt-auto pt-4 border-t border-gray-200">
                <p>Esta página é uma análise comparativa e não a prescrição final. A prescrição oficial está na página 1.</p>
            </footer>
        </div>
    </div>
  );
};
