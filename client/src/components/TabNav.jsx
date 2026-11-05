export default function TabNav({ tabs, activeKey, onSelect }) {
  return (
    <nav className="tab-nav" role="tablist" aria-label="Proyectos">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={tab.key === activeKey}
          className={`tab-nav__item${tab.key === activeKey ? ' tab-nav__item--active' : ''}`}
          onClick={() => onSelect(tab.key)}
        >
          {tab.iconSrc && (
            <img className="tab-nav__icon" src={`${import.meta.env.BASE_URL}${tab.iconSrc}`} alt="" aria-hidden="true" />
          )}
          {tab.icon && <span aria-hidden="true">{tab.icon} </span>}
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
