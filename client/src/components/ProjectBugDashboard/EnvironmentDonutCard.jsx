import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { environmentColor } from '../../config/environmentColors';
import MetricCard from './MetricCard';

const PLURAL = { Bug: 'bugs', Story: 'stories' };

function SliceTooltip({ active, payload, total, unit }) {
  if (!active || !payload?.length) return null;
  const { name, count, includes } = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <strong>{name}</strong>
      <span>
        {count} {unit} ({Math.round((count / total) * 100)}%)
      </span>
      {includes && <span>{includes.join(', ')}</span>}
      <span className="chart-tooltip__hint">Clic para ver en Jira ↗</span>
    </div>
  );
}

// Donut del campo Environment para un tipo de issue. Solo entran los issues
// con Environment informado; el resto se indica debajo.
export default function EnvironmentDonutCard({ stats, mode }) {
  const { issueType, total, withoutEnvironment, link, slices } = stats;
  const unit = PLURAL[issueType] || issueType;
  const open = (url) => url && window.open(url, '_blank', 'noopener,noreferrer');

  return (
    <MetricCard title={`${unit[0].toUpperCase()}${unit.slice(1)} por Environment`} headline={total} link={link}>
      {total === 0 ? (
        <p className="status-text">Ningún {issueType} tiene Environment informado.</p>
      ) : (
        <div className="env-donut">
          <div className="env-donut__chart">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="count"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="100%"
                  paddingAngle={0}
                  stroke="var(--surface-1)"
                  strokeWidth={2}
                  cursor="pointer"
                  onClick={(entry) => open(entry?.link)}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.name} fill={environmentColor(slice.name, mode)} />
                  ))}
                </Pie>
                <Tooltip content={<SliceTooltip total={total} unit={unit} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="env-donut__center" aria-hidden="true">
              <span className="env-donut__total">{total}</span>
              <span className="env-donut__unit">{unit}</span>
            </div>
          </div>
          <ul className="env-donut__legend">
            {slices.map((slice) => (
              <li key={slice.name}>
                <a href={slice.link} target="_blank" rel="noopener noreferrer" title={slice.includes?.join(', ')}>
                  <span
                    className="env-donut__swatch"
                    style={{ background: environmentColor(slice.name, mode) }}
                    aria-hidden="true"
                  />
                  <span className="env-donut__name">{slice.name}</span>
                  <span className="env-donut__count">{slice.count}</span>
                  <span className="env-donut__pct">{Math.round((slice.count / total) * 100)}%</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {withoutEnvironment > 0 && (
        <p className="metric-card__subtext">
          {withoutEnvironment} {unit} sin Environment no se incluyen
        </p>
      )}
    </MetricCard>
  );
}
