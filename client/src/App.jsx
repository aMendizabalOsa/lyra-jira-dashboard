import { useState } from 'react';
import { TABS } from './config/tabs';
import TabNav from './components/TabNav';
import TabPlaceholder from './components/TabPlaceholder';
import ProjectBugDashboard from './components/ProjectBugDashboard/ProjectBugDashboard';

export default function App() {
  const [activeKey, setActiveKey] = useState(TABS[0].key);
  const activeTab = TABS.find((tab) => tab.key === activeKey);

  return (
    <div className="app">
      <header className="app__header">
        <p className="app__eyebrow">cafpower.atlassian.net</p>
        <h1>Estadísticas de bugs</h1>
        <p className="app__subtitle">Panorama en vivo de los bugs abiertos y resueltos por proyecto</p>
      </header>
      <TabNav tabs={TABS} activeKey={activeKey} onSelect={setActiveKey} />
      <main className="app__content">
        {activeTab.enabled ? (
          <ProjectBugDashboard tabKey={activeTab.key} displayName={activeTab.label} />
        ) : (
          <TabPlaceholder displayName={activeTab.label} />
        )}
      </main>
    </div>
  );
}
