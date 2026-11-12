// Couche infrastructure : lecture des tables tubes, signaux et verdicts.
// Requêtes paramétrées uniquement : le slug n'est jamais concaténé au SQL.
import type pg from 'pg';
import type { TubeReader } from '../application/getTube.js';
import type { Drop, Tube, TubeKind, Verdict } from '../domain/tube.js';

interface TubeRow {
  id: number;
  slug: string;
  name: string;
  kind: TubeKind;
  verdict: Verdict | null;
  // NUMERIC arrive en texte depuis pg
  confidence: string | null;
  ai_summary: string | null;
  ai_what_would_change: string | null;
}

interface DropRow {
  date: string;
  place: string;
  source_type: string;
  text: string;
  verdict: Verdict;
  reasons: string[];
}

const TUBE_QUERY = `
  SELECT t.id, t.slug, t.name, t.kind,
         v.verdict, v.confidence, v.ai_summary, v.ai_what_would_change
  FROM tubes t
  LEFT JOIN verdicts v ON v.tube_id = t.id AND v.signal_id IS NULL
  WHERE t.slug = $1`;

// Un signal sans verdict n'est pas encore classé : il n'est pas affiché.
// to_char évite la conversion de DATE en Date JavaScript, sensible au fuseau.
const DROPS_QUERY = `
  SELECT to_char(s.observed_on, 'YYYY-MM-DD') AS date,
         s.place, s.source_type, s.text, v.verdict, v.reasons
  FROM signaux s
  JOIN verdicts v ON v.signal_id = s.id
  WHERE s.tube_id = $1
  ORDER BY s.observed_on DESC, s.id DESC`;

export function createPgTubeReader(db: pg.Pool): TubeReader {
  return {
    async findBySlug(slug) {
      const { rows } = await db.query<TubeRow>(TUBE_QUERY, [slug]);
      const row = rows[0];
      if (!row) return null;

      if (
        row.verdict === null ||
        row.confidence === null ||
        row.ai_summary === null ||
        row.ai_what_would_change === null
      ) {
        throw new Error(`Tube ${slug} sans verdict dans la table verdicts`);
      }

      const drops = await db.query<DropRow>(DROPS_QUERY, [row.id]);

      const tube: Tube = {
        slug: row.slug,
        name: row.name,
        kind: row.kind,
        verdict: row.verdict,
        confidence: Number(row.confidence),
        drops: drops.rows.map((drop): Drop => ({
          date: drop.date,
          place: drop.place,
          sourceType: drop.source_type,
          text: drop.text,
          verdict: drop.verdict,
          reasons: drop.reasons,
        })),
        aiReading: {
          summary: row.ai_summary,
          whatWouldChange: row.ai_what_would_change,
        },
      };
      return tube;
    },
  };
}
