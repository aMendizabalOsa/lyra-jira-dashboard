const path = require('path');

// En el ejecutable empaquetado con pkg, el .env va junto al .exe; en
// desarrollo se usa server/.env (el cwd de `npm run dev`).
const isPackaged = Boolean(process.pkg);
const envPath = isPackaged ? path.join(path.dirname(process.execPath), '.env') : path.resolve('.env');

require('dotenv').config({ path: envPath });

const required = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Faltan variables de entorno requeridas: ${missing.join(', ')}. ` +
      `Crea ${envPath} a partir de .env.example y rellénalo.`
  );
}

module.exports = {
  isPackaged,
  envPath,
  jiraBaseUrl: process.env.JIRA_BASE_URL.replace(/\/+$/, ''),
  jiraEmail: process.env.JIRA_EMAIL,
  jiraApiToken: process.env.JIRA_API_TOKEN,
  port: Number(process.env.PORT) || 4000,
};
