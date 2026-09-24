import { useEffect, useState } from 'react';
import { fetchPlanning } from '../../api/bugStatsApi';

const SECTIONS = [
  { key: 'newIssues', title: 'Issues nuevos', subtext: 'Creados en las últimas 2 semanas' },
  { key: 'unplanned', title: 'Issues sin planificar', subtext: 'Sin sprint y sin resolver' },
  { key: 'unresolved', title: 'Issues sin resolver', subtext: 'Todos los tipos de issue' },
];

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

  const { groups } = state.data;

  // Un único grupo sin título (CpuApp) se pinta tal cual; con varios grupos
  // (FpgaApp) cada uno va en su propia sección.
  if (groups.length === 1 && !groups[0].label) {
    return <PlanningCards group={groups[0]} />;
  }

  return (
    <div className="dashboard-sections">
      {groups.map((group) => (
        <section key={group.key} className="dashboard-section">
          <h2 className="dashboard-section__title">{group.label}</h2>
          <PlanningCards group={group} />
        </section>
      ))}
    </div>
  );
}

function PlanningCards({ group }) {
  return (
    <div className="metric-grid metric-grid--planning">
      {SECTIONS.map((section) => {
        const { total, link } = group[section.key];
        return (
          <section key={section.key} className="metric-card planning-card">
            <h3 className="metric-card__title">{section.title}</h3>
            <a
              className="planning-card__count"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              title="Ver en Jira"
            >
              {total}
              <span className="planning-card__arrow" aria-hidden="true">↗</span>
            </a>
            <p className="planning-card__subtext">{section.subtext}</p>
          </section>
        );
      })}
    </div>
  );
}
