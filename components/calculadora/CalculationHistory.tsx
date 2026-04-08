import React, { useState, useEffect } from 'react'
import { getPatientCalculations } from '../../services/nptDatabaseService'

interface CalculationHistoryProps {
  patientId: string | null
  patientName: string
}

interface Calculation {
  id: string
  created_at: string
  weight: number
  total_volume: number
  total_calories: number
  osmolarity: number
  status: string
  notes: string | null
  amino_acid_dose: number
  lipid_dose: number
  protein_concentration: number
  lipid_concentration: number
  glucose_source_1: number
  glucose_source_2: number
  sodium_dose: number
  potassium_dose: number
  calcium_dose: number
  magnesium_dose: number
  phosphorus_dose: number
  phosphorus_source: string
  date_of_birth: string
  glucose_concentration_final: number
  calorie_nitrogen_ratio: number
  hydration_target: number
  npt_stages: number | null
  amino_acid_volume: number | null
  lipid_volume: number | null
  glucose_volume_1: number | null
  glucose_volume_2: number | null
  nacl_volume: number | null
  kcl_volume: number | null
  phosphorus_volume: number | null
  calcium_volume: number | null
  magnesium_volume: number | null
  oligoelementos_volume: number | null
  vitamins_volume: number | null
  volume_per_bag: number | null
  infusion_rate: number | null
  tig: number | null
  access_recommendation: string | null
  caloric_dist_protein: number | null
  caloric_dist_lipid: number | null
  caloric_dist_glucose: number | null
  users?: {
    name: string
  }
}

