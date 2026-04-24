import { Database } from '@/integrations/supabase/types';
import { getTeamLabel } from '@/lib/brackets';

type Match = Database['public']['Tables']['matches']['Row'];
type Team = Database['public']['Tables']['teams']['Row'];

interface MatchCardProps {
  match: Match;
  teams: Record<string, Team>;
  /** Optional bracket lane — drives the accent color */
  lane?: 'winners' | 'losers' | 'finals';
  /** Optional phase label (e.g. "FINAL", "Terceiro Lugar") shown instead of "jogo NN" */
  phaseLabel?: string;
}

const STATUS_LABEL: Record<Match['status'], string> = {
  pending: 'pendente',
  in_progress: 'ao vivo',
  completed: 'final',
};

const MatchCard = ({ match, teams, lane = 'winners', phaseLabel }: MatchCardProps) => {
  const team1Display = getTeamLabel(match, teams, 1);
  const team2Display = getTeamLabel(match, teams, 2);
  const winner = match.winner_id ? teams[match.winner_id] : null;

  const accentBar =
    lane === 'winners' ? 'bg-accent' :
    lane === 'losers'  ? 'bg-ember'  :
                          'bg-foreground';

  const statusColor =
    match.status === 'completed' ? 'text-accent' :
    match.status === 'in_progress' ? 'text-ember animate-flicker' :
    'text-muted-foreground';

  const winner1 = match.winner_id && match.winner_id === match.team1_id;
  const winner2 = match.winner_id && match.winner_id === match.team2_id;

  return (
    <article className="group relative bg-card border border-border hover:border-accent/60 transition-colors">
      {/* lane-colored ribbon */}
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${accentBar}`} aria-hidden />

      <header className="flex items-center justify-between pl-4 pr-3 py-2 border-b border-border">
        <div className="flex items-baseline gap-2">
          {phaseLabel ? (
            <span className="font-display text-base sm:text-lg uppercase tracking-wider text-foreground">
              {phaseLabel}
            </span>
          ) : (
            <>
              <span className="font-mono-tab text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                jogo
              </span>
              <span className="font-display text-xl leading-none">
                {String(match.match_number).padStart(2, '0')}
              </span>
            </>
          )}
        </div>
        <span className={`font-mono-tab text-[10px] uppercase tracking-[0.25em] ${statusColor}`}>
          ● {STATUS_LABEL[match.status]}
          {match.status === 'in_progress' && match.court_number && (
            <span className="ml-1.5 px-1.5 py-px border border-ember/60 text-ember rounded-sm">
              Q{match.court_number}
            </span>
          )}
        </span>
      </header>

      <div className="pl-4 pr-3 py-3 space-y-1.5">
        <TeamRow label={team1Display} winner={!!winner1} loser={!!winner2} />
        <div className="flex items-center gap-2 px-1">
          <span className="h-px flex-1 bg-border" />
          <span className="font-display text-[11px] tracking-[0.3em] text-muted-foreground">vs</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <TeamRow label={team2Display} winner={!!winner2} loser={!!winner1} />
      </div>

      {winner && (
        <footer className="px-4 pb-2 pt-1 border-t border-border bg-background/30">
          <p className="font-mono-tab text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Vencedor
          </p>
          <p className="font-display text-lg uppercase text-accent leading-tight truncate">
            {winner.name}
          </p>
        </footer>
      )}
    </article>
  );
};

const TeamRow = ({ label, winner, loser }: { label: string; winner: boolean; loser: boolean }) => (
  <div
    className={`flex items-center justify-between px-3 py-2 border ${
      winner
        ? 'border-accent bg-accent/10 text-foreground'
        : loser
        ? 'border-border bg-transparent text-muted-foreground line-through opacity-60'
        : 'border-border bg-background/40 text-foreground'
    }`}
  >
    <span className="text-sm font-medium truncate">{label}</span>
    {winner && (
      <span className="ml-2 font-mono-tab text-[10px] tracking-[0.25em] uppercase text-accent">
        ▸ pass
      </span>
    )}
  </div>
);

export default MatchCard;
