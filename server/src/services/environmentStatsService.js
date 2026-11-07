const { searchIssues } = require('../jira/searchIssues');
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

async function statsForType({ jiraProjectKey, issueType, jiraIssueType = issueType, environmentFieldId }) {
  const fieldClause = `cf[${environmentFieldId.replace('customfield_', '')}]`;
  const base = `${projectClause(jiraProjectKey)} AND issuetype = "${jiraIssueType}"`;
  const withEnv = `${base} AND ${fieldClause} is not EMPTY`;

  const withoutEnv = `${base} AND ${fieldClause} is EMPTY`;

  // Recuento exacto de los que no tienen Environment: approximate-count
  // devolvía la misma cifra para conjuntos de proyectos distintos.
  const [issues, missing] = await Promise.all([
    searchIssues(withEnv, [environmentFieldId]),
    searchIssues(withoutEnv, ['key']),
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
    withoutEnvironment: missing.length,
    withoutEnvironmentLink: jiraIssueSearchUrl(jiraBaseUrl, withoutEnv),
    link: jiraIssueSearchUrl(jiraBaseUrl, withEnv),
    slices,
  };
}

// storyIssueType: nombre real en Jira del tipo equivalente a Story (BMS lo llama "Nuevo desarrollo").
async function getEnvironmentStats({ jiraProjectKey, environmentFieldId, storyIssueType }) {
  const byType = await Promise.all(
    ISSUE_TYPES.map((issueType) =>
      statsForType({
        jiraProjectKey,
        issueType,
        jiraIssueType: issueType === 'Story' && storyIssueType ? storyIssueType : issueType,
        environmentFieldId,
      })
    )
  );
  return byType;
}

module.exports = { getEnvironmentStats };
