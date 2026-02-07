// Currency formatting

const CURRENCY_LOCALES: Record<string, string> = {
  EUR: 'es-ES',
  USD: 'en-US',
  COP: 'es-CO',
  MXN: 'es-MX',
  GBP: 'en-GB',
  JPY: 'ja-JP',
};

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  const locale = CURRENCY_LOCALES[currency] || 'en-US';

  // Handle specific case for COP to remove decimals often not used or to ensuring nice formatting
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'COP' || currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'COP' || currency === 'JPY' ? 0 : 2,
  };

  return new Intl.NumberFormat(locale, options).format(amount);
};

// Date formatting with validation
const isValidDate = (date: string | Date): boolean => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

export const formatDate = (date: string | Date): string => {
  if (!isValidDate(date)) {
    console.warn('Fecha inválida proporcionada a formatDate:', date);
    return 'Fecha inválida';
  }

  try {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Error de fecha';
  }
};

export const formatShortDate = (date: string | Date): string => {
  if (!isValidDate(date)) {
    console.warn('Fecha inválida proporcionada a formatShortDate:', date);
    return '--/--';
  }

  try {
    return new Intl.DateTimeFormat('es-ES', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  } catch (error) {
    console.error('Error al formatear fecha corta:', error);
    return '--/--';
  }
};

export const formatMonthYear = (dateStr: string): string => {
  if (!dateStr || typeof dateStr !== 'string') {
    console.warn('Formato de fecha inválido en formatMonthYear:', dateStr);
    return 'Período desconocido';
  }

  try {
    // dateStr expects "YYYY-MM" or ISO date
    const [year, month] = dateStr.split('-');
    if (!year || !month || isNaN(parseInt(year)) || isNaN(parseInt(month))) {
      console.warn('Formato de mes/año inválido:', dateStr);
      return 'Período desconocido';
    }

    const date = new Date(parseInt(year), parseInt(month) - 1);
    if (isNaN(date.getTime())) {
      return 'Período desconocido';
    }

    const formatted = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(
      date
    );
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch (error) {
    console.error('Error al formatear mes/año:', error);
    return 'Período desconocido';
  }
};

// Percentage calculation
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Color utilities
export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Comida: '#10B981',
    Transporte: '#3B82F6',
    Vivienda: '#EF4444',
    Ocio: '#8B5CF6',
    Salud: '#F59E0B',
    Educación: '#EC4899',
    Salario: '#22C55E',
    'Meta de Ahorro': '#2DD4BF', // Teal for savings
    Otros: '#6B7280',
  };
  return colors[category] || colors['Otros'];
};

export const sortByDate = <T extends { date: string }>(
  array: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    // Manejar fechas inválidas
    if (isNaN(dateA) && isNaN(dateB)) return 0;
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};
