import MetricCard from './MetricCard';
import WeeklyPriorityTrendChart from './WeeklyPriorityTrendChart';
import { PRIORITY_ORDER, priorityColor } from '../../config/priorityColors';

// Una tarjeta por prioridad (Hotfix/High/Medium/Low): evolución semanal de
// la media de días que llevaban abiertos los bugs de esa categoría.
export default function WeeklyOpenAgeTrendCard({ weeklyOpenAgeTrend, targetDays, mode }) {
  const { points, weeks } = weeklyOpenAgeTrend;
  const latest = points[points.length - 1];

  return (
    <>
      {PRIORITY_ORDER.map((bucket) => (
        <MetricCard
          key={bucket}
          title={`${bucket} — evolución semanal (${weeks} semanas)`}
          headline={`${latest.byPriority[bucket].average} días`}
          subtext={`${latest.byPriority[bucket].count} bugs esta semana`}
        >
          <div className="target-legend">
            <span className="target-legend__item">
              <span className="target-legend__mark target-legend__mark--critical" />
              Objetivo: {targetDays[bucket]} días
            </span>
          </div>
          <WeeklyPriorityTrendChart
            points={points}
            bucket={bucket}
            color={priorityColor(bucket, mode)}
            target={targetDays[bucket]}
          />
        </MetricCard>
      ))}
    </>
  );
}
