import MetricCard from './MetricCard';
import PriorityBarChart from './PriorityBarChart';

export default function ResolutionTimeCard({ resolutionTimeDays, mode }) {
  return (
    <MetricCard
      title={`Tiempo medio de resolución (últimos ${resolutionTimeDays.windowMonths} meses)`}
      headline={`${resolutionTimeDays.overallAverage} días`}
      subtext={`n = ${resolutionTimeDays.overallCount} bugs`}
      link={resolutionTimeDays.overallLink}
    >
      <PriorityBarChart
        byPriority={resolutionTimeDays.byPriority}
        unit="días"
        mode={mode}
        valueKey="average"
        valueFormatter={(v) => `${v}d`}
      />
    </MetricCard>
  );
}
