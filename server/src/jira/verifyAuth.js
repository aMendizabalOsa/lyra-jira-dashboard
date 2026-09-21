const jiraClient = require('./client');

// El endpoint /search/jql no siempre devuelve 401 con credenciales inválidas
// (puede caer a acceso anónimo y devolver 0 resultados silenciosamente).
// /myself sí requiere auth real, así que lo usamos para validar el arranque.
async function verifyAuth() {
  const { data } = await jiraClient.get('/rest/api/3/myself');
  return data;
}

module.exports = { verifyAuth };
