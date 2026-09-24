// Paleta de estado (skill de dataviz, "Status palette": fija, igual en claro y
// oscuro y reservada para significar bien/mal). Aquí codifica el cumplimiento
// del objetivo de resolución por prioridad (targetDays de la API).
export const STATUS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
};

// Escala de retraso: de warning a critical pasando por serious.
const OVER_STOPS = [STATUS.warning, STATUS.serious, STATUS.critical];

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a, b, t) {
  const [ra, ga, ba] = hexToRgb(a);
  const [rb, gb, bb] = hexToRgb(b);
  const channel = (x, y) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${channel(ra, rb)}${channel(ga, gb)}${channel(ba, bb)}`;
}

// t en [0, 1] a lo largo de OVER_STOPS.
function overColor(t) {
  const scaled = t * (OVER_STOPS.length - 1);
  const i = Math.min(Math.floor(scaled), OVER_STOPS.length - 2);
  return mix(OVER_STOPS[i], OVER_STOPS[i + 1], scaled - i);
}

// Color de cada tramo de una distribución: verde los que están dentro del
// objetivo; el resto recorre warning -> critical, siendo el último siempre
// rojo (y si solo hay uno fuera del objetivo, ese es directamente rojo).
export function rangeColors(ranges) {
  const overCount = ranges.filter((r) => !r.withinTarget).length;
  let overIndex = 0;
  return ranges.map((r) => {
    if (r.withinTarget) return STATUS.good;
    const t = overCount === 1 ? 1 : overIndex / (overCount - 1);
    overIndex += 1;
    return overColor(t);
  });
}

// Color de una media de días frente a su objetivo: verde si lo cumple; si no,
// más rojo cuanto más lo supera (rojo del todo a partir del doble).
export function averageColor(value, target) {
  if (value <= target) return STATUS.good;
  return overColor(Math.min(value / target - 1, 1));
}
