import { useEffect, useState } from 'react';
import { fetchBugStats } from '../../api/bugStatsApi';
import { useColorMode } from '../../hooks/useColorMode';
import OpenBugsCard from './OpenBugsCard';
import ClosedLast6MonthsCard from './ClosedLast6MonthsCard';
import OpenAgeByPriorityCard from './OpenAgeByPriorityCard';
import ResolutionTimeCard from './ResolutionTimeCard';
import WeeklyOpenAgeTrendCard from './WeeklyOpenAgeTrendCard';
import DayRangeDistributionCard from './DayRangeDistributionCard';
import EnvironmentDonutCard from './EnvironmentDonutCard';

export default function ProjectBugDashboard({ tabKey, displayName }) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const mode = useColorMode();

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', data: null, error: null });

    fetchBugStats(tabKey)
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
    return <p className="status-text">Cargando datos de {displayName}…</p>;
  }

  if (state.status === 'error') {
    return <p className="status-text status-text--error">Error: {state.error.message}</p>;
  }

  if (state.data.groups) {
    return <GroupedBugStats groups={state.data.groups} displayName={displayName} mode={mode} />;
  }

  return <BugStats stats={state.data} mode={mode} />;
}

// Un grupo por pestaña (p. ej. Compac3 / aplicaciones genéricas de test en CpuApp).
function GroupedBugStats({ groups, displayName, mode }) {
  const [activeKey, setActiveKey] = useState(groups[0].key);
  const active = groups.find((group) => group.key === activeKey) || groups[0];

  return (
    <>
      <nav className="sub-tab-nav" role="tablist" aria-label={`Grupos de ${displayName}`}>
        {groups.map((group) => (
          <button
            key={group.key}
            type="button"
            role="tab"
            aria-selected={group.key === active.key}
            className={`sub-tab-nav__item${group.key === active.key ? ' sub-tab-nav__item--active' : ''}`}
            onClick={() => setActiveKey(group.key)}
          >
            {group.icon ? `${group.icon} ` : ''}{group.label}
          </button>
        ))}
      </nav>
      <BugStats key={active.key} stats={active.stats} mode={mode} />
    </>
  );
}

function BugStats({ stats, mode }) {
  const { open, closedLast6Months, openAgeDays, resolutionTimeDays, weeklyOpenAgeTrend, targetDays, environment } = stats;

  return (
    <div className="dashboard-sections">
      <section className="dashboard-section">
        <h2 className="dashboard-section__title">Resumen</h2>
        <div className="metric-grid metric-grid--summary">
          <OpenBugsCard open={open} mode={mode} />
          <ClosedLast6MonthsCard closedLast6Months={closedLast6Months} mode={mode} />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section__title">Detalle</h2>
        <div className="metric-grid metric-grid--detail">
          <OpenAgeByPriorityCard openAgeDays={openAgeDays} targetDays={targetDays} mode={mode} />
          <ResolutionTimeCard resolutionTimeDays={resolutionTimeDays} targetDays={targetDays} mode={mode} />
          <WeeklyOpenAgeTrendCard weeklyOpenAgeTrend={weeklyOpenAgeTrend} targetDays={targetDays} mode={mode} />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section__title">Distribución por tramos de días</h2>
        <div className="metric-grid">
          <DayRangeDistributionCard
            title="Días de media abiertos — por tramos y prioridad"
            distributionByPriority={openAgeDays.distributionByPriority}
            targetDays={targetDays}
          />
          <DayRangeDistributionCard
            title="Tiempo de resolución — por tramos y prioridad"
            distributionByPriority={resolutionTimeDays.distributionByPriority}
            targetDays={targetDays}
          />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section__title">Environment donde se detectan</h2>
        <div className="metric-grid metric-grid--summary">
          {environment.map((stats) => (
            <EnvironmentDonutCard key={stats.issueType} stats={stats} mode={mode} />
          ))}
        </div>
      </section>
    </div>
  );
}
