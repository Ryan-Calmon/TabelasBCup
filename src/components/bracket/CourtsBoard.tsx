import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface CourtMatch {
  id: string;
  match_number: number;
  court_number: number;
  team1_name: string | null;
  team2_name: string | null;
  category_id: string;
  category_name: string;
}

interface CourtsBoardProps {
  tournamentId: string;
}

const COURTS = [1, 2, 3, 4] as const;

const CourtsBoard = ({ tournamentId }: CourtsBoardProps) => {
  const [active, setActive] = useState<Record<number, CourtMatch | null>>({
    1: null, 2: null, 3: null, 4: null,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    // Get all categories of this tournament so we can scope the query.
    const { data: cats } = await supabase
      .from('categories')
      .select('id, name')
      .eq('tournament_id', tournamentId);

    const catMap = new Map((cats ?? []).map(c => [c.id, c.name]));
    const catIds = Array.from(catMap.keys());

    if (catIds.length === 0) {
      setActive({ 1: null, 2: null, 3: null, 4: null });
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('matches')
      .select('id, match_number, court_number, team1_id, team2_id, category_id')
      .in('category_id', catIds)
      .eq('status', 'in_progress')
      .not('court_number', 'is', null);

    const teamIds = new Set<string>();
    (data ?? []).forEach(m => {
      if (m.team1_id) teamIds.add(m.team1_id);
      if (m.team2_id) teamIds.add(m.team2_id);
    });

    const teamMap = new Map<string, string>();
    if (teamIds.size > 0) {
      const { data: teams } = await supabase
        .from('teams')
        .select('id, name')
        .in('id', Array.from(teamIds));
      (teams ?? []).forEach(t => teamMap.set(t.id, t.name));
    }

    const next: Record<number, CourtMatch | null> = { 1: null, 2: null, 3: null, 4: null };
    (data ?? []).forEach(m => {
      if (!m.court_number) return;
      next[m.court_number] = {
        id: m.id,
        match_number: m.match_number,
        court_number: m.court_number,
        team1_name: m.team1_id ? teamMap.get(m.team1_id) ?? null : null,
        team2_name: m.team2_id ? teamMap.get(m.team2_id) ?? null : null,
        category_id: m.category_id,
        category_name: catMap.get(m.category_id) ?? '',
      };
    });
    setActive(next);
    setLoading(false);
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel(`courts-${tournamentId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  return (
    <section aria-labelledby="quadras" className="mb-10">
      <div className="flex items-baseline justify-between mb-4">
        <h2 id="quadras" className="font-display text-3xl uppercase tracking-wider">
          Quadras
        </h2>
        <span className="font-mono-tab text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {loading ? '— —' : `${Object.values(active).filter(Boolean).length}/4 ocupadas`}
        </span>
      </div>

      <ul className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {COURTS.map((n) => {
          const m = active[n];
          const occupied = !!m;
          return (
            <li key={n}>
              <button
                type="button"
                disabled={!occupied}
                onClick={() => m && navigate(`/category/${m.category_id}`)}
                className={[
                  'group w-full text-left p-4 sm:p-5 border transition-colors relative overflow-hidden h-full',
                  occupied
                    ? 'bg-card border-yellow-500/60 hover:border-yellow-400 cursor-pointer'
                    : 'bg-card/40 border-border',
                ].join(' ')}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono-tab text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    quadra · {String(n).padStart(2, '0')}
                  </span>
                  {occupied ? (
                    <span className="font-mono-tab text-[10px] uppercase tracking-[0.25em] text-yellow-500 animate-flicker">
                      ● ao vivo
                    </span>
                  ) : (
                    <span className="font-mono-tab text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      livre
                    </span>
                  )}
                </div>

                {occupied ? (
                  <div className="space-y-2">
                    <div className="font-mono-tab text-[10px] uppercase tracking-[0.25em] text-accent truncate">
                      {m!.category_name} · jogo {String(m!.match_number).padStart(2, '0')}
                    </div>
                    <div className="font-display text-lg sm:text-xl uppercase leading-tight tracking-wide truncate">
                      {m!.team1_name ?? '—'}
                    </div>
                    <div className="font-mono-tab text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      vs
                    </div>
                    <div className="font-display text-lg sm:text-xl uppercase leading-tight tracking-wide truncate">
                      {m!.team2_name ?? '—'}
                    </div>
                  </div>
                ) : (
                  <div className="font-display text-2xl uppercase tracking-wide text-foreground/30 py-4 text-center">
                    aguardando
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default CourtsBoard;
