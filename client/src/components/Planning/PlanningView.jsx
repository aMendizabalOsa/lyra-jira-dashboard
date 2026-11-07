import { useEffect, useState } from 'react';
import { fetchPlanning } from '../../api/bugStatsApi';

// Columnas de la vista por grupos, en embudo: lo nuevo, lo pendiente y, dentro
// de lo pendiente, lo que no tiene sprint y lo que además importa (> Low).
const GROUP_COLUMNS = [
  { key: 'newIssues', label: 'Nuevos', hint: 'Creados en los últimos 30 días' },
  { key: 'unresolved', label: 'Sin resolver', hint: 'Todos los tipos de issue' },
  { key: 'unplanned', label: 'Sin planificar', hint: 'Sin sprint y sin resolver' },
  { key: 'unplannedHigh', label: 'Sin planificar, prioridad > Low', hint: 'Sin sprint, sin resolver y prioridad superior a Low' },
];

// Columna "sin planificar, prioridad > Low": en naranja si queda alguno, en verde si no hay ninguno.
const UNPLANNED_KEYS = ['unplannedHigh'];

export default function PlanningView({ tabKey, displayName }) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', data: null, error: null });

    fetchPlanning(tabKey)
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', data: null, error });
      });

    return () => {
      cancelled = true;
    };
  }, [tabKey]);

  if (state.status === 'loading') {
    return <p className="status-text">Cargando planificación de {displayName}…</p>;
  }

  if (state.status === 'error') {
    return <p className="status-text status-text--error">Error: {state.error.message}</p>;
  }

  if (state.data.kind === 'recentByType') {
    return <RecentByTypeTable data={state.data} />;
  }

  return <GroupsTable groups={state.data.groups} />;
}

// Lyra: filas por tipo de issue, columnas por nivel (creados en la ventana).
function RecentByTypeTable({ data }) {
  const { tiers, types, windowLabel } = data;
  return (
    <section className="metric-card planning-table-card">
      <p className="planning-table__caption">Issues creados en {windowLabel}</p>
      <table className="planning-table">
        <thead>
          <tr>
            <th scope="col">Tipo</th>
            {tiers.map((tier) => (
              <th key={tier.key} scope="col">{tier.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {types.map(({ type, counts }) => (
            <tr key={type}>
              <th scope="row">{type}</th>
              {tiers.map((tier) => {
                const cell = counts.find((c) => c.key === tier.key);
                return (
                  <td key={tier.key}>
                    <CountLink
                      rowLabel={type}
                      label={cell.label}
                      total={cell.total}
                      link={cell.link}
                      note={cell.notApplicable}
                      flagUnplanned={UNPLANNED_KEYS.includes(tier.key)}
                    />
                    {cell.label !== tier.label && <span className="planning-table__note">{cell.label}</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

// CpuApp, DspApp, FpgaApp: filas por grupo de proyectos.
function GroupsTable({ groups }) {
  return (
    <section className="metric-card planning-table-card">
      <table className="planning-table">
        <thead>
          <tr>
            <th scope="col">Grupo</th>
            {GROUP_COLUMNS.map((col) => (
              <th key={col.key} scope="col" title={col.hint}>
                {col.label}
                <span className="planning-table__hint">{col.hint}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => {
            const rowLabel = `${group.icon ? `${group.icon} ` : ''}${group.label || 'Todos'}`;
            return (
              <tr key={group.key}>
                <th scope="row">{rowLabel}</th>
                {GROUP_COLUMNS.map((col) => (
                  <td key={col.key}>
                    <CountLink
                      rowLabel={group.label || 'Todos'}
                      label={col.label}
                      {...group[col.key]}
                      flagUnplanned={UNPLANNED_KEYS.includes(col.key)}
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function CountLink({ rowLabel, label, total, link, note, flagUnplanned }) {
  if (total == null) {
    return (
      <span className="planning-table__na" title={note} aria-label={`${rowLabel}: ${note}`}>
        —
      </span>
    );
  }
  const status = flagUnplanned ? (total > 0 ? ' planning-table__count--pending' : ' planning-table__count--clear') : '';
  return (
    <a
      className={`planning-table__count${status}`}
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      title="Ver en Jira"
      aria-label={`${rowLabel}: ${total} ${label.toLowerCase()}, ver en Jira`}
    >
      {total}
      <span className="planning-table__arrow" aria-hidden="true">↗</span>
    </a>
  );
}
