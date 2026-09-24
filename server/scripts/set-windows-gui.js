// Marca un .exe de Windows como aplicación GUI (subsistema 2) en vez de
// consola (3), para que al abrirlo no aparezca la ventana negra de consola.
// Se aplica al ejecutable que genera pkg: el binario de Node va al principio
// del fichero, así que su cabecera PE es la del .exe.
const fs = require('fs');

const IMAGE_SUBSYSTEM_WINDOWS_GUI = 2;
const IMAGE_SUBSYSTEM_WINDOWS_CUI = 3;

const exePath = process.argv[2];
if (!exePath) {
  console.error('Uso: node scripts/set-windows-gui.js <ruta al .exe>');
  process.exit(1);
}

const fd = fs.openSync(exePath, 'r+');
try {
  const read = (offset, length) => {
    const buf = Buffer.alloc(length);
    fs.readSync(fd, buf, 0, length, offset);
    return buf;
  };

  if (read(0, 2).toString('latin1') !== 'MZ') throw new Error('No es un ejecutable de Windows (falta "MZ").');
  const peOffset = read(0x3c, 4).readUInt32LE(0);
  if (read(peOffset, 4).toString('latin1') !== 'PE\0\0') throw new Error('Cabecera PE no encontrada.');

  // Firma PE (4 bytes) + cabecera COFF (20) -> cabecera opcional, donde el
  // campo Subsystem está en el offset 68 tanto en PE32 como en PE32+.
  const subsystemOffset = peOffset + 4 + 20 + 68;
  const current = read(subsystemOffset, 2).readUInt16LE(0);

  if (current === IMAGE_SUBSYSTEM_WINDOWS_GUI) {
    console.log(`${exePath}: ya es una aplicación GUI.`);
  } else if (current === IMAGE_SUBSYSTEM_WINDOWS_CUI) {
    const value = Buffer.alloc(2);
    value.writeUInt16LE(IMAGE_SUBSYSTEM_WINDOWS_GUI, 0);
    fs.writeSync(fd, value, 0, 2, subsystemOffset);
    console.log(`${exePath}: subsistema cambiado de consola a GUI.`);
  } else {
    throw new Error(`Subsistema inesperado (${current}); no se modifica.`);
  }
} finally {
  fs.closeSync(fd);
}
