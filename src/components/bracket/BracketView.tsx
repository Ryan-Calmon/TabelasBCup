import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import MatchCard from './MatchCard';
import PodiumView from './PodiumView';
import ClassicBracketView from './ClassicBracketView';
import { buildRounds, getFinalsMatchNumbers } from '@/lib/brackets';
import { LayoutGrid, GitBranch } from 'lucide-react';

type Match = Database['public']['Tables']['matches']['Row'];
type Team = Database['public']['Tables']['teams']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface BracketViewProps {
  categoryId: string;
}

type ViewMode = 'cards' | 'classic';
const VIEW_STORAGE_KEY = 'bc:bracketView';

const BracketView = ({ categoryId }: BracketViewProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Record<string, Team>>({});
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'cards';
    return (window.localStorage.getItem(VIEW_STORAGE_KEY) as ViewMode) || 'cards';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
    }
  }, [viewMode]);

  useEffect(() => {
    loadBracket();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`bracket-${categoryId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `category_id=eq.${categoryId}`,
        },
        () => {
          loadBracket();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoryId]);

  const loadBracket = async () => {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    const { data: matchesData } = await supabase
      .from('matches')
      .select('*')
      .eq('category_id', categoryId)
      .order('match_number');

    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .eq('category_id', categoryId);

    if (teamsData) {
      const teamsMap: Record<string, Team> = {};
      teamsData.forEach((team) => {
        teamsMap[team.id] = team;
      });
      setTeams(teamsMap);
    }

    setCategory(categoryData);
    setMatches(matchesData || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12 font-mono-tab text-xs uppercase tracking-[0.3em] text-muted-foreground animate-flicker">
        carregando chaveamento…
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 font-mono-tab text-xs uppercase tracking-[0.3em] text-muted-foreground">
        chaveamento ainda não foi configurado
      </div>
    );
  }

  const numTeams = category?.num_teams || 16;

  // Pódio quando finalizada
  if (category?.status === 'completed') {
    return <PodiumView matches={matches} teams={teams} numTeams={numTeams} />;
  }

  const rounds = buildRounds(numTeams, matches).filter((r) => r.matches.length > 0);
  const { finalMatchNumber, thirdPlaceMatchNumber } = getFinalsMatchNumbers(numTeams);
  const phaseLabelFor = (n: number): string | undefined =>
    n === finalMatchNumber ? 'FINAL' : n === thirdPlaceMatchNumber ? 'Terceiro Lugar' : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-border p-2">
        <div className="font-mono-tab text-[10px] uppercase tracking-[0.3em] text-muted-foreground px-1">
          {matches.length} jogos · {numTeams} duplas
        </div>
        <div role="tablist" aria-label="Modo de visualização" className="grid grid-cols-2 gap-1">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'cards'}
            onClick={() => setViewMode('cards')}
            className={`flex items-center justify-center gap-2 px-3 py-1.5 font-mono-tab text-[11px] uppercase tracking-[0.18em] border transition-colors ${
              viewMode === 'cards'
                ? 'bg-accent text-accent-foreground border-accent'
                : 'border-border hover:border-accent hover:text-accent'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Cards
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'classic'}
            onClick={() => setViewMode('classic')}
            className={`flex items-center justify-center gap-2 px-3 py-1.5 font-mono-tab text-[11px] uppercase tracking-[0.18em] border transition-colors ${
              viewMode === 'classic'
                ? 'bg-accent text-accent-foreground border-accent'
                : 'border-border hover:border-accent hover:text-accent'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" /> Chaveamento
          </button>
        </div>
      </div>

      {viewMode === 'classic' ? (
        <ClassicBracketView matches={matches} teams={teams} numTeams={numTeams} />
      ) : (
        <div className="space-y-10 py-2">
          {rounds.map((round) => (
            <section key={round.name} className="space-y-3 animate-rise">
              <header className="flex items-baseline gap-3">
                <span
                  className={`inline-block w-2 h-6 ${
                    round.lane === 'winners'
                      ? 'bg-accent'
                      : round.lane === 'losers'
                      ? 'bg-ember'
                      : 'bg-foreground'
                  }`}
                  aria-hidden
                />
                <h3 className="font-display text-2xl uppercase tracking-wider text-foreground">
                  {round.name}
                </h3>
                <span className="font-mono-tab text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {round.lane === 'winners' ? 'vencedores'
                    : round.lane === 'losers' ? 'perdedores'
                    : 'finais'}
                </span>
              </header>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {round.matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    teams={teams}
                    lane={round.lane}
                    phaseLabel={phaseLabelFor(match.match_number)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default BracketView;
