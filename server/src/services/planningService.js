const { searchIssues } = require('../jira/searchIssues');
const { jiraIssueSearchUrl } = require('../jira/jiraLinks');
const { projectClause } = require('../jira/jql');
const { jiraBaseUrl } = require('../config/env');

const NEW_ISSUES_WINDOW_JQL = '-2w';

// A diferencia de las estadísticas, aquí entran todos los tipos de issue, no
// solo bugs. "Sin planificar" = sin sprint y todavía sin resolver: un issue ya
// resuelto sin sprint no tiene nada que planificar.
const LISTS = {
  newIssues: `created >= ${NEW_ISSUES_WINDOW_JQL}`,
  unplanned: 'sprint is EMPTY AND resolution is EMPTY',
  unresolved: 'resolution is EMPTY',
};

async function countLists(jiraProjectKey) {
  const base = projectClause(jiraProjectKey);

  const entries = await Promise.all(
    Object.entries(LISTS).map(async ([key, filter]) => {
      const jql = `${base} AND ${filter} ORDER BY created DESC`;
      // Se piden solo las claves: interesa el recuento exacto, no los datos.
      const issues = await searchIssues(jql, ['key']);
      return [key, { total: issues.length, link: jiraIssueSearchUrl(jiraBaseUrl, jql) }];
    })
  );

  return Object.fromEntries(entries);
}

// Issues creados en la ventana `window` (JQL relativo, p. ej. -30d), contados
// por tipo de issue y por nivel (sin planificar y prioridad > Low / sin
// planificar / todos), en el orden de `tiers`.
async function countRecentByType(jiraProjectKey, { window, windowLabel, tiers, issueTypes }) {
  const base = projectClause(jiraProjectKey);

  const tierFilters = (unplannedFilter) => ({
    all: null,
    unplanned: unplannedFilter,
    unplannedHigh: `${unplannedFilter} AND priority > Low`,
  });

  const types = await Promise.all(
    issueTypes.map(async ({ type, unplannedFilter }) => {
      const filters = tierFilters(unplannedFilter);
      const counts = await Promise.all(
        tiers.map(async ({ key, label }) => {
          const extra = filters[key] ? ` AND ${filters[key]}` : '';
          const jql = `${base} AND issuetype = "${type}" AND created >= ${window}${extra} ORDER BY created DESC`;
          const issues = await searchIssues(jql, ['key']);
          return { key, label, total: issues.length, link: jiraIssueSearchUrl(jiraBaseUrl, jql) };
        })
      );
      return { type, counts };
    })
  );

  return { windowLabel, types };
}

// Sin planningGroups, toda la pestaña es un único grupo sin título.
async function getPlanning({ tabKey, displayName, jiraProjectKey, planningGroups, recentIssues }) {
  if (recentIssues) {
    return {
      kind: 'recentByType',
      tabKey,
      displayName,
      generatedAt: new Date().toISOString(),
      ...(await countRecentByType(jiraProjectKey, recentIssues)),
    };
  }

  const groupDefs = planningGroups || [{ key: 'all', label: null, jiraProjectKey }];

  const groups = await Promise.all(
    groupDefs.map(async (group) => ({
      key: group.key,
      label: group.label,
      ...(await countLists(group.jiraProjectKey)),
    }))
  );

  return {
    tabKey,
    displayName,
    generatedAt: new Date().toISOString(),
    groups,
  };
}

module.exports = { getPlanning };
