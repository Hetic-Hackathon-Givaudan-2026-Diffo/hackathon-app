import { useEffect, useState } from 'react';
import { API_UNREACHABLE_MESSAGE } from '../domain/health';
import type { TubeState } from '../domain/tube';
import { ApiError } from '../infrastructure/apiClient';
import { fetchTube } from '../infrastructure/tubeApi';

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
