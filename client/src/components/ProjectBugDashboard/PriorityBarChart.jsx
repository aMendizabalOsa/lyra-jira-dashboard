import { Bar, Cell, ComposedChart, LabelList, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from 'recharts';
import { priorityColor, toOrderedSeries } from '../../config/priorityColors';
import { averageColor } from '../../config/targetColors';

function ValueTooltip({ active, payload, unit, showCount }) {
  if (!active || !payload?.length) return null;
  const { name, value, count, target } = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <strong>{name}</strong>
      <span>
        {value} {unit}
        {showCount ? ` (${count} ${count === 1 ? 'bug' : 'bugs'})` : ''}
      </span>
      {target != null && (
        <span>
          {value <= target ? '✓' : '✕'} Objetivo: {target} días
        </span>
      )}
      <span className="chart-tooltip__hint">Clic para ver en Jira ↗</span>
    </div>
  );
}

// Marca del objetivo sobre cada barra: raya discontinua algo más ancha que la
// barra, a la altura de targetDays de esa prioridad.
function TargetMark({ cx, cy }) {
  if (cx == null || cy == null) return null;
  return (
    <line
      x1={cx - 30}
      x2={cx + 30}
      y1={cy}
      y2={cy}
      stroke="var(--text-primary)"
      strokeWidth={1.5}
      strokeDasharray="4 3"
    />
  );
}

// Con `targetDays` (medias de días), cada barra se colorea según cumpla su
// objetivo de resolución y lleva encima la marca del objetivo; sin él
// (conteos), cada barra lleva el color de su prioridad.
export default function PriorityBarChart({
  byPriority,
  unit,
  mode = 'light',
  valueKey = 'count',
  valueFormatter = (v) => v,
  targetDays,
}) {
  const data = toOrderedSeries(byPriority, valueKey).map((entry) => ({
    ...entry,
    target: targetDays?.[entry.name] ?? null,
  }));
  const showCount = valueKey !== 'count';

  const barColor = (entry) =>
    targetDays && entry.count > 0 ? averageColor(entry.value, entry.target) : priorityColor(entry.name, mode);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          axisLine={{ stroke: 'var(--baseline)' }}
          tickLine={false}
        />
        <YAxis hide domain={[0, (max) => (max === 0 ? 1 : Math.ceil(max * 1.2))]} />
        <Tooltip
          content={<ValueTooltip unit={unit} showCount={showCount} />}
          cursor={{ fill: 'var(--surface-2)' }}
          shared={false}
        />
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
            <Cell key={entry.name} fill={barColor(entry)} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            formatter={valueFormatter}
            style={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          />
        </Bar>
        {targetDays && <Scatter dataKey="target" shape={<TargetMark />} isAnimationActive={false} />}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
