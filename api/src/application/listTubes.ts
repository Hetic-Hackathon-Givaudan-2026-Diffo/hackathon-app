// Couche application : liste des tubes de la Distillerie, filtrée.
import {
  isPeriod,
  PERIODS,
  periodStart,
  type Period,
  type TubeSummary,
} from '../domain/tube.js';

export interface TubeFilter {
  /** Premier jour de la période (AAAA-MM-JJ), ou null sans limite. */
  since: string | null;
  /** Thèmes acceptés ; vide : tous les thèmes. */
  themes: string[];
}

/** Port de lecture de la liste, implémenté dans infrastructure/. */
export interface TubeCatalog {
  list(filter: TubeFilter): Promise<TubeSummary[]>;
  themes(): Promise<string[]>;
}

export interface TubeListQuery {
  period?: string;
  themes: string[];
}

export type TubeListResult =
  | {
      ok: true;
      period: Period;
      tubes: TubeSummary[];
      themes: string[];
    }
  | { ok: false; message: string };

const MAX_THEMES = 20;
const MAX_THEME_LENGTH = 100;

export async function listTubes(
  catalog: TubeCatalog,
  query: TubeListQuery,
  today: Date = new Date(),
): Promise<TubeListResult> {
  const period = query.period ?? 'all';
  if (!isPeriod(period)) {
    return {
      ok: false,
      message: `Période inconnue : ${period}. Valeurs possibles : ${PERIODS.join(', ')}`,
    };
  }

  const themes = query.themes.map((theme) => theme.trim());
  if (themes.length > MAX_THEMES) {
    return { ok: false, message: `${MAX_THEMES} thèmes au plus` };
  }
  if (themes.some((theme) => !theme || theme.length > MAX_THEME_LENGTH)) {
    return {
      ok: false,
      message: `Un thème fait de 1 à ${MAX_THEME_LENGTH} caractères`,
    };
  }

  const [tubes, allThemes] = await Promise.all([
    catalog.list({ since: periodStart(period, today), themes }),
    catalog.themes(),
  ]);
  return { ok: true, period, tubes, themes: allThemes };
}
