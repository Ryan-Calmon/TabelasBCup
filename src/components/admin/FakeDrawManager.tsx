import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Shuffle, Trash2 } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import BracketView from '@/components/bracket/BracketView';

type Category = Database['public']['Tables']['categories']['Row'];

export interface FakeCategory {
  id: string;
  name: string;
  numTeams: number;
  teams: string[];
  phase: 'teams' | 'revealing' | 'revealed';
  matchedCategoryId: string | null;
}

interface FakeDrawManagerProps {
  fakeCategory: FakeCategory;
  realCategories: Category[];
  onUpdate: (id: string, patch: Partial<FakeCategory>) => void;
  onDelete: (id: string) => void;
}

const REVEAL_DELAY_MS = 2200;

const FakeDrawManager = ({ fakeCategory, realCategories, onUpdate, onDelete }: FakeDrawManagerProps) => {
  const [newTeamName, setNewTeamName] = useState('');
  const [bulkTeamNames, setBulkTeamNames] = useState('');
  const [shuffleDisplay, setShuffleDisplay] = useState<string[]>(fakeCategory.teams);

  const { id, name, numTeams, teams, phase, matchedCategoryId } = fakeCategory;
  const matchedCategory = matchedCategoryId ? realCategories.find((c) => c.id === matchedCategoryId) : null;

  useEffect(() => {
    if (phase !== 'revealing') return;

    setShuffleDisplay([...teams]);
    const interval = setInterval(() => {
      setShuffleDisplay((prev) => {
        const arr = [...prev];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      });
    }, 110);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      toast.error('Informe o nome da dupla');
      return;
    }
    if (teams.length >= numTeams) {
      toast.error(`Máximo de ${numTeams} duplas`);
      return;
    }
    onUpdate(id, { teams: [...teams, newTeamName.trim()] });
    setNewTeamName('');
  };

  const handleBulkAddTeams = () => {
    const names = bulkTeamNames
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);

    if (names.length === 0) {
      toast.error('Digite ao menos um nome');
      return;
    }

    const remaining = numTeams - teams.length;
    const toAdd = names.slice(0, remaining);

    if (names.length > remaining) {
      toast.error(`Só cabem mais ${remaining} dupla(s). Adicionadas ${toAdd.length}.`);
    } else {
      toast.success(`${toAdd.length} dupla(s) adicionada(s)!`);
    }

    onUpdate(id, { teams: [...teams, ...toAdd] });
    setBulkTeamNames('');
  };

  const handleRemoveTeam = (index: number) => {
    onUpdate(id, { teams: teams.filter((_, i) => i !== index) });
  };

  const runDraw = () => {
    onUpdate(id, { phase: 'revealing' });
    setTimeout(() => {
      const match = realCategories.find(
        (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase()
      );

      if (!match) {
        toast.error(`Nenhuma categoria real encontrada com o nome "${name}"`);
        onUpdate(id, { phase: 'teams' });
        return;
      }

      onUpdate(id, { phase: 'revealed', matchedCategoryId: match.id });
    }, REVEAL_DELAY_MS);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-tight">{name}</h2>
          <p className="font-mono-tab text-[10px] uppercase tracking-[0.3em] text-ink/50">
            {numTeams} duplas
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(id)}
          className="gap-2 rounded-none border-ink/20 hover:bg-destructive hover:text-destructive-foreground font-mono-tab text-[11px] uppercase tracking-[0.2em]"
        >
          <Trash2 className="w-3.5 h-3.5" />
          excluir
        </Button>
      </div>

      {phase === 'teams' && (
        <>
          <Card className="rounded-none border-ink/15 shadow-brutal-sm">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg">Adicionar Dupla</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <form onSubmit={handleAddTeam} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="newTeamName">Nome da Dupla</Label>
                  <Input
                    id="newTeamName"
                    placeholder="Ex: João e Pedro"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>
                <Button type="submit" className="gap-2 sm:self-end">
                  <Plus className="w-4 h-4" />
                  Adicionar
                </Button>
              </form>

              <div className="space-y-2">
                <Label htmlFor="bulkTeamNames">Adicionar Múltiplas Duplas (uma por linha)</Label>
                <Textarea
                  id="bulkTeamNames"
                  placeholder={'João e Pedro\nMaria e Ana\n...'}
                  value={bulkTeamNames}
                  onChange={(e) => setBulkTeamNames(e.target.value)}
                  rows={4}
                />
                <Button onClick={handleBulkAddTeams} variant="secondary" className="gap-2 w-full sm:w-auto">
                  <Plus className="w-4 h-4" />
                  Adicionar Múltiplas Duplas
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                {teams.length}/{numTeams} duplas cadastradas
              </div>

              {teams.length > 0 && (
                <ul className="space-y-1">
                  {teams.map((teamName, index) => (
                    <li
                      key={`${teamName}-${index}`}
                      className="flex items-center justify-between gap-2 border border-ink/10 px-3 py-2 text-sm"
                    >
                      <span>{index + 1}. {teamName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTeam(index)}
                        className="text-ink/40 hover:text-destructive"
                        aria-label="Remover dupla"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {teams.length === numTeams && (
            <Button onClick={runDraw} className="w-full gap-2">
              <Shuffle className="w-4 h-4" />
              Sortear
            </Button>
          )}
        </>
      )}

      {phase === 'revealing' && (
        <Card className="rounded-none border-ink/15 shadow-brutal-sm">
          <CardContent className="py-12 text-center space-y-6">
            <p className="font-mono-tab text-xs uppercase tracking-[0.3em] text-ink/60 animate-flicker">
              sorteando…
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-2xl mx-auto">
              {shuffleDisplay.map((teamName, index) => (
                <div
                  key={`${teamName}-${index}`}
                  className="border border-ink/15 px-2 py-1.5 text-xs truncate"
                >
                  {teamName}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {phase === 'revealed' && matchedCategory && (
        <div className="space-y-4">
          <BracketView categoryId={matchedCategory.id} />
        </div>
      )}
    </div>
  );
};

export default FakeDrawManager;
