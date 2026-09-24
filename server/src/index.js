const http = require('http');
const { isPackaged, logPath, redirectConsoleToLogFile, showErrorDialog, openBrowser } = require('./desktop');

if (isPackaged) redirectConsoleToLogFile();

function exitWithError(...lines) {
  console.error(lines.join('\n'));
  if (isPackaged) showErrorDialog(`${lines.join('\n\n')}\n\nMás detalles en ${logPath}`);
  process.exit(1);
}

// ¿Lo que ocupa el puerto es otra instancia del dashboard?
function isDashboardRunning(url) {
  return new Promise((resolve) => {
    http
      .get(`${url}/api/health`, { timeout: 2000 }, (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      })
      .on('error', () => resolve(false))
      .on('timeout', function onTimeout() {
        this.destroy();
        resolve(false);
      });
  });
}

async function start() {
  let app, env, verifyAuth;
  try {
    env = require('./config/env');
    app = require('./app');
    ({ verifyAuth } = require('./jira/verifyAuth'));
  } catch (err) {
    return exitWithError(err.message);
  }

  try {
    const me = await verifyAuth();
    console.log(`Autenticado en Jira como: ${me.displayName} (${me.emailAddress})`);
  } catch (err) {
    const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    return exitWithError(
      `No se pudo autenticar contra Jira. Revisa JIRA_EMAIL y JIRA_API_TOKEN en ${env.envPath}.`,
      detail
    );
  }

  const url = `http://localhost:${env.port}`;
  // El ejecutable solo escucha en local: la API da acceso a Jira con las
  // credenciales del usuario y permite cerrar la aplicación.
  const host = isPackaged ? '127.0.0.1' : undefined;

  const server = app.listen(env.port, host, () => {
    console.log(`Servidor escuchando en ${url}`);
    if (isPackaged) openBrowser(url);
  });

  server.on('error', async (err) => {
    if (err.code === 'EADDRINUSE') {
      // Abrir el .exe con el dashboard ya abierto: basta con mostrarlo.
      if (isPackaged && (await isDashboardRunning(`http://127.0.0.1:${env.port}`))) {
        console.log('El dashboard ya estaba abierto: se abre el navegador y se sale.');
        openBrowser(url);
        return process.exit(0);
      }
      return exitWithError(
        `El puerto ${env.port} ya está en uso por otra aplicación.`,
        `Cámbialo con PORT en ${env.envPath}.`
      );
    }
    exitWithError(err.message);
  });
}

start();
