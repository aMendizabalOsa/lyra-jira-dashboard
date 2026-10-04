const { searchIssues } = require('../jira/searchIssues');
const { countIssues } = require('../jira/countIssues');
const { jiraIssueSearchUrl } = require('../jira/jiraLinks');
const { projectClause } = require('../jira/jql');
const { jiraBaseUrl } = require('../config/env');

// Tipos de issue que se analizan, cada uno con su donut.
const ISSUE_TYPES = ['Bug', 'Story'];

// Valores del campo Environment que tienen color propio, en orden fijo (el
// color sigue al entorno, no a su ranking; ver client/src/config/environmentColors.js).
// Los demás (Service, MultiProject, valores futuros…) se agrupan en "Otros":
// la paleta categórica validada solo da para 8 colores.
const NAMED_ENVIRONMENTS = [
  'Development',
  'CombTest',
  'HIL',
  'PCTest',
  'TrackTest',
  'RoutineTest',
  'UnitTest',
  'FactoryTest',
];
const OTHERS = 'Otros';

function quote(values) {
  return values.map((v) => `"${v.replace(/"/g, '\\"')}"`).join(', ');
}

async function statsForType({ jiraProjectKey, issueType, environmentFieldId }) {
  const fieldClause = `cf[${environmentFieldId.replace('customfield_', '')}]`;
  const base = `${projectClause(jiraProjectKey)} AND issuetype = "${issueType}"`;
  const withEnv = `${base} AND ${fieldClause} is not EMPTY`;

  const [issues, all] = await Promise.all([
    searchIssues(withEnv, [environmentFieldId]),
    countIssues(base),
  ]);

  const counts = {};
  for (const issue of issues) {
    const name = issue.fields[environmentFieldId]?.value;
    if (name) counts[name] = (counts[name] || 0) + 1;
  }

  const link = (filter) => jiraIssueSearchUrl(jiraBaseUrl, `${withEnv} AND ${filter}`);

  const slices = NAMED_ENVIRONMENTS.filter((name) => counts[name]).map((name) => ({
    name,
    count: counts[name],
    link: link(`${fieldClause} = ${quote([name])}`),
  }));

  const otherNames = Object.keys(counts).filter((name) => !NAMED_ENVIRONMENTS.includes(name));
  if (otherNames.length) {
    slices.push({
      name: OTHERS,
      count: otherNames.reduce((sum, name) => sum + counts[name], 0),
      link: link(`${fieldClause} in (${quote(otherNames)})`),
      includes: otherNames.sort(),
    });
  }

  return {
    issueType,
    total: issues.length,
    // Issues del tipo sin Environment informado: no entran en el donut.
    withoutEnvironment: Math.max(all - issues.length, 0),
    link: jiraIssueSearchUrl(jiraBaseUrl, withEnv),
    slices,
  };
}

async function getEnvironmentStats({ jiraProjectKey, environmentFieldId }) {
  const byType = await Promise.all(
    ISSUE_TYPES.map((issueType) => statsForType({ jiraProjectKey, issueType, environmentFieldId }))
  );
  return byType;
}

module.exports = { getEnvironmentStats };
