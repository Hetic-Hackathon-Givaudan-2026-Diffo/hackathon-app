// Couche application : hooks React qui orchestrent infrastructure et domaine.
import { useEffect, useState } from 'react';
import { API_UNREACHABLE_MESSAGE, type Health } from '../domain/health';
import { ApiError } from '../infrastructure/apiClient';
import { fetchHealth } from '../infrastructure/healthApi';

export function useHealth(): Health {
  const [health, setHealth] = useState<Health>({ state: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    fetchHealth(controller.signal)
      .then(({ status }) => setHealth({ state: 'ok', status }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setHealth({
          state: 'error',
          message:
            error instanceof ApiError ? error.message : API_UNREACHABLE_MESSAGE,
        });
      });

    return () => controller.abort();
  }, []);

  return health;
}
