import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Play, Edit2, Check, X } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryManagerProps {
  tournamentId: string;
  categories: Category[];
  onUpdate: () => void;
}

const CategoryManager = ({ tournamentId, categories, onUpdate }: CategoryManagerProps) => {
  const [categoryName, setCategoryName] = useState('');
  const [numTeams, setNumTeams] = useState<8 | 9 | 12 | 14 | 16 | 18 | 20 | 24 | 25>(16);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toast.error('Por favor, insira um nome para a categoria');
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          tournament_id: tournamentId,
          name: categoryName.trim(),
          num_teams: numTeams,
          status: 'draft',
        });

      if (error) throw error;

      toast.success('Categoria criada em modo rascunho!');
      setCategoryName('');
      onUpdate();
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      toast.error(error.message || 'Erro ao criar categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast.success('Categoria excluída!');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir categoria');
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSaveEdit = async (categoryId: string) => {
    if (!editingName.trim()) {
      toast.error('Nome não pode estar vazio');
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .update({ name: editingName.trim() })
        .eq('id', categoryId);

      if (error) throw error;

      toast.success('Nome atualizado!');
      setEditingId(null);
      setEditingName('');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar nome');
    }
  };

  const handleStartCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ status: 'active' })
        .eq('id', categoryId);

      if (error) throw error;

      toast.success('Categoria iniciada!');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao iniciar categoria');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'secondary' as const },
      active: { label: 'Ativa', variant: 'default' as const },
      completed: { label: 'Finalizada', variant: 'outline' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Criar Nova Categoria</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nome da Categoria</Label>
              <Input
                id="categoryName"
                placeholder="Ex: Categoria A, Sub-18, etc."
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numTeams">Número de Duplas</Label>
              <select
                id="numTeams"
                value={numTeams}
                onChange={(e) => setNumTeams(Number(e.target.value) as 8 | 9 | 12 | 14 | 16 | 18 | 20 | 24 | 25)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              >
                <option value={8}>8 duplas (14 jogos)</option>
                <option value={9}>9 duplas (16 jogos)</option>
                <option value={12}>12 duplas (22 jogos)</option>
                <option value={14}>14 duplas (26 jogos)</option>
                <option value={16}>16 duplas (30 jogos)</option>
                <option value={18}>18 duplas (34 jogos)</option>
                <option value={20}>20 duplas (38 jogos)</option>
                <option value={24}>24 duplas (46 jogos)</option>
                <option value={25}>25 duplas (48 jogos)</option>
              </select>
            </div>
            <Button type="submit" disabled={loading} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              {loading ? 'Criando...' : 'Criar Categoria'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {categories.length > 0 && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Categorias Existentes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {editingId === category.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSaveEdit(category.id)}
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium text-sm sm:text-base break-words flex-1">{category.name}</span>
                        {getStatusBadge(category.status)}
                      </>
                    )}
                  </div>
                  
                  {editingId !== category.id && (
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartEdit(category)}
                        title="Editar nome"
                        className="flex-shrink-0"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {category.status === 'draft' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStartCategory(category.id)}
                          className="gap-2 flex-shrink-0"
                        >
                          <Play className="w-3 h-3" />
                          <span className="hidden sm:inline">Iniciar</span>
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteCategory(category.id)}
                        title="Excluir categoria"
                        className="flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CategoryManager;
