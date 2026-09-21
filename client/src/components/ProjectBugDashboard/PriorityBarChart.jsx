import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { priorityColor, toOrderedSeries } from '../../config/priorityColors';

function ValueTooltip({ active, payload, unit, showCount }) {
  if (!active || !payload?.length) return null;
  const { name, value, count } = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <strong>{name}</strong>
      <span>
        {value} {unit}
        {showCount ? ` (${count} ${count === 1 ? 'bug' : 'bugs'})` : ''}
      </span>
      <span className="chart-tooltip__hint">Clic para ver en Jira ↗</span>
    </div>
  );
}

export default function PriorityBarChart({
  byPriority,
  unit,
  mode = 'light',
  valueKey = 'count',
  valueFormatter = (v) => v,
}) {
  const data = toOrderedSeries(byPriority, valueKey);
  const showCount = valueKey !== 'count';

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          axisLine={{ stroke: 'var(--baseline)' }}
          tickLine={false}
        />
        <YAxis hide domain={[0, (max) => (max === 0 ? 1 : Math.ceil(max * 1.2))]} />
        <Tooltip content={<ValueTooltip unit={unit} showCount={showCount} />} cursor={{ fill: 'var(--surface-2)' }} />
        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
          cursor="pointer"
          onClick={(entry) => {
            if (entry?.link) window.open(entry.link, '_blank', 'noopener,noreferrer');
          }}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={priorityColor(entry.name, mode)} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            formatter={valueFormatter}
            style={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
