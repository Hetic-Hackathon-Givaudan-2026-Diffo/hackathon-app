// Couche domaine : le thème d'affichage choisi par l'utilisateur.

export type Theme = 'light' | 'dark';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}
