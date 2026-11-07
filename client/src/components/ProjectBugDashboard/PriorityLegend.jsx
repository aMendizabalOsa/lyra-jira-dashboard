import { PRIORITY_ORDER, priorityColor } from '../../config/priorityColors';

// En Resumen el tono de azul indica la prioridad (más oscuro = más urgente);
// en Detalle el color pasa a indicar si se cumple el objetivo (TargetLegend).
export default function PriorityLegend({ mode }) {
  return (
    <div className="target-legend">
      {PRIORITY_ORDER.map((name) => (
        <span key={name} className="target-legend__item">
          <span className="target-legend__swatch" style={{ background: priorityColor(name, mode) }} />
          {name}
        </span>
      ))}
      <span className="target-legend__item target-legend__item--muted">Color = prioridad</span>
    </div>
  );
}
