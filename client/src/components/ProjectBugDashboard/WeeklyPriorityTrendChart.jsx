import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { STATUS } from '../../config/targetColors';

function formatWeekLabel(iso) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function TrendTooltip({ active, payload, label, target }) {
  if (!active || !payload?.length) return null;
  const { average: avg, count } = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <strong>Semana del {formatWeekLabel(label)}</strong>
      <span>
        {avg} días ({count} {count === 1 ? 'bug' : 'bugs'})
      </span>
      <span>
        {avg <= target ? '✓' : '✕'} Objetivo: {target} días
      </span>
    </div>
  );
}

// Evolución semanal de un único bucket de prioridad: una barra por semana.
// Un solo color (el de ese bucket) — no hace falta leyenda, el título de la
// tarjeta ya nombra la serie. La línea discontinua marca el objetivo de
// resolución de esa prioridad (el eje siempre llega hasta ella); su valor va
// en la leyenda de la tarjeta, porque dentro del gráfico lo tapan las barras.
export default function WeeklyPriorityTrendChart({ points, bucket, color, target }) {
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
        <YAxis hide domain={[0, (max) => Math.ceil(Math.max(max, target) * 1.15)]} />
        <Tooltip content={<TrendTooltip target={target} />} cursor={{ fill: 'var(--surface-2)' }} />
        <Bar dataKey="average" fill={color} radius={[2, 2, 0, 0]} maxBarSize={14} />
        <ReferenceLine
          y={target}
          stroke={STATUS.critical}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          ifOverflow="extendDomain"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
