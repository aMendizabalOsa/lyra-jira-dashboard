import { useEffect, useState } from 'react';
import { fetchBugStats } from '../../api/bugStatsApi';
import { useColorMode } from '../../hooks/useColorMode';
import OpenBugsCard from './OpenBugsCard';
import ClosedLast6MonthsCard from './ClosedLast6MonthsCard';
import OpenAgeByPriorityCard from './OpenAgeByPriorityCard';
import ResolutionTimeCard from './ResolutionTimeCard';
import WeeklyOpenAgeTrendCard from './WeeklyOpenAgeTrendCard';
import DayRangeDistributionCard from './DayRangeDistributionCard';

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

  const { open, closedLast6Months, openAgeDays, resolutionTimeDays, weeklyOpenAgeTrend } = state.data;

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
          <OpenAgeByPriorityCard openAgeDays={openAgeDays} mode={mode} />
          <ResolutionTimeCard resolutionTimeDays={resolutionTimeDays} mode={mode} />
          <WeeklyOpenAgeTrendCard weeklyOpenAgeTrend={weeklyOpenAgeTrend} mode={mode} />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section__title">Distribución por tramos de días</h2>
        <div className="metric-grid">
          <DayRangeDistributionCard
            title="Días de media abiertos — por tramos y prioridad"
            distributionByPriority={openAgeDays.distributionByPriority}
            mode={mode}
          />
          <DayRangeDistributionCard
            title="Tiempo de resolución — por tramos y prioridad"
            distributionByPriority={resolutionTimeDays.distributionByPriority}
            mode={mode}
          />
        </div>
      </section>
    </div>
  );
}
