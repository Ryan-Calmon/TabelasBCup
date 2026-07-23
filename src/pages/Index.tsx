import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';
import { getOrCreateDefaultTournament } from '@/lib/defaultTournament';
import { ArrowUpRight, Trophy, Clock } from 'lucide-react';
import logo from '@/assets/logo.png';
import CourtsBoard from '@/components/bracket/CourtsBoard';
import { SCHEDULE, getCategorySchedule } from '@/lib/schedule';

type Category = Database['public']['Tables']['categories']['Row'];

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const tournament = await getOrCreateDefaultTournament();
    if (!tournament) { setLoading(false); return; }
    setTournamentId(tournament.id);
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('tournament_id', tournament.id)
      .neq('status', 'draft')
      .eq('is_public', true)
      .order('display_order')
      .order('created_at');
    setCategories(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stadium relative overflow-x-hidden w-full max-w-[100vw]">
      {/* Marquee tape band */}
      <div className="tape-band overflow-hidden whitespace-nowrap py-1.5 border-y border-ink/10 relative z-10 w-full max-w-[100vw]">
        <div className="inline-flex animate-marquee">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="px-6 text-sm flex items-center gap-6">
              {Array.from({ length: 8 }).map((_, j) => (
                <span key={j} className="flex items-center gap-3">
                  Brothers Cup · Quarta Edição · 25+26 jul · tabelas ao vivo ·
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 pt-12 pb-20 relative z-10">
        {/* Hero */}
        <header className="grid grid-cols-12 gap-4 sm:gap-6 items-end mb-12">
          <div className="col-span-12 md:col-span-8 space-y-4 animate-rise">
            <div className="flex items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              <span className="h-px w-8 bg-accent" />
              IV edição · 25–26 julho
            </div>
            <h1 className="font-display text-[14vw] sm:text-[12vw] md:text-[10rem] leading-[0.95] uppercase tracking-tight text-balance break-words max-w-full">
              Brothers
              <br />
              <span className="text-accent">Cup</span>
            </h1>
            <p className="font-mono-tab text-xs sm:text-sm uppercase tracking-[0.25em] text-muted-foreground max-w-md">
              Tabelas oficiais e Atualização em tempo real. 
              Escolha sua categoria e acompanhe.
            </p>
          </div>

          <div className="col-span-12 md:col-span-4 flex md:justify-end">
            <div className="relative">
              <div className="absolute -inset-3 bg-accent/20 blur-2xl rounded-full" aria-hidden />
              <img
                src={logo}
                alt="Brothers Cup"
                className="relative w-32 sm:w-40 md:w-48 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
              />
            </div>
          </div>
        </header>

        {/* Quadras (live courts board) */}
        {tournamentId && <CourtsBoard tournamentId={tournamentId} />}

        {/* Categories grid */}
        <section aria-labelledby="categorias">
          <div className="flex items-baseline justify-between mb-4">
            <h2 id="categorias" className="font-display text-3xl uppercase tracking-wider">
              Categorias
            </h2>
            <span className="font-mono-tab text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {loading ? '— —' : `${categories.length.toString().padStart(2, '0')} ativas`}
            </span>
          </div>

          {loading ? (
            <div className="font-mono-tab text-xs uppercase tracking-[0.3em] text-muted-foreground py-12 text-center animate-flicker">
              carregando…
            </div>
          ) : categories.length === 0 ? (
            <div className="border border-dashed border-border p-12 text-center">
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-display uppercase tracking-wider text-2xl text-foreground">
                Nenhuma categoria ativa
              </p>
              <p className="font-mono-tab text-xs uppercase tracking-[0.25em] text-muted-foreground mt-2">
                aguarde novidades em breve
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category, idx) => {
                const schedule = getCategorySchedule(category.name);
                return (
                <li key={category.id} className="animate-rise" style={{ animationDelay: `${idx * 60}ms` }}>
                  <button
                    type="button"
                    onClick={() => navigate(`/category/${category.id}`)}
                    className="group w-full text-left bg-card border border-border hover:border-accent transition-colors p-5 sm:p-6 relative overflow-hidden"
                  >
                    {/* index numeral */}
                    <span
                      aria-hidden
                      className="absolute -right-4 -bottom-8 font-display text-[8rem] leading-none text-foreground/[0.04] select-none"
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    <div className="flex items-start justify-between gap-4 relative">
                      <div className="space-y-3 flex-1 min-w-0">
                        <span className="inline-block font-mono-tab text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                          categoria · {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-foreground group-hover:text-accent transition-colors leading-tight truncate">
                          {category.name}
                        </h3>
                        {schedule && (
                          <span className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground px-2.5 py-1 font-mono-tab text-[11px] font-bold uppercase tracking-[0.2em] shadow-[0_2px_0_0_rgba(0,0,0,0.25)]">
                            <Clock className="w-3.5 h-3.5" />
                            {schedule.day} · {schedule.time}
                          </span>
                        )}
                        <div className="flex items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                          <span>{category.num_teams} duplas</span>
                          <span className="h-px flex-1 bg-border" />
                          {category.status === 'completed' ? (
                            <span className="text-accent">finalizada ✓</span>
                          ) : (
                            <span className="text-ember animate-flicker">● ao vivo</span>
                          )}
                        </div>
                      </div>
                      <ArrowUpRight className="w-6 h-6 text-muted-foreground group-hover:text-accent group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Programação (schedule) */}
        <section aria-labelledby="programacao" className="mt-16">
          <div className="flex items-baseline justify-between mb-4">
            <h2 id="programacao" className="font-display text-3xl uppercase tracking-wider">
              Programação
            </h2>
            <span className="font-mono-tab text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              25–26 jul
            </span>
          </div>

          <div className="space-y-4">
            {(['Sábado', 'Domingo'] as const).map((day, dayIdx) => {
              const entries = SCHEDULE.filter((entry) => entry.day === day);
              return (
                <div key={day} className="bg-card border border-border p-5 sm:p-6">
                  <div className="flex items-baseline justify-between gap-3 mb-6">
                    <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-foreground">
                      {day}
                    </h3>
                    <span className="font-mono-tab text-[10px] uppercase tracking-[0.3em] text-accent">
                      {dayIdx === 0 ? '25 jul' : '26 jul'}
                    </span>
                  </div>

                  <div className="relative overflow-x-auto pb-1">
                    <div className="flex items-start min-w-max">
                      {entries.map((entry, i) => (
                        <div key={entry.category} className="relative flex items-start">
                          <div className="flex flex-col items-start w-36 sm:w-44 pr-4">
                            <span className="w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-accent/15 mb-3" />
                            <span className="font-mono-tab text-xl sm:text-2xl font-bold text-foreground tracking-wide">
                              {entry.time}
                            </span>
                            <span className="font-mono-tab text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-snug mt-1">
                              {entry.category}
                            </span>
                          </div>
                          {i < entries.length - 1 && (
                            <span className="h-px w-8 sm:w-10 bg-border mt-[5px] shrink-0" aria-hidden />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="mt-20 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono-tab text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span>© Brothers Cup · {new Date().getFullYear()}</span>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="hover:text-accent transition-colors"
          >
            painel administrativo →
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Index;