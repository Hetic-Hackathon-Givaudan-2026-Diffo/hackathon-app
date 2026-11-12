import { useId, type CSSProperties } from 'react';
import {
  formatScore,
  tubeNumber,
  type TubeSummary,
} from '../../../domain/distillery';
import { VERDICT_LABELS, type Verdict } from '../../../domain/tube';
import './distilleryScene.css';

// Géométrie, en unités du viewBox. L'appareil occupe x 0 à 560, la paillasse suit.
const HEIGHT = 640;
const RACK_X = 580;
const SLOT = 120;
const MIN_SLOTS = 3;
const TUBE_TOP = 383;
const TUBE_RADIUS = 27;
const INNER_RADIUS = 21;
const INNER_BOTTOM = 567;
const CAPACITY = 172; // du fond intérieur à la graduation 100

// Le serpentin, de l'alambic (en bas à gauche) jusqu'au condenseur (en haut)
const COIL_PATH =
  'M188 437 L238 392 Q245 385 255 385 H294 Q314 385 314 405 V535 Q314 555 334 555 H483 A25.5 25.5 0 0 0 483 504 H385 A25.5 25.5 0 0 1 385 453 H483 A25.5 25.5 0 0 0 483 402 H385 A25.5 25.5 0 0 1 385 351 H483 A25.5 25.5 0 0 0 483 300 H430 Q420 300 420 290 V150';

const DROP_PATH =
  'M0 -10 C0 -10 -7 0 -7 3.5 a7 7 0 0 0 14 0 C7 0 0 -10 0 -10 Z';

function cssVars(vars: Record<string, string>): CSSProperties {
  return vars as CSSProperties;
}

function slotCenter(index: number): number {
  return RACK_X + index * SLOT + SLOT / 2;
}

interface DistillerySceneProps {
  tubes: TubeSummary[];
  activeSlug: string | null;
  onActiveChange: (slug: string | null) => void;
  /** Message affiché sur la paillasse vide (chargement, erreur, aucun tube). */
  message?: string;
}

