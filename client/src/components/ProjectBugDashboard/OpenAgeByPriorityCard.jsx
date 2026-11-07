import MetricCard from './MetricCard';
import PriorityBarChart from './PriorityBarChart';
import TargetLegend from './TargetLegend';
import { formatDays, formatNumber } from '../../utils/format';

export default function OpenAgeByPriorityCard({ openAgeDays, targetDays, mode }) {
  return (
    <MetricCard
      title="Antigüedad de los bugs abiertos"
      headline={formatDays(openAgeDays.overallMedian)}
      subtext={`mediana · media ${formatNumber(openAgeDays.overallAverage)} · n = ${openAgeDays.overallCount} bugs`}
      link={openAgeDays.overallLink}
    >
      <TargetLegend showMark />
      <PriorityBarChart
        byPriority={openAgeDays.byPriority}
        unit="días"
        mode={mode}
        valueKey="average"
        valueFormatter={(v) => `${formatNumber(v)}d`}
        targetDays={targetDays}
      />
    </MetricCard>
  );
}
