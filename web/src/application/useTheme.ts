import { useCallback, useState } from 'react';
import type { Theme } from '../domain/theme';
import {
  applyTheme,
  readStoredTheme,
  storeTheme,
  systemPrefersDark,
} from '../infrastructure/themeStorage';

function initialTheme(): Theme {
  return readStoredTheme() ?? (systemPrefersDark() ? 'dark' : 'light');
}

/** Thème courant et bascule ; le choix est mémorisé dans le navigateur. */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      storeTheme(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
