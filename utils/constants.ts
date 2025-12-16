/**
 * Constantes da aplicação
 */

// Status cores do paciente
export const PATIENT_STATUS_COLORS = {
    'Crítico': 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    'Estável': 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    'Observação': 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
} as const;

// Status cores do histórico
export const HISTORY_STATUS_CONFIG = {
    'Urgente': { icon: 'error', bgColor: 'bg-urgent/10', textColor: 'text-urgent' },
    'Atenção': { icon: 'warning', bgColor: 'bg-attention/10', textColor: 'text-attention' },
    'Normal': { icon: 'check_circle', bgColor: 'bg-normal/10', textColor: 'text-normal' },
    'Informativo': { icon: 'info', bgColor: 'bg-info/10', textColor: 'text-info' },
} as const;

// Formato de data
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
