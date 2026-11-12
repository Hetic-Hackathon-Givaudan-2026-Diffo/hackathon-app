import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useTube } from '../../../application/useTube';
import {
  chronologicalDrops,
  describeTube,
  formatConfidence,
  formatDropCounts,
  formatDropDate,
  formatVerdictSplit,
  KIND_LABELS,
  VERDICT_LABELS,
  VERDICT_TAGLINES,
  type Drop,
  type Tube,
} from '../../../domain/tube';
import { AppShell } from '../../app/AppShell';
import { TestTube } from './TestTube';
import { VerdictBadge } from '../../components/VerdictBadge';
import './tubeReading.css';

/** Écran 3 de la maquette : « Lecture du tube ». */
export function TubeReading({ slug }: { slug: string }) {
  const tube = useTube(slug);

  return (
    <AppShell>
      <main className="page tube-page">
        <nav className="breadcrumb" aria-label="Fil d'Ariane">
          <a href="/">Tous les tubes</a>
          <span aria-hidden="true"> / </span>
          <span className="mono">{slug}</span>
        </nav>

        {tube.state === 'loading' && (
          <section className="stage" aria-busy="true">
            <div className="stage-tube">
              <TestTube verdicts={[]} level={0} label="Tube vide" />
            </div>
            <p className="stage-status" role="status">
              Lecture du tube...
            </p>
          </section>
        )}
        {tube.state === 'notFound' && (
          <StageMessage title="Ce tube n'existe pas">
            Aucun tube ne correspond à « {slug} ». Vérifiez l'adresse, ou
            revenez à la liste des tubes.
          </StageMessage>
        )}
        {tube.state === 'error' && (
          <StageMessage title="Lecture impossible pour le moment">
            {tube.message}
          </StageMessage>
        )}
        {tube.state === 'ok' && <TubeDetails tube={tube.tube} />}
      </main>
    </AppShell>
  );
}

function StageMessage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="stage" role="alert">
      <div className="stage-tube">
        <TestTube verdicts={[]} level={0} label="Tube vide" />
      </div>
      <div className="stage-message">
        <p className="eyebrow">Paillasse vide</p>
        <h1>{title}</h1>
        <p>{children}</p>
        <a href="/">Revenir aux tubes</a>
      </div>
    </section>
  );
}

function TubeDetails({ tube }: { tube: Tube }) {
  // Couche du tube et goutte de la frise, liées au survol dans les deux sens
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Index 0 : la goutte la plus ancienne, au fond du tube
  const drops = useMemo(() => chronologicalDrops(tube.drops), [tube.drops]);
  const activeDrop = activeIndex !== null ? drops[activeIndex] : null;

  return (
    <>
      <header className="tube-title">
        <p className="eyebrow">{KIND_LABELS[tube.kind]} · Lecture du tube</p>
        <h1>{tube.name}</h1>
      </header>

      <div className="stage">
        <figure className="stage-tube">
          <TestTube
            verdicts={drops.map((drop) => drop.verdict)}
            level={tube.confidence}
            label={describeTube(tube)}
            activeIndex={activeIndex}
            onActiveChange={setActiveIndex}
          />
          <figcaption className="tube-caption mono">
            {activeDrop && activeIndex !== null ? (
              <>
                Couche {activeIndex + 1} · {formatDropDate(activeDrop.date)} ·{' '}
                {VERDICT_LABELS[activeDrop.verdict]}
              </>
            ) : (
              <>Survolez une couche pour retrouver sa goutte</>
            )}
          </figcaption>
          <p className="tube-legend">
            <span className="legend-swatch legend-swatch-durable" /> Durable
            <span className="legend-swatch legend-swatch-buzz" /> Buzz
            <span className="legend-note">niveau = confiance</span>
          </p>
        </figure>

        <div className="stage-story">
          <section className="verdict" aria-labelledby="verdict-title">
            <h2 id="verdict-title" className="eyebrow">
              Verdict du laboratoire
            </h2>
            <p className={`verdict-word verdict-word-${tube.verdict}`}>
              {VERDICT_LABELS[tube.verdict]}
            </p>
            <p className="verdict-tagline">{VERDICT_TAGLINES[tube.verdict]}</p>
            <dl className="verdict-figures">
              <div>
                <dt>Confiance</dt>
                <dd className="mono">{formatConfidence(tube.confidence)}</dd>
              </div>
              <div>
                <dt>Répartition</dt>
                <dd className="mono">{formatVerdictSplit(tube.dropCounts)}</dd>
              </div>
            </dl>
            <div
              className="confidence-meter"
              role="presentation"
              style={{ '--confidence': tube.confidence } as CSSProperties}
            />
          </section>

          <section aria-labelledby="drops-title">
            <div className="section-heading">
              <h2 id="drops-title">Les gouttes</h2>
              <p className="mono">
                {formatDropCounts(tube.dropCounts)} · la plus récente en haut
              </p>
            </div>
            {/* Même sens que le tube : la couche du dessus est la plus récente */}
            <ol className="timeline">
              {drops
                .map((drop, index) => ({ drop, index }))
                .reverse()
                .map(({ drop, index }) => (
                  <DropItem
                    key={`${drop.date}-${index}`}
                    drop={drop}
                    index={index}
                    active={activeIndex === index}
                    onActiveChange={setActiveIndex}
                  />
                ))}
            </ol>
          </section>

          <section className="lab-note" aria-labelledby="ai-reading-title">
            <div className="lab-note-head">
              <p className="eyebrow">Note de laboratoire</p>
              <p className="lab-note-stamp">Rédigé par une IA</p>
            </div>
            <h2 id="ai-reading-title">Ce que lit l'IA</h2>
            <p className="lab-note-summary">{tube.aiReading.summary}</p>
            <h3>Ce qui changerait la lecture</h3>
            <p>{tube.aiReading.whatWouldChange}</p>
          </section>
        </div>
      </div>
    </>
  );
}

function DropItem({
  drop,
  index,
  active,
  onActiveChange,
}: {
  drop: Drop;
  index: number;
  active: boolean;
  onActiveChange: (index: number | null) => void;
}) {
  return (
    <li
      className={`timeline-item timeline-item-${drop.verdict}${active ? ' is-active' : ''}`}
      tabIndex={0}
      onMouseEnter={() => onActiveChange(index)}
      onMouseLeave={() => onActiveChange(null)}
      onFocus={() => onActiveChange(index)}
      onBlur={() => onActiveChange(null)}
    >
      <span className="timeline-node" aria-hidden="true" />
      <div className="timeline-meta">
        <time className="mono" dateTime={drop.date}>
          {formatDropDate(drop.date)}
        </time>
        <span className="timeline-number mono">
          Goutte {String(index + 1).padStart(2, '0')}
        </span>
        <VerdictBadge verdict={drop.verdict} />
      </div>
      <p className="timeline-source">
        {drop.place} · {drop.sourceType}
      </p>
      <p className="timeline-text">{drop.text}</p>
      <ul className="timeline-reasons">
        {drop.reasons.map((reason) => (
          <li key={reason}>
            <span className="mono">Raison</span> {reason}
          </li>
        ))}
      </ul>
    </li>
  );
}
