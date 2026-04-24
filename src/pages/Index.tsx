import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';
import { getOrCreateDefaultTournament } from '@/lib/defaultTournament';
import { ArrowUpRight, Trophy } from 'lucide-react';
import logo from '@/assets/logo.png';

type Category = Database['public']['Tables']['categories']['Row'];

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const tournament = await getOrCreateDefaultTournament();
    if (!tournament) { setLoading(false); return; }
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('tournament_id', tournament.id)
      .neq('status', 'draft')
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
              {categories.map((category, idx) => (
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
              ))}
            </ul>
          )}
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