/** La Distillerie : l'appareil de distillation, puis un tube par résultat, rempli jusqu'à son score. */
export function DistilleryScene({
  tubes,
  activeSlug,
  onActiveChange,
  message,
}: DistillerySceneProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const hatchId = `scene-hatch-${id}`;
  const titleId = `scene-title-${id}`;
  const slots = Math.max(tubes.length, MIN_SLOTS);
  const width = RACK_X + slots * SLOT + 30;

  return (
    <div className="scene-frame">
      <svg
        className="scene"
        viewBox={`0 0 ${width} ${HEIGHT}`}
        style={{ minWidth: `${Math.round(width * 0.62)}px` }}
        aria-labelledby={titleId}
      >
        <title id={titleId}>
          {`Distillerie : ${tubes.length} tube${tubes.length > 1 ? 's' : ''} sur la paillasse, du plus haut score au plus bas`}
        </title>
        <defs>
          <pattern
            id={hatchId}
            patternUnits="userSpaceOnUse"
            width="9"
            height="9"
            patternTransform="rotate(45)"
          >
            <rect className="scene-hatch-base" width="9" height="9" />
            <rect className="scene-hatch-line" width="3" height="9" />
          </pattern>
          <clipPath id={`${id}-boiler`}>
            <circle cx="140" cy="472" r="56" />
          </clipPath>
          <clipPath id={`${id}-condenser`}>
            <circle cx="420" cy="103" r="47" />
          </clipPath>
        </defs>

        <rect
          className="scene-bench"
          x="0"
          y="612"
          width={width}
          height={HEIGHT - 612}
        />

        <Apparatus id={id} width={width} />
        <Rack slots={slots} width={width} />

        {tubes.map((tube, index) => (
          <SceneTube
            key={tube.slug}
            tube={tube}
            index={index}
            hatchId={hatchId}
            clipId={`${id}-tube-${index}`}
            active={activeSlug === tube.slug}
            onActiveChange={onActiveChange}
          />
        ))}
      </svg>
      {message && (
        <p className="scene-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

/** Entonnoir, alambic sur sa flamme, serpentin et condenseur : décor, ignoré des lecteurs d'écran. */
function Apparatus({ id, width }: { id: string; width: number }) {
  return (
    <g aria-hidden="true">
      {/* Les signaux tombent dans l'entonnoir */}
      {(['durable', 'buzz', 'durable'] as Verdict[]).map((verdict, index) => (
        <g key={index} transform={`translate(${[132, 150, 140][index]} 40)`}>
          <path
            className={`scene-funnel-drop scene-drop-${verdict}`}
            d={DROP_PATH}
            style={cssVars({ '--delay': `${index * -0.9}s` })}
          />
        </g>
      ))}
      <path
        className="scene-glass"
        d="M74 237 H206 L151 322 V350 H129 V322 Z"
      />

      {/* Serpentin : le tuyau, puis le liquide qui y circule */}
      <path className="scene-pipe-edge" d={COIL_PATH} />
      <path className="scene-pipe" d={COIL_PATH} />
      <path className="scene-flow" d={COIL_PATH} />

      {/* Rampe vers les tubes */}
      <path className="scene-pipe-edge" d={`M470 103 H${width}`} />
      <path className="scene-pipe" d={`M470 103 H${width}`} />
      <path className="scene-flow" d={`M473 103 H${width}`} />

      {/* Condenseur */}
      <circle className="scene-glass" cx="420" cy="103" r="53.5" />
      <g clipPath={`url(#${id}-condenser)`}>
        <path
          className="scene-wave scene-liquid-fill"
          d="M360 96q15-9 30 0t30 0t30 0t30 0t30 0t30 0V160H360z"
        />
      </g>

      {/* Alambic : col, collier, ballon et ses bulles */}
      <rect className="scene-glass" x="122" y="341" width="36" height="84" />
      <rect
        className="scene-metal"
        x="116"
        y="333"
        width="48"
        height="10"
        rx="3"
      />
      <circle className="scene-glass" cx="140" cy="472" r="62" />
      <g clipPath={`url(#${id}-boiler)`}>
        <path
          className="scene-wave scene-liquid-fill"
          d="M80 462q15-5 30 0t30 0t30 0t30 0t30 0t30 0V540H80z"
        />
        <circle className="scene-bubble" cx="112" cy="505" r="4" />
        <circle
          className="scene-bubble"
          style={cssVars({ '--delay': '-0.9s' })}
          cx="150"
          cy="512"
          r="3"
        />
        <circle
          className="scene-bubble"
          style={cssVars({ '--delay': '-1.7s' })}
          cx="172"
          cy="498"
          r="4"
        />
      </g>
      <circle className="scene-shine-dot" cx="118" cy="446" r="7" />

      {/* Support, flamme et brûleur */}
      <path className="scene-metal-line" d="M46 612L62 525M234 612L218 525" />
      <path
        className="scene-metal"
        d="M50 515h180c0 8-4 12-10 12H60c-6 0-10-4-10-12z"
      />
      <g className="scene-flame">
        <path
          className="scene-flame-outer"
          d="M140 538c10 10 17 18 17 30 0 10-7 16-17 16s-17-6-17-16c0-12 7-20 17-30z"
        />
        <path
          className="scene-flame-inner"
          d="M140 556c5 5 8 9 8 14 0 5-3 8-8 8s-8-3-8-8c0-5 3-9 8-14z"
        />
      </g>
      <path className="scene-metal" d="M99 612c0-18 18-30 41-30s41 12 41 30z" />
    </g>
  );
}

/** Portoir des tubes et égouttoirs sous la rampe, un par emplacement. */
function Rack({ slots, width }: { slots: number; width: number }) {
  return (
    <g aria-hidden="true">
      {Array.from({ length: slots }, (_, index) => {
        const cx = slotCenter(index);
        return (
          <g key={index}>
            <rect
              className="scene-metal"
              x={cx - 10}
              y="92"
              width="20"
              height="21"
              rx="2"
            />
            <rect
              className="scene-dropper"
              x={cx - 5.5}
              y="113"
              width="11"
              height="133"
              rx="5"
            />
          </g>
        );
      })}
      <rect
        className="scene-metal"
        x={RACK_X - 6}
        y="459"
        width={width - RACK_X - 10}
        height="7"
      />
      {Array.from({ length: slots + 1 }, (_, index) => (
        <rect
          key={index}
          className="scene-metal"
          x={RACK_X + index * SLOT - 2}
          y="459"
          width="4"
          height="140"
        />
      ))}
      <rect
        className="scene-metal"
        x={RACK_X - 6}
        y="595"
        width={width - RACK_X - 10}
        height="15"
        rx="4"
      />
    </g>
  );
}

function SceneTube({
  tube,
  index,
  hatchId,
  clipId,
  active,
  onActiveChange,
}: {
  tube: TubeSummary;
  index: number;
  hatchId: string;
  clipId: string;
  active: boolean;
  onActiveChange: (slug: string | null) => void;
}) {
  const cx = slotCenter(index);
  const level =
    INNER_BOTTOM - Math.min(Math.max(tube.confidence, 0), 1) * CAPACITY;
  const score = formatScore(tube.confidence);
  const verdict = VERDICT_LABELS[tube.verdict];
  const outline = `M${cx - TUBE_RADIUS} ${TUBE_TOP} V${INNER_BOTTOM - 21} A${TUBE_RADIUS} ${TUBE_RADIUS} 0 0 0 ${cx + TUBE_RADIUS} ${INNER_BOTTOM - 21} V${TUBE_TOP}`;
  const inner = `M${cx - INNER_RADIUS} ${TUBE_TOP + 5} V${INNER_BOTTOM - INNER_RADIUS} A${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${cx + INNER_RADIUS} ${INNER_BOTTOM - INNER_RADIUS} V${TUBE_TOP + 5} Z`;

  return (
    <a
      href={`/tubes/${tube.slug}`}
      className={`scene-tube${active ? ' is-active' : ''}`}
      aria-label={`Tube ${tubeNumber(index)}, ${tube.name} : ${verdict}, score ${score} sur 100. Ouvrir la lecture`}
      onMouseEnter={() => onActiveChange(tube.slug)}
      onMouseLeave={() => onActiveChange(null)}
      onFocus={() => onActiveChange(tube.slug)}
      onBlur={() => onActiveChange(null)}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={inner} />
        </clipPath>
      </defs>

      {/* L'égouttoir goutte dans le tube */}
      <g transform={`translate(${cx} 256)`} aria-hidden="true">
        <path
          className={`scene-drip scene-drop-${tube.verdict}`}
          d={DROP_PATH}
          style={cssVars({ '--delay': `${index * -0.7}s` })}
        />
      </g>

      <rect
        className="scene-focus-ring"
        x={cx - 44}
        y={TUBE_TOP - 48}
        width="88"
        height={INNER_BOTTOM - TUBE_TOP + 62}
        rx="12"
      />

      <g className="scene-tube-body">
        <text
          className="scene-score"
          x={cx}
          y={TUBE_TOP - 16}
          textAnchor="middle"
        >
          {score}
          <tspan className="scene-score-unit"> %</tspan>
        </text>
        <path className="scene-tube-glass" d={`${outline} Z`} />
        <g clipPath={`url(#${clipId})`}>
          <rect
            className={`scene-liquid scene-liquid-${tube.verdict}`}
            x={cx - INNER_RADIUS}
            y={level}
            width={INNER_RADIUS * 2}
            height={INNER_BOTTOM - level + 2}
            fill={tube.verdict === 'buzz' ? `url(#${hatchId})` : undefined}
            style={cssVars({ '--delay': `${400 + index * 180}ms` })}
          />
        </g>
        <rect
          className="scene-shine"
          x={cx - 16}
          y={TUBE_TOP + 14}
          width="5"
          height="120"
          rx="2.5"
        />
        <path className="scene-tube-outline" d={outline} />
        <rect
          className="scene-tube-lip"
          x={cx - 31}
          y={TUBE_TOP - 6}
          width="62"
          height="8"
          rx="4"
        />
      </g>

      <text className="scene-label" x={cx} y="631" textAnchor="middle">
        {tubeNumber(index)} · {verdict}
      </text>
    </a>
  );
}
