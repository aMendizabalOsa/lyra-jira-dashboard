// Certificados raíz de confianza para las peticiones a Jira.
//
// Node solo confía en su propia lista de CAs (tls.rootCertificates), no en la
// del sistema. En redes corporativas que inspeccionan HTTPS, el proxy firma
// las conexiones con una CA de la empresa que IT instala en el almacén de
// Windows: el navegador funciona pero Node falla con "self-signed certificate
// in certificate chain". Por eso, en Windows se añaden las CAs del almacén del
// sistema, y opcionalmente las de un fichero indicado en EXTRA_CA_CERTS.
const fs = require('fs');
const tls = require('tls');
const { X509Certificate } = require('crypto');
const { spawnSync } = require('child_process');

const PEM_PATTERN = /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g;

// Raíces e intermedias, de máquina y de usuario (una CA corporativa puede
// estar en cualquiera de ellas).
const EXPORT_WINDOWS_STORE_SCRIPT = `
$stores = 'Cert:\\LocalMachine\\Root', 'Cert:\\CurrentUser\\Root', 'Cert:\\LocalMachine\\CA', 'Cert:\\CurrentUser\\CA'
foreach ($store in $stores) {
  foreach ($cert in (Get-ChildItem -Path $store -ErrorAction SilentlyContinue)) {
    '-----BEGIN CERTIFICATE-----'
    [Convert]::ToBase64String($cert.RawData, 'InsertLineBreaks')
    '-----END CERTIFICATE-----'
  }
}
# Un almacén inexistente deja $? a false y PowerShell saldría con código 1.
exit 0`;

function windowsStoreCertificates() {
  if (process.platform !== 'win32') return [];
  const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', EXPORT_WINDOWS_STORE_SCRIPT], {
    windowsHide: true,
    encoding: 'utf8',
    timeout: 20000,
    maxBuffer: 32 * 1024 * 1024,
  });
  // Se aprovecha lo que haya salido aunque el código de salida no sea 0.
  const certificates = result.stdout?.match(PEM_PATTERN) || [];
  if (!certificates.length) {
    console.warn('[certificados] No se pudo leer el almacén de Windows:', result.error?.message || result.stderr);
  }
  return certificates;
}

// Acepta PEM (uno o varios certificados) o un único certificado DER, que es
// lo que exporta Windows como ".cer" binario.
function fileCertificates(filePath) {
  if (!filePath) return [];
  try {
    const content = fs.readFileSync(filePath);
    const pems = content.toString('latin1').match(PEM_PATTERN);
    if (pems) return pems;
    return [new X509Certificate(content).toString()];
  } catch (err) {
    console.warn(`[certificados] No se pudo leer EXTRA_CA_CERTS (${filePath}): ${err.message}`);
    return [];
  }
}

// Un certificado corrupto haría fallar todas las conexiones: se descartan.
function isValidCertificate(pem) {
  try {
    new X509Certificate(pem);
    return true;
  } catch {
    return false;
  }
}

// Lista completa de CAs (las de Node más las extra), o null si no hay extra
// y basta con las de Node.
function trustedCertificates() {
  const fromWindows = windowsStoreCertificates().filter(isValidCertificate);
  const fromFile = fileCertificates(process.env.EXTRA_CA_CERTS).filter(isValidCertificate);

  if (fromWindows.length || process.env.EXTRA_CA_CERTS) {
    console.log(
      `[certificados] CAs añadidas: ${fromWindows.length} del almacén de Windows, ${fromFile.length} de EXTRA_CA_CERTS.`
    );
  }

  const extra = [...fromWindows, ...fromFile];
  return extra.length ? [...tls.rootCertificates, ...extra] : null;
}

module.exports = { trustedCertificates };
