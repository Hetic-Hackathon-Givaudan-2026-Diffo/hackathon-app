import type { DistilleryFilters, TubeList } from '../domain/distillery';
import type { Tube } from '../domain/tube';
import { getJson } from './apiClient';

/** GET /api/tubes/{slug}, voir openapi.yaml. La 404 suit le schéma `Erreur`. */
export function fetchTube(slug: string, signal?: AbortSignal): Promise<Tube> {
  return getJson<Tube>(`/api/tubes/${encodeURIComponent(slug)}`, signal);
}

/** GET /api/tubes?period=...&theme=...&theme=..., voir openapi.yaml. */
export function fetchTubes(
  { period, themes }: DistilleryFilters,
  signal?: AbortSignal,
): Promise<TubeList> {
  const query = new URLSearchParams({ period });
  for (const theme of themes) query.append('theme', theme);
  return getJson<TubeList>(`/api/tubes?${query}`, signal);
}
