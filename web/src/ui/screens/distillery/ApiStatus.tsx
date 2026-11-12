import type { Health } from '../../../domain/health';

export function ApiStatus({ health }: { health: Health }) {
  switch (health.state) {
    case 'loading':
      return <p>Connexion à l'API...</p>;
    case 'ok':
      return <p>API : {health.status}</p>;
    case 'error':
      return <p>API indisponible : {health.message}</p>;
  }
}
