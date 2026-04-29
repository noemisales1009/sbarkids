import { Alerta } from '../services/alertasService';
import { GlobalReportItem } from '../types/reports';

export const getAlertStatusBadge = (status: string) => {
  const s = (status || '').toLowerCase();
  if (s === 'concluido' || s.includes('concluí')) return { label: 'Concluído', bg: '#10b981', color: '#fff' };
  if (s === 'fora_do_prazo' || s.includes('fora')) return { label: 'Fora do prazo', bg: '#ef4444', color: '#fff' };
  if (s.includes('arquivado') || s.includes('resolvido')) return { label: 'Arquivado', bg: '#6b7280', color: '#fff' };
  return { label: 'No prazo', bg: '#f59e0b', color: '#fff' };
};

export const buildShiftSection = (
  shiftKey: 'morning' | 'afternoon' | 'night',
  item: GlobalReportItem,
  alertasPorPaciente: Record<string, Alerta[]>,
): string => {
  const shiftInfo = {
    morning: { label: '🌅 MANHÃ', hours: '07:00 - 13:00', color: '#f97316', class: 'shift-morning' },
    afternoon: { label: '☀️ TARDE', hours: '13:00 - 19:00', color: '#eab308', class: 'shift-afternoon' },
    night: { label: '🌙 NOITE', hours: '19:00 - 07:00', color: '#4f46e5', class: 'shift-night' },
  }[shiftKey];

  const assessment = item.assessment[shiftKey];
  const assessmentBy = item.assessmentBy[shiftKey];
  const recommendation = item.recommendation[shiftKey];
  const recommendationBy = item.recommendationBy[shiftKey];
  const shiftAlerts = (alertasPorPaciente[item.patient.id] || []).filter(
    (a: any) => a.shift_criacao === shiftKey,
  );

  if (!assessment && !recommendation && shiftAlerts.length === 0) return '';

  return `
    <div class="shift-section ${shiftInfo.class}">
      <div class="shift-header" style="background:${shiftInfo.color};">
        <span>${shiftInfo.label}</span>
        <span style="font-size:11px;opacity:0.9;">${shiftInfo.hours}</span>
      </div>
      <div class="shift-content">
        ${assessment ? `
          <div class="sbar-block" style="background:#eff6ff;border-color:#bfdbfe;">
            <div class="sbar-label" style="color:#1e40af;"><span class="sbar-chip" style="background:#1e40af;">A</span> ASSESSMENT (Avaliação)</div>
            <div class="sbar-text">${assessment}</div>
            ${assessmentBy ? `<div class="sbar-author">✍️ Registrado por: <strong>${assessmentBy}</strong></div>` : ''}
          </div>
        ` : ''}
        ${recommendation ? `
          <div class="sbar-block" style="background:#f0fdf4;border-color:#bbf7d0;">
            <div class="sbar-label" style="color:#166534;"><span class="sbar-chip" style="background:#166534;">R</span> RECOMENDAÇÃO / PLANO</div>
            <div class="sbar-text">${recommendation}</div>
            ${recommendationBy ? `<div class="sbar-author">✍️ Registrado por: <strong>${recommendationBy}</strong></div>` : ''}
          </div>
        ` : ''}
        ${shiftAlerts.length > 0 ? `
          <div class="alerts-title">🔔 Alertas Clínicos (${shiftAlerts.length})</div>
          ${shiftAlerts.map((alert: any) => {
            const badge = getAlertStatusBadge(alert.live_status || alert.status || '');
            return `
              <div class="alert-item">
                <div class="alert-top">
                  <div class="alert-description">${alert.alertaclinico}</div>
                  <span class="alert-badge" style="background:${badge.bg};color:${badge.color};">${badge.label}</span>
                </div>
                ${alert.justificativa?.trim() ? `<div class="alert-justification"><strong>Justificativa:</strong> ${alert.justificativa}</div>` : ''}
              </div>
            `;
          }).join('')}
        ` : ''}
      </div>
    </div>
  `;
};

