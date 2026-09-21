import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function formatWeekLabel(iso) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const { average: avg, count } = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <strong>Semana del {formatWeekLabel(label)}</strong>
      <span>
        {avg} días ({count} {count === 1 ? 'bug' : 'bugs'})
      </span>
    </div>
  );
}

// Evolución semanal de un único bucket de prioridad: una barra por semana.
// Un solo color (el de ese bucket) — no hace falta leyenda, el título de la
// tarjeta ya nombra la serie.
export default function WeeklyPriorityTrendChart({ points, bucket, color }) {
  const data = points.map((p) => ({
    weekStart: p.weekStart,
    average: p.byPriority[bucket].average,
    count: p.byPriority[bucket].count,
  }));

  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="24%">
        <CartesianGrid stroke="var(--surface-2)" vertical={false} />
        <XAxis
          dataKey="weekStart"
          tickFormatter={formatWeekLabel}
          tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
          axisLine={{ stroke: 'var(--baseline)' }}
          tickLine={false}
          interval={5}
          minTickGap={16}
        />
        <YAxis hide domain={[0, (max) => (max === 0 ? 1 : Math.ceil(max * 1.15))]} />
        <Tooltip content={<TrendTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
        <Bar dataKey="average" fill={color} radius={[2, 2, 0, 0]} maxBarSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}
