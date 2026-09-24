const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const projectsRoute = require('./routes/projects.route');
const errorHandler = require('./middleware/errorHandler');
const { isPackaged } = require('./desktop');

// Build del frontend (`npm run build`). En desarrollo no existe y el frontend
// lo sirve Vite; en el ejecutable va empaquetado como asset de pkg.
const clientDist = path.join(__dirname, '../../client/dist');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Solo en el ejecutable: no tiene ventana que cerrar, así que el frontend
// muestra un botón "Salir" que llama a /api/app/quit.
app.get('/api/app', (req, res) => res.json({ desktop: isPackaged }));
if (isPackaged) {
  app.post('/api/app/quit', (req, res) => {
    console.log('Cierre solicitado desde el navegador.');
    res.json({ status: 'closing' });
    res.on('finish', () => process.exit(0));
  });
}
app.use('/api', projectsRoute);

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

app.use(errorHandler);

module.exports = app;
