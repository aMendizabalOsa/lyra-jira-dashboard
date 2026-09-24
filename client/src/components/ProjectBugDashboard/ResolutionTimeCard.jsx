import MetricCard from './MetricCard';
import PriorityBarChart from './PriorityBarChart';
import TargetLegend from './TargetLegend';

export default function ResolutionTimeCard({ resolutionTimeDays, targetDays, mode }) {
  return (
    <MetricCard
      title={`Tiempo medio de resolución (últimos ${resolutionTimeDays.windowMonths} meses)`}
      headline={`${resolutionTimeDays.overallAverage} días`}
      subtext={`n = ${resolutionTimeDays.overallCount} bugs`}
      link={resolutionTimeDays.overallLink}
    >
      <TargetLegend showMark />
      <PriorityBarChart
        byPriority={resolutionTimeDays.byPriority}
        unit="días"
        mode={mode}
        valueKey="average"
        valueFormatter={(v) => `${v}d`}
        targetDays={targetDays}
      />
    </MetricCard>
  );
}
