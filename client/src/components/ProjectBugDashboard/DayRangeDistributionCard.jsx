import MetricCard from './MetricCard';
import DayRangeDistributionChart from './DayRangeDistributionChart';
import { PRIORITY_ORDER, priorityColor } from '../../config/priorityColors';

// Tarjeta ancha con una faceta por prioridad: cada una es la distribución de
// esa prioridad en tramos de días (antigüedad o tiempo de resolución).
export default function DayRangeDistributionCard({ title, distributionByPriority, mode }) {
  return (
    <MetricCard title={title} wide>
      <div className="facet-grid">
        {PRIORITY_ORDER.map((bucket) => (
          <div key={bucket} className="facet">
            <p className="facet__label">{bucket}</p>
            <DayRangeDistributionChart ranges={distributionByPriority[bucket]} color={priorityColor(bucket, mode)} />
          </div>
        ))}
      </div>
    </MetricCard>
  );
}
