import { ResponsiveContainer } from 'recharts';

// ResponsiveContainer con un tamaño inicial: sin él, en el primer render mide
// 0 px de ancho y el gráfico no se pinta hasta un scroll o un resize.
export default function ChartContainer({ height, children }) {
  return (
    <div className="chart-container" style={{ height }}>
      <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 320, height }}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

// Props comunes del Tooltip: sin animación ni eventos de ratón, para que no se
// quede pegado tapando las barras vecinas al salir del gráfico.
export const TOOLTIP_PROPS = {
  isAnimationActive: false,
  wrapperStyle: { pointerEvents: 'none', zIndex: 10 },
};
