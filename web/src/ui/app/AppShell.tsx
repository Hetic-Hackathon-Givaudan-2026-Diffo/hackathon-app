import type { ReactNode } from 'react';
import { useTheme } from '../../application/useTheme';
import { SimulatedDataNotice } from './SimulatedDataNotice';

/** Cadre de chaque écran : en-tête TrendLab, contenu, pied de page. */
export function AppShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <a className="brand" href="/">
            <span className="brand-name">
              Trend<em>Lab</em>
            </span>
            <span className="brand-tagline">Distillerie de tendances</span>
          </a>
          <div className="app-header-tools">
            <SimulatedDataNotice />
            <button
              type="button"
              className="theme-toggle"
              aria-pressed={theme === 'dark'}
              onClick={toggleTheme}
            >
              <span className="theme-toggle-track" aria-hidden="true">
                <span className="theme-toggle-thumb" />
              </span>
              Thème sombre
            </button>
          </div>
        </div>
      </header>
      {children}
      <footer className="app-footer">
        <p>TrendLab · cahier de laboratoire · gouttes simulées</p>
        {footer}
      </footer>
    </>
  );
}
