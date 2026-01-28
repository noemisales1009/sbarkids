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

// Lista de medicações
export const MEDICATION_LIST: string[] = [
    'Epinefrina',
    'Noraepinefrina',
    'Milrinona',
    'Dobutamina',
    'Vasopressina',
    'Nipride',
    'Midazolam',
    'Fentanyl (Fentanila)',
    'Morfina',
    'Precedex (Dexmedetomidina)',
    'Propofol',
    'Clonidina',
    'Cetamina',
    'Tiopental',
    'Lorazepam',
    'Metadona',
    'Diazepam',
    'Fenitoína',
    'Fenobarbital',
    'Topiramato',
    'Levetiracetam',
    'Ácido Valproico',
    'Oxcarbazepina',
    'Furosemida',
    'Hidroclorotiazida',
    'Omeprazol',
    'Espironolactona',
    'Acetazolamida',
    'Bicarbonato de Sódio',
    'Correção de Potássio',
    'Hidrocortisona',
    'Octreotida',
    'N-Acetilcisteína',
    'Vitamina K',
    'Complexo Protrombínico',
    'Plasma Fresco',
    'Concentrado de Hemácias',
    'Plaquetas',
    'Crioprecipitado',
    'Tazocin',
    'Meropenem',
    'Polimixina B',
    'Amicacina',
    'Ceftriaxone',
    'Teicoplanina',
    'Vancomicina',
    'Cefepime',
    'Cefazolina',
    'Metronidazol',
    'Gentamicina',
    'Tigeciclina',
    'Torgena',
    'Aztreonam',
    'Anfotericina B',
    'Fluconazol',
    'Micafungina',
    'Outro'
];

// Unidades de dosagem
export const MEDICATION_DOSAGE_UNITS: string[] = [
    'mg/dia',
    'mg/h',
    'mg/kg/dia',
    'mg/kg/h',
    'mg/kg/min',
    'mg/ml',
    'UI/dia',
    'UI/h',
    'UI/kg/dia',
    'UI/kg/h',
    'UI/kg/min',
    'UI/ml',
    'ug/dia',
    'ug/h',
    'ug/kg/dia',
    'ug/kg/h',
    'ug/kg/min',
    'ug/ml'
];

// Tipos de dispositivos
export const DEVICE_TYPES: string[] = [
    'AVP1',
    'AVP2',
    'CNAF',
    'CURATIVO À VÁCUO',
    'CVC 1',
    'CVC 2',
    'CATETER DE SHILLY',
    'CATETER DE TENCKHOFF',
    'DRENO TORÁXICO D',
    'DRENO TORÁXICO E',
    'DVE',
    'GTT',
    'OUTROS DRENOS',
    'PICC1',
    'PICC2',
    'SNE',
    'SNG',
    'SVD',
    'TOT',
    'VENTURY',
    'VNI',
    'VPM',
    'Outros'
];

// Locais e acessos para dispositivos
export const DEVICE_LOCATIONS: string[] = [
    'ABDOME',
    'CABEÇA',
    'FACE',
    'HTD',
    'HTE',
    'LOCAIS',
    'MÃO D',
    'MÃO E',
    'MID',
    'MIE',
    'MSD',
    'MSE',
    'NASAL',
    'ORAL',
    'PÉ D',
    'PÉ E',
    'PERÍNEO',
    'REGIÃO LOMBAR',
    'TRAQUÉIA',
    'TRONCO',
    'VBD',
    'VBE',
    'VFD',
    'VFE',
    'VJID',
    'VJIE',
    'VJED',
    'VJEE',
    'VSD',
    'VSE'
];
// Lista de locais de coleta para culturas
export const CULTURE_COLLECTION_SITES: string[] = [
    'Swab nasal',
    'Swab orofaríngeo',
    'Swab retal',
    'Secreção traqueal',
    'Broncoaspirado',
    'Lavado broncoalveolar (LBA)',
    'Urocultura (jato médio)',
    'Urocultura por sonda',
    'Ponta de cateter',
    'Cateter venoso central (CVC)',
    'Cateter arterial',
    'Punção de líquor (LCR)',
    'Punção de abscesso',
    'Secreção de ferida operatória',
    'Secreção de dreno cirúrgico',
    'Hemocultura periférica',
    'Hemocultura de cateter',
    'Escarro (quando aplicável)',
    'Fezes para cultura',
    'Material de pele/lesão cutânea',
    'Secreção ocular',
    'Secreção ótica',
    'Outros'
];