import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LogOut, Plus } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { getOrCreateDefaultTournament } from '@/lib/defaultTournament';
import { useAdminTheme } from '@/lib/useAdminTheme';
import FakeDrawManager, { FakeCategory } from '@/components/admin/FakeDrawManager';

type Category = Database['public']['Tables']['categories']['Row'];

const NUM_TEAMS_OPTIONS = [8, 9, 12, 14, 15, 16, 17, 18, 19, 20, 24, 25, 32] as const;

const SorteioFake = () => {
  useAdminTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [realCategories, setRealCategories] = useState<Category[]>([]);

  const [categoryName, setCategoryName] = useState('');
  const [numTeams, setNumTeams] = useState<number>(16);

  const [fakeCategories, setFakeCategories] = useState<FakeCategory[]>([]);
  const [activeTab, setActiveTab] = useState('manage-categories');

  useEffect(() => {
    checkAuthAndLoadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/admin');
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const tournament = await getOrCreateDefaultTournament();
    if (tournament) {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('tournament_id', tournament.id);
      setRealCategories(data || []);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logout realizado');
    navigate('/admin');
  };

  const handleCreateFakeCategory = (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error('Insira um nome para a categoria');
      return;
    }

    const id = `fake-${Date.now()}`;
    const fake: FakeCategory = {
      id,
      name: categoryName.trim(),
      numTeams,
      teams: [],
      phase: 'teams',
      matchedCategoryId: null,
    };

    setFakeCategories((prev) => [...prev, fake]);
    setCategoryName('');
    setActiveTab(id);
    toast.success('Categoria criada!');
  };

  const handleUpdateFakeCategory = (id: string, patch: Partial<FakeCategory>) => {
    setFakeCategories((prev) => prev.map((fc) => (fc.id === id ? { ...fc, ...patch } : fc)));
  };

  const handleDeleteFakeCategory = (id: string) => {
    setFakeCategories((prev) => prev.filter((fc) => fc.id !== id));
    setActiveTab('manage-categories');
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
              Sorteio
            </h1>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              size="sm"
              className="flex-1 sm:flex-initial rounded-none border-ink/20 hover:bg-ink hover:text-volt font-mono-tab text-[11px] uppercase tracking-[0.25em]"
            >
              painel
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

        <Card className="rounded-none border-ink/15 shadow-brutal-sm bg-white">
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                <TabsList className="inline-flex w-auto min-w-full rounded-none bg-transparent border-b border-ink/15 p-0 h-auto">
                  <TabsTrigger
                    value="manage-categories"
                    className="text-[11px] sm:text-xs font-mono-tab uppercase tracking-[0.2em] whitespace-nowrap flex-shrink-0 rounded-none data-[state=active]:bg-ink data-[state=active]:text-volt data-[state=active]:shadow-none px-3 py-2"
                  >
                    categorias
                  </TabsTrigger>
                  {fakeCategories.map((fc) => (
                    <TabsTrigger
                      key={fc.id}
                      value={fc.id}
                      className="text-[11px] sm:text-xs font-mono-tab uppercase tracking-[0.2em] whitespace-nowrap flex-shrink-0 rounded-none data-[state=active]:bg-ink data-[state=active]:text-volt data-[state=active]:shadow-none px-3 py-2"
                    >
                      {fc.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="manage-categories">
                <div className="space-y-4 sm:space-y-6">
                  <Card className="rounded-none border-ink/15 shadow-brutal-sm">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-lg sm:text-xl">Criar Nova Categoria</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <form onSubmit={handleCreateFakeCategory} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="categoryName">Nome da Categoria</Label>
                          <Input
                            id="categoryName"
                            placeholder="Ex: Categoria A, Sub-18, etc."
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="numTeams">Número de Duplas</Label>
                          <select
                            id="numTeams"
                            value={numTeams}
                            onChange={(e) => setNumTeams(Number(e.target.value))}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {NUM_TEAMS_OPTIONS.map((n) => (
                              <option key={n} value={n}>{n} duplas</option>
                            ))}
                          </select>
                        </div>
                        <Button type="submit" className="gap-2 w-full sm:w-auto">
                          <Plus className="w-4 h-4" />
                          Criar Categoria
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {fakeCategories.map((fc) => (
                <TabsContent key={fc.id} value={fc.id}>
                  <FakeDrawManager
                    fakeCategory={fc}
                    realCategories={realCategories}
                    onUpdate={handleUpdateFakeCategory}
                    onDelete={handleDeleteFakeCategory}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SorteioFake;
