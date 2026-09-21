import MetricCard from './MetricCard';
import PriorityBarChart from './PriorityBarChart';

export default function OpenBugsCard({ open, mode }) {
  return (
    <MetricCard title="Bugs abiertos" headline={open.total} link={open.link}>
      <PriorityBarChart byPriority={open.byPriority} unit="abiertos" mode={mode} valueKey="count" />
    </MetricCard>
  );
}
