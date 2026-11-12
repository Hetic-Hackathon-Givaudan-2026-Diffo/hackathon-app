// Couche application : cas d'usage, qui orchestrent le domaine et un dépôt.
import {
  countDrops,
  isValidSlug,
  type DropCounts,
  type Tube,
} from '../domain/tube.js';

/** Port de lecture des tubes, implémenté dans infrastructure/. */
export interface TubeReader {
  findBySlug(slug: string): Promise<Tube | null>;
}

export interface TubeReading extends Tube {
  dropCounts: DropCounts;
}

/** Renvoie null si aucun tube ne porte ce slug. */
export async function getTube(
  reader: TubeReader,
  slug: string,
): Promise<TubeReading | null> {
  if (!isValidSlug(slug)) return null;

  const tube = await reader.findBySlug(slug);
  if (!tube) return null;

  return { ...tube, dropCounts: countDrops(tube.drops) };
}
