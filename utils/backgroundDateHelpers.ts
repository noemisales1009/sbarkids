export const convertDateFormat = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  dateStr = String(dateStr).trim();
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
  if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [dia, mes, ano] = dateStr.split('/');
    return `${ano}-${mes}-${dia}`;
  }
  return dateStr;
};

// Calcula dias de uso a partir de uma data de início (fuso de São Paulo)
export const calculateDaysOfUsage = (dataInicio: string | null | undefined): number => {
  try {
    if (!dataInicio) return 0;
    dataInicio = dataInicio.trim();

    let startDate: Date;

    if (dataInicio.includes('-') && !dataInicio.includes('/')) {
      startDate = new Date(dataInicio + 'T00:00:00');
    } else if (dataInicio.includes('/')) {
      const parts = dataInicio.split('/');
      if (parts.length === 3) {
        startDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      } else {
        return 0;
      }
    } else {
      startDate = new Date(dataInicio);
    }

    if (isNaN(startDate.getTime())) return 0;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = today.getTime() - startDate.getTime();
    return Math.max(Math.floor(diff / (24 * 60 * 60 * 1000)), 0);
  } catch {
    return 0;
  }
};
