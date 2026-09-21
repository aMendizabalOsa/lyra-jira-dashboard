export default function MetricCard({ title, headline, subtext, link, wide, children }) {
  return (
    <section className={`metric-card${wide ? ' metric-card--wide' : ''}`}>

      <div className="metric-card__header">
        <h3 className="metric-card__title">{title}</h3>
        <div className="metric-card__headline-wrap">
          {headline != null && <span className="metric-card__headline">{headline}</span>}
          {subtext && <span className="metric-card__subtext">{subtext}</span>}
        </div>
      </div>
      {children}
      {link && (
        <a className="metric-card__link" href={link} target="_blank" rel="noopener noreferrer">
          Ver todos en Jira ↗
        </a>
      )}
    </section>
  );
}
