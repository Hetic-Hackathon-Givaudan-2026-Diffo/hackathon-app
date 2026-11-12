// Couche infrastructure : mémorise le thème et l'applique au document.
// La même clé est lue par le script de web/index.html, avant le premier rendu.
import { isTheme, type Theme } from '../domain/theme';

const STORAGE_KEY = 'trendlab-theme';

export function readStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    // Stockage bloqué (navigation privée, réglages) : on suit le système
    return null;
  }
}

export function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Le choix vaut alors pour la session en cours seulement
  }
}

export function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}
