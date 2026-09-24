import MetricCard from './MetricCard';
import DayRangeDistributionChart from './DayRangeDistributionChart';
import TargetLegend from './TargetLegend';
import { PRIORITY_ORDER } from '../../config/priorityColors';

// Tarjeta ancha con una faceta por prioridad: cada una es la distribución de
// esa prioridad en tramos de días (antigüedad o tiempo de resolución).
export default function DayRangeDistributionCard({ title, distributionByPriority, targetDays }) {
  return (
    <MetricCard title={title} wide>
      <TargetLegend />
      <div className="facet-grid">
        {PRIORITY_ORDER.map((bucket) => (
          <div key={bucket} className="facet">
            <p className="facet__label">
              {bucket} <span className="facet__target">· objetivo {targetDays[bucket]} días</span>
            </p>
            <DayRangeDistributionChart ranges={distributionByPriority[bucket]} />
          </div>
        ))}
      </div>
    </MetricCard>
  );
}
