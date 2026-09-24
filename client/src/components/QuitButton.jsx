import { useEffect, useState } from 'react';

// Solo aparece en el ejecutable de escritorio, que no tiene ventana propia:
// es la forma de cerrar el servidor local. Al cerrarlo, `onQuit` sustituye
// el dashboard por un aviso (la API ya no responde).
export default function QuitButton({ onQuit }) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    fetch('/api/app')
      .then((res) => (res.ok ? res.json() : null))
      .then((info) => setVisible(Boolean(info?.desktop)))
      .catch(() => {});
  }, []);

  if (!visible) return null;

  const quit = async () => {
    setClosing(true);
    try {
      await fetch('/api/app/quit', { method: 'POST' });
    } catch {
      // Si el servidor se cierra antes de responder, también vale.
    }
    onQuit();
  };

  return (
    <button type="button" className="quit-button" onClick={quit} disabled={closing} title="Cerrar el dashboard">
      {closing ? 'Cerrando…' : 'Salir'}
    </button>
  );
}
