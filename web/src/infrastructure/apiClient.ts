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

/**
 * GET sur une route de l'API. Rejette une `ApiError`, ou une `AbortError` si
 * `signal` est annulé. Seule une erreur conforme au schéma `Erreur` garde son
 * message ; tout le reste (réseau, proxy, corps non JSON) affiche
 * `API_UNREACHABLE_MESSAGE`, le détail technique allant dans la console.
 */
export async function getJson<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    console.error(`GET ${path} : erreur réseau`, error);
    throw new ApiError(API_UNREACHABLE_MESSAGE);
  }

  const body: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    if (isApiErrorBody(body)) {
      throw new ApiError(body.erreur, response.status);
    }
    console.error(
      `GET ${path} : réponse ${response.status} hors du schéma Erreur`,
      body,
    );
    throw new ApiError(API_UNREACHABLE_MESSAGE, response.status);
  }

  if (body === undefined) {
    console.error(`GET ${path} : réponse ${response.status} sans corps JSON`);
    throw new ApiError(API_UNREACHABLE_MESSAGE, response.status);
  }
  return body as T;
}
