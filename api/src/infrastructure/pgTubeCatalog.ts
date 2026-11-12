// Couche infrastructure : liste des tubes pour la Distillerie.
// Requêtes paramétrées uniquement : les filtres ne sont jamais concaténés au SQL.
import type pg from 'pg';
import type { TubeCatalog } from '../application/listTubes.js';
import type { Drop, TubeKind, TubeSummary, Verdict } from '../domain/tube.js';

interface SummaryRow {
  id: number;
  slug: string;
  name: string;
  kind: TubeKind;
  themes: string[];
  verdict: Verdict;
  // NUMERIC arrive en texte depuis pg
  confidence: string;
  // COUNT arrive en texte (bigint)
  total: string;
  durable: string;
}

interface LatestDropRow {
  tube_id: number;
  date: string;
  place: string;
  source_type: string;
  text: string;
  verdict: Verdict;
  reasons: string[];
}

// Seules les gouttes classées (avec un verdict) comptent, comme dans GET /api/tubes/{slug}.
// Un tube sans verdict de tube n'est pas encore lisible : il n'est pas listé.
const LIST_QUERY = `
  SELECT t.id, t.slug, t.name, t.kind, t.themes, v.verdict, v.confidence,
         count(s.id) AS total,
         count(s.id) FILTER (WHERE sv.verdict = 'durable') AS durable
  FROM tubes t
  JOIN verdicts v ON v.tube_id = t.id AND v.signal_id IS NULL
  LEFT JOIN (signaux s JOIN verdicts sv ON sv.signal_id = s.id)
    ON s.tube_id = t.id
  WHERE cardinality($1::text[]) = 0 OR t.themes && $1::text[]
  GROUP BY t.id, v.id
  HAVING $2::date IS NULL OR max(s.observed_on) >= $2::date
  ORDER BY v.confidence DESC, t.name`;

// to_char évite la conversion de DATE en Date JavaScript, sensible au fuseau.
const LATEST_DROPS_QUERY = `
  SELECT DISTINCT ON (s.tube_id)
         s.tube_id, to_char(s.observed_on, 'YYYY-MM-DD') AS date,
         s.place, s.source_type, s.text, v.verdict, v.reasons
  FROM signaux s
  JOIN verdicts v ON v.signal_id = s.id
  WHERE s.tube_id = ANY($1::int[])
  ORDER BY s.tube_id, s.observed_on DESC, s.id DESC`;

const THEMES_QUERY = `
  SELECT DISTINCT unnest(themes) AS theme FROM tubes ORDER BY theme`;

function toDrop(row: LatestDropRow): Drop {
  return {
    date: row.date,
    place: row.place,
    sourceType: row.source_type,
    text: row.text,
    verdict: row.verdict,
    reasons: row.reasons,
  };
}

export function createPgTubeCatalog(db: pg.Pool): TubeCatalog {
  return {
    async list({ since, themes }) {
      const { rows } = await db.query<SummaryRow>(LIST_QUERY, [themes, since]);
      if (rows.length === 0) return [];

      const latest = await db.query<LatestDropRow>(LATEST_DROPS_QUERY, [
        rows.map((row) => row.id),
      ]);
      const latestByTube = new Map(
        latest.rows.map((row) => [row.tube_id, toDrop(row)]),
      );

      return rows.map((row): TubeSummary => {
        const total = Number(row.total);
        const durable = Number(row.durable);
        return {
          slug: row.slug,
          name: row.name,
          kind: row.kind,
          themes: row.themes,
          verdict: row.verdict,
          confidence: Number(row.confidence),
          dropCounts: { total, durable, buzz: total - durable },
          latestDrop: latestByTube.get(row.id) ?? null,
        };
      });
    },

    async themes() {
      const { rows } = await db.query<{ theme: string }>(THEMES_QUERY);
      return rows.map((row) => row.theme);
    },
  };
}
