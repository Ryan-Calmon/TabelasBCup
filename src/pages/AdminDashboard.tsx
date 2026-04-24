import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryManager from '@/components/admin/CategoryManager';
import MatchManager from '@/components/admin/MatchManager';
import { getOrCreateDefaultTournament } from '@/lib/defaultTournament';
import { useAdminTheme } from '@/lib/useAdminTheme';

type Category = Database['public']['Tables']['categories']['Row'];

const AdminDashboard = () => {
  useAdminTheme();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/admin');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/admin');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      toast.error('Acesso não autorizado');
      await supabase.auth.signOut();
      navigate('/admin');
      return;
    }

    // Get or create default tournament
    const tournament = await getOrCreateDefaultTournament();
    if (tournament) {
      setTournamentId(tournament.id);
      loadCategories(tournament.id);
    }
    
    setLoading(false);
  };

  const loadCategories = async (tournamentId: string) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('created_at');

    if (error) {
      toast.error('Erro ao carregar categorias');
      return;
    }

    setCategories(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logout realizado');
    navigate('/admin');
  };

  const handleCategoriesUpdate = () => {
    if (tournamentId) {
      loadCategories(tournamentId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper text-ink flex items-center justify-center font-mono-tab text-xs uppercase tracking-[0.3em] text-ink/60 animate-flicker">
        carregando…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-ink/15 pb-4">
          <div className="space-y-1">
            <p className="font-mono-tab text-[10px] uppercase tracking-[0.4em] text-ink/50">
              painel administrativo
            </p>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight leading-none">
              Brothers Cup
            </h1>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              size="sm"
              className="flex-1 sm:flex-initial rounded-none border-ink/20 hover:bg-ink hover:text-volt font-mono-tab text-[11px] uppercase tracking-[0.25em]"
            >
              público
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              size="sm"
              className="gap-2 flex-1 sm:flex-initial rounded-none border-ink/20 hover:bg-ink hover:text-volt font-mono-tab text-[11px] uppercase tracking-[0.25em]"
            >
              <LogOut className="w-3.5 h-3.5" />
              sair
            </Button>
          </div>
        </header>

        {!tournamentId ? (
          <Card className="rounded-none border-ink/15 shadow-brutal-sm">
            <CardContent className="text-center py-12 font-mono-tab text-xs uppercase tracking-[0.3em] text-ink/50">
              carregando…
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-none border-ink/15 shadow-brutal-sm bg-white">
            <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
              <Tabs defaultValue="manage-categories" className="w-full">
                <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                  <TabsList className="inline-flex w-auto min-w-full rounded-none bg-transparent border-b border-ink/15 p-0 h-auto">
                    <TabsTrigger
                      value="manage-categories"
                      className="text-[11px] sm:text-xs font-mono-tab uppercase tracking-[0.2em] whitespace-nowrap flex-shrink-0 rounded-none data-[state=active]:bg-ink data-[state=active]:text-volt data-[state=active]:shadow-none px-3 py-2"
                    >
                      categorias
                    </TabsTrigger>
                    {categories.map((category) => (
                      <TabsTrigger
                        key={category.id}
                        value={category.id}
                        className="text-[11px] sm:text-xs font-mono-tab uppercase tracking-[0.2em] whitespace-nowrap flex-shrink-0 rounded-none data-[state=active]:bg-ink data-[state=active]:text-volt data-[state=active]:shadow-none px-3 py-2"
                      >
                        {category.name}
                        {category.status === 'completed' && <span className="ml-2">✓</span>}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                <TabsContent value="manage-categories">
                  <CategoryManager
                    tournamentId={tournamentId}
                    onUpdate={handleCategoriesUpdate}
                    categories={categories}
                  />
                </TabsContent>
                {categories.map((category) => (
                  <TabsContent key={category.id} value={category.id}>
                    <MatchManager categoryId={category.id} />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
