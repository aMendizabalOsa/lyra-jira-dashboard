// Números en formato español (coma decimal), con un decimal como máximo.
const NUMBER = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 });

export function formatNumber(value) {
  return value == null ? '' : NUMBER.format(value);
}

export function formatDays(value) {
  return `${formatNumber(value)} días`;
}
