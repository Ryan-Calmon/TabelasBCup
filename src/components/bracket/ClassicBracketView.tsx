import { useMemo, useRef, useState, useLayoutEffect } from 'react';
import {
  Match,
  Team,
  RoundGroup,
  buildRounds,
  getTeamLabel,
  getFinalsMatchNumbers,
} from '@/lib/brackets';

interface ClassicBracketViewProps {
  matches: Match[];
  teams: Record<string, Team>;
  numTeams: number;
}

const COL_WIDTH = 240;
const COL_GAP = 56;
const MATCH_HEIGHT = 72;
const MATCH_GAP = 18;
const PADDING_X = 24;
const PADDING_Y = 20;
const HEADER_H = 28;

type LaneRow = 'winners' | 'losers';

/**
 * Classic bracket — Challonge-style horizontal layout.
 * Renders TWO independent scroll-rows:
 *   1) winners row  → all winners-bracket rounds + finals column at the end
 *   2) losers row   → all losers-bracket rounds
 * Connectors are drawn ONLY within the same row, so the messy
 * "winners-loss → losers-bracket" diagonals are intentionally omitted.
 */
const ClassicBracketView = ({ matches, teams, numTeams }: ClassicBracketViewProps) => {
  const allRounds = useMemo(
    () => buildRounds(numTeams, matches).filter((r) => r.matches.length > 0),
    [matches, numTeams],
  );

  // Split rounds into two visual rows
  const winnersRounds = useMemo(
    () => allRounds.filter((r) => r.lane === 'winners' || r.lane === 'finals'),
    [allRounds],
  );
  const losersRounds = useMemo(
    () => allRounds.filter((r) => r.lane === 'losers'),
    [allRounds],
  );

  return (
    <div className="space-y-4">
      <BracketRow
        title="Chave de Vencedores"
        subtitle={`${winnersRounds.reduce((acc, r) => acc + r.matches.length, 0)} jogos`}
        rounds={winnersRounds}
        matches={matches}
        teams={teams}
        row="winners"
        numTeams={numTeams}
      />
      {losersRounds.length > 0 && (
        <BracketRow
          title="Chave de Perdedores"
          subtitle={`${losersRounds.reduce((acc, r) => acc + r.matches.length, 0)} jogos`}
          rounds={losersRounds}
          matches={matches}
          teams={teams}
          row="losers"
          numTeams={numTeams}
        />
      )}
    </div>
  );
};

interface BracketRowProps {
  title: string;
  subtitle: string;
  rounds: RoundGroup[];
  matches: Match[];
  teams: Record<string, Team>;
  row: LaneRow;
  numTeams: number;
}

