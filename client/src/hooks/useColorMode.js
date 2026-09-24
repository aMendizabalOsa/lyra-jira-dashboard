import { useSyncExternalStore } from 'react';

// Modo elegido por el usuario ('light' | 'dark'). Se guarda en localStorage y
// se refleja como data-theme en <html> (index.css redefine los tokens según
// ese atributo). Si el usuario nunca ha elegido, se parte del modo del sistema.
// index.html aplica el mismo atributo antes de pintar para evitar un parpadeo.
export const STORAGE_KEY = 'color-mode';
const MODES = ['light', 'dark'];

const listeners = new Set();

function readInitialMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (MODES.includes(stored)) return stored;
  } catch {
    // Sin almacenamiento (modo privado, etc.): se usa el del sistema.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

let mode = readInitialMode();
document.documentElement.dataset.theme = mode;

export function toggleColorMode() {
  mode = mode === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = mode;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Sin almacenamiento: el modo dura lo que dure la sesión.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Devuelve el modo actual: 'light' | 'dark'.
export function useColorMode() {
  return useSyncExternalStore(subscribe, () => mode);
}
