# Dashboard de bugs — Jira (cafpower.atlassian.net)

Dashboard con una pestaña por proyecto de Jira (Lyra, CpuApp, DspApp, FpgaApp) para
analizar estadísticas de issues de tipo *Bug*. Por ahora solo la pestaña **Lyra**
consulta datos reales; el resto son placeholders.

## Arquitectura

- `client/`: React + Vite. Nunca habla directamente con Jira.
- `server/`: Node/Express. Proxy autenticado hacia la API REST v3 de Jira Cloud,
  hace las consultas JQL y toda la agregación (conteos, medias por prioridad).

Los datos se piden en vivo en cada carga/cambio de pestaña — no hay caché ni base
de datos.

## Configuración

1. Genera un API token de Jira en
   https://id.atlassian.com/manage-profile/security/api-tokens con la cuenta de
   Atlassian asociada a `cafpower.atlassian.net`.
2. Copia `server/.env.example` a `server/.env` y rellena `JIRA_EMAIL` y
   `JIRA_API_TOKEN`.
3. Instala dependencias:

   ```bash
   npm run install:all
   ```

## Arrancar en desarrollo

```bash
npm run dev
```

Esto levanta el backend en `http://localhost:4000` y el frontend en
`http://localhost:5173` (con proxy de `/api` hacia el backend). El backend valida
las credenciales contra Jira al arrancar (`GET /rest/api/3/myself`) y falla con un
mensaje claro si `JIRA_EMAIL`/`JIRA_API_TOKEN` son inválidos.

## Añadir un nuevo proyecto (CpuApp, DspApp, FpgaApp)

1. Confirma la clave real del proyecto en Jira y el nombre exacto del issue type
   de bug.
2. Edita `server/src/config/projects.js`: pon `jiraProjectKey` y cambia
   `enabled: true`.
3. No hace falta tocar el frontend: `ProjectBugDashboard` es genérico y
   `client/src/config/tabs.js` solo necesita `enabled: true` en esa pestaña.

## Notas

- El proyecto de Jira detrás de la pestaña "Lyra" se asume con clave `LYRA` y
  tipo de issue `Bug`; confírmalo contra la instancia real y ajusta
  `server/src/config/projects.js` si difiere.
- El endpoint `/rest/api/3/search/jql` puede devolver 200 con 0 resultados en
  modo anónimo si las credenciales son inválidas (en vez de un 401 claro) — por
  eso el arranque valida con `/rest/api/3/myself` primero.
