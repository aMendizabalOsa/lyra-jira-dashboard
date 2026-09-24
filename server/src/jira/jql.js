// jiraProjectKey puede ser un único key ("LYRA") o una lista de keys
// (DspApp/CpuApp/FpgaApp, que son varios proyectos de Jira en lugar de uno).
function projectClause(jiraProjectKey) {
  const keys = Array.isArray(jiraProjectKey) ? jiraProjectKey : [jiraProjectKey];
  return `project in (${keys.map((key) => `"${key}"`).join(', ')})`;
}

module.exports = { projectClause };
