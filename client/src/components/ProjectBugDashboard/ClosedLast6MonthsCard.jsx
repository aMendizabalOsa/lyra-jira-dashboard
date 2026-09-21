import MetricCard from './MetricCard';
import PriorityBarChart from './PriorityBarChart';

export default function ClosedLast6MonthsCard({ closedLast6Months, mode }) {
  return (
    <MetricCard
      title="Cerrados en los últimos 6 meses"
      headline={closedLast6Months.total}
      link={closedLast6Months.link}
    >
      <PriorityBarChart byPriority={closedLast6Months.byPriority} unit="cerrados" mode={mode} valueKey="count" />
    </MetricCard>
  );
}
