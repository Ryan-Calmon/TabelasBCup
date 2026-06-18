import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Play, PenSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface Tournament {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

interface TournamentListProps {
  tournaments: Tournament[];
  onUpdate: () => void;
}

const TournamentList = ({ tournaments, onUpdate }: TournamentListProps) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [newName, setNewName] = useState('');

  const statusColors = {
    draft: 'bg-muted',
    active: 'bg-primary',
    completed: 'bg-accent',
  };

  const statusLabels = {
    draft: 'Rascunho',
    active: 'Ativo',
    completed: 'Concluído',
  };

  const handleStartTournament = async (tournament: Tournament) => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ status: 'active' })
        .eq('id', tournament.id);

      if (error) throw error;

      toast.success('Torneio iniciado com sucesso!');
      onUpdate();
    } catch (error: any) {
      toast.error('Erro ao iniciar torneio: ' + error.message);
    }
  };

  const handleOpenRename = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setNewName(tournament.name);
    setRenameDialogOpen(true);
  };

  const handleRename = async () => {
    if (!selectedTournament || !newName.trim()) return;

    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ name: newName.trim() })
        .eq('id', selectedTournament.id);

      if (error) throw error;

      toast.success('Torneio renomeado com sucesso!');
      setRenameDialogOpen(false);
      onUpdate();
    } catch (error: any) {
      toast.error('Erro ao renomear torneio: ' + error.message);
    }
  };

  const handleOpenDelete = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTournament) return;

    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', selectedTournament.id);

      if (error) throw error;

      toast.success('Torneio excluído com sucesso!');
      setDeleteDialogOpen(false);
      onUpdate();
    } catch (error: any) {
      toast.error('Erro ao excluir torneio: ' + error.message);
    }
  };

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum torneio criado ainda. Crie seu primeiro torneio!
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {tournaments.map((tournament) => (
          <div
            key={tournament.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors bg-card"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{tournament.name}</h3>
              <p className="text-sm text-muted-foreground">
                Criado em {new Date(tournament.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={statusColors[tournament.status as keyof typeof statusColors]}>
                {statusLabels[tournament.status as keyof typeof statusLabels]}
              </Badge>
              <div className="flex gap-2">
                {tournament.status === 'draft' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleStartTournament(tournament)}
                    className="gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Iniciar
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleOpenRename(tournament)}
                  title="Renomear"
                >
                  <PenSquare className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate(`/admin/tournament/${tournament.id}`)}
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate(`/tournament/${tournament.id}`)}
                  title="Visualizar"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleOpenDelete(tournament)}
                  className="text-destructive hover:text-destructive"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Torneio</DialogTitle>
            <DialogDescription>
              Digite o novo nome para o torneio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Torneio</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Digite o novo nome"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o torneio "
              {selectedTournament?.name}" e todos os seus dados incluindo categorias, times e
              partidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TournamentList;
