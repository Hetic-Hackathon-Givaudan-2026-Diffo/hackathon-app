// Couche domaine : types et règles métier purs, sans Express ni PostgreSQL.

export type Verdict = 'durable' | 'buzz';

export type TubeKind = 'catalogue' | 'new';

/** Une goutte : un signal observé, classé durable ou buzz. */
export interface Drop {
  /** Date d'observation, au format AAAA-MM-JJ. */
  date: string;
  place: string;
  sourceType: string;
  text: string;
  verdict: Verdict;
  /** Au moins une raison qui explique le verdict. */
  reasons: string[];
}

/** Texte produit par l'IA. */
export interface AiReading {
  summary: string;
  whatWouldChange: string;
}

export interface Tube {
  slug: string;
  name: string;
  kind: TubeKind;
  verdict: Verdict;
  /** De 0 à 1. */
  confidence: number;
  drops: Drop[];
  aiReading: AiReading;
}

export interface DropCounts {
  total: number;
  durable: number;
  buzz: number;
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

/** Calculé à chaque lecture : ces nombres ne sont jamais stockés. */
export function countDrops(drops: readonly Drop[]): DropCounts {
  const durable = drops.filter((drop) => drop.verdict === 'durable').length;
  return { total: drops.length, durable, buzz: drops.length - durable };
}

/** Fenêtre d'observation de la Distillerie, comptée à partir d'aujourd'hui. */
export const PERIODS = ['1m', '6m', '12m', '36m', 'all'] as const;

export type Period = (typeof PERIODS)[number];

const PERIOD_MONTHS: Record<Period, number | null> = {
  '1m': 1,
  '6m': 6,
  '12m': 12,
  '36m': 36,
  all: null,
};

export function isPeriod(value: string): value is Period {
  return (PERIODS as readonly string[]).includes(value);
}

/**
 * Premier jour de la période (AAAA-MM-JJ), ou null pour « all ».
 * Calcul en UTC : le résultat ne dépend pas du fuseau du serveur.
 */
export function periodStart(period: Period, today: Date): string | null {
  const months = PERIOD_MONTHS[period];
  if (months === null) return null;
  const start = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth() - months,
      today.getUTCDate(),
    ),
  );
  return start.toISOString().slice(0, 10);
}

/** Un tube vu depuis la Distillerie, sans le détail des gouttes. */
export interface TubeSummary {
  slug: string;
  name: string;
  kind: TubeKind;
  themes: string[];
  verdict: Verdict;
  /** Le score du tube : la confiance dans son verdict, de 0 à 1. */
  confidence: number;
  dropCounts: DropCounts;
  latestDrop: Drop | null;
}
