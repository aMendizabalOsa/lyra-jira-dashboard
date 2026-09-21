// Rampa ordinal de un solo tono (azul), clara -> oscura, validada con
// scripts/validate_palette.js del skill de dataviz (--ordinal, ambos modos).
// Refleja la clasificación de negocio: Hotfix (campo hotfix activo, cualquier
// prioridad) > High > Medium (= priority "Normal" en Jira) > Low.
export const PRIORITY_ORDER = ['Hotfix', 'High', 'Medium', 'Low'];

const LIGHT = {
  Hotfix: '#0d366b',
  High: '#1c5cab',
  Medium: '#3987e5',
  Low: '#86b6ef',
};

const DARK = {
  Hotfix: '#184f95',
  High: '#256abf',
  Medium: '#5598e7',
  Low: '#9ec5f4',
};

const FALLBACK = { light: '#898781', dark: '#898781' };

export function priorityColor(name, mode = 'light') {
  const table = mode === 'dark' ? DARK : LIGHT;
  return table[name] || FALLBACK[mode];
}

// Ordena un byPriority de la API (siempre trae las 4 categorías) según
// PRIORITY_ORDER y extrae, para cada una, el valor que marca la altura de la
// barra (`valueKey`: "count" para gráficas de conteo, "average" para medias
// de días), junto con el nº de bugs (`count`) y el link a Jira de esa
// categoría, para el tooltip y el click.
export function toOrderedSeries(byPriority = {}, valueKey = 'count') {
  return PRIORITY_ORDER.map((name) => {
    const entry = byPriority[name] || {};
    return {
      name,
      value: entry[valueKey] || 0,
      count: entry.count ?? entry[valueKey] ?? 0,
      link: entry.link,
    };
  });
}
