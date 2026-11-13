import { useState } from 'react';
import {
  useDistilleryFilters,
  useTubeList,
} from '../../../application/useDistillery';
import { useHealth } from '../../../application/useHealth';
import {
  benchFacts,
  periodLabel,
  type TubeList,
} from '../../../domain/distillery';
import { ApiStatus } from './ApiStatus';
import { AppShell } from '../../app/AppShell';
import { DistilleryScene } from './DistilleryScene';
import { FilterPanel } from './FilterPanel';
import { SignalJourney } from './SignalJourney';
import './distillery.css';

/** Accueil : la Distillerie. */
export function Distillery() {
  const health = useHealth();
  const { filters, setPeriod, toggleTheme, clearThemes } =
    useDistilleryFilters();
  const tubeList = useTubeList(filters);
  // Tube survolé : lié entre le classement et la scène
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
    sceneMessage = 'Aucun tube pour ces filtres.';
  }

  return (
    <AppShell footer={<ApiStatus health={health} />}>
      <main className="distillery">
        <BenchLabel list={list} themes={filters.themes} />

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
          </div>
        </div>
      </main>
    </AppShell>
  );
}

/** Intitulé de paillasse : le nom de la paillasse et ce qu'elle porte, d'après l'API. */
function BenchLabel({
  list,
  themes,
}: {
  list: TubeList | null;
  themes: string[];
}) {
  const facts = list ? benchFacts(list.tubes) : null;

  return (
    <header className="bench-label">
      <h1>La Distillerie</h1>
      {facts && list && (
        <dl className="bench-facts">
          <div>
            <dt>Tubes</dt>
            <dd className="num">{facts.tubes}</dd>
          </div>
          <div>
            <dt>Gouttes</dt>
            <dd className="num">{facts.drops}</dd>
          </div>
          <div>
            <dt>Durables</dt>
            <dd className="num">{facts.durable}</dd>
          </div>
          <div>
            <dt>Buzz</dt>
            <dd className="num">{facts.buzz}</dd>
          </div>
          <div>
            <dt>Période</dt>
            <dd>{periodLabel(list.period)}</dd>
          </div>
          {themes.length > 0 && (
            <div>
              <dt>Thèmes</dt>
              <dd>{themes.join(', ')}</dd>
            </div>
          )}
        </dl>
      )}
    </header>
  );
}
