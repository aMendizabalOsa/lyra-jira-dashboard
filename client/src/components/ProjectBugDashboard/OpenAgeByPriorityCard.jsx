import MetricCard from './MetricCard';
import PriorityBarChart from './PriorityBarChart';

export default function OpenAgeByPriorityCard({ openAgeDays, mode }) {
  return (
    <MetricCard
      title="Días de media abiertos"
      headline={`${openAgeDays.overallAverage} días`}
      subtext={`n = ${openAgeDays.overallCount} bugs`}
      link={openAgeDays.overallLink}
    >
      <PriorityBarChart
        byPriority={openAgeDays.byPriority}
        unit="días"
        mode={mode}
        valueKey="average"
        valueFormatter={(v) => `${v}d`}
      />
    </MetricCard>
  );
}
