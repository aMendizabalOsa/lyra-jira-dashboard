const app = require('./app');
const { port } = require('./config/env');
const { verifyAuth } = require('./jira/verifyAuth');

async function start() {
  try {
    const me = await verifyAuth();
    console.log(`Autenticado en Jira como: ${me.displayName} (${me.emailAddress})`);
  } catch (err) {
    console.error(
      'No se pudo autenticar contra Jira. Revisa JIRA_EMAIL y JIRA_API_TOKEN en server/.env.'
    );
    console.error(err.response?.data || err.message);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Servidor backend escuchando en http://localhost:${port}`);
  });
}

start();
