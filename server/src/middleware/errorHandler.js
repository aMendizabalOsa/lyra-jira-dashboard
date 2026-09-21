function errorHandler(err, req, res, _next) {
  console.error('[error]', err.response?.data || err.message);

  const status = err.response?.status;
  if (status === 401 || status === 403) {
    return res.status(502).json({
      error: {
        code: 'JIRA_AUTH_ERROR',
        message: 'Jira rechazó las credenciales del backend. Revisa JIRA_EMAIL y JIRA_API_TOKEN.',
      },
    });
  }

  res.status(502).json({
    error: {
      code: 'JIRA_API_ERROR',
      message: 'No se pudo obtener la información desde Jira.',
    },
  });
}

module.exports = errorHandler;