export const CalculationHistory: React.FC<CalculationHistoryProps> = ({
  patientId,
  patientName
}) => {
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!patientId) {
      setCalculations([])
      return
    }

    const fetchCalculations = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getPatientCalculations(patientId)
        setCalculations(data as Calculation[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar histórico')
        console.error('Erro ao buscar cálculos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCalculations()
  }, [patientId])

  const handlePrintPharmacy = (calc: Calculation) => {
    if (!calc.amino_acid_volume) {
      alert('Esta prescrição não possui os volumes salvos. Salve novamente pela calculadora.')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const formattedDob = new Date(calc.date_of_birth).toLocaleDateString('pt-BR')
    const generatedDate = new Date(calc.created_at).toLocaleDateString('pt-BR')
    const stages = calc.npt_stages || 1
    const stagesHours: Record<number, number> = { 1: 24, 2: 12, 4: 6 }
    const infusionHours = stagesHours[stages] || 24
    const phosphorusSourceName = calc.phosphorus_source === 'sodium' ? 'Glicerofosfato de Sódio' : 'Fosfato Ácido de Potássio'

    const getVol = (v: number | null) => v ? (v / stages).toFixed(1) : '0.0'
    const volumePerBag = calc.volume_per_bag || (calc.total_volume / stages)
    const infusionRate = calc.infusion_rate || (volumePerBag / infusionHours)

    const renderBag = (bagNumber: number | null) => {
      const title = stages === 1
        ? 'Prescrição NPT - Etapa Única (24h)'
        : `Prescrição NPT - Etapa ${bagNumber} de ${stages} (${infusionHours}h)`

      // Separação de fósforo/cálcio para fosfato de potássio com 2+ bolsas
      const needsSeparation = calc.phosphorus_source === 'potassium' && stages >= 2
      const pVol = (needsSeparation && bagNumber === 2) ? '0.0' : getVol(calc.phosphorus_volume)
      const caVol = (needsSeparation && bagNumber === 1) ? '0.0' : getVol(calc.calcium_volume)

      return `
        <div style="border: 1px solid #666; padding: 8px; border-radius: 8px; margin-bottom: 16px;">
          <h3 style="text-align: center; font-size: 14pt; margin-bottom: 8px;">${title}</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10pt; margin-bottom: 8px;">
            <p><strong>Paciente:</strong> ${patientName}</p>
            <p><strong>Data Nasc:</strong> ${formattedDob}</p>
            <p><strong>Peso:</strong> ${calc.weight} kg</p>
            <p><strong>Data:</strong> ${generatedDate}</p>
          </div>
          <div style="font-family: monospace; font-size: 10pt; line-height: 1.6;">
            <p>Aminoácidos ${calc.protein_concentration}% --- ${getVol(calc.amino_acid_volume)} mL</p>
            <p>Lipídeos ${calc.lipid_concentration}% --- ${getVol(calc.lipid_volume)} mL</p>
            <p>Glicose ${calc.glucose_source_1}% --- ${getVol(calc.glucose_volume_1)} mL</p>
            <p>Glicose ${calc.glucose_source_2}% --- ${getVol(calc.glucose_volume_2)} mL</p>
            <p>NaCl 20% --- ${getVol(calc.nacl_volume)} mL</p>
            <p>KCl 10% --- ${getVol(calc.kcl_volume)} mL</p>
            <p>${phosphorusSourceName} --- ${pVol} mL</p>
            <p>Gluconato de Cálcio 10% --- ${caVol} mL</p>
            <p>Sulfato de Magnésio 50% --- ${getVol(calc.magnesium_volume)} mL</p>
            <p>Oligoelementos --- ${getVol(calc.oligoelementos_volume)} mL</p>
            <p>Vitaminas (Frutovitam) --- ${getVol(calc.vitamins_volume)} mL</p>
          </div>
          <div style="margin-top: 8px; padding-top: 6px; border-top: 2px solid #000; display: flex; justify-content: space-between; font-weight: bold; font-size: 10pt;">
            <span>Volume Total: ${volumePerBag.toFixed(1)} mL</span>
            <span>Vazão: ${infusionRate.toFixed(1)} mL/h</span>
          </div>
        </div>
      `
    }

    const bagsHtml = stages === 1
      ? renderBag(null)
      : Array.from({ length: stages }, (_, i) => renderBag(i + 1)).join('')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Prescrição Farmácia - ${patientName}</title>
          <style>
            @page { size: A4; margin: 10mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: serif; font-size: 11pt; color: #000; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body style="padding: 20px;">
          <h1 style="text-align: center; font-size: 18pt; margin-bottom: 16px;">Prescrição para Manipulação de NPT</h1>

          ${bagsHtml}

          <div style="border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; font-size: 9pt;">
            <h4 style="text-align: center; font-weight: bold; margin-bottom: 8px;">PARÂMETROS PRESCRITOS & INDICADORES</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 4px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #ccc;">
              <p><strong>Aminoácidos:</strong> ${calc.amino_acid_dose} g/kg</p>
              <p><strong>Lipídeos:</strong> ${calc.lipid_dose} g/kg</p>
              <p><strong>Sódio:</strong> ${calc.sodium_dose} mEq/100mL</p>
              <p><strong>Potássio:</strong> ${calc.potassium_dose} mEq/100mL</p>
              <p><strong>Cálcio:</strong> ${calc.calcium_dose} mEq/kg</p>
              <p><strong>Magnésio:</strong> ${calc.magnesium_dose} mEq/kg</p>
              <p><strong>Fósforo:</strong> ${calc.phosphorus_dose} mEq/kg</p>
              <p><strong>Cal/gN:</strong> ${calc.calorie_nitrogen_ratio}</p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
              <div>
                <p><strong>Osmolaridade:</strong> ${calc.osmolarity?.toFixed(0)} mOsm/L</p>
                <p style="font-weight: bold; margin-top: 4px;">RECOMENDAÇÃO DE ACESSO: ${calc.access_recommendation || (calc.osmolarity > 900 ? 'CENTRAL' : 'PERIFÉRICO')}</p>
              </div>
              <div style="text-align: right;">
                <p><strong>Conc. Glicose:</strong> ${calc.glucose_concentration_final?.toFixed(1)}%</p>
                <p><strong>TIG:</strong> ${calc.tig?.toFixed(2) || 'N/A'} mg/kg/min</p>
                <p><strong>Calorias:</strong> ${calc.total_calories?.toFixed(0)} kcal</p>
              </div>
            </div>
            ${calc.caloric_dist_protein ? `
              <div style="text-align: center; font-size: 8pt; color: #666;">
                Distribuição Calórica: Proteínas ${calc.caloric_dist_protein?.toFixed(0)}% | Lipídeos ${calc.caloric_dist_lipid?.toFixed(0)}% | Glicose ${calc.caloric_dist_glucose?.toFixed(0)}%
              </div>
            ` : ''}
            <div style="text-align: center; padding-top: 30px;">
              <span style="display: inline-block; border-top: 2px solid #000; padding: 4px 40px;">Assinatura e Carimbo do Médico</span>
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    setTimeout(() => { printWindow.print() }, 250)
  }

  const handlePrint = (calc: Calculation) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Prescrição NPT - ${patientName}</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 11pt;
              line-height: 1.4;
              color: #000;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .header h1 {
              font-size: 16pt;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .section {
              margin-bottom: 12px;
            }
            .section h2 {
              font-size: 12pt;
              font-weight: bold;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
              margin-bottom: 8px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              border-bottom: 1px solid #ddd;
            }
            .row-label {
              font-weight: bold;
              flex: 1;
            }
            .row-value {
              flex: 1;
              text-align: right;
            }
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-bottom: 10px;
            }
            .grid-4 {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr 1fr;
              gap: 10px;
              margin-bottom: 10px;
            }
            .box {
              border: 1px solid #ddd;
              padding: 8px;
              border-radius: 4px;
            }
            .signature-area {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 2px solid #000;
              text-align: center;
            }
            .signature-line {
              display: inline-block;
              border-top: 1px solid #000;
              width: 150px;
              padding-top: 5px;
              font-size: 10pt;
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Prescrição para Manipulação de NPT</h1>
            <p>Cálculo Histórico</p>
          </div>

          <div class="section">
            <h2>Dados do Paciente</h2>
            <div class="row">
              <span class="row-label">Paciente:</span>
              <span class="row-value">${patientName}</span>
            </div>
            <div class="row">
              <span class="row-label">Peso:</span>
              <span class="row-value">${calc.weight} kg</span>
            </div>
            <div class="row">
              <span class="row-label">Data de Nascimento:</span>
              <span class="row-value">${new Date(calc.date_of_birth).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="row">
              <span class="row-label">Data do Cálculo:</span>
              <span class="row-value">${formatDate(calc.created_at)}</span>
            </div>
            <div class="row">
              <span class="row-label">Criado por:</span>
              <span class="row-value">${calc.users?.name || 'N/A'}</span>
            </div>
          </div>

          <div class="section">
            <h2>Composição da NPT</h2>
            <div class="grid-2">
              <div class="box">
                <strong>Aminoácidos ${calc.protein_concentration}%</strong><br>
                ${calc.amino_acid_dose} g/kg
              </div>
              <div class="box">
                <strong>Lipídeos ${calc.lipid_concentration}%</strong><br>
                ${calc.lipid_dose} g/kg
              </div>
            </div>
            <div class="row">
              <span class="row-label">Glicose:</span>
              <span class="row-value">${calc.glucose_source_1}% e ${calc.glucose_source_2}%</span>
            </div>
          </div>

          <div class="section">
            <h2>Eletrólitos</h2>
            <div class="grid-2">
              <div class="box">
                <strong>Sódio</strong><br>
                ${calc.sodium_dose} mEq/100mL
              </div>
              <div class="box">
                <strong>Potássio</strong><br>
                ${calc.potassium_dose} mEq/100mL
              </div>
              <div class="box">
                <strong>Cálcio</strong><br>
                ${calc.calcium_dose} mEq/kg
              </div>
              <div class="box">
                <strong>Magnésio</strong><br>
                ${calc.magnesium_dose} mEq/kg
              </div>
            </div>
            <div class="row">
              <span class="row-label">Fósforo:</span>
              <span class="row-value">${calc.phosphorus_dose} mEq/kg (${calc.phosphorus_source === 'sodium' ? 'Glicerofosfato de Sódio' : 'Fosfato Ácido de Potássio'})</span>
            </div>
          </div>

          <div class="section">
            <h2>Resultados</h2>
            <div class="grid-4">
              <div class="box">
                <strong>Volume Total</strong><br>
                ${calc.total_volume?.toFixed(1)} mL
              </div>
              <div class="box">
                <strong>Calorias</strong><br>
                ${calc.total_calories?.toFixed(0)} kcal
              </div>
              <div class="box">
                <strong>Osmolaridade</strong><br>
                ${calc.osmolarity?.toFixed(0)} mOsm/L
              </div>
              <div class="box">
                <strong>Vazão (24h)</strong><br>
                ${(calc.total_volume / 24).toFixed(1)} mL/h
              </div>
            </div>
            <div class="row">
              <span class="row-label">Concentração de Glicose Final:</span>
              <span class="row-value">${calc.glucose_concentration_final?.toFixed(1)}%</span>
            </div>
          </div>

          ${calc.notes ? `
            <div class="section">
              <h2>Observações</h2>
              <div class="box">
                ${calc.notes}
              </div>
            </div>
          ` : ''}

          <div class="signature-area">
            <div class="signature-line">Assinatura e Carimbo do Médico</div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  if (!patientId) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <span className="text-6xl mb-4 block">📋</span>
        <p className="text-gray-500">Selecione um paciente para ver o histórico</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Carregando histórico...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-800">⚠️ {error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📜</span>
            <div>
              <h2 className="text-2xl font-bold text-white">Histórico de Cálculos</h2>
              <p className="text-purple-100 text-sm">Cálculos de NPT para {patientName}</p>
            </div>
          </div>
        </div>

        {/* Lista de Cálculos */}
        <div className="p-6">
          {calculations.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🔍</span>
              <p className="text-gray-500 text-lg">Nenhum cálculo encontrado</p>
              <p className="text-gray-400 text-sm mt-2">Os cálculos salvos aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {calculations.map((calc) => (
                <div
                  key={calc.id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          📅 {new Date(calc.created_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </h3>
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-bold uppercase
                          ${calc.status === 'ativo' ? 'bg-green-100 text-green-800' :
                            calc.status === 'revisado' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'}
                        `}>
                          {calc.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        👤 Criado por: <span className="font-medium">{calc.users?.name || 'Desconhecido'}</span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {calc.amino_acid_volume && (
                        <button
                          onClick={() => handlePrintPharmacy(calc)}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                        >
                          📋 Prescrição Farmácia
                        </button>
                      )}
                      <button
                        onClick={() => handlePrint(calc)}
                        className="bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 text-sm border border-gray-300"
                      >
                        🖨️ Detalhado
                      </button>
                    </div>
                  </div>

                  {/* Dados do Cálculo - Resumo Principal */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4 border-2 border-purple-200">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-medium">Peso</p>
                      <p className="text-lg font-bold text-gray-800">{calc.weight} kg</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-medium">Volume Total</p>
                      <p className="text-lg font-bold text-blue-600">{calc.total_volume?.toFixed(1)} mL</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-medium">Calorias</p>
                      <p className="text-lg font-bold text-green-600">{calc.total_calories?.toFixed(0)} kcal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-medium">Conc. Glicose</p>
                      <p className="text-lg font-bold text-amber-600">{calc.glucose_concentration_final?.toFixed(1)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-medium">Osmolaridade</p>
                      <p className="text-lg font-bold text-purple-600">{calc.osmolarity?.toFixed(0)} mOsm/L</p>
                    </div>
                  </div>

                  {/* Indicadores de Eficácia */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-red-50 rounded-lg p-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-red-600 font-semibold">TIG</p>
                      <p className="text-sm font-bold text-gray-800">{((calc.total_volume * calc.glucose_concentration_final) / (calc.weight * 144)).toFixed(2)} mg/kg/min</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-red-600 font-semibold">Cal/gN</p>
                      <p className="text-sm font-bold text-gray-800">{calc.calorie_nitrogen_ratio}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-red-600 font-semibold">Vazão (24h)</p>
                      <p className="text-sm font-bold text-gray-800">{(calc.total_volume / 24).toFixed(1)} mL/h</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-red-600 font-semibold">Hidratação</p>
                      <p className="text-sm font-bold text-gray-800">{calc.hydration_target} mL/m²</p>
                    </div>
                  </div>

                  {/* Eletrólitos */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-amber-50 rounded-lg p-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-amber-600 font-semibold">Sódio</p>
                      <p className="text-sm font-bold text-gray-800">{calc.sodium_dose} mEq</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-amber-600 font-semibold">Potássio</p>
                      <p className="text-sm font-bold text-gray-800">{calc.potassium_dose} mEq</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-amber-600 font-semibold">Cálcio</p>
                      <p className="text-sm font-bold text-gray-800">{calc.calcium_dose} mEq/kg</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-amber-600 font-semibold">Magnésio</p>
                      <p className="text-sm font-bold text-gray-800">{calc.magnesium_dose} mEq/kg</p>
                    </div>
                  </div>

                  {/* Fósforo */}
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-green-600 font-semibold">Fósforo</p>
                      <p className="text-sm font-bold text-gray-800">{calc.phosphorus_dose} mEq/kg ({calc.phosphorus_source === 'sodium' ? 'Glicerofosfato de Sódio' : 'Fosfato Ácido de Potássio'})</p>
                    </div>
                  </div>

                  {/* Composição e Distribuição Calórica */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-indigo-50 rounded-lg p-4 mb-4">
                    <div className="text-center border-r border-indigo-200">
                      <p className="text-xs text-indigo-600 font-semibold">Proteína %</p>
                      <p className="text-sm font-bold text-gray-800">{calc.protein_concentration}%</p>
                    </div>
                    <div className="text-center border-r border-indigo-200">
                      <p className="text-xs text-indigo-600 font-semibold">Lipídio %</p>
                      <p className="text-sm font-bold text-gray-800">{calc.lipid_concentration}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-indigo-600 font-semibold">Glicose %</p>
                      <p className="text-sm font-bold text-gray-800">{calc.glucose_source_1}% / {calc.glucose_source_2}%</p>
                    </div>
                  </div>

                  {/* Observações */}
                  {calc.notes && (
                    <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">💬 Observações:</span> {calc.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {calculations.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center font-medium">
              📊 Total de cálculos: <span className="font-bold text-purple-600">{calculations.length}</span>
            </p>
          </div>
        )}
      </div>


    </>
  )
}
