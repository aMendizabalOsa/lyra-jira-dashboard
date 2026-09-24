// Utilidades del ejecutable de escritorio (pkg). En Windows el .exe se marca
// como aplicación GUI (scripts/set-windows-gui.js): no hay ventana de consola,
// así que los logs van a un fichero y los errores a un cuadro de diálogo.
const fs = require('fs');
const path = require('path');
const { Console } = require('console');
const { Writable } = require('stream');
const { spawn, spawnSync } = require('child_process');

const isPackaged = Boolean(process.pkg);
const exeDir = path.dirname(process.execPath);
const logPath = path.join(exeDir, 'dashboard.log');

const MAX_LOG_BYTES = 1024 * 1024;

// Sin consola, console.log no llega a ningún sitio: se redirige a
// dashboard.log. Se añade al final (abrir el .exe con el dashboard ya abierto
// no debe borrar el log de la instancia en marcha) y se vacía al pasar de 1 MB.
function redirectConsoleToLogFile() {
  let size = 0;
  try {
    size = fs.statSync(logPath).size;
  } catch {
    // Aún no existe.
  }
  // Escritura síncrona: los errores de arranque se registran justo antes de
  // process.exit(), y un stream asíncrono se perdería lo pendiente.
  const fd = fs.openSync(logPath, size > MAX_LOG_BYTES ? 'w' : 'a');
  const stream = new Writable({
    write(chunk, encoding, callback) {
      fs.writeSync(fd, chunk);
      callback();
    },
  });
  const logger = new Console({ stdout: stream, stderr: stream });
  for (const method of ['log', 'info', 'warn', 'error']) {
    console[method] = (...args) => logger[method](new Date().toISOString(), ...args);
  }
}

function showErrorDialog(message) {
  if (process.platform !== 'win32') return;
  // El mensaje va por variable de entorno para no tener que escaparlo dentro
  // del comando de PowerShell.
  spawnSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show($env:DASHBOARD_ERROR, 'Dashboard de Bugs', 'OK', 'Error') | Out-Null",
    ],
    { windowsHide: true, env: { ...process.env, DASHBOARD_ERROR: message } }
  );
}

function openBrowser(url) {
  const [command, args] =
    process.platform === 'win32'
      ? ['cmd', ['/c', 'start', '', url]]
      : [process.platform === 'darwin' ? 'open' : 'xdg-open', [url]];
  // windowsHide: sin él, "cmd" abriría un instante una ventana de consola.
  spawn(command, args, { detached: true, stdio: 'ignore', windowsHide: true })
    .on('error', () => {})
    .unref();
}

module.exports = { isPackaged, logPath, redirectConsoleToLogFile, showErrorDialog, openBrowser };
