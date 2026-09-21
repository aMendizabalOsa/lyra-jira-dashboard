// Fuente de verdad: pestaña del dashboard -> proyecto real de Jira.
// Para activar una pestaña nueva, basta con poner su jiraProjectKey real,
// su hotfixFieldId (customfield_XXXXX del checkbox "Hotfix" de ese proyecto,
// consultable vía GET /rest/api/3/field) y enabled: true.
module.exports = {
  lyra: {
    jiraProjectKey: 'LYRA',
    bugIssueType: 'Bug',
    hotfixFieldId: 'customfield_10154',
    enabled: true,
  },
  cpuapp: { jiraProjectKey: null, bugIssueType: 'Bug', hotfixFieldId: null, enabled: false },
  dspapp: { jiraProjectKey: null, bugIssueType: 'Bug', hotfixFieldId: null, enabled: false },
  fpgaapp: { jiraProjectKey: null, bugIssueType: 'Bug', hotfixFieldId: null, enabled: false },
};
