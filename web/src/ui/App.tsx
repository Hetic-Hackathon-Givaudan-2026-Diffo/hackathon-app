// Couche ui : composants d'affichage, sans fetch direct.
import { useHealth } from '../application/useHealth';
import { ApiStatus } from './ApiStatus';

export default function App() {
  const health = useHealth();

  return (
    <main>
      <h1>Hackathon</h1>
      <p>Données simulées</p>
      <ApiStatus health={health} />
    </main>
  );
}
