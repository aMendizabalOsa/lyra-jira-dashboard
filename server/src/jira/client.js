const https = require('https');
const axios = require('axios');
const { jiraBaseUrl, jiraEmail, jiraApiToken } = require('../config/env');
const { trustedCertificates } = require('./trustedCertificates');

const ca = trustedCertificates();

const jiraClient = axios.create({
  baseURL: jiraBaseUrl,
  timeout: 15000,
  // Solo se sustituye el agente si hay CAs extra (almacén de Windows o
  // EXTRA_CA_CERTS); si no, axios usa el de Node por defecto.
  ...(ca ? { httpsAgent: new https.Agent({ ca, keepAlive: true }) } : {}),
  auth: {
    username: jiraEmail,
    password: jiraApiToken,
  },
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

module.exports = jiraClient;
