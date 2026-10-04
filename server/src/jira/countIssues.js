const jiraClient = require('./client');

/**
 * Nº de issues que cumplen una JQL, sin descargarlos (endpoint
 * /rest/api/3/search/approximate-count).
 */
async function countIssues(jql) {
  const { data } = await jiraClient.post('/rest/api/3/search/approximate-count', { jql });
  return data.count;
}

module.exports = { countIssues };
