// Couche infrastructure : client HTTP vers /api, d'après openapi.yaml.
import { API_UNREACHABLE_MESSAGE } from '../domain/health';

/** Schéma `Erreur` de openapi.yaml, commun à toutes les erreurs de l'API. */
export interface ApiErrorBody {
  erreur: string;
}

/** Réponse non 2xx, ou API injoignable (status absent). */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as Record<string, unknown>).erreur === 'string'
  );
}

/** GET sur une route de l'API. Rejette une `ApiError`, ou une `AbortError` si `signal` est annulé. */
export async function getJson<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(API_UNREACHABLE_MESSAGE);
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      isApiErrorBody(body) ? body.erreur : `Erreur ${response.status}`,
      response.status,
    );
  }
  return body as T;
}
