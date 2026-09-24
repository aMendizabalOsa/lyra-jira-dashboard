import { STATUS } from '../../config/targetColors';

// Leyenda de los colores de estado: el color nunca va solo, cada tramo
// también lo indica en su tooltip. `showMark` añade la raya del objetivo
// (gráficas de medias por prioridad).
export default function TargetLegend({ showMark = false }) {
  return (
    <div className="target-legend">
      {showMark && (
        <span className="target-legend__item">
          <span className="target-legend__mark" />
          Objetivo
        </span>
      )}
      <span className="target-legend__item">
        <span className="target-legend__swatch" style={{ background: STATUS.good }} />
        Dentro del objetivo
      </span>
      <span className="target-legend__item">
        <span
          className="target-legend__swatch target-legend__swatch--ramp"
          style={{ background: `linear-gradient(90deg, ${STATUS.warning}, ${STATUS.serious}, ${STATUS.critical})` }}
        />
        Fuera del objetivo{showMark ? '' : ' (más rojo = más retraso)'}
      </span>
    </div>
  );
}
