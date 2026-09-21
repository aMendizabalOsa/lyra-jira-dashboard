const jiraClient = require('./client');

const MAX_PAGES = 50; // salvaguarda: 50 * 100 = 5000 issues como máximo por consulta

/**
 * Ejecuta una JQL y devuelve TODOS los issues, paginando con nextPageToken
 * sobre el endpoint moderno /rest/api/3/search/jql (sustituye al /search clásico,
 * que Atlassian está retirando en Cloud).
 */
async function searchIssues(jql, fields) {
  const issues = [];
  let nextPageToken;
  let page = 0;

  do {
    const { data } = await jiraClient.post('/rest/api/3/search/jql', {
      jql,
      maxResults: 100,
      fields,
      ...(nextPageToken ? { nextPageToken } : {}),
    });

    issues.push(...(data.issues || []));
    nextPageToken = data.nextPageToken;
    page += 1;

    if (page >= MAX_PAGES) {
      console.warn(
        `[searchIssues] Límite de ${MAX_PAGES} páginas alcanzado para JQL: ${jql}. Resultados truncados.`
      );
      break;
    }
  } while (nextPageToken);

  return issues;
}

module.exports = { searchIssues };
