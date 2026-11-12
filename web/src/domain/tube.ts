// Couche domaine : types de GET /api/tubes/{slug} (openapi.yaml) et textes dérivés.

export type Verdict = 'durable' | 'buzz';

export type TubeKind = 'catalogue' | 'new';

export interface Drop {
  date: string;
  place: string;
  sourceType: string;
  text: string;
  verdict: Verdict;
  reasons: string[];
}

export interface DropCounts {
  total: number;
  durable: number;
  buzz: number;
}

export interface AiReading {
  summary: string;
  whatWouldChange: string;
}

export interface Tube {
  slug: string;
  name: string;
  kind: TubeKind;
  verdict: Verdict;
  confidence: number;
  dropCounts: DropCounts;
  drops: Drop[];
  aiReading: AiReading;
  donneesSimulees: true;
}

export type TubeState =
  | { state: 'loading' }
  | { state: 'ok'; tube: Tube }
  | { state: 'notFound'; message: string }
  | { state: 'error'; message: string };

export const VERDICT_LABELS: Record<Verdict, string> = {
  durable: 'Durable',
  buzz: 'Buzz',
};

/** Phrase d'accompagnement du verdict, écrite par l'équipe (pas par l'IA). */
export const VERDICT_TAGLINES: Record<Verdict, string> = {
  durable: 'La tendance se dépose et tient dans le temps.',
  buzz: "Un pic d'attention, qui ne s'installe pas encore.",
};

export const KIND_LABELS: Record<TubeKind, string> = {
  catalogue: 'Au catalogue',
  new: 'Nouveauté',
};

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count > 1 ? pluralForm : singular}`;
}

/** Par exemple « 9 gouttes : 7 durables, 2 buzz ». */
export function formatDropCounts({ total, durable, buzz }: DropCounts): string {
  return `${plural(total, 'goutte', 'gouttes')} : ${plural(durable, 'durable', 'durables')}, ${buzz} buzz`;
}

/** Par exemple « 7 durables, 2 buzz ». */
export function formatVerdictSplit({ durable, buzz }: DropCounts): string {
  return `${plural(durable, 'durable', 'durables')}, ${buzz} buzz`;
}

/** Gouttes de la plus ancienne à la plus récente : l'ordre où elles tombent dans le tube. */
export function chronologicalDrops(drops: Drop[]): Drop[] {
  // Dates ISO AAAA-MM-JJ : l'ordre alphabétique est l'ordre chronologique
  return [...drops].sort((a, b) => a.date.localeCompare(b.date));
}

/** Description du tube dessiné, pour les lecteurs d'écran. */
export function describeTube(tube: Tube): string {
  return `Tube ${tube.name} : ${formatDropCounts(tube.dropCounts)}, rempli à ${formatConfidence(tube.confidence)}.`;
}

/** Par exemple « 82 % ». */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)} %`;
}

/** « 2026-09-14 » devient « 14 septembre 2026 », sans décalage de fuseau. */
export function formatDropDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
