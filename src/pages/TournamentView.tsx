import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import BracketView from '@/components/bracket/BracketView';
import { Database } from '@/integrations/supabase/types';

type Tournament = Database['public']['Tables']['tournaments']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

const TournamentView = () => {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [tournamentId]);

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
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        <Card className="border-primary/20 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-glow">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {tournament.name}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>

        {categories.length === 0 ? (
          <Card className="border-primary/20 shadow-xl">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma categoria configurada ainda
              </p>
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
                    <BracketView categoryId={category.id} />
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

export default TournamentView;
