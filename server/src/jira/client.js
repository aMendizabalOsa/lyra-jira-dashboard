const axios = require('axios');
const { jiraBaseUrl, jiraEmail, jiraApiToken } = require('../config/env');

const jiraClient = axios.create({
  baseURL: jiraBaseUrl,
  timeout: 15000,
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
