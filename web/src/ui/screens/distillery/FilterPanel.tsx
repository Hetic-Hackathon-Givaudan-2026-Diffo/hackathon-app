import {
  formatScore,
  PERIOD_OPTIONS,
  tubeNumber,
  type DistilleryFilters,
  type Period,
  type TubeSummary,
} from '../../../domain/distillery';
import { VerdictBadge } from '../../components/VerdictBadge';

interface FilterPanelProps {
  filters: DistilleryFilters;
  themes: string[];
  tubes: TubeSummary[];
  loading: boolean;
  activeSlug: string | null;
  onPeriodChange: (period: Period) => void;
  onThemeToggle: (theme: string) => void;
  onThemesClear: () => void;
  onActiveChange: (slug: string | null) => void;
}

/** Panneau de gauche : filtres période et thème, puis le classement des tubes. */
export function FilterPanel({
  filters,
  themes,
  tubes,
  loading,
  activeSlug,
  onPeriodChange,
  onThemeToggle,
  onThemesClear,
  onActiveChange,
}: FilterPanelProps) {
  // Un thème choisi reste visible même s'il n'existe plus dans la base
  const themeOptions = [
    ...themes,
    ...filters.themes.filter((theme) => !themes.includes(theme)),
  ];

  return (
    <aside className="filter-panel" aria-label="Filtres et tubes">
      <h2 className="panel-title">Filtrer par</h2>

      <fieldset className="filter-group">
        <legend>Période d'observation</legend>
        <div className="chips">
          {PERIOD_OPTIONS.map((option) => (
            <label key={option.value} className="chip">
              <input
                type="radio"
                name="period"
                value={option.value}
                checked={filters.period === option.value}
                onChange={() => onPeriodChange(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend>Thème</legend>
        <div className="chips">
          <button
            type="button"
            className="chip"
            aria-pressed={filters.themes.length === 0}
            onClick={onThemesClear}
          >
            Tous
          </button>
          {themeOptions.map((theme) => (
            <button
              key={theme}
              type="button"
              className="chip"
              aria-pressed={filters.themes.includes(theme)}
              onClick={() => onThemeToggle(theme)}
            >
              {theme}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="panel-list-head">
        <h2 className="panel-title">Classement</h2>
        <p className="mono" aria-live="polite">
          {loading
            ? 'Mise à jour...'
            : `${tubes.length} tube${tubes.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {tubes.length === 0 && !loading ? (
        <p className="panel-empty">
          Aucun tube pour ces filtres. Élargissez la période ou retirez un
          thème.
        </p>
      ) : (
        <ol className="tube-rows">
          {tubes.map((tube, index) => (
            <li key={tube.slug}>
              <a
                className={`tube-row${activeSlug === tube.slug ? ' is-active' : ''}`}
                href={`/tubes/${tube.slug}`}
                onMouseEnter={() => onActiveChange(tube.slug)}
                onMouseLeave={() => onActiveChange(null)}
                onFocus={() => onActiveChange(tube.slug)}
                onBlur={() => onActiveChange(null)}
              >
                <span className="tube-row-rank mono">{tubeNumber(index)}</span>
                <span className="tube-row-name">
                  <strong>{tube.name}</strong>
                  <small>{tube.themes.join(', ') || 'Sans thème'}</small>
                </span>
                <span className="tube-row-score">
                  <span className="mono">{formatScore(tube.confidence)}</span>
                  <span
                    className="tube-row-bar"
                    aria-hidden="true"
                    style={{ width: `${Math.round(tube.confidence * 100)}%` }}
                  />
                  <VerdictBadge verdict={tube.verdict} />
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
