import MetricCard from './MetricCard';
import PriorityBarChart from './PriorityBarChart';
import TargetLegend from './TargetLegend';
import { formatDays, formatNumber } from '../../utils/format';

export default function ResolutionTimeCard({ resolutionTimeDays, targetDays, mode }) {
  return (
    <MetricCard
      title={`Tiempo de resolución (últimos ${resolutionTimeDays.windowMonths} meses)`}
      headline={formatDays(resolutionTimeDays.overallMedian)}
      subtext={`mediana · media ${formatNumber(resolutionTimeDays.overallAverage)} · n = ${resolutionTimeDays.overallCount} bugs`}
      link={resolutionTimeDays.overallLink}
    >
      <TargetLegend showMark />
      <PriorityBarChart
        byPriority={resolutionTimeDays.byPriority}
        unit="días"
        mode={mode}
        valueKey="average"
        valueFormatter={(v) => `${formatNumber(v)}d`}
        targetDays={targetDays}
      />
    </MetricCard>
  );
}
