import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { API_UNREACHABLE_MESSAGE } from '../domain/health';
import type {
  DistilleryFilters,
  Period,
  TubeList,
  TubeListState,
} from '../domain/distillery';
import { ApiError } from '../infrastructure/apiClient';
import {
  onReducedMotionChange,
  prefersReducedMotion,
  readFiltersFromUrl,
  writeFiltersToUrl,
} from '../infrastructure/browserState';
import { fetchTubes } from '../infrastructure/tubeApi';

/** Filtres de la Distillerie, gardés dans l'adresse de la page. */
export function useDistilleryFilters() {
  const [filters, setFilters] = useState<DistilleryFilters>(readFiltersFromUrl);

  useEffect(() => writeFiltersToUrl(filters), [filters]);

  const setPeriod = useCallback(
    (period: Period) => setFilters((current) => ({ ...current, period })),
    [],
  );

  const toggleTheme = useCallback(
    (theme: string) =>
      setFilters((current) => ({
        ...current,
        themes: current.themes.includes(theme)
          ? current.themes.filter((item) => item !== theme)
          : [...current.themes, theme],
      })),
    [],
  );

  const clearThemes = useCallback(
    () => setFilters((current) => ({ ...current, themes: [] })),
    [],
  );

  return { filters, setPeriod, toggleTheme, clearThemes };
}

/** Tubes filtrés ; la liste précédente reste affichée pendant un rechargement. */
export function useTubeList(filters: DistilleryFilters): TubeListState {
  const [state, setState] = useState<TubeListState>({
    state: 'loading',
    previous: null,
  });
  // Clé stable : un nouveau tableau de thèmes identique ne relance pas l'appel
  const key = JSON.stringify([filters.period, filters.themes]);

  useEffect(() => {
    const [period, themes] = JSON.parse(key) as [Period, string[]];
    const controller = new AbortController();
    setState((current) => ({ state: 'loading', previous: lastList(current) }));

    fetchTubes({ period, themes }, controller.signal)
      .then((list) => setState({ state: 'ok', list }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState((current) => ({
          state: 'error',
          message:
            error instanceof ApiError ? error.message : API_UNREACHABLE_MESSAGE,
          previous: lastList(current),
        }));
      });

    return () => controller.abort();
  }, [key]);

  return state;
}

function lastList(state: TubeListState): TubeList | null {
  return state.state === 'ok' ? state.list : state.previous;
}

/** Vrai si l'utilisateur a demandé à réduire les animations. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(onReducedMotionChange, prefersReducedMotion);
}
