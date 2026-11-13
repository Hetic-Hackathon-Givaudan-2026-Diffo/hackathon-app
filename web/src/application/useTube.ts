import { useEffect, useState } from 'react';
import { API_UNREACHABLE_MESSAGE } from '../domain/health';
import { DEFAULT_PERIOD } from '../domain/distillery';
import type { TubeState } from '../domain/tube';
import { ApiError } from '../infrastructure/apiClient';
import { fetchTube, fetchTubes } from '../infrastructure/tubeApi';

export function useTube(slug: string): TubeState {
  const [tube, setTube] = useState<TubeState>({ state: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setTube({ state: 'loading' });

    fetchTube(slug, controller.signal)
      .then((data) => setTube({ state: 'ok', tube: data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 404) {
          setTube({ state: 'notFound', message: error.message });
          return;
        }
        setTube({
          state: 'error',
          message:
            error instanceof ApiError ? error.message : API_UNREACHABLE_MESSAGE,
        });
      });

    return () => controller.abort();
  }, [slug]);

  return tube;
}

/**
 * Rang du tube dans GET /api/tubes sans filtre (du plus haut score au plus bas) :
 * son numéro de lot. null tant qu'il est inconnu, ou si le tube n'est pas classé.
 */
export function useLotIndex(slug: string): number | null {
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIndex(null);

    fetchTubes({ period: DEFAULT_PERIOD, themes: [] }, controller.signal)
      .then((list) => {
        const found = list.tubes.findIndex((tube) => tube.slug === slug);
        setIndex(found >= 0 ? found : null);
      })
      // Sans liste, la page s'affiche sans numéro de lot
      .catch(() => undefined);

    return () => controller.abort();
  }, [slug]);

  return index;
}
