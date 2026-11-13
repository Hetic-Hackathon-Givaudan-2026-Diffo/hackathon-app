import type { Health } from '../../../domain/health';

export function ApiStatus({ health }: { health: Health }) {
  switch (health.state) {
    case 'loading':
      return <p>Mise en chauffe de l'alambic...</p>;
    case 'ok':
      return <p>Alambic en marche</p>;
    case 'error':
      return <p>Alambic à l'arrêt : {health.message}</p>;
  }
}
