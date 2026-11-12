// Couche routes : HTTP uniquement, d'après openapi.yaml
// (GET /api/tubes et GET /api/tubes/{slug}).
import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { getTube, type TubeReader } from '../application/getTube.js';
import { listTubes, type TubeCatalog } from '../application/listTubes.js';

/** ?theme=a&theme=b arrive en tableau, ?theme=a en texte. */
function queryValues(value: unknown): string[] | null {
  if (value === undefined) return [];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return value;
  }
  return null;
}

export function createTubesRouter(
  reader: TubeReader,
  catalog: TubeCatalog,
): Router {
  const router = Router();

  router.get('/api/tubes', async (req, res) => {
    const periods = queryValues(req.query.period);
    const themes = queryValues(req.query.theme);
    if (periods === null || periods.length > 1 || themes === null) {
      res.status(400).json({
        erreur: 'Filtres invalides : une période au plus, des thèmes en texte',
      });
      return;
    }

    const result = await listTubes(catalog, { period: periods[0], themes });
    if (!result.ok) {
      res.status(400).json({ erreur: result.message });
      return;
    }

    res.json({
      period: result.period,
      tubes: result.tubes,
      themes: result.themes,
      donneesSimulees: true,
    });
  });

  router.get('/api/tubes/:slug', async (req, res) => {
    const { slug } = req.params;
    const tube = await getTube(reader, slug);

    if (!tube) {
      res.status(404).json({ erreur: `Tube introuvable : ${slug}` });
      return;
    }

    res.json({
      slug: tube.slug,
      name: tube.name,
      kind: tube.kind,
      verdict: tube.verdict,
      confidence: tube.confidence,
      dropCounts: tube.dropCounts,
      drops: tube.drops,
      aiReading: tube.aiReading,
      donneesSimulees: true,
    });
  });

  // Toute autre erreur suit le schéma Erreur (503 dans openapi.yaml)
  router.use(
    (error: unknown, req: Request, res: Response, next: NextFunction) => {
      if (res.headersSent) {
        next(error);
        return;
      }
      console.error(`GET ${req.path}`, error);
      res.status(503).json({ erreur: 'La base de données ne répond pas' });
    },
  );

  return router;
}
