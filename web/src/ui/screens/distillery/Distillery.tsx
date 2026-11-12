import { useState } from 'react';
import {
  useDistilleryFilters,
  useTubeList,
} from '../../../application/useDistillery';
import { useHealth } from '../../../application/useHealth';
import {
  formatScore,
  tubeNumber,
  type TubeSummary,
} from '../../../domain/distillery';
import { formatVerdictSplit, KIND_LABELS } from '../../../domain/tube';
import { ApiStatus } from './ApiStatus';
import { AppShell } from '../../app/AppShell';
import { DistilleryScene } from './DistilleryScene';
import { FilterPanel } from './FilterPanel';
import { SignalJourney } from './SignalJourney';
import { VerdictBadge } from '../../components/VerdictBadge';
import './distillery.css';

/** Accueil : la Distillerie. */
export function Distillery() {
  const health = useHealth();
  const { filters, setPeriod, toggleTheme, clearThemes } =
    useDistilleryFilters();
  const tubeList = useTubeList(filters);
  // Tube survolé : lié entre le classement, la scène et les cartes
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const list = tubeList.state === 'ok' ? tubeList.list : tubeList.previous;
  const tubes = list?.tubes ?? [];
  const loading = tubeList.state === 'loading';

  let sceneMessage: string | undefined;
  if (tubeList.state === 'error') {
    sceneMessage = `Lecture impossible pour le moment : ${tubeList.message}`;
  } else if (loading && !list) {
    sceneMessage = 'Mise en place de la paillasse...';
  } else if (!loading && tubes.length === 0) {
    sceneMessage =
      'Aucun tube pour ces filtres. Élargissez la période ou retirez un thème.';
  }

  return (
    <AppShell footer={<ApiStatus health={health} />}>
      <main className="distillery">
        <header className="distillery-intro">
          <p className="eyebrow">La Distillerie</p>
          <h1>
            Chaque signal est une goutte. <em>Le tube dit s'il dure.</em>
          </h1>
          <p className="distillery-lead">
            TrendLab recueille les signaux, les classe durables ou buzz, et
            distille chaque tendance jusqu'à son score. Cliquez sur un tube pour
            lire son verdict.
          </p>
        </header>

        <div className="distillery-layout">
          <FilterPanel
            filters={filters}
            themes={list?.themes ?? []}
            tubes={tubes}
            loading={loading}
            activeSlug={activeSlug}
            onPeriodChange={setPeriod}
            onThemeToggle={toggleTheme}
            onThemesClear={clearThemes}
            onActiveChange={setActiveSlug}
          />

          <div className="bench" aria-busy={loading}>
            <DistilleryScene
              tubes={tubes}
              activeSlug={activeSlug}
              onActiveChange={setActiveSlug}
              message={sceneMessage}
            />
            <SignalJourney tubes={tubes} />
            {tubes.length > 0 && (
              <section aria-labelledby="cards-title">
                <h2 id="cards-title" className="eyebrow">
                  Les tubes sur la paillasse
                </h2>
                <ol className="tube-cards">
                  {tubes.map((tube, index) => (
                    <li key={tube.slug}>
                      <TubeCard
                        tube={tube}
                        index={index}
                        active={activeSlug === tube.slug}
                        onActiveChange={setActiveSlug}
                      />
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}

function TubeCard({
  tube,
  index,
  active,
  onActiveChange,
}: {
  tube: TubeSummary;
  index: number;
  active: boolean;
  onActiveChange: (slug: string | null) => void;
}) {
  return (
    <a
      className={`tube-card${active ? ' is-active' : ''}`}
      href={`/tubes/${tube.slug}`}
      onMouseEnter={() => onActiveChange(tube.slug)}
      onMouseLeave={() => onActiveChange(null)}
      onFocus={() => onActiveChange(tube.slug)}
      onBlur={() => onActiveChange(null)}
    >
      <span className="tube-card-number mono">{tubeNumber(index)}</span>
      <span className="tube-card-kind">{KIND_LABELS[tube.kind]}</span>
      <strong className="tube-card-name">{tube.name}</strong>
      <span className="tube-card-verdict">
        <VerdictBadge verdict={tube.verdict} />
        <span className="mono">Score {formatScore(tube.confidence)}</span>
      </span>
      <span className="tube-card-split mono">
        {formatVerdictSplit(tube.dropCounts)}
      </span>
      <span className="tube-card-cta">Lire le tube</span>
    </a>
  );
}
