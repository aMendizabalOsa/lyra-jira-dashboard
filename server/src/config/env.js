require('dotenv').config();

const required = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Faltan variables de entorno requeridas: ${missing.join(', ')}. ` +
      'Copia server/.env.example a server/.env y rellénalo.'
  );
}

module.exports = {
  jiraBaseUrl: process.env.JIRA_BASE_URL.replace(/\/+$/, ''),
  jiraEmail: process.env.JIRA_EMAIL,
  jiraApiToken: process.env.JIRA_API_TOKEN,
  port: Number(process.env.PORT) || 4000,
};
