import { toggleColorMode, useColorMode } from '../hooks/useColorMode';

export default function ColorModeToggle() {
  const mode = useColorMode();
  const label = mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

  return (
    <button type="button" className="mode-toggle" onClick={toggleColorMode} aria-label={label} title={label}>
      <span aria-hidden="true">{mode === 'dark' ? '☀' : '☾'}</span>
    </button>
  );
}