export const buildReportHtml = (
  item: GlobalReportItem,
  isLast: boolean,
  alertasPorPaciente: Record<string, Alerta[]>,
): string => {
  const patient = item.patient;
  return `
    <section class="report-page" ${isLast ? '' : 'style="page-break-after:always;"'}>
      <div class="brand-bar">
        <div>
          <h1>SBAR KIDS</h1>
          <div class="subtitle">Relatório Clínico do Paciente</div>
        </div>
        <div class="meta">
          <div>${item.datetime}</div>
          <div>Responsável: <strong>${item.author}</strong></div>
        </div>
      </div>
      <div class="patient-card">
        <h2 class="patient-name">${patient.name}</h2>
        <div class="patient-grid">
          <div class="patient-item"><span class="patient-label">Leito</span><span class="patient-value">${patient.bed_number || '-'}</span></div>
          <div class="patient-item"><span class="patient-label">Data Nasc.</span><span class="patient-value">${patient.dob ? new Date(patient.dob).toLocaleDateString('pt-BR') : '-'}</span></div>
          <div class="patient-item"><span class="patient-label">Status</span><span class="patient-value">${item.status}</span></div>
          <div class="patient-item"><span class="patient-label">Mãe</span><span class="patient-value">${patient.mother_name || '-'}</span></div>
        </div>
      </div>
      ${(['morning', 'afternoon', 'night'] as const).map(s => buildShiftSection(s, item, alertasPorPaciente)).join('')}
      <div class="doc-footer">Documento gerado automaticamente · SBAR Kids · ${new Date().toLocaleString('pt-BR')}</div>
    </section>
  `;
};

const PRINT_CSS = `
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: -apple-system,'Segoe UI',Roboto,Arial,sans-serif; padding: 24px 28px 32px; color: #1f2937; background: #fff; font-size: 13px; line-height: 1.55; }
  .report-page { padding-bottom: 20px; }
  .brand-bar { background: linear-gradient(90deg,#1e3a8a 0%,#2563eb 100%); color:#fff; padding:14px 20px; border-radius:10px 10px 0 0; display:flex; justify-content:space-between; align-items:center; }
  .brand-bar h1 { margin:0; font-size:24px; letter-spacing:0.5px; }
  .brand-bar .subtitle { font-size:12px; opacity:0.85; }
  .brand-bar .meta { font-size:11px; text-align:right; opacity:0.9; }
  .patient-card { border:1px solid #e5e7eb; border-top:none; border-radius:0 0 10px 10px; padding:14px 20px; margin-bottom:20px; background:#f9fafb; }
  .patient-name { font-size:20px; font-weight:700; color:#111827; margin:0 0 10px; }
  .patient-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; font-size:12px; }
  .patient-item { display:flex; flex-direction:column; }
  .patient-label { font-size:10px; font-weight:600; color:#2563eb; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:2px; }
  .patient-value { font-size:13px; font-weight:600; color:#111827; }
  .shift-section { margin-bottom:18px; border-radius:10px; overflow:hidden; border:1px solid #e5e7eb; page-break-inside:avoid; }
  .shift-header { padding:10px 16px; font-weight:700; font-size:14px; color:#fff; display:flex; justify-content:space-between; align-items:center; }
  .shift-morning { border-left:5px solid #f97316; }
  .shift-afternoon { border-left:5px solid #eab308; }
  .shift-night { border-left:5px solid #4f46e5; }
  .shift-content { padding:14px 16px; background:#fff; }
  .sbar-block { padding:12px; border:1px solid; border-radius:8px; margin-bottom:12px; }
  .sbar-label { font-weight:700; font-size:12px; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.3px; display:flex; align-items:center; gap:8px; }
  .sbar-chip { display:inline-block; width:22px; height:22px; line-height:22px; text-align:center; color:#fff; border-radius:4px; font-weight:700; }
  .sbar-text { font-size:13px; color:#1f2937; white-space:pre-wrap; word-wrap:break-word; }
  .sbar-author { margin-top:6px; padding-top:6px; border-top:1px dashed #d1d5db; font-size:11px; color:#6b7280; }
  .sbar-author strong { color:#111827; }
  .alerts-title { font-weight:700; font-size:12px; color:#374151; margin:14px 0 8px; text-transform:uppercase; letter-spacing:0.3px; }
  .alert-item { border:1px solid #e5e7eb; border-left:4px solid #2563eb; border-radius:8px; padding:10px 12px; margin-bottom:8px; background:#fff; page-break-inside:avoid; }
  .alert-top { display:flex; justify-content:space-between; align-items:start; gap:8px; margin-bottom:8px; }
  .alert-description { font-weight:700; font-size:13px; color:#111827; flex:1; }
  .alert-badge { font-size:10px; font-weight:700; padding:3px 8px; border-radius:999px; white-space:nowrap; }
  .alert-justification { margin-top:8px; padding:8px 10px; background:#f3f4f6; border-left:3px solid #9ca3af; border-radius:4px; font-size:11px; color:#374151; }
  .doc-footer { margin-top:24px; padding-top:12px; border-top:1px solid #e5e7eb; font-size:9px; color:#9ca3af; text-align:center; }
  @media print { body { padding:20px; } .shift-section { page-break-inside:auto; } .alert-item { page-break-inside:auto; } }
`;

export const openPrintWindow = (body: string) => {
  const html = `<html><head><meta charset="UTF-8"><title>SBAR Kids - Relatórios</title><style>${PRINT_CSS}</style></head><body>${body}</body></html>`;
  const win = window.open('', '', 'height=600,width=800');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 300);
  }
};
