import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import BracketView from '@/components/bracket/BracketView';
import { Database } from '@/integrations/supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];

const CategoryView = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const loadCategory = async () => {
    if (!categoryId) return;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (error || !data) {
      console.error('Error loading category:', error);
      setLoading(false);
      return;
    }

    setCategory(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono-tab text-xs uppercase tracking-[0.3em] text-muted-foreground animate-flicker">
        carregando…
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stadium px-4">
        <div className="border border-border bg-card p-8 max-w-sm text-center">
          <p className="font-display text-3xl uppercase tracking-wide">404</p>
          <p className="font-mono-tab text-xs uppercase tracking-[0.25em] text-muted-foreground mt-2">
            categoria não encontrada
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-accent text-accent-foreground font-mono-tab text-xs uppercase tracking-[0.25em]"
          >
            voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stadium">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 relative z-10">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 font-mono-tab text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> voltar
        </button>

        <header className="border-y border-border py-4 sm:py-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1">
            <p className="font-mono-tab text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              brothers cup · categoria
            </p>
            <h1 className="font-display text-5xl sm:text-7xl uppercase tracking-tight leading-none text-balance">
              {category.name}
            </h1>
          </div>
          <div className="flex items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.3em]">
            <span className="px-2 py-1 border border-border">
              {category.num_teams} duplas
            </span>
            {category.status === 'completed' ? (
              <span className="px-2 py-1 bg-accent text-accent-foreground">finalizada ✓</span>
            ) : (
              <span className="px-2 py-1 bg-ember text-white animate-flicker">● ao vivo</span>
            )}
          </div>
        </header>

        <BracketView categoryId={categoryId!} />
      </div>
    </div>
  );
};

export default CategoryView;
