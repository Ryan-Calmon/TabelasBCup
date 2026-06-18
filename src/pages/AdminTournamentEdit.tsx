import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Trophy, Plus } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import CategoryManager from '@/components/admin/CategoryManager';
import MatchManager from '@/components/admin/MatchManager';

type Tournament = Database['public']['Tables']['tournaments']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

const AdminTournamentEdit = () => {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/admin');
      }
    });

    return () => subscription.unsubscribe();
  }, [tournamentId]);

  const checkAuth = async () => {
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
      navigate('/admin');
    }
  };

  const loadData = async () => {
    if (!tournamentId) return;

    const { data: tournamentData } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .eq('tournament_id', tournamentId);

    setTournament(tournamentData);
    setCategories(categoriesData || []);
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!tournament) {
    return <div className="min-h-screen flex items-center justify-center">Torneio não encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto p-6 space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/dashboard')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Painel
        </Button>

        <Card className="border-primary/20 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-glow">
                  <Trophy className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {tournament.name}
                </CardTitle>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(`/tournament/${tournamentId}`)}
              >
                Visualizar Público
              </Button>
            </div>
          </CardHeader>
        </Card>

        {categories.length === 0 ? (
          <Card className="border-primary/20 shadow-xl">
            <CardContent className="text-center py-12">
              <CategoryManager
                tournamentId={tournamentId!}
                onUpdate={loadData}
                categories={categories}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/20 shadow-xl">
            <CardContent className="pt-6">
              <Tabs defaultValue={categories[0]?.id} className="w-full">
                <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
                  {categories.map((category) => (
                    <TabsTrigger key={category.id} value={category.id}>
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
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

export default AdminTournamentEdit;
