import { useState } from 'react';
import { TABS } from './config/tabs';
import TabNav from './components/TabNav';
import ColorModeToggle from './components/ColorModeToggle';
import QuitButton from './components/QuitButton';
import TabPlaceholder from './components/TabPlaceholder';
import ProjectBugDashboard from './components/ProjectBugDashboard/ProjectBugDashboard';
import ProjectWithPlanning from './components/ProjectWithPlanning';

export default function App() {
  const [activeKey, setActiveKey] = useState(TABS[0].key);
  const [closed, setClosed] = useState(false);
  const activeTab = TABS.find((tab) => tab.key === activeKey);

  if (closed) {
    return (
      <div className="app">
        <div className="placeholder">
          <p className="placeholder__title">Dashboard cerrado</p>
          <p className="placeholder__text">Ya puedes cerrar esta pestaña. Para volver a usarlo, abre DashboardJira.exe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-actions">
          <QuitButton onQuit={() => setClosed(true)} />
          <ColorModeToggle />
        </div>
        <p className="app__eyebrow">cafpower.atlassian.net</p>
        <h1>Estadísticas de bugs</h1>
        <p className="app__subtitle">Panorama en vivo de los bugs abiertos y resueltos por proyecto</p>
      </header>
      <TabNav tabs={TABS} activeKey={activeKey} onSelect={setActiveKey} />
      <main className="app__content">
        {!activeTab.enabled ? (
          <TabPlaceholder displayName={activeTab.label} />
        ) : activeTab.planning ? (
          <ProjectWithPlanning key={activeTab.key} tabKey={activeTab.key} displayName={activeTab.label} />
        ) : (
          <ProjectBugDashboard tabKey={activeTab.key} displayName={activeTab.label} />
        )}
      </main>
      <footer className="app__footer">Dashboard de bugs · v{__APP_VERSION__}</footer>
    </div>
  );
}
