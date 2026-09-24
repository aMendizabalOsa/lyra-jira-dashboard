import MetricCard from './MetricCard';
import PriorityBarChart from './PriorityBarChart';
import TargetLegend from './TargetLegend';

export default function OpenAgeByPriorityCard({ openAgeDays, targetDays, mode }) {
  return (
    <MetricCard
      title="Días de media abiertos"
      headline={`${openAgeDays.overallAverage} días`}
      subtext={`n = ${openAgeDays.overallCount} bugs`}
      link={openAgeDays.overallLink}
    >
      <TargetLegend showMark />
      <PriorityBarChart
        byPriority={openAgeDays.byPriority}
        unit="días"
        mode={mode}
        valueKey="average"
        valueFormatter={(v) => `${v}d`}
        targetDays={targetDays}
      />
    </MetricCard>
  );
}
