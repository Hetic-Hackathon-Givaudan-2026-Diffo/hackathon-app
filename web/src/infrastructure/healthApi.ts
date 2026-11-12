import { getJson } from './apiClient';

/** Réponse 200 de GET /api/health, voir openapi.yaml. La 503 suit le schéma `Erreur`. */
export interface HealthResponse {
  status: string;
}

export function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return getJson<HealthResponse>('/api/health', signal);
}
