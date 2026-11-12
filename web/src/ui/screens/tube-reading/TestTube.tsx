import { useId, type CSSProperties } from 'react';
import type { Verdict } from '../../../domain/tube';
import './testTube.css';

// Géométrie du tube, en unités du viewBox (260 x 600)
const CENTER_X = 120;
const INNER_LEFT = 78;
const INNER_WIDTH = 84;
const INNER_BOTTOM = 542;
const CAPACITY = 452; // hauteur du fond jusqu'à la graduation 100 %
const DROP_BOTTOM = 28; // bas de la goutte avant sa chute

// Rythme de la distillation : une goutte toutes les STEP_MS
const STEP_MS = 480;
const FALL_MS = 400;

const SCALE_MARKS = [0, 0.25, 0.5, 0.75, 1];
const MINOR_MARKS = Array.from({ length: 21 }, (_, index) => index / 20);

function levelY(fraction: number): number {
  return INNER_BOTTOM - fraction * CAPACITY;
}

function cssVars(vars: Record<string, string>): CSSProperties {
  return vars as CSSProperties;
}

interface TestTubeProps {
  /** Verdicts des gouttes, du plus ancien (au fond) au plus récent. */
  verdicts: Verdict[];
  /** Niveau final du liquide, entre 0 et 1. */
  level: number;
  /** Texte lu par les lecteurs d'écran à la place du dessin. */
  label: string;
  variant?: 'stage' | 'mini';
  activeIndex?: number | null;
  onActiveChange?: (index: number | null) => void;
}

/** Tube à essai : chaque goutte se dépose en couche, foncée si durable, ambre hachurée si buzz. */
export function TestTube({
  verdicts,
  level,
  label,
  variant = 'stage',
  activeIndex = null,
  onActiveChange,
}: TestTubeProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const clipId = `tube-clip-${id}`;
  const hatchId = `tube-hatch-${id}`;
  const isStage = variant === 'stage';

  const fill = Math.min(Math.max(level, 0), 1);
  const surfaceY = levelY(fill);
  const layerHeight =
    verdicts.length > 0 ? (fill * CAPACITY) / verdicts.length : 0;
  const settledDelay = verdicts.length * STEP_MS + FALL_MS;

  return (
    <svg
      className={`test-tube test-tube-${variant}`}
      viewBox={isStage ? '0 0 260 600' : '56 40 128 530'}
      role="img"
      aria-label={label}
      style={cssVars({ '--settled-delay': `${settledDelay}ms` })}
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M78 66 V500 A42 42 0 0 0 162 500 V66 Z" />
        </clipPath>
        <pattern
          id={hatchId}
          patternUnits="userSpaceOnUse"
          width="9"
          height="9"
          patternTransform="rotate(45)"
        >
          <rect className="tube-hatch-base" width="9" height="9" />
          <rect className="tube-hatch-line" width="3" height="9" />
        </pattern>
      </defs>

      <ellipse className="tube-shadow" cx={CENTER_X} cy="574" rx="64" ry="9" />

      {/* Verre : le corps, derrière le liquide */}
      <path
        className="tube-glass-body"
        d="M70 58 V500 A50 50 0 0 0 170 500 V58 Z"
      />

      {/* Couches déposées, du fond vers le haut */}
      <g
        clipPath={`url(#${clipId})`}
        className={`tube-layers${activeIndex !== null ? ' has-active' : ''}`}
      >
        {verdicts.map((verdict, index) => {
          const y = INNER_BOTTOM - (index + 1) * layerHeight;
          // La couche du fond descend jusqu'au fond arrondi
          const height = index === 0 ? layerHeight + 4 : layerHeight;
          return (
            <rect
              key={index}
              className={`tube-layer tube-layer-${verdict}${activeIndex === index ? ' is-active' : ''}`}
              x={INNER_LEFT}
              y={y}
              width={INNER_WIDTH}
              height={height}
              fill={verdict === 'buzz' ? `url(#${hatchId})` : undefined}
              style={cssVars({ '--delay': `${index * STEP_MS + FALL_MS}ms` })}
              onMouseEnter={onActiveChange && (() => onActiveChange(index))}
              onMouseLeave={onActiveChange && (() => onActiveChange(null))}
              onClick={onActiveChange && (() => onActiveChange(index))}
            />
          );
        })}
        {verdicts.length > 0 && (
          <ellipse
            className="tube-meniscus tube-settled"
            cx={CENTER_X}
            cy={surfaceY}
            rx={INNER_WIDTH / 2}
            ry="3.5"
          />
        )}
      </g>

      {/* Gouttes qui tombent du haut, une à une (masquées si animations réduites) */}
      {isStage && (
        <g className="tube-drops" aria-hidden="true">
          {verdicts.map((verdict, index) => (
            <path
              key={index}
              className={`tube-drop tube-drop-${verdict}`}
              d={`M${CENTER_X} 6 C${CENTER_X + 5} 13 ${CENTER_X + 9} 18 ${CENTER_X + 9} ${DROP_BOTTOM - 9} A9 9 0 0 1 ${CENTER_X - 9} ${DROP_BOTTOM - 9} C${CENTER_X - 9} 18 ${CENTER_X - 5} 13 ${CENTER_X} 6 Z`}
              style={cssVars({
                '--fall': `${INNER_BOTTOM - index * layerHeight - DROP_BOTTOM}px`,
                '--delay': `${index * STEP_MS}ms`,
              })}
            />
          ))}
        </g>
      )}

      {/* Graduations */}
      {isStage && (
        <g className="tube-scale" aria-hidden="true">
          {MINOR_MARKS.map((mark) => (
            <line
              key={mark}
              x1="70"
              x2={SCALE_MARKS.includes(mark) ? 86 : 78}
              y1={levelY(mark)}
              y2={levelY(mark)}
            />
          ))}
          {SCALE_MARKS.map((mark) => (
            <text key={mark} x="58" y={levelY(mark) + 4} textAnchor="end">
              {Math.round(mark * 100)}
            </text>
          ))}
        </g>
      )}

      {/* Reflets du verre, par-dessus le liquide */}
      <g className="tube-shine" aria-hidden="true">
        <rect x="86" y="84" width="9" height="400" rx="4.5" />
        <rect x="149" y="96" width="3" height="150" rx="1.5" />
      </g>
      <path
        className="tube-glass-outline"
        d="M70 58 V500 A50 50 0 0 0 170 500 V58"
      />
      <rect className="tube-lip" x="60" y="46" width="120" height="14" rx="7" />

      {/* Niveau atteint : la confiance */}
      {isStage && verdicts.length > 0 && (
        <g className="tube-level tube-settled" aria-hidden="true">
          <line x1="172" x2="198" y1={surfaceY} y2={surfaceY} />
          <text x="202" y={surfaceY + 5}>
            {Math.round(fill * 100)} %
          </text>
        </g>
      )}
    </svg>
  );
}
