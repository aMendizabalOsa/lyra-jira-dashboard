const MS_PER_DAY = 1000 * 60 * 60 * 24;

const BUCKETS = ['Hotfix', 'High', 'Medium', 'Low'];

// Prioridad "de negocio" real -> nombre del campo priority en Jira.
// "Normal" es el valor que usa Jira para lo que el negocio llama "Medium"
// (el valor "Medium" del esquema de prioridades existe pero no se usa).
const PRIORITY_NAME_TO_BUCKET = {
  High: 'High',
  Normal: 'Medium',
  Low: 'Low',
};

/**
 * Clasifica un issue en Hotfix / High / Medium / Low:
 * - Hotfix si el campo de checkbox de hotfix tiene alguna opción marcada,
 *   sin importar la prioridad.
 * - Si no, según PRIORITY_NAME_TO_BUCKET.
 * Devuelve null si no encaja en ninguna categoría (issues así deberían haber
 * sido excluidos ya por la JQL, pero se filtran también aquí por seguridad).
 */
function classifyBucket(issue, hotfixFieldId) {
  const hotfixValue = issue.fields?.[hotfixFieldId];
  if (Array.isArray(hotfixValue) && hotfixValue.length > 0) return 'Hotfix';

  const priorityName = issue.fields?.priority?.name;
  return PRIORITY_NAME_TO_BUCKET[priorityName] || null;
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function emptyByBucket() {
  return Object.fromEntries(BUCKETS.map((b) => [b, 0]));
}

/**
 * Cuenta issues por bucket. Siempre incluye las 4 categorías (con 0 si no hay
 * issues en esa categoría) para que el frontend no tenga que rellenar huecos.
 */
function countByPriority(issues, hotfixFieldId) {
  const byPriority = emptyByBucket();
  let total = 0;
  for (const issue of issues) {
    const bucket = classifyBucket(issue, hotfixFieldId);
    if (!bucket) continue;
    byPriority[bucket] += 1;
    total += 1;
  }
  return { total, byPriority };
}

function average(numbers) {
  if (numbers.length === 0) return 0;
  return round1(numbers.reduce((sum, n) => sum + n, 0) / numbers.length);
}

/**
 * Media de días entre `fromField` y `toDate` (o ahora), global y por bucket,
 * junto con el número de issues (n) que entran en cada media.
 */
function averageAgeDaysByPriority(issues, fromField, hotfixFieldId, toDate = new Date()) {
  const byBucketDays = Object.fromEntries(BUCKETS.map((b) => [b, []]));
  const allDays = [];

  for (const issue of issues) {
    const bucket = classifyBucket(issue, hotfixFieldId);
    const fromValue = issue.fields?.[fromField];
    if (!bucket || !fromValue) continue;

    const days = (toDate.getTime() - new Date(fromValue).getTime()) / MS_PER_DAY;
    allDays.push(days);
    byBucketDays[bucket].push(days);
  }

  const byPriority = {};
  for (const bucket of BUCKETS) {
    byPriority[bucket] = { average: average(byBucketDays[bucket]), count: byBucketDays[bucket].length };
  }

  return { overallAverage: average(allDays), overallCount: allDays.length, byPriority };
}

/**
 * Media de días entre `fromField` y `toField` (p.ej. created -> resolutiondate),
 * global y por bucket, junto con el número de issues (n) que entran en cada media.
 */
function averageDurationDaysByPriority(issues, fromField, toField, hotfixFieldId) {
  const byBucketDays = Object.fromEntries(BUCKETS.map((b) => [b, []]));
  const allDays = [];

  for (const issue of issues) {
    const bucket = classifyBucket(issue, hotfixFieldId);
    const fromValue = issue.fields?.[fromField];
    const toValue = issue.fields?.[toField];
    if (!bucket || !fromValue || !toValue) continue;

    const days = (new Date(toValue).getTime() - new Date(fromValue).getTime()) / MS_PER_DAY;
    allDays.push(days);
    byBucketDays[bucket].push(days);
  }

  const byPriority = {};
  for (const bucket of BUCKETS) {
    byPriority[bucket] = { average: average(byBucketDays[bucket]), count: byBucketDays[bucket].length };
  }

  return { overallAverage: average(allDays), overallCount: allDays.length, byPriority };
}

/**
 * Evolución semanal de la media de días que llevaban abiertos los bugs que
 * estaban abiertos en cada semana de las últimas `weeks` semanas.
 *
 * No hace falta consultar el historial de cambios de cada issue: un bug
 * estaba "abierto" en una fecha D si created <= D y (no tiene resolutiondate,
 * o resolutiondate > D). `openIssues` (abiertos ahora) + `closedIssues`
 * (resueltos en los últimos 6 meses) ya cubren exactamente el conjunto de
 * bugs que pudieron estar abiertos en algún punto de esa ventana.
 */
function weeklyOpenAgeTrend(openIssues, closedIssues, hotfixFieldId, weeks = 26) {
  const combined = [...openIssues, ...closedIssues]
    .map((issue) => ({ issue, bucket: classifyBucket(issue, hotfixFieldId) }))
    .filter(({ bucket }) => bucket !== null);
  const now = new Date();

  const points = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekDate = new Date(now.getTime() - i * 7 * MS_PER_DAY);
    const allAges = [];
    const agesByBucket = Object.fromEntries(BUCKETS.map((b) => [b, []]));

    for (const { issue, bucket } of combined) {
      const createdValue = issue.fields?.created;
      if (!createdValue) continue;
      const created = new Date(createdValue);
      if (created > weekDate) continue;

      const resolutiondateValue = issue.fields?.resolutiondate;
      if (resolutiondateValue && new Date(resolutiondateValue) <= weekDate) continue;

      const age = (weekDate.getTime() - created.getTime()) / MS_PER_DAY;
      allAges.push(age);
      agesByBucket[bucket].push(age);
    }

    const byPriority = {};
    for (const bucket of BUCKETS) {
      byPriority[bucket] = { average: average(agesByBucket[bucket]), count: agesByBucket[bucket].length };
    }

    points.push({
      weekStart: weekDate.toISOString(),
      averageAgeDays: average(allAges),
      openCount: allAges.length,
      byPriority,
    });
  }

  return points;
}

