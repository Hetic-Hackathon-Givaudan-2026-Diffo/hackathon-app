// Couche infrastructure : ce que le navigateur sait de la page et de l'utilisateur.
import {
  DEFAULT_PERIOD,
  isPeriod,
  type DistilleryFilters,
} from '../domain/distillery';

/** Filtres de la Distillerie lus dans l'adresse (?period=12m&theme=...). */
export function readFiltersFromUrl(): DistilleryFilters {
  const query = new URLSearchParams(window.location.search);
  const period = query.get('period');
  return {
    period: isPeriod(period) ? period : DEFAULT_PERIOD,
    themes: query.getAll('theme').filter((theme) => theme.trim() !== ''),
  };
}

/**
 * Écrit les filtres dans l'adresse, sans recharger ni empiler l'historique :
 * le bouton Retour depuis la lecture d'un tube les retrouve.
 */
export function writeFiltersToUrl({ period, themes }: DistilleryFilters): void {
  const query = new URLSearchParams();
  if (period !== DEFAULT_PERIOD) query.set('period', period);
  for (const theme of themes) query.append('theme', theme);
  const search = query.toString();
  const url = `${window.location.pathname}${search ? `?${search}` : ''}`;
  window.history.replaceState(null, '', url);
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Prévient quand l'utilisateur change sa préférence ; renvoie de quoi arrêter. */
export function onReducedMotionChange(listener: () => void): () => void {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}
