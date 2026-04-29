import React from 'react';
import { Alerta } from '../../services/alertasService';
import { GlobalReportItem } from '../../types/reports';

interface PrintableContentProps {
  items: GlobalReportItem[];
  alertasPorPaciente: Record<string, Alerta[]>;
}

type Shift = 'morning' | 'afternoon' | 'night';

const SHIFTS: { key: Shift; emoji: string; label: string; border: string; textColor: string }[] = [
  { key: 'morning', emoji: '🌅', label: 'MANHÃ', border: 'border-orange-400', textColor: 'text-orange-600' },
  { key: 'afternoon', emoji: '☀️', label: 'TARDE', border: 'border-yellow-400', textColor: 'text-yellow-600' },
  { key: 'night', emoji: '🌙', label: 'NOITE', border: 'border-blue-400', textColor: 'text-blue-600' },
];

const PrintableContent: React.FC<PrintableContentProps> = ({ items, alertasPorPaciente }) => (
  <div className="print-only font-serif">
    {items.map((item) => (
      <div key={item.id} className="print-page-break flex flex-col h-full relative p-2">
        {/* Cabeçalho Institucional */}
        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="size-16 bg-gray-200 flex items-center justify-center rounded-full border border-gray-400">
              <span className="material-symbols-outlined text-4xl text-gray-600">local_hospital</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wide">
                Hospital Infantil Dr. Juvêncio Mattos
              </h1>
              <p className="text-sm text-gray-600">Rua São Pantaleão S/N - Centro | São Luís - MA</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">RELATÓRIO SBAR</h2>
            <p className="text-sm font-medium">Sistema SBAR KIDS</p>
          </div>
        </div>

        {/* Identificação do Paciente */}
        <div className="print-border rounded p-4 mb-6 bg-gray-50">
          <h3 className="text-sm uppercase font-bold text-gray-500 mb-2 border-b border-gray-300 pb-1">
            Identificação do Paciente
          </h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div><span className="font-semibold">Nome:</span> {item.patient.name}</div>
            <div>
              <span className="font-semibold">Leito:</span>{' '}
              <span className="text-lg font-bold">{item.patient.bed_number}</span>
            </div>
            <div><span className="font-semibold">Data Nasc.:</span> {item.patient.dob}</div>
            {item.patient.mother_name && (
              <div><span className="font-semibold">Nome da Mãe:</span> {item.patient.mother_name}</div>
            )}
            <div className="col-span-2 mt-1">
              <span className="font-semibold">Status:</span> {item.status}
            </div>
          </div>
        </div>

        {/* Metadados do Relatório */}
        <div className="mb-4 text-sm flex justify-between bg-gray-100 p-2 rounded print-border">
          <span><strong>Data:</strong> {item.datetime}</span>
          <span><strong>Médico:</strong> {item.author}</span>
        </div>

        {/* Turnos */}
        <div className="grow space-y-4">
          {SHIFTS.map(({ key, emoji, label, border, textColor }) => {
            const hasContent = item.assessment[key] || item.recommendation[key];
            const shiftAlerts = (alertasPorPaciente[item.patient.id] || []).filter(
              (a: any) => a.shift_criacao === key,
            );
            if (!hasContent && shiftAlerts.length === 0) return null;

            return (
              <div key={key} className="print-border rounded p-4">
                <div className={`flex items-center gap-2 mb-3 border-b-2 ${border} pb-2`}>
                  <span className="text-2xl">{emoji}</span>
                  <strong className={`text-lg uppercase ${textColor}`}>{label}</strong>
                </div>

                {item.assessment[key] && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold bg-gray-200 px-2 py-1 rounded">A</span>
                      <span className="font-semibold text-sm">ASSESSMENT (Avaliação)</span>
                    </div>
                    <p className="text-sm pl-8 text-justify leading-relaxed">{item.assessment[key]}</p>
                  </div>
                )}

                {item.recommendation[key] && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold bg-gray-200 px-2 py-1 rounded">R</span>
                      <span className="font-semibold text-sm">RECOMENDAÇÃO / PLANO</span>
                    </div>
                    <p className="text-sm pl-8 text-justify leading-relaxed">{item.recommendation[key]}</p>
                  </div>
                )}

                {shiftAlerts.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold bg-red-100 px-2 py-1 rounded text-red-700">⚠</span>
                      <span className="font-semibold text-sm text-red-700">ALERTAS CLÍNICOS</span>
                    </div>
                    {shiftAlerts.map((alert: any) => (
                      <div key={alert.id_alerta} className="text-xs mb-2 border-l-2 border-red-300 pl-3">
                        <p className="font-semibold">{alert.alertaclinico}</p>
                        <p className="text-gray-600">Responsável: {alert.responsavel}</p>
                        <p className="text-gray-600">Status: {alert.status}</p>
                        {alert.justificativa && (
                          <p className="italic text-gray-600">Justificativa: {alert.justificativa}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {!item.assessment.morning &&
            !item.assessment.afternoon &&
            !item.assessment.night &&
            !item.recommendation.morning &&
            !item.recommendation.afternoon &&
            !item.recommendation.night && (
              <div className="text-center py-6 text-gray-500 italic">
                Nenhum registro de avaliação ou recomendação encontrado
              </div>
            )}
        </div>

        {/* Assinatura */}
        <div className="mt-12 mb-4 pt-10">
          <div className="grid grid-cols-2 gap-10">
            <div className="text-center">
              <div className="border-t border-black w-3/4 mx-auto mb-2"></div>
              <p className="font-bold text-sm">{item.author}</p>
              <p className="text-xs">Médico Responsável</p>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-3/4 mx-auto mb-2"></div>
              <p className="font-bold text-sm">Carimbo / CRM / COREN</p>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] text-gray-400 border-t pt-2">
          Impresso em {new Date().toLocaleString()} - Sistema SBAR KIDS - Página 1/1
        </div>
      </div>
    ))}
  </div>
);

export default PrintableContent;
