function jiraIssueSearchUrl(baseUrl, jql) {
  return `${baseUrl}/issues/?jql=${encodeURIComponent(jql)}`;
}

module.exports = { jiraIssueSearchUrl };
