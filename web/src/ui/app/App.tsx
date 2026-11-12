// Couche ui : composants d'affichage, sans fetch direct.
import { Distillery } from '../screens/distillery/Distillery';
import { TubeReading } from '../screens/tube-reading/TubeReading';

/** Slug de /tubes/{slug}, ou null pour toute autre adresse. */
function tubeSlugFromPath(pathname: string): string | null {
  const match = /^\/tubes\/([^/]+)\/?$/.exec(pathname);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export default function App() {
  // Pas de routeur : une dépendance de plus demanderait un ADR
  const slug = tubeSlugFromPath(window.location.pathname);
  if (slug !== null) return <TubeReading slug={slug} />;
  return <Distillery />;
}
