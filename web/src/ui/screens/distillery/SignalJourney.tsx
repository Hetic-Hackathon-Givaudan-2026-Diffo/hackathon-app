import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../../application/useDistillery';
import { formatScore, type TubeSummary } from '../../../domain/distillery';
import { formatDropDate, VERDICT_LABELS } from '../../../domain/tube';

const ROTATION_MS = 4200;

/** Parcours d'un signal, illustré par la goutte la plus récente de chaque tube, à tour de rôle. */
export function SignalJourney({ tubes }: { tubes: TubeSummary[] }) {
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [step, setStep] = useState(0);

  const samples = tubes.filter((tube) => tube.latestDrop !== null);
  const rotating = !reducedMotion && !paused && !hovered && samples.length > 1;

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => setStep((n) => n + 1), ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [rotating]);

  const tube = samples.length > 0 ? samples[step % samples.length] : null;
  const drop = tube?.latestDrop ?? null;

  return (
    <section
      className="journey"
      aria-labelledby="journey-title"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="journey-head">
        <h2 id="journey-title" className="eyebrow">
          Le parcours d'un signal
        </h2>
        {samples.length > 1 && (
          <div className="journey-controls">
            {!reducedMotion && (
              <button type="button" onClick={() => setPaused((p) => !p)}>
                {paused ? 'Reprendre' : 'Pause'}
              </button>
            )}
            <button type="button" onClick={() => setStep((n) => n + 1)}>
              Signal suivant
            </button>
          </div>
        )}
      </div>

      <ol className="journey-steps">
        <li>
          <span className="journey-number num">01</span>
          <h3>Veille</h3>
          {drop ? (
            <p key={`a${step}`} className="journey-live">
              {drop.text}
              <small className="num">
                {drop.place} · {drop.sourceType} · {formatDropDate(drop.date)}
              </small>
            </p>
          ) : (
            <p>Chaque signal observé devient une goutte, datée et sourcée.</p>
          )}
        </li>
        <li>
          <span className="journey-number num">02</span>
          <h3>Décryptage</h3>
          {drop ? (
            <p key={`b${step}`} className="journey-live">
              Classée <strong>{VERDICT_LABELS[drop.verdict]}</strong>
              <small>{drop.reasons[0]}</small>
            </p>
          ) : (
            <p>Chaque goutte est classée durable ou buzz, avec sa raison.</p>
          )}
        </li>
        <li>
          <span className="journey-number num">03</span>
          <h3>Distillation</h3>
          {tube ? (
            <p key={`c${step}`} className="journey-live">
              {tube.name} : <strong>{VERDICT_LABELS[tube.verdict]}</strong>
              <small className="num">
                Score {formatScore(tube.confidence)} sur 100
              </small>
            </p>
          ) : (
            <p>Le tube monte jusqu'à son score : la confiance du verdict.</p>
          )}
        </li>
        <li>
          <span className="journey-number num">04</span>
          <h3>Lecture</h3>
          <p>Ouvrez un tube : ses gouttes, son verdict et la note de l'IA.</p>
        </li>
      </ol>
    </section>
  );
}