const BracketRow = ({ title, subtitle, rounds, matches, teams, row, numTeams }: BracketRowProps) => {
  // Set of match numbers in this row (used to filter connectors)
  const roundMatchNumbers = useMemo(() => {
    const set = new Set<number>();
    rounds.forEach((r) => r.matches.forEach((m) => set.add(m.match_number)));
    return set;
  }, [rounds]);

  // Position map for matches in this row (with column index for routing)
  const positions = useMemo(() => {
    const map = new Map<number, { x: number; y: number; w: number; h: number; col: number }>();
    const rowHeight = laneHeight(rounds);

    rounds.forEach((round, colIdx) => {
      const x = PADDING_X + colIdx * (COL_WIDTH + COL_GAP);
      const totalH = round.matches.length * MATCH_HEIGHT + Math.max(0, round.matches.length - 1) * MATCH_GAP;
      // Vertically center each column inside the row
      const offset = Math.max(0, (rowHeight - totalH) / 2);
      round.matches.forEach((m, i) => {
        const y = PADDING_Y + HEADER_H + offset + i * (MATCH_HEIGHT + MATCH_GAP);
        map.set(m.match_number, { x, y, w: COL_WIDTH, h: MATCH_HEIGHT, col: colIdx });
      });
    });
    return map;
  }, [rounds]);

  const totalWidth = PADDING_X * 2 + rounds.length * COL_WIDTH + Math.max(0, rounds.length - 1) * COL_GAP;
  const totalHeight = PADDING_Y * 2 + HEADER_H + laneHeight(rounds);

  // Connectors only between matches that BOTH live in this row
  const connectors = useMemo(() => {
    const lines: Array<{ d: string; key: string; highlight: boolean }> = [];
    matches.forEach((m) => {
      if (!roundMatchNumbers.has(m.match_number)) return;
      const target = positions.get(m.match_number);
      if (!target) return;
      [m.depends_on_match1, m.depends_on_match2].forEach((dep, idx) => {
        if (!dep) return;
        if (!roundMatchNumbers.has(dep)) return; // skip cross-row links
        const source = positions.get(dep);
        if (!source) return;
        const x1 = source.x + source.w;
        const y1 = source.y + source.h / 2;
        const x2 = target.x;
        const y2 = target.y + (idx === 0 ? source.h * 0.3 : source.h * 0.7);
        const midX = (x1 + x2) / 2;
        const d = `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;
        const sourceMatch = matches.find((mm) => mm.match_number === dep);
        const highlight =
          sourceMatch?.status === 'completed' &&
          (m.team1_id === sourceMatch.winner_id ||
            m.team2_id === sourceMatch.winner_id);
        lines.push({ d, key: `${dep}->${m.match_number}-${idx}`, highlight });
      });
    });
    return lines;
  }, [matches, positions, roundMatchNumbers]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  // Default zoom: 80% on mobile (so users don't need to pinch),
  // shrink further only if needed to fit, but never below 0.55.
  const [zoom, setZoom] = useState(0.8);
  const [autoFit, setAutoFit] = useState(true);

  useLayoutEffect(() => {
    if (!autoFit) return;
    const el = wrapperRef.current;
    if (!el) return;
    const compute = () => {
      const available = el.clientWidth - 8;
      if (available <= 0) return;
      const isMobile = window.innerWidth < 768;
      const fit = available / totalWidth;
      const next = isMobile
        ? Math.max(0.55, Math.min(0.85, Math.max(0.8, fit)))
        : Math.min(1, Math.max(0.7, fit));
      setZoom(Number(next.toFixed(2)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener('orientationchange', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', compute);
    };
  }, [totalWidth, autoFit]);

  const accentBg =
    row === 'winners'
      ? 'bg-[hsl(48_96%_58%)] text-[hsl(220_35%_6%)]'
      : 'bg-accent text-accent-foreground';
  const accentBar = row === 'winners' ? 'bg-[hsl(48_96%_58%)]' : 'bg-accent';

  return (
    <section className="space-y-2">
      <header className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`inline-block w-2 h-6 ${accentBar}`} aria-hidden />
          <h3 className="font-display text-xl sm:text-2xl uppercase tracking-wider truncate">
            {title}
          </h3>
          <span className="font-mono-tab text-[10px] uppercase tracking-[0.25em] text-muted-foreground hidden sm:inline">
            {subtitle}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono-tab flex-shrink-0">
          <button
            type="button"
            onClick={() => { setAutoFit(false); setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2))); }}
            className="px-2 py-1 border border-border hover:border-accent hover:text-accent transition-colors"
            aria-label="Diminuir zoom"
          >
            −
          </button>
          <span className="w-10 text-center tabular-nums text-[10px]">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => { setAutoFit(false); setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2))); }}
            className="px-2 py-1 border border-border hover:border-accent hover:text-accent transition-colors"
            aria-label="Aumentar zoom"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setAutoFit(true)}
            className={`px-2 py-1 border transition-colors text-[10px] ${
              autoFit ? 'border-accent text-accent' : 'border-border hover:border-accent hover:text-accent'
            }`}
          >
            auto
          </button>
        </div>
      </header>

      <div
        ref={wrapperRef}
        className="overflow-auto border border-border bg-card/60 rounded-sm"
        style={{ maxHeight: '70vh' }}
      >
        <div style={{ width: totalWidth * zoom, height: totalHeight * zoom }}>
          <div
            style={{
              width: totalWidth,
              height: totalHeight,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              position: 'relative',
            }}
          >
            {/* Round headers */}
            {rounds.map((r, idx) => (
              <div
                key={`h-${idx}`}
                className="absolute font-display uppercase text-[11px] tracking-[0.18em] text-muted-foreground"
                style={{
                  left: PADDING_X + idx * (COL_WIDTH + COL_GAP),
                  top: PADDING_Y,
                  width: COL_WIDTH,
                }}
              >
                <span
                  className={`inline-block px-2 py-0.5 ${
                    r.lane === 'finals' ? 'bg-foreground text-background' : accentBg
                  }`}
                >
                  {r.name}
                </span>
              </div>
            ))}

            {/* SVG connectors */}
            <svg
              width={totalWidth}
              height={totalHeight}
              className="absolute inset-0 pointer-events-none"
            >
              {connectors.map((c) => {
                const activeColor =
                  row === 'winners' ? 'hsl(48 96% 58%)' : 'hsl(var(--accent))';
                return (
                  <path
                    key={c.key}
                    d={c.d}
                    fill="none"
                    stroke={c.highlight ? activeColor : 'hsl(var(--border))'}
                    strokeWidth={c.highlight ? 2 : 1.5}
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                  />
                );
              })}
            </svg>

            {/* Match cards */}
            {matches.map((m) => {
              if (!roundMatchNumbers.has(m.match_number)) return null;
              const pos = positions.get(m.match_number);
              if (!pos) return null;
              const finals = getFinalsMatchNumbers(numTeams);
              const phaseLabel =
                m.match_number === finals.finalMatchNumber
                  ? 'FINAL'
                  : m.match_number === finals.thirdPlaceMatchNumber
                  ? '3º LUGAR'
                  : undefined;
              return (
                <ClassicMatch
                  key={m.id}
                  match={m}
                  teams={teams}
                  x={pos.x}
                  y={pos.y}
                  w={pos.w}
                  h={pos.h}
                  row={row}
                  isFinal={!!allRoundsFinalsContains(m, rounds)}
                  phaseLabel={phaseLabel}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

function allRoundsFinalsContains(m: Match, rounds: RoundGroup[]) {
  return rounds.some((r) => r.lane === 'finals' && r.matches.some((mm) => mm.match_number === m.match_number));
}

function laneHeight(rounds: RoundGroup[]): number {
  let max = 0;
  rounds.forEach((r) => {
    const h = r.matches.length * MATCH_HEIGHT + Math.max(0, r.matches.length - 1) * MATCH_GAP;
    if (h > max) max = h;
  });
  return max;
}

interface ClassicMatchProps {
  match: Match;
  teams: Record<string, Team>;
  x: number;
  y: number;
  w: number;
  h: number;
  row: LaneRow;
  isFinal: boolean;
  phaseLabel?: string;
}

const ClassicMatch = ({ match, teams, x, y, w, h, row, isFinal, phaseLabel }: ClassicMatchProps) => {
  const t1 = getTeamLabel(match, teams, 1);
  const t2 = getTeamLabel(match, teams, 2);
  const winner1 = match.winner_id && match.winner_id === match.team1_id;
  const winner2 = match.winner_id && match.winner_id === match.team2_id;

  const accentClass = isFinal
    ? 'border-l-foreground'
    : row === 'winners'
    ? 'border-l-[hsl(48_96%_58%)]'
    : 'border-l-accent';

  const statusDoneColor = row === 'winners' ? 'text-[hsl(48_96%_58%)]' : 'text-accent';
  const slotHighlightBg = row === 'winners' ? 'bg-[hsl(48_96%_58%)]/15' : 'bg-accent/15';
  const slotHighlightArrow = row === 'winners' ? 'text-[hsl(48_96%_58%)]' : 'text-accent';

  return (
    <div
      className={`absolute bg-card border border-border ${accentClass} border-l-[3px] flex flex-col`}
      style={{ left: x, top: y, width: w, height: h }}
    >
      <div className="flex items-center justify-between px-2 py-0.5 border-b border-border bg-background/40">
        <span className="font-mono-tab text-[10px] tracking-widest uppercase text-muted-foreground">
          {phaseLabel ?? `J${match.match_number}`}
        </span>
        <span className={`font-mono-tab text-[10px] tracking-widest uppercase ${
          match.status === 'completed' ? statusDoneColor :
          match.status === 'in_progress' ? 'text-ember' :
          'text-muted-foreground'
        }`}>
          {match.status === 'completed' ? '● final' :
           match.status === 'in_progress' ? '● ao vivo' :
           '○ pendente'}
        </span>
      </div>
      <Slot label={t1} highlight={!!winner1} dim={!!winner2} highlightBg={slotHighlightBg} arrowColor={slotHighlightArrow} />
      <Slot label={t2} highlight={!!winner2} dim={!!winner1} highlightBg={slotHighlightBg} arrowColor={slotHighlightArrow} />
    </div>
  );
};

const Slot = ({ label, highlight, dim, highlightBg, arrowColor }: { label: string; highlight: boolean; dim: boolean; highlightBg: string; arrowColor: string }) => (
  <div
    className={`flex-1 flex items-center justify-between px-2 text-sm leading-tight ${
      highlight
        ? `${highlightBg} text-foreground font-semibold`
        : dim
        ? 'text-muted-foreground line-through opacity-60'
        : 'text-foreground'
    }`}
  >
    <span className="truncate">{label}</span>
    {highlight && (
      <span className={`ml-2 text-[10px] font-mono-tab uppercase tracking-widest ${arrowColor}`}>
        ▸
      </span>
    )}
  </div>
);

export default ClassicBracketView;

