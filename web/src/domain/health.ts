// Couche domaine : types et règles métier purs, sans React ni fetch.

export type Health =
  | { state: 'loading' }
  | { state: 'ok'; status: string }
  | { state: 'error'; message: string };

export const API_UNREACHABLE_MESSAGE = "L'API ne répond pas";
