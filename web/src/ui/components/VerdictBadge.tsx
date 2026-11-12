import { VERDICT_LABELS, type Verdict } from '../../domain/tube';

/** Le verdict est toujours écrit : la couleur et la pastille ne font que l'accompagner. */
export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span className={`verdict-badge verdict-badge-${verdict}`}>
      {VERDICT_LABELS[verdict]}
    </span>
  );
}
