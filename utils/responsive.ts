/**
 * Breakpoints de Responsividade
 * Seguindo padrão Tailwind CSS
 */

export const BREAKPOINTS = {
  // Mobile first
  xs: '320px',    // Extra small devices
  sm: '640px',    // Small devices (tablets portrait)
  md: '768px',    // Medium devices (tablets landscape)
  lg: '1024px',   // Large devices (desktops)
  xl: '1280px',   // Extra large devices
  '2xl': '1536px' // Ultra large devices
} as const;

/**
 * Espaçamento responsivo
 */
export const RESPONSIVE_SPACING = {
  containerPadding: 'px-4 sm:px-6 md:px-8 lg:px-12',
  sectionGap: 'gap-3 sm:gap-4 md:gap-6',
  itemSpacing: 'space-y-3 sm:space-y-4 md:space-y-6',
} as const;

/**
 * Grid responsivo para listas
 */
export const RESPONSIVE_GRID = {
  // 1 coluna em mobile, 2 em tablet, 3 em desktop
  cards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
  // 1 coluna em mobile, 2 em desktop
  twoCol: 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6',
} as const;

/**
 * Tamanhos de fonte responsivos
 */
export const RESPONSIVE_TEXT = {
  title: 'text-2xl sm:text-3xl lg:text-4xl',
  heading: 'text-lg sm:text-xl lg:text-2xl',
  body: 'text-base sm:text-lg',
  caption: 'text-xs sm:text-sm',
} as const;

/**
 * Altura de componentes responsivos
 */
export const RESPONSIVE_HEIGHT = {
  button: 'h-10 sm:h-11 lg:h-12',
  input: 'h-10 sm:h-11 lg:h-12',
  card: 'min-h-32 sm:min-h-40 lg:min-h-48',
} as const;
