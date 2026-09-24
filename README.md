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

## Ejecutable para Windows

```bash
npm run build
```

Compila el frontend (`client/dist`) y lo empaqueta junto al backend y a Node 20
en `release/DashboardJira.exe` con [`@yao-pkg/pkg`](https://github.com/yao-pkg/pkg)
(fijado a 6.13.1: las versiones posteriores requieren Node ≥ 22 para ejecutarse).
El `.exe` sirve el frontend y la API en el mismo puerto y abre el navegador al
arrancar.

Para usarlo en otro PC, copia `release/DashboardJira.exe` y, **en la misma
carpeta**, un `.env` creado a partir de `release/.env.example` con las
credenciales de Jira de quien lo vaya a usar. El token no va dentro del
ejecutable.

El `.exe` se marca como aplicación GUI de Windows
(`server/scripts/set-windows-gui.js`), así que no abre ventana de consola:

- Se cierra con el botón **Salir** de la cabecera (solo aparece en el
  ejecutable).
- Los errores de arranque (sin `.env`, credenciales inválidas, puerto ocupado)
  se muestran en un cuadro de diálogo, y el log queda en `dashboard.log` junto
  al `.exe`.
- Si se abre con el dashboard ya en marcha, solo abre el navegador.
- Solo escucha en `127.0.0.1`: no es accesible desde otros equipos de la red.

## Añadir un nuevo proyecto (CpuApp, DspApp, FpgaApp)

1. Confirma la clave real del proyecto en Jira y el nombre exacto del issue type
   de bug.
2. Edita `server/src/config/projects.js`: pon `jiraProjectKey` y cambia
   `enabled: true`.
3. Opcional: para añadir la sub-pestaña **Planificación** (issues nuevos, sin
   sprint y sin resolver, como en CpuApp), pon `planningEnabled: true` en
   `server/src/config/projects.js` y `planning: true` en
   `client/src/config/tabs.js`. Con `planningGroups` (ver FpgaApp) los
   recuentos se separan por grupos de proyectos.
4. No hace falta tocar el frontend: `ProjectBugDashboard` es genérico y
   `client/src/config/tabs.js` solo necesita `enabled: true` en esa pestaña.

## Notas

- El proyecto de Jira detrás de la pestaña "Lyra" se asume con clave `LYRA` y
  tipo de issue `Bug`; confírmalo contra la instancia real y ajusta
  `server/src/config/projects.js` si difiere.
- El endpoint `/rest/api/3/search/jql` puede devolver 200 con 0 resultados en
  modo anónimo si las credenciales son inválidas (en vez de un 401 claro) — por
  eso el arranque valida con `/rest/api/3/myself` primero.
- Objetivos de resolución por prioridad (Hotfix 15 días, High 30, Normal/Medium
  90, Low 360): se definen en `TARGET_DAYS` de `server/src/services/aggregate.js`
  y llegan al frontend en `targetDays`. Cada objetivo debe ser frontera de tramo
  en `DAY_RANGES_BY_BUCKET`.
