// Couche domaine : types de GET /api/tubes (openapi.yaml) et textes de la Distillerie.
import type { Drop, DropCounts, TubeKind, Verdict } from './tube';

export type Period = '1m' | '6m' | '12m' | '36m' | 'all';

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: '1m', label: 'Ce mois-ci' },
  { value: '6m', label: '6 derniers mois' },
  { value: '12m', label: '12 derniers mois' },
  { value: '36m', label: '3 dernières années' },
  { value: 'all', label: 'Depuis le début' },
];

export const DEFAULT_PERIOD: Period = 'all';

export function isPeriod(value: unknown): value is Period {
  return PERIOD_OPTIONS.some((option) => option.value === value);
}

export interface TubeSummary {
  slug: string;
  name: string;
  kind: TubeKind;
  themes: string[];
  verdict: Verdict;
  confidence: number;
  dropCounts: DropCounts;
  latestDrop: Drop | null;
}

export interface TubeList {
  period: Period;
  tubes: TubeSummary[];
  themes: string[];
  donneesSimulees: true;
}

export interface DistilleryFilters {
  period: Period;
  themes: string[];
}

export type TubeListState =
  | { state: 'loading'; previous: TubeList | null }
  | { state: 'ok'; list: TubeList }
  | { state: 'error'; message: string; previous: TubeList | null };

/** Score affiché au-dessus d'un tube : la confiance, sur 100. */
export function formatScore(confidence: number): string {
  return String(Math.round(confidence * 100));
}

/** Libellé d'une période, par exemple « 6 derniers mois ». */
export function periodLabel(period: Period): string {
  return (
    PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? period
  );
}

export interface BenchFacts {
  tubes: number;
  drops: number;
  durable: number;
  buzz: number;
}

/** Faits de l'intitulé de paillasse, tirés de la réponse de GET /api/tubes. */
export function benchFacts(tubes: TubeSummary[]): BenchFacts {
  return {
    tubes: tubes.length,
    drops: tubes.reduce((sum, tube) => sum + tube.dropCounts.total, 0),
    durable: tubes.filter((tube) => tube.verdict === 'durable').length,
    buzz: tubes.filter((tube) => tube.verdict === 'buzz').length,
  };
}

/** Numéro d'un tube sur la paillasse : 01, 02... */
export function tubeNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

/** Numéro de lot d'un tube, d'après son rang dans la liste sans filtre : « Lot 02 ». */
export function lotLabel(index: number): string {
  return `Lot ${tubeNumber(index)}`;
}
