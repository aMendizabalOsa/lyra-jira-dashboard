import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { rangeColors } from '../../config/targetColors';

// Etiqueta corta para el eje (el label completo, con "días", se reserva
// para el tooltip — en columnas tan estrechas no cabe rotado sin recortarse).
function shortLabel(label) {
  return label.replace(/\s*días?$/, '');
}

function DistributionTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { label, count, withinTarget } = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      <span>{count} {count === 1 ? 'bug' : 'bugs'}</span>
      <span>{withinTarget ? '✓ Dentro del objetivo' : '✕ Fuera del objetivo'}</span>
      <span className="chart-tooltip__hint">Clic para ver en Jira ↗</span>
    </div>
  );
}

// Distribución de una sola prioridad en tramos de días (p.ej. Medium: <15,
// 15-45, 45-90...). Barra por tramo, clicable si tiene bugs, coloreada según
// si el tramo cumple el objetivo de resolución de esa prioridad.
export default function DayRangeDistributionChart({ ranges }) {
  const colors = rangeColors(ranges);

  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={ranges} margin={{ top: 16, right: 4, left: 4, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tickFormatter={shortLabel}
          tick={{ fill: 'var(--text-muted)', fontSize: 9.5 }}
          axisLine={{ stroke: 'var(--baseline)' }}
          tickLine={false}
          interval={0}
          angle={-35}
          textAnchor="end"
          height={34}
        />
        <YAxis hide domain={[0, (max) => (max === 0 ? 1 : Math.ceil(max * 1.25))]} />
        <Tooltip content={<DistributionTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
        <Bar
          dataKey="count"
          radius={[3, 3, 0, 0]}
          maxBarSize={32}
          cursor="pointer"
          onClick={(entry) => {
            if (entry?.link) window.open(entry.link, '_blank', 'noopener,noreferrer');
          }}
        >
          {ranges.map((r, i) => (
            <Cell key={r.label} fill={colors[i]} opacity={r.count === 0 ? 0.25 : 1} />
          ))}
          <LabelList dataKey="count" position="top" style={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
