import { Database } from '@/integrations/supabase/types';
import { Trophy } from 'lucide-react';
import { getFinalsMatchNumbers } from '@/lib/brackets';

type Match = Database['public']['Tables']['matches']['Row'];
type Team = Database['public']['Tables']['teams']['Row'];

interface PodiumViewProps {
  matches: Match[];
  teams: Record<string, Team>;
  numTeams: number;
}

const PodiumView = ({ matches, teams, numTeams }: PodiumViewProps) => {
  const { finalMatchNumber, thirdPlaceMatchNumber } = getFinalsMatchNumbers(numTeams);

  const finalMatch = matches.find((m) => m.match_number === finalMatchNumber);
  const thirdPlaceMatch = matches.find((m) => m.match_number === thirdPlaceMatchNumber);

  if (!finalMatch || !thirdPlaceMatch) {
    return (
      <div className="text-center py-12 font-mono-tab text-xs uppercase tracking-[0.3em] text-muted-foreground">
        torneio ainda não finalizado
      </div>
    );
  }

  const firstPlace = finalMatch.winner_id ? teams[finalMatch.winner_id] : null;
  const secondPlace = finalMatch.winner_id
    ? teams[finalMatch.team1_id === finalMatch.winner_id ? finalMatch.team2_id! : finalMatch.team1_id!]
    : null;
  const thirdPlace = thirdPlaceMatch.winner_id ? teams[thirdPlaceMatch.winner_id] : null;
  const fourthPlace = thirdPlaceMatch.winner_id
    ? teams[thirdPlaceMatch.team1_id === thirdPlaceMatch.winner_id ? thirdPlaceMatch.team2_id! : thirdPlaceMatch.team1_id!]
    : null;

  return (
    <div className="py-6 sm:py-10 space-y-10">
      <header className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.4em] text-accent">
          <span className="h-px w-8 bg-accent" /> resultado oficial <span className="h-px w-8 bg-accent" />
        </div>
        <h2 className="font-display text-5xl sm:text-7xl uppercase tracking-wide flex items-center justify-center gap-4">
          <Trophy className="w-10 h-10 sm:w-14 sm:h-14 text-accent" />
          Pódio
        </h2>
        <p className="font-mono-tab text-xs uppercase tracking-[0.25em] text-muted-foreground">
          categoria finalizada
        </p>
      </header>

      {/* Stadium podium: 1st center-tall, 2nd left-medium, 3rd right-short */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-3xl mx-auto items-end px-2">
        <PodiumPillar place="2" team={secondPlace} height="h-44 sm:h-56" tone="silver" />
        <PodiumPillar place="1" team={firstPlace}  height="h-60 sm:h-80" tone="gold" featured />
        <PodiumPillar place="3" team={thirdPlace}  height="h-36 sm:h-44" tone="bronze" />
      </div>

      <div className="max-w-md mx-auto border border-border bg-card">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="font-mono-tab text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            4º lugar
          </span>
          <span className="font-mono-tab text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            participação
          </span>
        </div>
        <div className="px-4 py-4">
          <p className="font-display text-2xl uppercase tracking-wide truncate">
            {fourthPlace ? fourthPlace.name : '—'}
          </p>
        </div>
      </div>
    </div>
  );
};

const TONE: Record<string, { bg: string; text: string; ring: string; label: string }> = {
  gold:   { bg: 'bg-accent',         text: 'text-ink',       ring: 'border-accent',         label: 'CAMPEÕES' },
  silver: { bg: 'bg-muted',          text: 'text-foreground', ring: 'border-border',        label: 'VICE'      },
  bronze: { bg: 'bg-ember',          text: 'text-white',      ring: 'border-ember',         label: '3º LUGAR'  },
};

const PodiumPillar = ({
  place,
  team,
  height,
  tone,
  featured,
}: {
  place: '1' | '2' | '3';
  team: Team | null;
  height: string;
  tone: 'gold' | 'silver' | 'bronze';
  featured?: boolean;
}) => {
  const t = TONE[tone];
  return (
    <div className="flex flex-col items-stretch gap-2">
      <div className={`text-center ${featured ? 'animate-rise' : ''}`}>
        <p className="font-mono-tab text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {t.label}
        </p>
        <p className={`font-display uppercase truncate ${featured ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'} text-foreground`}>
          {team ? team.name : '—'}
        </p>
      </div>
      <div className={`${height} ${t.bg} ${t.text} border-2 ${t.ring} flex items-start justify-center pt-2 sm:pt-4 shadow-brutal-sm`}>
        <span className="font-display text-5xl sm:text-7xl leading-none">{place}</span>
      </div>
    </div>
  );
};

export default PodiumView;