// Tramos de días por bucket de prioridad, usados tanto para "días de media
// abiertos" (antigüedad) como para "tiempo medio de resolución" (duración) —
// misma frontera para las dos métricas. min inclusivo, max exclusivo
// (Infinity para el último tramo abierto).
const HIGH_MEDIUM_RANGES = [
  { label: '< 15 días', min: 0, max: 15 },
  { label: '15-45 días', min: 15, max: 45 },
  { label: '45-90 días', min: 45, max: 90 },
  { label: '90-180 días', min: 90, max: 180 },
  { label: '180-360 días', min: 180, max: 360 },
  { label: '> 360 días', min: 360, max: Infinity },
];

const DAY_RANGES_BY_BUCKET = {
  Hotfix: [
    { label: '< 15 días', min: 0, max: 15 },
    { label: '≥ 15 días', min: 15, max: Infinity },
  ],
  High: HIGH_MEDIUM_RANGES,
  Medium: HIGH_MEDIUM_RANGES,
  Low: [
    { label: '< 90 días', min: 0, max: 90 },
    { label: '90-180 días', min: 90, max: 180 },
    { label: '180-360 días', min: 180, max: 360 },
    { label: '> 360 días', min: 360, max: Infinity },
  ],
};

function ageDays(issue, fromField, toDate = new Date()) {
  const fromValue = issue.fields?.[fromField];
  if (!fromValue) return null;
  return (toDate.getTime() - new Date(fromValue).getTime()) / MS_PER_DAY;
}

function durationDays(issue, fromField, toField) {
  const fromValue = issue.fields?.[fromField];
  const toValue = issue.fields?.[toField];
  if (!fromValue || !toValue) return null;
  return (new Date(toValue).getTime() - new Date(fromValue).getTime()) / MS_PER_DAY;
}

/**
 * Distribuye issues en los tramos de días de DAY_RANGES_BY_BUCKET, por
 * prioridad. `computeDays(issue)` calcula los días (antigüedad o duración)
 * de cada issue; issues sin ese dato (null) se ignoran. Cada tramo incluye
 * las claves de los issues que caen en él, para poder construir un enlace
 * "key in (...)" a Jira sin depender de fechas de corte en la JQL (que no
 * sirven para "tiempo de resolución", al ser una resta entre dos campos).
 */
function dayRangeDistribution(issues, hotfixFieldId, computeDays) {
  const byPriority = {};
  for (const bucket of BUCKETS) {
    byPriority[bucket] = DAY_RANGES_BY_BUCKET[bucket].map((range) => ({
      ...range,
      count: 0,
      keys: [],
    }));
  }

  for (const issue of issues) {
    const bucket = classifyBucket(issue, hotfixFieldId);
    if (!bucket) continue;
    const days = computeDays(issue);
    if (days == null) continue;

    const ranges = byPriority[bucket];
    const range = ranges.find((r) => days >= r.min && days < r.max) || ranges[ranges.length - 1];
    range.count += 1;
    range.keys.push(issue.key);
  }

  return byPriority;
}

module.exports = {
  BUCKETS,
  countByPriority,
  averageAgeDaysByPriority,
  averageDurationDaysByPriority,
  weeklyOpenAgeTrend,
  dayRangeDistribution,
  ageDays,
  durationDays,
};
