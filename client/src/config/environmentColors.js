// Paleta categórica de 8 tonos del skill de dataviz (validada en ambos modos
// con scripts/validate_palette.js sobre pares adyacentes). El color sigue al
// entorno, no a su posición: el orden de ENVIRONMENT_ORDER es el mismo que usa
// el servidor (services/environmentStatsService.js, NAMED_ENVIRONMENTS).
export const ENVIRONMENT_ORDER = [
  'Development',
  'CombTest',
  'HIL',
  'PCTest',
  'TrackTest',
  'RoutineTest',
  'UnitTest',
  'FactoryTest',
];

const LIGHT = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];
const DARK = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];

// "Otros" agrupa los entornos sin color propio: gris neutro, no un tono de serie.
const OTHERS = '#898781';

export function environmentColor(name, mode = 'light') {
  const index = ENVIRONMENT_ORDER.indexOf(name);
  if (index === -1) return OTHERS;
  return (mode === 'dark' ? DARK : LIGHT)[index];
}
