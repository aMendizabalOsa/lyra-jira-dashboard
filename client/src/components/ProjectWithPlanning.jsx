import ProjectBugDashboard from './ProjectBugDashboard/ProjectBugDashboard';
import PlanningView from './Planning/PlanningView';

const SUB_TABS = [
  { key: 'planning', label: 'Planificación' },
  { key: 'stats', label: 'Estadísticas' },
];

// Pestaña de proyecto con sub-pestañas: planificación de issues y las
// estadísticas de bugs de siempre.
export default function ProjectWithPlanning({ tabKey, displayName, subTabKey, onSubTabChange, ...groupProps }) {
  const activeKey = SUB_TABS.some((tab) => tab.key === subTabKey) ? subTabKey : SUB_TABS[0].key;

  return (
    <>
      <nav className="sub-tab-nav" role="tablist" aria-label={`Vistas de ${displayName}`}>
        {SUB_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={tab.key === activeKey}
            className={`sub-tab-nav__item${tab.key === activeKey ? ' sub-tab-nav__item--active' : ''}`}
            onClick={() => onSubTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {activeKey === 'planning' ? (
        <PlanningView tabKey={tabKey} displayName={displayName} />
      ) : (
        <ProjectBugDashboard tabKey={tabKey} displayName={displayName} {...groupProps} />
      )}
    </>
  );
}
