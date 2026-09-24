const { searchIssues } = require('../jira/searchIssues');
const { jiraIssueSearchUrl } = require('../jira/jiraLinks');
const { projectClause } = require('../jira/jql');
const { jiraBaseUrl } = require('../config/env');
const {
  BUCKETS,
  TARGET_DAYS,
  countByPriority,
  averageAgeDaysByPriority,
  averageDurationDaysByPriority,
  weeklyOpenAgeTrend,
  dayRangeDistribution,
  ageDays,
  durationDays,
} = require('./aggregate');

const TREND_WEEKS = 26; // ~6 meses

const RESOLUTION_WINDOW_MONTHS = 6;
// JQL "-6M" no funciona en esta instancia (la unidad de mes no se parsea y la
// consulta devuelve 0 resultados en vez de un error) — verificado en vivo
// contra cafpower.atlassian.net. "-26w" (~6 meses) sí funciona.
const RESOLUTION_WINDOW_JQL = '-26w';

// Bugs "clasificables" son solo los que encajan en hotfix/high/medium/low
// (ver aggregate.js: "Normal" = medium). El resto de prioridades (Blocker,
// Minor, "High (migrated)") se excluyen del dashboard a petición del usuario.
const PRIORITY_BY_BUCKET = { High: 'High', Medium: 'Normal', Low: 'Low' };

function hotfixClauseId(hotfixFieldId) {
  return hotfixFieldId.replace('customfield_', '');
}

// JQL que encaja cualquiera de las 4 categorías (usada para traer todos los
// issues relevantes de una vez y clasificarlos en memoria).
function classifiableFilter(hotfixFieldId) {
  const priorityList = Object.values(PRIORITY_BY_BUCKET)
    .map((p) => `"${p}"`)
    .join(', ');
  return `(cf[${hotfixClauseId(hotfixFieldId)}] is not EMPTY OR priority in (${priorityList}))`;
}

// JQL exacta de una sola categoría, para los enlaces "ver en Jira".
function bucketFilter(bucket, hotfixFieldId) {
  const id = hotfixClauseId(hotfixFieldId);
  if (bucket === 'Hotfix') return `cf[${id}] is not EMPTY`;
  return `cf[${id}] is EMPTY AND priority = "${PRIORITY_BY_BUCKET[bucket]}"`;
}

// Construye el link "ver todos" y un link por cada bucket, a partir de una
// JQL base (sin el filtro de clasificación todavía).
function buildLinks(baseJql, hotfixFieldId) {
  const overall = jiraIssueSearchUrl(jiraBaseUrl, `${baseJql} AND ${classifiableFilter(hotfixFieldId)}`);
  const byPriority = {};
  for (const bucket of BUCKETS) {
    byPriority[bucket] = jiraIssueSearchUrl(jiraBaseUrl, `${baseJql} AND ${bucketFilter(bucket, hotfixFieldId)}`);
  }
  return { overall, byPriority };
}

function withLinks(countsByPriority, links) {
  const byPriority = {};
  for (const bucket of BUCKETS) {
    byPriority[bucket] = { count: countsByPriority[bucket], link: links.byPriority[bucket] };
  }
  return byPriority;
}

function withAverageLinks(averagesByPriority, links) {
  const byPriority = {};
  for (const bucket of BUCKETS) {
    byPriority[bucket] = { ...averagesByPriority[bucket], link: links.byPriority[bucket] };
  }
  return byPriority;
}

// Link "ver estos issues concretos" a partir de sus claves — no se puede
// expresar el tiempo de resolución (resolutiondate - created) como fecha de
// corte en JQL al ser una resta entre dos campos, así que en vez de eso se
// listan las claves exactas que ya se clasificaron en cada tramo.
function buildKeyLink(keys) {
  if (!keys.length) return null;
  return jiraIssueSearchUrl(jiraBaseUrl, `key in (${keys.join(',')})`);
}

function withDistributionLinks(distributionByBucket) {
  const byPriority = {};
  for (const bucket of BUCKETS) {
    byPriority[bucket] = distributionByBucket[bucket].map(({ label, min, max, withinTarget, count, keys }) => ({
      label,
      min,
      max: Number.isFinite(max) ? max : null,
      withinTarget,
      count,
      link: buildKeyLink(keys),
    }));
  }
  return byPriority;
}

async function getBugStats({ tabKey, displayName, jiraProjectKey, bugIssueType, hotfixFieldId }) {
  const baseOpenJql = `${projectClause(jiraProjectKey)} AND issuetype = "${bugIssueType}" AND statusCategory != Done`;
  const baseClosedJql = `${projectClause(jiraProjectKey)} AND issuetype = "${bugIssueType}" AND statusCategory = Done AND resolutiondate >= ${RESOLUTION_WINDOW_JQL}`;

  const openJql = `${baseOpenJql} AND ${classifiableFilter(hotfixFieldId)}`;
  const closedJql = `${baseClosedJql} AND ${classifiableFilter(hotfixFieldId)}`;

  const [openIssues, closedIssues] = await Promise.all([
    searchIssues(openJql, ['priority', 'created', 'status', hotfixFieldId]),
    searchIssues(closedJql, ['priority', 'created', 'resolutiondate', 'status', hotfixFieldId]),
  ]);

  const openLinks = buildLinks(baseOpenJql, hotfixFieldId);
  const closedLinks = buildLinks(baseClosedJql, hotfixFieldId);

  const open = countByPriority(openIssues, hotfixFieldId);
  const closedLast6Months = countByPriority(closedIssues, hotfixFieldId);
  const openAge = averageAgeDaysByPriority(openIssues, 'created', hotfixFieldId);
  const resolutionTime = averageDurationDaysByPriority(
    closedIssues,
    'created',
    'resolutiondate',
    hotfixFieldId
  );
  const openAgeTrend = weeklyOpenAgeTrend(openIssues, closedIssues, hotfixFieldId, TREND_WEEKS);
  const openAgeDistribution = dayRangeDistribution(openIssues, hotfixFieldId, (issue) =>
    ageDays(issue, 'created')
  );
  const resolutionDistribution = dayRangeDistribution(closedIssues, hotfixFieldId, (issue) =>
    durationDays(issue, 'created', 'resolutiondate')
  );

  return {
    tabKey,
    displayName,
    jiraProjectKey,
    issueType: bugIssueType,
    generatedAt: new Date().toISOString(),
    targetDays: TARGET_DAYS,
    open: {
      total: open.total,
      link: openLinks.overall,
      byPriority: withLinks(open.byPriority, openLinks),
    },
    closedLast6Months: {
      total: closedLast6Months.total,
      link: closedLinks.overall,
      byPriority: withLinks(closedLast6Months.byPriority, closedLinks),
    },
    openAgeDays: {
      referenceField: 'created',
      overallAverage: openAge.overallAverage,
      overallCount: openAge.overallCount,
      overallLink: openLinks.overall,
      byPriority: withAverageLinks(openAge.byPriority, openLinks),
      distributionByPriority: withDistributionLinks(openAgeDistribution),
    },
    resolutionTimeDays: {
      windowMonths: RESOLUTION_WINDOW_MONTHS,
      overallAverage: resolutionTime.overallAverage,
      overallCount: resolutionTime.overallCount,
      overallLink: closedLinks.overall,
      byPriority: withAverageLinks(resolutionTime.byPriority, closedLinks),
      distributionByPriority: withDistributionLinks(resolutionDistribution),
    },
    weeklyOpenAgeTrend: {
      weeks: TREND_WEEKS,
      points: openAgeTrend,
    },
  };
}

module.exports = { getBugStats };
