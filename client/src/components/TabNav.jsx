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
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
