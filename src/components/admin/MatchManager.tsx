import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Shuffle, CheckCircle2, RotateCcw, Pencil, Check, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Database } from '@/integrations/supabase/types';
import { Textarea } from '@/components/ui/textarea';

type Team = Database['public']['Tables']['teams']['Row'];
type Match = Database['public']['Tables']['matches']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface MatchManagerProps {
  categoryId: string;
}

const MatchManager = ({ categoryId }: MatchManagerProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [bulkTeamNames, setBulkTeamNames] = useState('');
  const [loading, setLoading] = useState(false);
  const [shuffleTeams, setShuffleTeams] = useState(true);
  const [resetMatchId, setResetMatchId] = useState<string | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');

  useEffect(() => {
    loadData();
  }, [categoryId]);

  const loadData = async () => {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .eq('category_id', categoryId)
      .order('seed_position');

    const { data: matchesData } = await supabase
      .from('matches')
      .select('*')
      .eq('category_id', categoryId)
      .order('match_number');

    setCategory(categoryData);
    setTeams(teamsData || []);
    setMatches(matchesData || []);
  };

  // Helper function to get match dependencies based on progression rules
  const getDependenciesMap = (numTeams: number): Record<number, {match1?: number, match2?: number, takesWinnerMatch1?: boolean, takesWinnerMatch2?: boolean}> => {
    const dependenciesMap: Record<number, {match1?: number, match2?: number, takesWinnerMatch1?: boolean, takesWinnerMatch2?: boolean}> = {};
    
    // Define progression rules inline with takesWinner information
    let rules: Array<{sourceMatch: number, targetMatch: number, takesWinner: boolean, position: 'team1' | 'team2'}> = [];
    
    if (numTeams === 8) {
      rules = [
        // Jogo 5: Perdedor do jogo 3 x Perdedor do jogo 4
        {sourceMatch: 3, targetMatch: 5, takesWinner: false, position: 'team1'},
        {sourceMatch: 4, targetMatch: 5, takesWinner: false, position: 'team2'},
        // Jogo 6: Perdedor do jogo 1 x Perdedor do jogo 2
        {sourceMatch: 1, targetMatch: 6, takesWinner: false, position: 'team1'},
        {sourceMatch: 2, targetMatch: 6, takesWinner: false, position: 'team2'},
        // Jogo 7: Vencedor do Jogo 1 x vencedor do jogo 2
        {sourceMatch: 1, targetMatch: 7, takesWinner: true, position: 'team1'},
        {sourceMatch: 2, targetMatch: 7, takesWinner: true, position: 'team2'},
        // Jogo 8: Vencedor do jogo 3 x Vencedor do jogo 4
        {sourceMatch: 3, targetMatch: 8, takesWinner: true, position: 'team1'},
        {sourceMatch: 4, targetMatch: 8, takesWinner: true, position: 'team2'},
        // Jogo 9: Vencedor do jogo 5 x Perdedor do jogo 8
        {sourceMatch: 5, targetMatch: 9, takesWinner: true, position: 'team1'},
        {sourceMatch: 8, targetMatch: 9, takesWinner: false, position: 'team2'},
        // Jogo 10: perdedor do jogo 7 x vencedor do jogo 6
        {sourceMatch: 7, targetMatch: 10, takesWinner: false, position: 'team1'},
        {sourceMatch: 6, targetMatch: 10, takesWinner: true, position: 'team2'},
        // Jogo 11: Vencedor do jogo 9 x Vencedor do jogo 7
        {sourceMatch: 9, targetMatch: 11, takesWinner: true, position: 'team1'},
        {sourceMatch: 7, targetMatch: 11, takesWinner: true, position: 'team2'},
        // Jogo 12: Vencedor do jogo 8 x Vencedor do jogo 10
        {sourceMatch: 8, targetMatch: 12, takesWinner: true, position: 'team1'},
        {sourceMatch: 10, targetMatch: 12, takesWinner: true, position: 'team2'},
        // Jogo 13: Perdedor do jogo 12 x Perdedor do jogo 11
        {sourceMatch: 12, targetMatch: 13, takesWinner: false, position: 'team1'},
        {sourceMatch: 11, targetMatch: 13, takesWinner: false, position: 'team2'},
        // Jogo 14: Vencedor do jogo 11 x Vencedor do jogo 12
        {sourceMatch: 11, targetMatch: 14, takesWinner: true, position: 'team1'},
        {sourceMatch: 12, targetMatch: 14, takesWinner: true, position: 'team2'},
      ];
    } else if (numTeams === 9) {
      rules = [
        // Jogo 5: Vencedor do jogo 1 x Dupla 9
        {sourceMatch: 1, targetMatch: 5, takesWinner: true, position: 'team1'},
        // Jogo 6: Perdedor do jogo 1 x Perdedor do jogo 4
        {sourceMatch: 1, targetMatch: 6, takesWinner: false, position: 'team1'},
        {sourceMatch: 4, targetMatch: 6, takesWinner: false, position: 'team2'},
        // Jogo 7: Perdedor do jogo 2 x Perdedor do jogo 3
        {sourceMatch: 2, targetMatch: 7, takesWinner: false, position: 'team1'},
        {sourceMatch: 3, targetMatch: 7, takesWinner: false, position: 'team2'},
        // Jogo 8: Vencedor do jogo 5 x Vencedor do jogo 2
        {sourceMatch: 5, targetMatch: 8, takesWinner: true, position: 'team1'},
        {sourceMatch: 2, targetMatch: 8, takesWinner: true, position: 'team2'},
        // Jogo 9: Vencedor do jogo 3 x Vencedor do jogo 4
        {sourceMatch: 3, targetMatch: 9, takesWinner: true, position: 'team1'},
        {sourceMatch: 4, targetMatch: 9, takesWinner: true, position: 'team2'},
        // Jogo 10: Vencedor do jogo 7 x Perdedor do jogo 5
        {sourceMatch: 7, targetMatch: 10, takesWinner: true, position: 'team1'},
        {sourceMatch: 5, targetMatch: 10, takesWinner: false, position: 'team2'},
        // Jogo 11: Perdedor do jogo 8 x Vencedor do jogo 6
        {sourceMatch: 8, targetMatch: 11, takesWinner: false, position: 'team1'},
        {sourceMatch: 6, targetMatch: 11, takesWinner: true, position: 'team2'},
        // Jogo 12: Vencedor do jogo 10 x Perdedor do jogo 9
        {sourceMatch: 10, targetMatch: 12, takesWinner: true, position: 'team1'},
        {sourceMatch: 9, targetMatch: 12, takesWinner: false, position: 'team2'},
        // Jogo 13 (Semi 1): Vencedor do jogo 8 x Vencedor do jogo 12
        {sourceMatch: 8, targetMatch: 13, takesWinner: true, position: 'team1'},
        {sourceMatch: 12, targetMatch: 13, takesWinner: true, position: 'team2'},
        // Jogo 14 (Semi 2): Vencedor do jogo 9 x Vencedor do jogo 11
        {sourceMatch: 9, targetMatch: 14, takesWinner: true, position: 'team1'},
        {sourceMatch: 11, targetMatch: 14, takesWinner: true, position: 'team2'},
        // Jogo 15 (Terceiro): Perdedor do jogo 13 x Perdedor do jogo 14
        {sourceMatch: 13, targetMatch: 15, takesWinner: false, position: 'team1'},
        {sourceMatch: 14, targetMatch: 15, takesWinner: false, position: 'team2'},
        // Jogo 16 (Final): Vencedor do jogo 13 x Vencedor do jogo 14
        {sourceMatch: 13, targetMatch: 16, takesWinner: true, position: 'team1'},
        {sourceMatch: 14, targetMatch: 16, takesWinner: true, position: 'team2'},
      ];
    } else if (numTeams === 14) {
      rules = [
        // Jogo 7: vencedor do jogo 1 x dupla 13
        {sourceMatch: 1, targetMatch: 7, takesWinner: true, position: 'team1'},
        // Jogo 8: vencedor do jogo 2 x vencedor do jogo 3
        {sourceMatch: 2, targetMatch: 8, takesWinner: true, position: 'team1'},
        {sourceMatch: 3, targetMatch: 8, takesWinner: true, position: 'team2'},
        // Jogo 9: vencedor do jogo 4 x vencedor do jogo 5
        {sourceMatch: 4, targetMatch: 9, takesWinner: true, position: 'team1'},
        {sourceMatch: 5, targetMatch: 9, takesWinner: true, position: 'team2'},
        // Jogo 10: vencedor do jogo 6 x dupla 14
        {sourceMatch: 6, targetMatch: 10, takesWinner: true, position: 'team1'},
        // Jogo 11: perdedor do jogo 4 x perdedor do jogo 5
        {sourceMatch: 4, targetMatch: 11, takesWinner: false, position: 'team1'},
        {sourceMatch: 5, targetMatch: 11, takesWinner: false, position: 'team2'},
        // Jogo 12: perdedor do jogo 2 x perdedor do jogo 3
        {sourceMatch: 2, targetMatch: 12, takesWinner: false, position: 'team1'},
        {sourceMatch: 3, targetMatch: 12, takesWinner: false, position: 'team2'},
        // Jogo 13: perdedor do jogo 6 x perdedor do jogo 7
        {sourceMatch: 6, targetMatch: 13, takesWinner: false, position: 'team1'},
        {sourceMatch: 7, targetMatch: 13, takesWinner: false, position: 'team2'},
        // Jogo 14: vencedor do jogo 11 x perdedor do jogo 8
        {sourceMatch: 11, targetMatch: 14, takesWinner: true, position: 'team1'},
        {sourceMatch: 8, targetMatch: 14, takesWinner: false, position: 'team2'},
        // Jogo 15: vencedor do jogo 12 x perdedor do jogo 9
        {sourceMatch: 12, targetMatch: 15, takesWinner: true, position: 'team1'},
        {sourceMatch: 9, targetMatch: 15, takesWinner: false, position: 'team2'},
        // Jogo 16: perdedor do jogo 1 x perdedor do jogo 10
        {sourceMatch: 1, targetMatch: 16, takesWinner: false, position: 'team1'},
        {sourceMatch: 10, targetMatch: 16, takesWinner: false, position: 'team2'},
        // Jogo 17: vencedor do jogo 7 x vencedor do jogo 8
        {sourceMatch: 7, targetMatch: 17, takesWinner: true, position: 'team1'},
        {sourceMatch: 8, targetMatch: 17, takesWinner: true, position: 'team2'},
        // Jogo 18: vencedor do jogo 9 x vencedor do jogo 10
        {sourceMatch: 9, targetMatch: 18, takesWinner: true, position: 'team1'},
        {sourceMatch: 10, targetMatch: 18, takesWinner: true, position: 'team2'},
        // Jogo 19: vencedor do jogo 13 x vencedor do jogo 14
        {sourceMatch: 13, targetMatch: 19, takesWinner: true, position: 'team1'},
        {sourceMatch: 14, targetMatch: 19, takesWinner: true, position: 'team2'},
        // Jogo 20: vencedor do jogo 15 x vencedor do jogo 16
        {sourceMatch: 15, targetMatch: 20, takesWinner: true, position: 'team1'},
        {sourceMatch: 16, targetMatch: 20, takesWinner: true, position: 'team2'},
        // Jogo 21: perdedor do jogo 18 x vencedor do jogo 19
        {sourceMatch: 18, targetMatch: 21, takesWinner: false, position: 'team1'},
        {sourceMatch: 19, targetMatch: 21, takesWinner: true, position: 'team2'},
        // Jogo 22: perdedor do jogo 17 x vencedor do jogo 20
        {sourceMatch: 17, targetMatch: 22, takesWinner: false, position: 'team1'},
        {sourceMatch: 20, targetMatch: 22, takesWinner: true, position: 'team2'},
        // Jogo 23 (Semi Final): vencedor do jogo 17 x vencedor do jogo 21
        {sourceMatch: 17, targetMatch: 23, takesWinner: true, position: 'team1'},
        {sourceMatch: 21, targetMatch: 23, takesWinner: true, position: 'team2'},
        // Jogo 24 (Semi Final): vencedor do jogo 18 x vencedor do jogo 22
        {sourceMatch: 18, targetMatch: 24, takesWinner: true, position: 'team1'},
        {sourceMatch: 22, targetMatch: 24, takesWinner: true, position: 'team2'},
        // Jogo 25 (Terceiro Lugar): perdedor do jogo 23 x perdedor do jogo 24
        {sourceMatch: 23, targetMatch: 25, takesWinner: false, position: 'team1'},
        {sourceMatch: 24, targetMatch: 25, takesWinner: false, position: 'team2'},
        // Jogo 26 (Final): vencedor do jogo 23 x vencedor do jogo 24
        {sourceMatch: 23, targetMatch: 26, takesWinner: true, position: 'team1'},
        {sourceMatch: 24, targetMatch: 26, takesWinner: true, position: 'team2'},
      ];
    } else if (numTeams === 18) {
      rules = [
        // Jogo 9: Vencedor do jogo 1 x Dupla 17
        {sourceMatch: 1, targetMatch: 9, takesWinner: true, position: 'team1'},
        // Jogo 10: Vencedor do jogo 2 x Dupla 18
        {sourceMatch: 2, targetMatch: 10, takesWinner: true, position: 'team1'},
        // Jogo 11: Perdedor do jogo 2 x Perdedor do jogo 9
        {sourceMatch: 2, targetMatch: 11, takesWinner: false, position: 'team1'},
        {sourceMatch: 9, targetMatch: 11, takesWinner: false, position: 'team2'},
        // Jogo 12: Perdedor do jogo 10 x Perdedor do jogo 1
        {sourceMatch: 10, targetMatch: 12, takesWinner: false, position: 'team1'},
        {sourceMatch: 1, targetMatch: 12, takesWinner: false, position: 'team2'},
        // Jogo 13: Vencedor do jogo 9 x Vencedor do jogo 3
        {sourceMatch: 9, targetMatch: 13, takesWinner: true, position: 'team1'},
        {sourceMatch: 3, targetMatch: 13, takesWinner: true, position: 'team2'},
        // Jogo 14: Vencedor do jogo 4 x Vencedor do jogo 5
        {sourceMatch: 4, targetMatch: 14, takesWinner: true, position: 'team1'},
        {sourceMatch: 5, targetMatch: 14, takesWinner: true, position: 'team2'},
        // Jogo 15: Vencedor do jogo 6 x Vencedor do jogo 7
        {sourceMatch: 6, targetMatch: 15, takesWinner: true, position: 'team1'},
        {sourceMatch: 7, targetMatch: 15, takesWinner: true, position: 'team2'},
        // Jogo 16: Vencedor do jogo 8 x Vencedor do jogo 10
        {sourceMatch: 8, targetMatch: 16, takesWinner: true, position: 'team1'},
        {sourceMatch: 10, targetMatch: 16, takesWinner: true, position: 'team2'},
        // Jogo 17: Vencedor do jogo 12 x Perdedor do jogo 8
        {sourceMatch: 12, targetMatch: 17, takesWinner: true, position: 'team1'},
        {sourceMatch: 8, targetMatch: 17, takesWinner: false, position: 'team2'},
        // Jogo 18: Perdedor do jogo 7 x Perdedor do jogo 6
        {sourceMatch: 7, targetMatch: 18, takesWinner: false, position: 'team1'},
        {sourceMatch: 6, targetMatch: 18, takesWinner: false, position: 'team2'},
        // Jogo 19: Perdedor do jogo 5 x Perdedor do jogo 4
        {sourceMatch: 5, targetMatch: 19, takesWinner: false, position: 'team1'},
        {sourceMatch: 4, targetMatch: 19, takesWinner: false, position: 'team2'},
        // Jogo 20: Perdedor do jogo 3 x Vencedor do jogo 11
        {sourceMatch: 3, targetMatch: 20, takesWinner: false, position: 'team1'},
        {sourceMatch: 11, targetMatch: 20, takesWinner: true, position: 'team2'},
        // Jogo 21: Vencedor do jogo 17 x Perdedor do jogo 13
        {sourceMatch: 17, targetMatch: 21, takesWinner: true, position: 'team1'},
        {sourceMatch: 13, targetMatch: 21, takesWinner: false, position: 'team2'},
        // Jogo 22: Vencedor do jogo 18 x Perdedor do jogo 14
        {sourceMatch: 18, targetMatch: 22, takesWinner: true, position: 'team1'},
        {sourceMatch: 14, targetMatch: 22, takesWinner: false, position: 'team2'},
        // Jogo 23: Vencedor do jogo 19 x Perdedor do jogo 15
        {sourceMatch: 19, targetMatch: 23, takesWinner: true, position: 'team1'},
        {sourceMatch: 15, targetMatch: 23, takesWinner: false, position: 'team2'},
        // Jogo 24: Vencedor do jogo 20 x Perdedor do jogo 16
        {sourceMatch: 20, targetMatch: 24, takesWinner: true, position: 'team1'},
        {sourceMatch: 16, targetMatch: 24, takesWinner: false, position: 'team2'},
        // Jogo 25: Vencedor do jogo 13 x Vencedor do jogo 14
        {sourceMatch: 13, targetMatch: 25, takesWinner: true, position: 'team1'},
        {sourceMatch: 14, targetMatch: 25, takesWinner: true, position: 'team2'},
        // Jogo 26: Vencedor do jogo 15 x Vencedor do jogo 16
        {sourceMatch: 15, targetMatch: 26, takesWinner: true, position: 'team1'},
        {sourceMatch: 16, targetMatch: 26, takesWinner: true, position: 'team2'},
        // Jogo 27: Vencedor do jogo 21 x Vencedor do jogo 22
        {sourceMatch: 21, targetMatch: 27, takesWinner: true, position: 'team1'},
        {sourceMatch: 22, targetMatch: 27, takesWinner: true, position: 'team2'},
        // Jogo 28: Vencedor do jogo 23 x Vencedor do jogo 24
        {sourceMatch: 23, targetMatch: 28, takesWinner: true, position: 'team1'},
        {sourceMatch: 24, targetMatch: 28, takesWinner: true, position: 'team2'},
        // Jogo 29: Perdedor do jogo 26 x Vencedor do jogo 27
        {sourceMatch: 26, targetMatch: 29, takesWinner: false, position: 'team1'},
        {sourceMatch: 27, targetMatch: 29, takesWinner: true, position: 'team2'},
        // Jogo 30: Perdedor do jogo 25 x Vencedor do jogo 28
        {sourceMatch: 25, targetMatch: 30, takesWinner: false, position: 'team1'},
        {sourceMatch: 28, targetMatch: 30, takesWinner: true, position: 'team2'},
        // Jogo 31 (Semi Final): Vencedor do jogo 25 x Vencedor do jogo 29
        {sourceMatch: 25, targetMatch: 31, takesWinner: true, position: 'team1'},
        {sourceMatch: 29, targetMatch: 31, takesWinner: true, position: 'team2'},
        // Jogo 32 (Semi Final): Vencedor do jogo 26 x Vencedor do jogo 30
        {sourceMatch: 26, targetMatch: 32, takesWinner: true, position: 'team1'},
        {sourceMatch: 30, targetMatch: 32, takesWinner: true, position: 'team2'},
        // Jogo 33 (3o Lugar): Perdedor do jogo 31 x Perdedor do jogo 32
        {sourceMatch: 31, targetMatch: 33, takesWinner: false, position: 'team1'},
        {sourceMatch: 32, targetMatch: 33, takesWinner: false, position: 'team2'},
        // Jogo 34 (Final): Vencedor do jogo 31 x Vencedor do jogo 32
        {sourceMatch: 31, targetMatch: 34, takesWinner: true, position: 'team1'},
        {sourceMatch: 32, targetMatch: 34, takesWinner: true, position: 'team2'},
      ];
    } else if (numTeams === 12) {
      rules = [
        // Jogo 5: Vencedor do jogo 1 x Dupla 9
        {sourceMatch: 1, targetMatch: 5, takesWinner: true, position: 'team1'},
        // Jogo 6: Vencedor do jogo 2 x Dupla 10
        {sourceMatch: 2, targetMatch: 6, takesWinner: true, position: 'team1'},
        // Jogo 7: Vencedor do jogo 3 x Dupla 11
        {sourceMatch: 3, targetMatch: 7, takesWinner: true, position: 'team1'},
        // Jogo 8: Vencedor do jogo 4 x Dupla 12
        {sourceMatch: 4, targetMatch: 8, takesWinner: true, position: 'team1'},
        // Jogo 9: Perdedor do jogo 1 x Perdedor do jogo 5
        {sourceMatch: 1, targetMatch: 9, takesWinner: false, position: 'team1'},
        {sourceMatch: 5, targetMatch: 9, takesWinner: false, position: 'team2'},
        // Jogo 10: Perdedor do jogo 2 x Perdedor do jogo 6
        {sourceMatch: 2, targetMatch: 10, takesWinner: false, position: 'team1'},
        {sourceMatch: 6, targetMatch: 10, takesWinner: false, position: 'team2'},
        // Jogo 11: Perdedor do jogo 4 x Perdedor do jogo 7
        {sourceMatch: 4, targetMatch: 11, takesWinner: false, position: 'team1'},
        {sourceMatch: 7, targetMatch: 11, takesWinner: false, position: 'team2'},
        // Jogo 12: Perdedor do jogo 3 x Perdedor do jogo 8
        {sourceMatch: 3, targetMatch: 12, takesWinner: false, position: 'team1'},
        {sourceMatch: 8, targetMatch: 12, takesWinner: false, position: 'team2'},
        // Jogo 13: Vencedor do jogo 9 x Vencedor do jogo 10
        {sourceMatch: 9, targetMatch: 13, takesWinner: true, position: 'team1'},
        {sourceMatch: 10, targetMatch: 13, takesWinner: true, position: 'team2'},
        // Jogo 14: Vencedor do jogo 11 x Vencedor do jogo 12
        {sourceMatch: 11, targetMatch: 14, takesWinner: true, position: 'team1'},
        {sourceMatch: 12, targetMatch: 14, takesWinner: true, position: 'team2'},
        // Jogo 15: Vencedor do jogo 7 x Vencedor do jogo 8
        {sourceMatch: 7, targetMatch: 15, takesWinner: true, position: 'team1'},
        {sourceMatch: 8, targetMatch: 15, takesWinner: true, position: 'team2'},
        // Jogo 16: Vencedor do jogo 5 x Vencedor do jogo 6
        {sourceMatch: 5, targetMatch: 16, takesWinner: true, position: 'team1'},
        {sourceMatch: 6, targetMatch: 16, takesWinner: true, position: 'team2'},
        // Jogo 17: Perdedor do jogo 15 x Vencedor do jogo 14
        {sourceMatch: 15, targetMatch: 17, takesWinner: false, position: 'team1'},
        {sourceMatch: 14, targetMatch: 17, takesWinner: true, position: 'team2'},
        // Jogo 18: Perdedor do jogo 16 x Vencedor do jogo 13
        {sourceMatch: 16, targetMatch: 18, takesWinner: false, position: 'team1'},
        {sourceMatch: 13, targetMatch: 18, takesWinner: true, position: 'team2'},
        // Jogo 19: Vencedor do jogo 16 x Vencedor do jogo 17
        {sourceMatch: 16, targetMatch: 19, takesWinner: true, position: 'team1'},
        {sourceMatch: 17, targetMatch: 19, takesWinner: true, position: 'team2'},
        // Jogo 20: Vencedor do jogo 18 x Vencedor do jogo 15
        {sourceMatch: 18, targetMatch: 20, takesWinner: true, position: 'team1'},
        {sourceMatch: 15, targetMatch: 20, takesWinner: true, position: 'team2'},
        // Jogo 21: Perdedor do jogo 19 x Perdedor do jogo 20
        {sourceMatch: 19, targetMatch: 21, takesWinner: false, position: 'team1'},
        {sourceMatch: 20, targetMatch: 21, takesWinner: false, position: 'team2'},
        // Jogo 22: Vencedor do jogo 19 x Vencedor do jogo 20
        {sourceMatch: 19, targetMatch: 22, takesWinner: true, position: 'team1'},
        {sourceMatch: 20, targetMatch: 22, takesWinner: true, position: 'team2'},
      ];
    } else if (numTeams === 16) {
      rules = [
        // Jogos 9-12: Vencedores dos jogos 1-8
        {sourceMatch: 1, targetMatch: 9, takesWinner: true, position: 'team1'},
        {sourceMatch: 2, targetMatch: 9, takesWinner: true, position: 'team2'},
        {sourceMatch: 3, targetMatch: 10, takesWinner: true, position: 'team1'},
        {sourceMatch: 4, targetMatch: 10, takesWinner: true, position: 'team2'},
        {sourceMatch: 5, targetMatch: 11, takesWinner: true, position: 'team1'},
        {sourceMatch: 6, targetMatch: 11, takesWinner: true, position: 'team2'},
        {sourceMatch: 7, targetMatch: 12, takesWinner: true, position: 'team1'},
        {sourceMatch: 8, targetMatch: 12, takesWinner: true, position: 'team2'},
        // Jogos 13-16: Perdedores dos jogos 1-8 (invertido)
        {sourceMatch: 8, targetMatch: 13, takesWinner: false, position: 'team1'},
        {sourceMatch: 7, targetMatch: 13, takesWinner: false, position: 'team2'},
        {sourceMatch: 6, targetMatch: 14, takesWinner: false, position: 'team1'},
        {sourceMatch: 5, targetMatch: 14, takesWinner: false, position: 'team2'},
        {sourceMatch: 4, targetMatch: 15, takesWinner: false, position: 'team1'},
        {sourceMatch: 3, targetMatch: 15, takesWinner: false, position: 'team2'},
        {sourceMatch: 2, targetMatch: 16, takesWinner: false, position: 'team1'},
        {sourceMatch: 1, targetMatch: 16, takesWinner: false, position: 'team2'},
        // Jogos 17-20: Vencedores de 13-16 x Perdedores de 9-12
        {sourceMatch: 13, targetMatch: 17, takesWinner: true, position: 'team1'},
        {sourceMatch: 9, targetMatch: 17, takesWinner: false, position: 'team2'},
        {sourceMatch: 14, targetMatch: 18, takesWinner: true, position: 'team1'},
        {sourceMatch: 10, targetMatch: 18, takesWinner: false, position: 'team2'},
        {sourceMatch: 15, targetMatch: 19, takesWinner: true, position: 'team1'},
        {sourceMatch: 11, targetMatch: 19, takesWinner: false, position: 'team2'},
        {sourceMatch: 16, targetMatch: 20, takesWinner: true, position: 'team1'},
        {sourceMatch: 12, targetMatch: 20, takesWinner: false, position: 'team2'},
        // Jogos 21-22: Valendo vaga para Semi-Final - Vencedores
        {sourceMatch: 9, targetMatch: 21, takesWinner: true, position: 'team1'},
        {sourceMatch: 10, targetMatch: 21, takesWinner: true, position: 'team2'},
        {sourceMatch: 11, targetMatch: 22, takesWinner: true, position: 'team1'},
        {sourceMatch: 12, targetMatch: 22, takesWinner: true, position: 'team2'},
        // Jogos 23-24: Losers bracket intermediário
        {sourceMatch: 17, targetMatch: 23, takesWinner: true, position: 'team1'},
        {sourceMatch: 18, targetMatch: 23, takesWinner: true, position: 'team2'},
        {sourceMatch: 19, targetMatch: 24, takesWinner: true, position: 'team1'},
        {sourceMatch: 20, targetMatch: 24, takesWinner: true, position: 'team2'},
        // Jogos 25-26: Valendo vaga para Semi-Final - Perdedores
        {sourceMatch: 23, targetMatch: 25, takesWinner: true, position: 'team1'},
        {sourceMatch: 22, targetMatch: 25, takesWinner: false, position: 'team2'},
        {sourceMatch: 24, targetMatch: 26, takesWinner: true, position: 'team1'},
        {sourceMatch: 21, targetMatch: 26, takesWinner: false, position: 'team2'},
        // Jogos 27-28: Semifinais
        {sourceMatch: 21, targetMatch: 27, takesWinner: true, position: 'team1'},
        {sourceMatch: 25, targetMatch: 27, takesWinner: true, position: 'team2'},
        {sourceMatch: 22, targetMatch: 28, takesWinner: true, position: 'team1'},
        {sourceMatch: 26, targetMatch: 28, takesWinner: true, position: 'team2'},
        // Jogo 29: Terceiro Lugar
        {sourceMatch: 27, targetMatch: 29, takesWinner: false, position: 'team1'},
        {sourceMatch: 28, targetMatch: 29, takesWinner: false, position: 'team2'},
        // Jogo 30: Final
        {sourceMatch: 27, targetMatch: 30, takesWinner: true, position: 'team1'},
        {sourceMatch: 28, targetMatch: 30, takesWinner: true, position: 'team2'},
      ];
    } else if (numTeams === 20) {
      rules = [
        // Jogo 5: Vencedor do jogo 1 x Dupla 9
        {sourceMatch: 1, targetMatch: 5, takesWinner: true, position: 'team1'},
        // Jogo 8: Vencedor do jogo 2 x Dupla 14
        {sourceMatch: 2, targetMatch: 8, takesWinner: true, position: 'team1'},
        // Jogo 9: Vencedor do jogo 3 x Dupla 15
        {sourceMatch: 3, targetMatch: 9, takesWinner: true, position: 'team1'},
        // Jogo 12: Vencedor do jogo 4 x Dupla 20
        {sourceMatch: 4, targetMatch: 12, takesWinner: true, position: 'team1'},
        
        // Jogo 13: Perdedor do jogo 4 x Perdedor do jogo 5
        {sourceMatch: 4, targetMatch: 13, takesWinner: false, position: 'team1'},
        {sourceMatch: 5, targetMatch: 13, takesWinner: false, position: 'team2'},
        // Jogo 14: Perdedor do jogo 3 x Perdedor do jogo 8
        {sourceMatch: 3, targetMatch: 14, takesWinner: false, position: 'team1'},
        {sourceMatch: 8, targetMatch: 14, takesWinner: false, position: 'team2'},
        // Jogo 15: Perdedor do jogo 2 x Perdedor do jogo 9
        {sourceMatch: 2, targetMatch: 15, takesWinner: false, position: 'team1'},
        {sourceMatch: 9, targetMatch: 15, takesWinner: false, position: 'team2'},
        // Jogo 16: Perdedor do jogo 1 x Perdedor do jogo 12
        {sourceMatch: 1, targetMatch: 16, takesWinner: false, position: 'team1'},
        {sourceMatch: 12, targetMatch: 16, takesWinner: false, position: 'team2'},
        
        // Jogo 17: Vencedor do jogo 5 x Vencedor do jogo 6
        {sourceMatch: 5, targetMatch: 17, takesWinner: true, position: 'team1'},
        {sourceMatch: 6, targetMatch: 17, takesWinner: true, position: 'team2'},
        // Jogo 18: Vencedor do jogo 7 x Vencedor do jogo 8
        {sourceMatch: 7, targetMatch: 18, takesWinner: true, position: 'team1'},
        {sourceMatch: 8, targetMatch: 18, takesWinner: true, position: 'team2'},
        // Jogo 19: Vencedor do jogo 9 x Vencedor do jogo 10
        {sourceMatch: 9, targetMatch: 19, takesWinner: true, position: 'team1'},
        {sourceMatch: 10, targetMatch: 19, takesWinner: true, position: 'team2'},
        // Jogo 20: Vencedor do jogo 11 x Vencedor do jogo 12
        {sourceMatch: 11, targetMatch: 20, takesWinner: true, position: 'team1'},
        {sourceMatch: 12, targetMatch: 20, takesWinner: true, position: 'team2'},
        
        // Jogo 21: Vencedor do jogo 16 x Perdedor do jogo 11
        {sourceMatch: 16, targetMatch: 21, takesWinner: true, position: 'team1'},
        {sourceMatch: 11, targetMatch: 21, takesWinner: false, position: 'team2'},
        // Jogo 22: Vencedor do jogo 15 x Perdedor do jogo 10
        {sourceMatch: 15, targetMatch: 22, takesWinner: true, position: 'team1'},
        {sourceMatch: 10, targetMatch: 22, takesWinner: false, position: 'team2'},
        // Jogo 23: Vencedor do jogo 14 x Perdedor do jogo 7
        {sourceMatch: 14, targetMatch: 23, takesWinner: true, position: 'team1'},
        {sourceMatch: 7, targetMatch: 23, takesWinner: false, position: 'team2'},
        // Jogo 24: Vencedor do jogo 13 x Perdedor do jogo 6
        {sourceMatch: 13, targetMatch: 24, takesWinner: true, position: 'team1'},
        {sourceMatch: 6, targetMatch: 24, takesWinner: false, position: 'team2'},
        
        // Jogo 25: Vencedor do jogo 21 x Perdedor do jogo 17
        {sourceMatch: 21, targetMatch: 25, takesWinner: true, position: 'team1'},
        {sourceMatch: 17, targetMatch: 25, takesWinner: false, position: 'team2'},
        // Jogo 26: Vencedor do jogo 22 x Perdedor do jogo 18
        {sourceMatch: 22, targetMatch: 26, takesWinner: true, position: 'team1'},
        {sourceMatch: 18, targetMatch: 26, takesWinner: false, position: 'team2'},
        // Jogo 27: Vencedor do jogo 23 x Perdedor do jogo 19
        {sourceMatch: 23, targetMatch: 27, takesWinner: true, position: 'team1'},
        {sourceMatch: 19, targetMatch: 27, takesWinner: false, position: 'team2'},
        // Jogo 28: Vencedor do jogo 24 x Perdedor do jogo 20
        {sourceMatch: 24, targetMatch: 28, takesWinner: true, position: 'team1'},
        {sourceMatch: 20, targetMatch: 28, takesWinner: false, position: 'team2'},
        
        // Jogo 29: Valendo vaga para a Semi-Final - Vencedores
        {sourceMatch: 17, targetMatch: 29, takesWinner: true, position: 'team1'},
        {sourceMatch: 18, targetMatch: 29, takesWinner: true, position: 'team2'},
        // Jogo 30: Valendo vaga para a Semi-Final - Vencedores
        {sourceMatch: 19, targetMatch: 30, takesWinner: true, position: 'team1'},
        {sourceMatch: 20, targetMatch: 30, takesWinner: true, position: 'team2'},
        
        // Jogo 31: Vencedor do jogo 25 x Vencedor do jogo 26
        {sourceMatch: 25, targetMatch: 31, takesWinner: true, position: 'team1'},
        {sourceMatch: 26, targetMatch: 31, takesWinner: true, position: 'team2'},
        // Jogo 32: Vencedor do jogo 27 x Vencedor do jogo 28
        {sourceMatch: 27, targetMatch: 32, takesWinner: true, position: 'team1'},
        {sourceMatch: 28, targetMatch: 32, takesWinner: true, position: 'team2'},
        
        // Jogo 33: Valendo a Vaga para a Semi-Final - Perdedores
        {sourceMatch: 30, targetMatch: 33, takesWinner: false, position: 'team1'},
        {sourceMatch: 31, targetMatch: 33, takesWinner: true, position: 'team2'},
        // Jogo 34: Valendo a Vaga para a Semi-Final - Perdedores
        {sourceMatch: 29, targetMatch: 34, takesWinner: false, position: 'team1'},
        {sourceMatch: 32, targetMatch: 34, takesWinner: true, position: 'team2'},
        
        // Jogo 35: Semi Final
        {sourceMatch: 29, targetMatch: 35, takesWinner: true, position: 'team1'},
        {sourceMatch: 33, targetMatch: 35, takesWinner: true, position: 'team2'},
        // Jogo 36: Semi Final
        {sourceMatch: 30, targetMatch: 36, takesWinner: true, position: 'team1'},
        {sourceMatch: 34, targetMatch: 36, takesWinner: true, position: 'team2'},
        
        // Jogo 37: Terceiro Lugar
        {sourceMatch: 35, targetMatch: 37, takesWinner: false, position: 'team1'},
        {sourceMatch: 36, targetMatch: 37, takesWinner: false, position: 'team2'},
        // Jogo 38: Final
        {sourceMatch: 35, targetMatch: 38, takesWinner: true, position: 'team1'},
        {sourceMatch: 36, targetMatch: 38, takesWinner: true, position: 'team2'},
      ];
    } else if (numTeams === 24) {
      rules = [
        // Jogo 9: Vencedor do jogo 1 x Dupla 17
        {sourceMatch: 1, targetMatch: 9, takesWinner: true, position: 'team1'},
        // Jogo 10: Vencedor do jogo 2 x Dupla 18
        {sourceMatch: 2, targetMatch: 10, takesWinner: true, position: 'team1'},
        // Jogo 11: Vencedor do jogo 3 x Dupla 19
        {sourceMatch: 3, targetMatch: 11, takesWinner: true, position: 'team1'},
        // Jogo 12: Vencedor do jogo 4 x Dupla 20
        {sourceMatch: 4, targetMatch: 12, takesWinner: true, position: 'team1'},
        // Jogo 13: Vencedor do jogo 5 x Dupla 21
        {sourceMatch: 5, targetMatch: 13, takesWinner: true, position: 'team1'},
        // Jogo 14: Vencedor do jogo 6 x Dupla 22
        {sourceMatch: 6, targetMatch: 14, takesWinner: true, position: 'team1'},
        // Jogo 15: Vencedor do jogo 7 x Dupla 23
        {sourceMatch: 7, targetMatch: 15, takesWinner: true, position: 'team1'},
        // Jogo 16: Vencedor do jogo 8 x Dupla 24
        {sourceMatch: 8, targetMatch: 16, takesWinner: true, position: 'team1'},
        
        // Jogo 17: Perdedor do jogo 8 x Perdedor do jogo 9
        {sourceMatch: 8, targetMatch: 17, takesWinner: false, position: 'team1'},
        {sourceMatch: 9, targetMatch: 17, takesWinner: false, position: 'team2'},
        // Jogo 18: Perdedor do jogo 10 x Perdedor do jogo 7
        {sourceMatch: 10, targetMatch: 18, takesWinner: false, position: 'team1'},
        {sourceMatch: 7, targetMatch: 18, takesWinner: false, position: 'team2'},
        // Jogo 19: Perdedor do jogo 11 X Perdedor do jogo 6
        {sourceMatch: 11, targetMatch: 19, takesWinner: false, position: 'team1'},
        {sourceMatch: 6, targetMatch: 19, takesWinner: false, position: 'team2'},
        // Jogo 20: Perdedor do jogo 12 x Perdedor do jogo 5
        {sourceMatch: 12, targetMatch: 20, takesWinner: false, position: 'team1'},
        {sourceMatch: 5, targetMatch: 20, takesWinner: false, position: 'team2'},
        // Jogo 21: Perdedor do jogo 13 x Perdedor do jogo 4
        {sourceMatch: 13, targetMatch: 21, takesWinner: false, position: 'team1'},
        {sourceMatch: 4, targetMatch: 21, takesWinner: false, position: 'team2'},
        // Jogo 22: Perdedor do jogo 14 x Perdedor do jogo 3
        {sourceMatch: 14, targetMatch: 22, takesWinner: false, position: 'team1'},
        {sourceMatch: 3, targetMatch: 22, takesWinner: false, position: 'team2'},
        // Jogo 23: Perdedor do jogo 15 x Perdedor do jogo 2
        {sourceMatch: 15, targetMatch: 23, takesWinner: false, position: 'team1'},
        {sourceMatch: 2, targetMatch: 23, takesWinner: false, position: 'team2'},
        // Jogo 24: Perdedor do jogo 16 x Perdedor do jogo 1
        {sourceMatch: 16, targetMatch: 24, takesWinner: false, position: 'team1'},
        {sourceMatch: 1, targetMatch: 24, takesWinner: false, position: 'team2'},
        
        // Jogo 25: Vencedor do jogo 9 x Vencedor do jogo 10
        {sourceMatch: 9, targetMatch: 25, takesWinner: true, position: 'team1'},
        {sourceMatch: 10, targetMatch: 25, takesWinner: true, position: 'team2'},
        // Jogo 26: Vencedor do jogo 11 x Vencedor do jogo 12
        {sourceMatch: 11, targetMatch: 26, takesWinner: true, position: 'team1'},
        {sourceMatch: 12, targetMatch: 26, takesWinner: true, position: 'team2'},
        // Jogo 27: Vencedor do jogo 13 x Vencedor do jogo 14
        {sourceMatch: 13, targetMatch: 27, takesWinner: true, position: 'team1'},
        {sourceMatch: 14, targetMatch: 27, takesWinner: true, position: 'team2'},
        // Jogo 28: Vencedor do jogo 15 x Vencedor do jogo 16
        {sourceMatch: 15, targetMatch: 28, takesWinner: true, position: 'team1'},
        {sourceMatch: 16, targetMatch: 28, takesWinner: true, position: 'team2'},
        
        // Jogo 29: Vencedor do jogo 24 x Vencedor do jogo 23
        {sourceMatch: 24, targetMatch: 29, takesWinner: true, position: 'team1'},
        {sourceMatch: 23, targetMatch: 29, takesWinner: true, position: 'team2'},
        // Jogo 30: Vencedor do jogo 22 x Vencedor do jogo 21
        {sourceMatch: 22, targetMatch: 30, takesWinner: true, position: 'team1'},
        {sourceMatch: 21, targetMatch: 30, takesWinner: true, position: 'team2'},
        // Jogo 31: Vencedor do jogo 20 x Vencedor do jogo 19
        {sourceMatch: 20, targetMatch: 31, takesWinner: true, position: 'team1'},
        {sourceMatch: 19, targetMatch: 31, takesWinner: true, position: 'team2'},
        // Jogo 32: Vencedor do jogo 18 x Vencedor do jogo 17
        {sourceMatch: 18, targetMatch: 32, takesWinner: true, position: 'team1'},
        {sourceMatch: 17, targetMatch: 32, takesWinner: true, position: 'team2'},
        
        // Jogo 33: Vencedor do jogo 29 x Perdedor do jogo 25
        {sourceMatch: 29, targetMatch: 33, takesWinner: true, position: 'team1'},
        {sourceMatch: 25, targetMatch: 33, takesWinner: false, position: 'team2'},
        // Jogo 34: Vencedor do jogo 30 x Perdedor do jogo 26
        {sourceMatch: 30, targetMatch: 34, takesWinner: true, position: 'team1'},
        {sourceMatch: 26, targetMatch: 34, takesWinner: false, position: 'team2'},
        // Jogo 35: Vencedor do jogo 31 x Perdedor do jogo 27
        {sourceMatch: 31, targetMatch: 35, takesWinner: true, position: 'team1'},
        {sourceMatch: 27, targetMatch: 35, takesWinner: false, position: 'team2'},
        // Jogo 36: Vencedor do jogo 32 x Perdedor do jogo 28
        {sourceMatch: 32, targetMatch: 36, takesWinner: true, position: 'team1'},
        {sourceMatch: 28, targetMatch: 36, takesWinner: false, position: 'team2'},
        
        // Jogo 37: Vencedor do jogo 25 x Vencedor do jogo 26
        {sourceMatch: 25, targetMatch: 37, takesWinner: true, position: 'team1'},
        {sourceMatch: 26, targetMatch: 37, takesWinner: true, position: 'team2'},
        // Jogo 38: Vencedor do jogo 27 x Vencedor do jogo 28
        {sourceMatch: 27, targetMatch: 38, takesWinner: true, position: 'team1'},
        {sourceMatch: 28, targetMatch: 38, takesWinner: true, position: 'team2'},
        
        // Jogo 39: Vencedor do jogo 33 x Vencedor do jogo 34
        {sourceMatch: 33, targetMatch: 39, takesWinner: true, position: 'team1'},
        {sourceMatch: 34, targetMatch: 39, takesWinner: true, position: 'team2'},
        // Jogo 40: Vencedor do jogo 35 x Vencedor do jogo 36
        {sourceMatch: 35, targetMatch: 40, takesWinner: true, position: 'team1'},
        {sourceMatch: 36, targetMatch: 40, takesWinner: true, position: 'team2'},
        
        // Jogo 41: Perdedor do jogo 38 x Vencedor do jogo 39
        {sourceMatch: 38, targetMatch: 41, takesWinner: false, position: 'team1'},
        {sourceMatch: 39, targetMatch: 41, takesWinner: true, position: 'team2'},
        // Jogo 42: Perdedor do jogo 37 x Vencedor do jogo 40
        {sourceMatch: 37, targetMatch: 42, takesWinner: false, position: 'team1'},
        {sourceMatch: 40, targetMatch: 42, takesWinner: true, position: 'team2'},
        
        // Jogo 43: Vencedor do jogo 37 x Vencedor do jogo 41
        {sourceMatch: 37, targetMatch: 43, takesWinner: true, position: 'team1'},
        {sourceMatch: 41, targetMatch: 43, takesWinner: true, position: 'team2'},
        // Jogo 44: Vencedor do jogo 38 x Vencedor do jogo 42
        {sourceMatch: 38, targetMatch: 44, takesWinner: true, position: 'team1'},
        {sourceMatch: 42, targetMatch: 44, takesWinner: true, position: 'team2'},
        
        // Jogo 45: Perdedor do jogo 43 x Perdedor do jogo 44
        {sourceMatch: 43, targetMatch: 45, takesWinner: false, position: 'team1'},
        {sourceMatch: 44, targetMatch: 45, takesWinner: false, position: 'team2'},
        // Jogo 46: Vencedor do jogo 43 x Vencedor do jogo 44
        {sourceMatch: 43, targetMatch: 46, takesWinner: true, position: 'team1'},
        {sourceMatch: 44, targetMatch: 46, takesWinner: true, position: 'team2'},
      ];
    } else if (numTeams === 25) {
      rules = [
        // Jogo 10: Perdedor do jogo 2 X perdedor do jogo 3
        {sourceMatch: 2, targetMatch: 10, takesWinner: false, position: 'team1'},
        {sourceMatch: 3, targetMatch: 10, takesWinner: false, position: 'team2'},
        // Jogo 11: Vencedor do jogo 1 x Dupla 19
        {sourceMatch: 1, targetMatch: 11, takesWinner: true, position: 'team1'},
        // Jogo 12: Vencedor do jogo 2 x Vencedor do jogo 3
        {sourceMatch: 2, targetMatch: 12, takesWinner: true, position: 'team1'},
        {sourceMatch: 3, targetMatch: 12, takesWinner: true, position: 'team2'},
        // Jogo 13: Vencedor do jogo 4 x Dupla 20
        {sourceMatch: 4, targetMatch: 13, takesWinner: true, position: 'team1'},
        // Jogo 14: Vencedor do jogo 5 x Dupla 21
        {sourceMatch: 5, targetMatch: 14, takesWinner: true, position: 'team1'},
        // Jogo 15: Vencedor do jogo 6 x Dupla 22
        {sourceMatch: 6, targetMatch: 15, takesWinner: true, position: 'team1'},
        // Jogo 16: Vencedor do jogo 7 x Dupla 23
        {sourceMatch: 7, targetMatch: 16, takesWinner: true, position: 'team1'},
        // Jogo 17: Vencedor do jogo 8 x Dupla 24
        {sourceMatch: 8, targetMatch: 17, takesWinner: true, position: 'team1'},
        // Jogo 18: Vencedor do jogo 9 x Dupla 25
        {sourceMatch: 9, targetMatch: 18, takesWinner: true, position: 'team1'},
        // Jogo 19: Perdedor do jogo 11 x Perdedor do jogo 9
        {sourceMatch: 11, targetMatch: 19, takesWinner: false, position: 'team1'},
        {sourceMatch: 9, targetMatch: 19, takesWinner: false, position: 'team2'},
        // Jogo 20: Perdedor do jogo 12 x Perdedor do jogo 8
        {sourceMatch: 12, targetMatch: 20, takesWinner: false, position: 'team1'},
        {sourceMatch: 8, targetMatch: 20, takesWinner: false, position: 'team2'},
        // Jogo 21: Perdedor do jogo 13 x Perdedor do jogo 7
        {sourceMatch: 13, targetMatch: 21, takesWinner: false, position: 'team1'},
        {sourceMatch: 7, targetMatch: 21, takesWinner: false, position: 'team2'},
        // Jogo 22: Perdedor do jogo 14 x Perdedor do jogo 6
        {sourceMatch: 14, targetMatch: 22, takesWinner: false, position: 'team1'},
        {sourceMatch: 6, targetMatch: 22, takesWinner: false, position: 'team2'},
        // Jogo 23: Perdedor do jogo 15 x Perdedor do jogo 5
        {sourceMatch: 15, targetMatch: 23, takesWinner: false, position: 'team1'},
        {sourceMatch: 5, targetMatch: 23, takesWinner: false, position: 'team2'},
        // Jogo 24: Perdedor do jogo 16 x Perdedor do jogo 4
        {sourceMatch: 16, targetMatch: 24, takesWinner: false, position: 'team1'},
        {sourceMatch: 4, targetMatch: 24, takesWinner: false, position: 'team2'},
        // Jogo 25: Perdedor do jogo 17 x Vencedor do jogo 10
        {sourceMatch: 17, targetMatch: 25, takesWinner: false, position: 'team1'},
        {sourceMatch: 10, targetMatch: 25, takesWinner: true, position: 'team2'},
        // Jogo 26: Perdedor do jogo 18 x Perdedor do jogo 1
        {sourceMatch: 18, targetMatch: 26, takesWinner: false, position: 'team1'},
        {sourceMatch: 1, targetMatch: 26, takesWinner: false, position: 'team2'},
        // Jogo 27: Vencedor do jogo 19 x Vencedor do jogo 20
        {sourceMatch: 19, targetMatch: 27, takesWinner: true, position: 'team1'},
        {sourceMatch: 20, targetMatch: 27, takesWinner: true, position: 'team2'},
        // Jogo 28: Vencedor do jogo 21 x Vencedor do jogo 22
        {sourceMatch: 21, targetMatch: 28, takesWinner: true, position: 'team1'},
        {sourceMatch: 22, targetMatch: 28, takesWinner: true, position: 'team2'},
        // Jogo 29: Vencedor do jogo 23 x Vencedor do jogo 24
        {sourceMatch: 23, targetMatch: 29, takesWinner: true, position: 'team1'},
        {sourceMatch: 24, targetMatch: 29, takesWinner: true, position: 'team2'},
        // Jogo 30: Vencedor do jogo 25 x Vencedor do jogo 26
        {sourceMatch: 25, targetMatch: 30, takesWinner: true, position: 'team1'},
        {sourceMatch: 26, targetMatch: 30, takesWinner: true, position: 'team2'},
        // Jogo 31: Vencedor do jogo 11 x Vencedor do jogo 12
        {sourceMatch: 11, targetMatch: 31, takesWinner: true, position: 'team1'},
        {sourceMatch: 12, targetMatch: 31, takesWinner: true, position: 'team2'},
        // Jogo 32: Vencedor do jogo 13 x Vencedor do jogo 14
        {sourceMatch: 13, targetMatch: 32, takesWinner: true, position: 'team1'},
        {sourceMatch: 14, targetMatch: 32, takesWinner: true, position: 'team2'},
        // Jogo 33: Vencedor do jogo 15 x Vencedor do jogo 16
        {sourceMatch: 15, targetMatch: 33, takesWinner: true, position: 'team1'},
        {sourceMatch: 16, targetMatch: 33, takesWinner: true, position: 'team2'},
        // Jogo 34: Vencedor do jogo 17 x Vencedor do jogo 18
        {sourceMatch: 17, targetMatch: 34, takesWinner: true, position: 'team1'},
        {sourceMatch: 18, targetMatch: 34, takesWinner: true, position: 'team2'},
        // Jogo 35: Perdedor do jogo 32 x Vencedor do jogo 30
        {sourceMatch: 32, targetMatch: 35, takesWinner: false, position: 'team1'},
        {sourceMatch: 30, targetMatch: 35, takesWinner: true, position: 'team2'},
        // Jogo 36: Perdedor do jogo 31 x Vencedor do jogo 29
        {sourceMatch: 31, targetMatch: 36, takesWinner: false, position: 'team1'},
        {sourceMatch: 29, targetMatch: 36, takesWinner: true, position: 'team2'},
        // Jogo 37: Perdedor do jogo 34 X Vencedor do jogo 28
        {sourceMatch: 34, targetMatch: 37, takesWinner: false, position: 'team1'},
        {sourceMatch: 28, targetMatch: 37, takesWinner: true, position: 'team2'},
        // Jogo 38: Perdedor do jogo 33 x Vencedor do jogo 27
        {sourceMatch: 33, targetMatch: 38, takesWinner: false, position: 'team1'},
        {sourceMatch: 27, targetMatch: 38, takesWinner: true, position: 'team2'},
        // Jogo 39: Vencedor do jogo 36 x Vencedor do jogo 35
        {sourceMatch: 36, targetMatch: 39, takesWinner: true, position: 'team1'},
        {sourceMatch: 35, targetMatch: 39, takesWinner: true, position: 'team2'},
        // Jogo 40: Vencedor do jogo 38 x Vencedor do jogo 37
        {sourceMatch: 38, targetMatch: 40, takesWinner: true, position: 'team1'},
        {sourceMatch: 37, targetMatch: 40, takesWinner: true, position: 'team2'},
        // Jogo 41: Vencedor do jogo 31 x Vencedor do jogo 32
        {sourceMatch: 31, targetMatch: 41, takesWinner: true, position: 'team1'},
        {sourceMatch: 32, targetMatch: 41, takesWinner: true, position: 'team2'},
        // Jogo 42: Vencedor do jogo 33 x Vencedor do jogo 34
        {sourceMatch: 33, targetMatch: 42, takesWinner: true, position: 'team1'},
        {sourceMatch: 34, targetMatch: 42, takesWinner: true, position: 'team2'},
        // Jogo 43: Perdedor do jogo 41 x Vencedor do jogo 40
        {sourceMatch: 41, targetMatch: 43, takesWinner: false, position: 'team1'},
        {sourceMatch: 40, targetMatch: 43, takesWinner: true, position: 'team2'},
        // Jogo 44: Perdedor do jogo 42 x Vencedor do jogo 39
        {sourceMatch: 42, targetMatch: 44, takesWinner: false, position: 'team1'},
        {sourceMatch: 39, targetMatch: 44, takesWinner: true, position: 'team2'},
        // Jogo 45 (Semi Final): Vencedor do jogo 44 x Vencedor do jogo 41
        {sourceMatch: 44, targetMatch: 45, takesWinner: true, position: 'team1'},
        {sourceMatch: 41, targetMatch: 45, takesWinner: true, position: 'team2'},
        // Jogo 46 (Semi Final): Vencedor do jogo 42 x Vencedor do jogo 43
        {sourceMatch: 42, targetMatch: 46, takesWinner: true, position: 'team1'},
        {sourceMatch: 43, targetMatch: 46, takesWinner: true, position: 'team2'},
        // Jogo 47 (Terceiro Lugar): Perdedor do jogo 45 x Perdedor do jogo 46
        {sourceMatch: 45, targetMatch: 47, takesWinner: false, position: 'team1'},
        {sourceMatch: 46, targetMatch: 47, takesWinner: false, position: 'team2'},
        // Jogo 48 (Final): Vencedor do jogo 45 x Vencedor do jogo 46
        {sourceMatch: 45, targetMatch: 48, takesWinner: true, position: 'team1'},
        {sourceMatch: 46, targetMatch: 48, takesWinner: true, position: 'team2'},
      ];
    }
    
    // Build the dependencies map with takesWinner information for each position
    rules.forEach(rule => {
      if (!dependenciesMap[rule.targetMatch]) {
        dependenciesMap[rule.targetMatch] = {};
      }
      if (rule.position === 'team1') {
        dependenciesMap[rule.targetMatch].match1 = rule.sourceMatch;
        dependenciesMap[rule.targetMatch].takesWinnerMatch1 = rule.takesWinner;
      } else {
        dependenciesMap[rule.targetMatch].match2 = rule.sourceMatch;
        dependenciesMap[rule.targetMatch].takesWinnerMatch2 = rule.takesWinner;
      }
    });
    
    return dependenciesMap;
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const maxTeams = category?.num_teams || 16;
    if (teams.length >= maxTeams) {
      toast.error(`Máximo de ${maxTeams} duplas por categoria`);
      return;
    }

    try {
      const { error } = await supabase
        .from('teams')
        .insert({
          category_id: categoryId,
          name: newTeamName,
          seed_position: teams.length + 1,
        });

      if (error) throw error;

      toast.success('Dupla adicionada!');
      setNewTeamName('');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar dupla');
    }
  };

  const handleAddBulkTeams = async (e: React.FormEvent) => {
    e.preventDefault();
    const maxTeams = category?.num_teams || 16;
    
    // Split by lines and filter empty lines
    const teamNames = bulkTeamNames
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (teamNames.length === 0) {
      toast.error('Por favor, insira pelo menos uma dupla');
      return;
    }
    
    if (teams.length + teamNames.length > maxTeams) {
      toast.error(`Não é possível adicionar ${teamNames.length} duplas. Limite: ${maxTeams} duplas (${teams.length} já cadastradas)`);
      return;
    }

    setLoading(true);

    try {
      const teamsToInsert = teamNames.map((name, index) => ({
        category_id: categoryId,
        name: name,
        seed_position: teams.length + index + 1,
      }));

      const { error } = await supabase
        .from('teams')
        .insert(teamsToInsert);

      if (error) throw error;

      toast.success(`${teamNames.length} dupla(s) adicionada(s) com sucesso!`);
      setBulkTeamNames('');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar duplas');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBracket = async () => {
    const numTeams = category?.num_teams || 16;
    
    if (teams.length !== numTeams) {
      toast.error(`É necessário exatamente ${numTeams} duplas para gerar o chaveamento`);
      return;
    }

    setLoading(true);
    try {
      // Sortear posições ou manter ordem original
      const shuffled = shuffleTeams ? [...teams].sort(() => Math.random() - 0.5) : [...teams];

      // Get dependencies map
      const dependenciesMap = getDependenciesMap(numTeams);

      const matchesData = [];
      
      if (numTeams === 8) {
        // Jogos 1-4: Primeira rodada com nova ordem
        // Jogo 1: Dupla 1 X Dupla 8
        matchesData.push({
          category_id: categoryId,
          match_number: 1,
          round_type: 'winners',
          team1_id: shuffled[0].id,
          team2_id: shuffled[7].id,
          status: 'pending' as const,
        });
        // Jogo 2: Dupla 4 X Dupla 5
        matchesData.push({
          category_id: categoryId,
          match_number: 2,
          round_type: 'winners',
          team1_id: shuffled[3].id,
          team2_id: shuffled[4].id,
          status: 'pending' as const,
        });
        // Jogo 3: Dupla 3 X Dupla 6
        matchesData.push({
          category_id: categoryId,
          match_number: 3,
          round_type: 'winners',
          team1_id: shuffled[2].id,
          team2_id: shuffled[5].id,
          status: 'pending' as const,
        });
        // Jogo 4: Dupla 7 x Dupla 2
        matchesData.push({
          category_id: categoryId,
          match_number: 4,
          round_type: 'winners',
          team1_id: shuffled[6].id,
          team2_id: shuffled[1].id,
          status: 'pending' as const,
        });

        // Jogos 5-14: Restante do chaveamento
        for (let i = 5; i <= 14; i++) {
          const deps = dependenciesMap[i] || {};
          matchesData.push({
            category_id: categoryId,
            match_number: i,
            round_type: i === 14 ? 'finals' : i === 13 ? 'third_place' : i >= 11 ? 'semifinals' : i >= 9 ? 'losers' : i >= 7 ? 'winners' : 'losers',
            status: 'pending' as const,
            depends_on_match1: deps.match1 || null,
            depends_on_match2: deps.match2 || null,
            takes_winner_match1: deps.takesWinnerMatch1 !== undefined ? deps.takesWinnerMatch1 : null,
            takes_winner_match2: deps.takesWinnerMatch2 !== undefined ? deps.takesWinnerMatch2 : null,
          });
        }
      } else if (numTeams === 9) {
        // 9 duplas - 16 jogos
        // Jogos 1-4: Primeira rodada (8 duplas jogam)
        // Jogo 1: Dupla 1 x Dupla 2
        matchesData.push({
          category_id: categoryId,
          match_number: 1,
          round_type: 'winners',
          team1_id: shuffled[0].id,
          team2_id: shuffled[1].id,
          status: 'pending' as const,
        });
        // Jogo 2: Dupla 3 x Dupla 4
        matchesData.push({
          category_id: categoryId,
          match_number: 2,
          round_type: 'winners',
          team1_id: shuffled[2].id,
          team2_id: shuffled[3].id,
          status: 'pending' as const,
        });
        // Jogo 3: Dupla 5 x Dupla 6
        matchesData.push({
          category_id: categoryId,
          match_number: 3,
          round_type: 'winners',
          team1_id: shuffled[4].id,
          team2_id: shuffled[5].id,
          status: 'pending' as const,
        });
        // Jogo 4: Dupla 7 x Dupla 8
        matchesData.push({
          category_id: categoryId,
          match_number: 4,
          round_type: 'winners',
          team1_id: shuffled[6].id,
          team2_id: shuffled[7].id,
          status: 'pending' as const,
        });

        // Jogo 5: Vencedor do jogo 1 x Dupla 9
        matchesData.push({
          category_id: categoryId,
          match_number: 5,
          round_type: 'winners',
          team2_id: shuffled[8].id, // Dupla 9 já definida
          status: 'pending' as const,
          depends_on_match1: dependenciesMap[5]?.match1 || null,
          takes_winner_match1: dependenciesMap[5]?.takesWinnerMatch1 ?? null,
        });

        // Jogos 6-16: Restante do chaveamento
        for (let i = 6; i <= 16; i++) {
          const deps = dependenciesMap[i] || {};
          let roundType = 'losers';
          if (i === 16) roundType = 'finals';
          else if (i === 15) roundType = 'third_place';
          else if (i >= 13) roundType = 'semifinals';
          else if (i >= 8 && i <= 9) roundType = 'winners';
          
          matchesData.push({
            category_id: categoryId,
            match_number: i,
            round_type: roundType,
            status: 'pending' as const,
            depends_on_match1: deps.match1 || null,
            depends_on_match2: deps.match2 || null,
            takes_winner_match1: deps.takesWinnerMatch1 !== undefined ? deps.takesWinnerMatch1 : null,
            takes_winner_match2: deps.takesWinnerMatch2 !== undefined ? deps.takesWinnerMatch2 : null,
          });
        }
      } else if (numTeams === 14) {
        // 14 duplas - 26 jogos
        // Jogos 1-6: Primeira rodada (12 duplas)
        // Jogo 1: Dupla 1 x Dupla 2
        matchesData.push({
          category_id: categoryId,
          match_number: 1,
          round_type: 'winners',
          team1_id: shuffled[0].id,
          team2_id: shuffled[1].id,
          status: 'pending' as const,
        });
        // Jogo 2: Dupla 3 x Dupla 4
        matchesData.push({
          category_id: categoryId,
          match_number: 2,
          round_type: 'winners',
          team1_id: shuffled[2].id,
          team2_id: shuffled[3].id,
          status: 'pending' as const,
        });
        // Jogo 3: Dupla 5 x Dupla 6
        matchesData.push({
          category_id: categoryId,
          match_number: 3,
          round_type: 'winners',
          team1_id: shuffled[4].id,
          team2_id: shuffled[5].id,
          status: 'pending' as const,
        });
        // Jogo 4: Dupla 7 x Dupla 8
        matchesData.push({
          category_id: categoryId,
          match_number: 4,
          round_type: 'winners',
          team1_id: shuffled[6].id,
          team2_id: shuffled[7].id,
          status: 'pending' as const,
        });
        // Jogo 5: Dupla 9 x Dupla 10
        matchesData.push({
          category_id: categoryId,
          match_number: 5,
          round_type: 'winners',
          team1_id: shuffled[8].id,
          team2_id: shuffled[9].id,
          status: 'pending' as const,
        });
        // Jogo 6: Dupla 11 x Dupla 12
        matchesData.push({
          category_id: categoryId,
          match_number: 6,
          round_type: 'winners',
          team1_id: shuffled[10].id,
          team2_id: shuffled[11].id,
          status: 'pending' as const,
        });

        // Jogo 7: Vencedor do jogo 1 x Dupla 13
        matchesData.push({
          category_id: categoryId,
          match_number: 7,
          round_type: 'winners',
          team2_id: shuffled[12].id, // Dupla 13
          status: 'pending' as const,
          depends_on_match1: dependenciesMap[7]?.match1 || null,
          takes_winner_match1: dependenciesMap[7]?.takesWinnerMatch1 ?? null,
        });

        // Jogo 10: Vencedor do jogo 6 x Dupla 14
        matchesData.push({
          category_id: categoryId,
          match_number: 10,
          round_type: 'winners',
          team2_id: shuffled[13].id, // Dupla 14
          status: 'pending' as const,
          depends_on_match1: dependenciesMap[10]?.match1 || null,
          takes_winner_match1: dependenciesMap[10]?.takesWinnerMatch1 ?? null,
        });

        // Jogos 8-9 e 11-26: Restante do chaveamento
        const remainingMatches = [8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
        for (const i of remainingMatches) {
          const deps = dependenciesMap[i] || {};
          let roundType = 'losers';
          if (i === 26) roundType = 'finals';
          else if (i === 25) roundType = 'third_place';
          else if (i >= 23) roundType = 'semifinals';
          else if (i >= 17 && i <= 18) roundType = 'winners';
          else if (i >= 8 && i <= 9) roundType = 'winners';
          
          matchesData.push({
            category_id: categoryId,
            match_number: i,
            round_type: roundType,
            status: 'pending' as const,
            depends_on_match1: deps.match1 || null,
            depends_on_match2: deps.match2 || null,
            takes_winner_match1: deps.takesWinnerMatch1 !== undefined ? deps.takesWinnerMatch1 : null,
            takes_winner_match2: deps.takesWinnerMatch2 !== undefined ? deps.takesWinnerMatch2 : null,
          });
        }
      } else if (numTeams === 18) {
        // 18 duplas - 34 jogos
        // Jogos 1-8: Primeira rodada
        // Jogo 1: Dupla 1 x Dupla 2
        matchesData.push({
          category_id: categoryId,
          match_number: 1,
          round_type: 'winners',
          team1_id: shuffled[0].id,
          team2_id: shuffled[1].id,
          status: 'pending' as const,
        });
        // Jogo 2: Dupla 3 x Dupla 4
        matchesData.push({
          category_id: categoryId,
          match_number: 2,
          round_type: 'winners',
          team1_id: shuffled[2].id,
          team2_id: shuffled[3].id,
          status: 'pending' as const,
        });
        // Jogo 3: Dupla 5 x Dupla 6
        matchesData.push({
          category_id: categoryId,
          match_number: 3,
          round_type: 'winners',
          team1_id: shuffled[4].id,
          team2_id: shuffled[5].id,
          status: 'pending' as const,
        });
        // Jogo 4: Dupla 7 x Dupla 8
        matchesData.push({
          category_id: categoryId,
          match_number: 4,
          round_type: 'winners',
          team1_id: shuffled[6].id,
          team2_id: shuffled[7].id,
          status: 'pending' as const,
        });
        // Jogo 5: Dupla 9 x Dupla 10
        matchesData.push({
          category_id: categoryId,
          match_number: 5,
          round_type: 'winners',
          team1_id: shuffled[8].id,
          team2_id: shuffled[9].id,
          status: 'pending' as const,
        });
        // Jogo 6: Dupla 11 x Dupla 12
        matchesData.push({
          category_id: categoryId,
          match_number: 6,
          round_type: 'winners',
          team1_id: shuffled[10].id,
          team2_id: shuffled[11].id,
          status: 'pending' as const,
        });
        // Jogo 7: Dupla 13 x Dupla 14
        matchesData.push({
          category_id: categoryId,
          match_number: 7,
          round_type: 'winners',
          team1_id: shuffled[12].id,
          team2_id: shuffled[13].id,
          status: 'pending' as const,
        });
        // Jogo 8: Dupla 15 x Dupla 16
        matchesData.push({
          category_id: categoryId,
          match_number: 8,
          round_type: 'winners',
          team1_id: shuffled[14].id,
          team2_id: shuffled[15].id,
          status: 'pending' as const,
        });

        // Jogo 9: Vencedor do jogo 1 x Dupla 17
        const game9Deps = dependenciesMap[9] || {};
        matchesData.push({
          category_id: categoryId,
          match_number: 9,
          round_type: 'winners',
          team2_id: shuffled[16].id,
          status: 'pending' as const,
          depends_on_match1: game9Deps.match1 || null,
          takes_winner_match1: game9Deps.takesWinnerMatch1 ?? null,
        });

        // Jogo 10: Vencedor do jogo 2 x Dupla 18
        const game10Deps = dependenciesMap[10] || {};
        matchesData.push({
          category_id: categoryId,
          match_number: 10,
          round_type: 'winners',
          team2_id: shuffled[17].id,
          status: 'pending' as const,
          depends_on_match1: game10Deps.match1 || null,
          takes_winner_match1: game10Deps.takesWinnerMatch1 ?? null,
        });

        // Jogos 11-34: Restante do chaveamento
        for (let i = 11; i <= 34; i++) {
          const deps = dependenciesMap[i] || {};
          let roundType = 'losers';
          if (i === 34) roundType = 'finals';
          else if (i === 33) roundType = 'third_place';
          else if (i >= 31) roundType = 'semifinals';
          else if (i >= 25 && i <= 26) roundType = 'winners';
          else if (i >= 13 && i <= 16) roundType = 'winners';
          
          matchesData.push({
            category_id: categoryId,
            match_number: i,
            round_type: roundType,
            status: 'pending' as const,
            depends_on_match1: deps.match1 || null,
            depends_on_match2: deps.match2 || null,
            takes_winner_match1: deps.takesWinnerMatch1 !== undefined ? deps.takesWinnerMatch1 : null,
            takes_winner_match2: deps.takesWinnerMatch2 !== undefined ? deps.takesWinnerMatch2 : null,
          });
        }
      } else if (numTeams === 12) {
        // Jogos 1-4: Primeira rodada com nova ordem
        // Jogo 1: Dupla 1 x Dupla 8
        matchesData.push({
          category_id: categoryId,
          match_number: 1,
          round_type: 'winners',
          team1_id: shuffled[0].id,
          team2_id: shuffled[7].id,
          status: 'pending' as const,
        });
        // Jogo 2: Dupla 5 x Dupla 2
        matchesData.push({
          category_id: categoryId,
          match_number: 2,
          round_type: 'winners',
          team1_id: shuffled[4].id,
          team2_id: shuffled[1].id,
          status: 'pending' as const,
        });
        // Jogo 3: Dupla 6 x Dupla 3
        matchesData.push({
          category_id: categoryId,
          match_number: 3,
          round_type: 'winners',
          team1_id: shuffled[5].id,
          team2_id: shuffled[2].id,
          status: 'pending' as const,
        });
        // Jogo 4: Dupla 7 x Dupla 4
        matchesData.push({
          category_id: categoryId,
          match_number: 4,
          round_type: 'winners',
          team1_id: shuffled[6].id,
          team2_id: shuffled[3].id,
          status: 'pending' as const,
        });

        // Jogos 5-8: Segunda rodada (vencedores da primeira + 4 duplas diretas)
        for (let i = 5; i <= 8; i++) {
          const deps = dependenciesMap[i] || {};
          matchesData.push({
            category_id: categoryId,
            match_number: i,
            round_type: 'winners',
            team2_id: i === 5 ? shuffled[8].id : i === 6 ? shuffled[9].id : i === 7 ? shuffled[10].id : shuffled[11].id,
            status: 'pending' as const,
            depends_on_match1: deps.match1 || null,
            depends_on_match2: deps.match2 || null,
            takes_winner_match1: deps.takesWinnerMatch1 !== undefined ? deps.takesWinnerMatch1 : null,
            takes_winner_match2: deps.takesWinnerMatch2 !== undefined ? deps.takesWinnerMatch2 : null,
          });
        }

        // Jogos 9-22: Restante do chaveamento
        for (let i = 9; i <= 22; i++) {
          const deps = dependenciesMap[i] || {};
          let roundType = 'losers';
          if (i === 22) roundType = 'finals';
          else if (i === 21) roundType = 'third_place';
          else if (i >= 19) roundType = 'semifinals';
          else if (i >= 15 && i <= 16) roundType = 'winners';
          
          matchesData.push({
            category_id: categoryId,
            match_number: i,
            round_type: roundType,
            status: 'pending' as const,
            depends_on_match1: deps.match1 || null,
            depends_on_match2: deps.match2 || null,
            takes_winner_match1: deps.takesWinnerMatch1 !== undefined ? deps.takesWinnerMatch1 : null,
            takes_winner_match2: deps.takesWinnerMatch2 !== undefined ? deps.takesWinnerMatch2 : null,
          });
        }
      } else if (numTeams === 20) {
        // 20 duplas - 38 jogos
        // Jogos 1-4: Primeira rodada (8 duplas)
        // Jogo 1: Dupla 1 x Dupla 2
        matchesData.push({
          category_id: categoryId,
          match_number: 1,
          round_type: 'winners',
          team1_id: shuffled[0].id,
          team2_id: shuffled[1].id,
          status: 'pending' as const,
        });
        // Jogo 2: Dupla 3 x Dupla 4
        matchesData.push({
          category_id: categoryId,
          match_number: 2,
          round_type: 'winners',
          team1_id: shuffled[2].id,
          team2_id: shuffled[3].id,
          status: 'pending' as const,
        });
        // Jogo 3: Dupla 5 x Dupla 6
        matchesData.push({
          category_id: categoryId,
          match_number: 3,
          round_type: 'winners',
          team1_id: shuffled[4].id,
          team2_id: shuffled[5].id,
          status: 'pending' as const,
        });
        // Jogo 4: Dupla 7 x Dupla 8
        matchesData.push({
          category_id: categoryId,
          match_number: 4,
          round_type: 'winners',
          team1_id: shuffled[6].id,
          team2_id: shuffled[7].id,
          status: 'pending' as const,
        });

        // Jogos 5-12: Segunda rodada mista com dependências
        // Jogo 5: Vencedor do jogo 1 x Dupla 9
        const game5Deps = dependenciesMap[5] || {};
        matchesData.push({
          category_id: categoryId,
          match_number: 5,
          round_type: 'winners',
          team2_id: shuffled[8].id,
          status: 'pending' as const,
          depends_on_match1: game5Deps.match1 || null,
          depends_on_match2: game5Deps.match2 || null,
          takes_winner_match1: game5Deps.takesWinnerMatch1 !== undefined ? game5Deps.takesWinnerMatch1 : null,
          takes_winner_match2: game5Deps.takesWinnerMatch2 !== undefined ? game5Deps.takesWinnerMatch2 : null,
        });
        
        // Jogo 6: Dupla 10 x Dupla 11
        matchesData.push({
          category_id: categoryId,
          match_number: 6,
          round_type: 'winners',
          team1_id: shuffled[9].id,
          team2_id: shuffled[10].id,
          status: 'pending' as const,
        });
        
        // Jogo 7: Dupla 12 x Dupla 13
        matchesData.push({
          category_id: categoryId,
          match_number: 7,
          round_type: 'winners',
          team1_id: shuffled[11].id,
          team2_id: shuffled[12].id,
          status: 'pending' as const,
        });
        
        // Jogo 8: Vencedor do jogo 2 x Dupla 14
        const game8Deps = dependenciesMap[8] || {};
        matchesData.push({
          category_id: categoryId,
          match_number: 8,
          round_type: 'winners',
          team2_id: shuffled[13].id,
          status: 'pending' as const,
          depends_on_match1: game8Deps.match1 || null,
          depends_on_match2: game8Deps.match2 || null,
          takes_winner_match1: game8Deps.takesWinnerMatch1 !== undefined ? game8Deps.takesWinnerMatch1 : null,
          takes_winner_match2: game8Deps.takesWinnerMatch2 !== undefined ? game8Deps.takesWinnerMatch2 : null,
        });
        
        // Jogo 9: Vencedor do jogo 3 x Dupla 15
        const game9Deps = dependenciesMap[9] || {};
        matchesData.push({
          category_id: categoryId,
          match_number: 9,
          round_type: 'winners',
          team2_id: shuffled[14].id,
          status: 'pending' as const,
          depends_on_match1: game9Deps.match1 || null,
          depends_on_match2: game9Deps.match2 || null,
          takes_winner_match1: game9Deps.takesWinnerMatch1 !== undefined ? game9Deps.takesWinnerMatch1 : null,
          takes_winner_match2: game9Deps.takesWinnerMatch2 !== undefined ? game9Deps.takesWinnerMatch2 : null,
        });
        
        // Jogo 10: Dupla 16 x Dupla 17
        matchesData.push({
          category_id: categoryId,
          match_number: 10,
          round_type: 'winners',
          team1_id: shuffled[15].id,
          team2_id: shuffled[16].id,
          status: 'pending' as const,
        });
        
        // Jogo 11: Dupla 18 x Dupla 19
        matchesData.push({
          category_id: categoryId,
          match_number: 11,
          round_type: 'winners',
          team1_id: shuffled[17].id,
          team2_id: shuffled[18].id,
          status: 'pending' as const,
        });
        
        // Jogo 12: Vencedor do jogo 4 x Dupla 20
        const game12Deps = dependenciesMap[12] || {};
        matchesData.push({
          category_id: categoryId,
          match_number: 12,
          round_type: 'winners',
          team2_id: shuffled[19].id,
          status: 'pending' as const,
          depends_on_match1: game12Deps.match1 || null,
          depends_on_match2: game12Deps.match2 || null,
          takes_winner_match1: game12Deps.takesWinnerMatch1 !== undefined ? game12Deps.takesWinnerMatch1 : null,
          takes_winner_match2: game12Deps.takesWinnerMatch2 !== undefined ? game12Deps.takesWinnerMatch2 : null,
        });

        // Jogos 13-38: Restante do chaveamento
        for (let i = 13; i <= 38; i++) {
          const deps = dependenciesMap[i] || {};
          let roundType = 'losers';
          if (i === 38) roundType = 'finals';
          else if (i === 37) roundType = 'third_place';
          else if (i >= 35) roundType = 'semifinals';
          else if (i >= 29 && i <= 30) roundType = 'winners';
          
          matchesData.push({
            category_id: categoryId,
            match_number: i,
            round_type: roundType,
            status: 'pending' as const,
            depends_on_match1: deps.match1 || null,
            depends_on_match2: deps.match2 || null,
            takes_winner_match1: deps.takesWinnerMatch1 !== undefined ? deps.takesWinnerMatch1 : null,
            takes_winner_match2: deps.takesWinnerMatch2 !== undefined ? deps.takesWinnerMatch2 : null,
          });
        }
      } else if (numTeams === 24) {
        // 24 duplas - 46 jogos
        // Jogos 1-8: Primeira rodada
        for (let i = 0; i < 8; i++) {
          matchesData.push({
            category_id: categoryId,
            match_number: i + 1,
            round_type: 'winners',
            team1_id: shuffled[i * 2].id,
            team2_id: shuffled[i * 2 + 1].id,
            status: 'pending' as const,
          });
        }

        // Jogos 9-16: Segunda rodada (vencedores da primeira + 8 duplas diretas)
        for (let i = 9; i <= 16; i++) {
          const deps = dependenciesMap[i] || {};
          matchesData.push({
            category_id: categoryId,
            match_number: i,
            round_type: 'winners',
            team2_id: shuffled[16 + (i - 9)].id, // Duplas 17-24 (índices 16-23)
            status: 'pending' as const,
            depends_on_match1: deps.match1 || null,
            depends_on_match2: deps.match2 || null,
            takes_winner_match1: deps.takesWinnerMatch1 !== undefined ? deps.takesWinnerMatch1 : null,
            takes_winner_match2: deps.takesWinnerMatch2 !== undefined ? deps.takesWinnerMatch2 : null,
          });
        }

        // Jogos 17-46: Restante do chaveamento
        for (let i = 17; i <= 46; i++) {
          const deps = dependenciesMap[i] || {};
          let roundType = 'losers';
          if (i === 46) roundType = 'finals';
          else if (i === 45) roundType = 'third_place';
          else if (i >= 43) roundType = 'semifinals';
          else if (i >= 37 && i <= 38) roundType = 'winners';
          
          matchesData.push({
            category_id: categoryId,
            match_number: i,
            round_type: roundType,
            status: 'pending' as const,
            depends_on_match1: deps.match1 || null,
            depends_on_match2: deps.match2 || null,
            takes_winner_match1: deps.takesWinnerMatch1 !== undefined ? deps.takesWinnerMatch1 : null,
            takes_winner_match2: deps.takesWinnerMatch2 !== undefined ? deps.takesWinnerMatch2 : null,
          });
        }
      } else if (numTeams === 25) {
        // 25 duplas - 48 jogos
        // Jogos 1-9: Primeira rodada (18 duplas jogam)
        for (let i = 0; i < 9; i++) {
          matchesData.push({
            category_id: categoryId,
            match_number: i + 1,
            round_type: 'winners',
            team1_id: shuffled[i * 2].id,
            team2_id: shuffled[i * 2 + 1].id,
            status: 'pending' as const,
          });
        }

        // Jogo 10: Perdedor do jogo 2 X perdedor do jogo 3 (só dependências)
        const game10Deps = dependenciesMap[10] || {};
        matchesData.push({
          category_id: categoryId,
          match_number: 10,
          round_type: 'losers',
          status: 'pending' as const,
          depends_on_match1: game10Deps.match1 || null,
          depends_on_match2: game10Deps.match2 || null,
          takes_winner_match1: game10Deps.takesWinnerMatch1 !== undefined ? game10Deps.takesWinnerMatch1 : null,
          takes_winner_match2: game10Deps.takesWinnerMatch2 !== undefined ? game10Deps.takesWinnerMatch2 : null,
        });

        // Jogo 11: Vencedor do jogo 1 x Dupla 19
        const game11Deps = dependenciesMap[11] || {};
        matchesData.push({
          category_id: categoryId,
          match_number: 11,
          round_type: 'winners',
          team2_id: shuffled[18].id, // Dupla 19
          status: 'pending' as const,
          depends_on_match1: game11Deps.match1 || null,
          takes_winner_match1: game11Deps.takesWinnerMatch1 ?? null,
        });

        // Jogo 12: Vencedor do jogo 2 x Vencedor do jogo 3 (só dependências)
        const game12Deps = dependenciesMap[12] || {};
        matchesData.push({
          category_id: categoryId,
          match_number: 12,
          round_type: 'winners',
          status: 'pending' as const,
          depends_on_match1: game12Deps.match1 || null,
          depends_on_match2: game12Deps.match2 || null,
          takes_winner_match1: game12Deps.takesWinnerMatch1 !== undefined ? game12Deps.takesWinnerMatch1 : null,
          takes_winner_match2: game12Deps.takesWinnerMatch2 !== undefined ? game12Deps.takesWinnerMatch2 : null,
        });

        // Jogo 13: Vencedor do jogo 4 x Dupla 20
        const game13Deps = dependenciesMap[13] || {};
        matchesData.push({
          category_id: categoryId,
          match_number: 13,
          round_type: 'winners',
          team2_id: shuffled[19].id, // Dupla 20
          status: 'pending' as const,
          depends_on_match1: game13Deps.match1 || null,
          takes_winner_match1: game13Deps.takesWinnerMatch1 ?? null,
        });

        // Jogo 14: Vencedor do jogo 5 x Dupla 21
        const game14Deps = dependenciesMap[14] || {};
        matchesData.push({
          category_id: categoryId,
          match_number: 14,
          round_type: 'winners',
          team2_id: shuffled[20].id, // Dupla 21
          status: 'pending' as const,
          depends_on_match1: game14Deps.match1 || null,
          takes_winner_match1: game14Deps.takesWinnerMatch1 ?? null,
        });

        // Jogo 15: Vencedor do jogo 6 x Dupla 22
        const game15Deps = dependenciesMap[15] || {};
        matchesData.push({
          category_id: categoryId,
          match_number: 15,
          round_type: 'winners',
          team2_id: shuffled[21].id, // Dupla 22
          status: 'pending' as const,
          depends_on_match1: game15Deps.match1 || null,
          takes_winner_match1: game15Deps.takesWinnerMatch1 ?? null,
        });

        // Jogo 16: Vencedor do jogo 7 x Dupla 23
        const game16Deps = dependenciesMap[16] || {};
        matchesData.push({
          category_id: categoryId,
          match_number: 16,
          round_type: 'winners',
          team2_id: shuffled[22].id, // Dupla 23
          status: 'pending' as const,
          depends_on_match1: game16Deps.match1 || null,
          takes_winner_match1: game16Deps.takesWinnerMatch1 ?? null,
        });

        // Jogo 17: Vencedor do jogo 8 x Dupla 24
        const game17Deps = dependenciesMap[17] || {};
        matchesData.push({
          category_id: categoryId,
          match_number: 17,
          round_type: 'winners',
          team2_id: shuffled[23].id, // Dupla 24
          status: 'pending' as const,
          depends_on_match1: game17Deps.match1 || null,
          takes_winner_match1: game17Deps.takesWinnerMatch1 ?? null,
        });

        // Jogo 18: Vencedor do jogo 9 x Dupla 25
        const game18Deps = dependenciesMap[18] || {};
        matchesData.push({
          category_id: categoryId,
          match_number: 18,
          round_type: 'winners',
          team2_id: shuffled[24].id, // Dupla 25
          status: 'pending' as const,
          depends_on_match1: game18Deps.match1 || null,
          takes_winner_match1: game18Deps.takesWinnerMatch1 ?? null,
        });

        // Jogos 19-48: Restante do chaveamento
        for (let i = 19; i <= 48; i++) {
          const deps = dependenciesMap[i] || {};
          let roundType = 'losers';
          if (i === 48) roundType = 'finals';
          else if (i === 47) roundType = 'third_place';
          else if (i >= 45) roundType = 'semifinals';
          else if (i >= 41 && i <= 42) roundType = 'winners';
          
          matchesData.push({
            category_id: categoryId,
            match_number: i,
            round_type: roundType,
            status: 'pending' as const,
            depends_on_match1: deps.match1 || null,
            depends_on_match2: deps.match2 || null,
            takes_winner_match1: deps.takesWinnerMatch1 !== undefined ? deps.takesWinnerMatch1 : null,
            takes_winner_match2: deps.takesWinnerMatch2 !== undefined ? deps.takesWinnerMatch2 : null,
          });
        }
      } else {
        // 16 duplas - lógica existente
        // Jogos 1-8: Primeira rodada
        for (let i = 0; i < 8; i++) {
          matchesData.push({
            category_id: categoryId,
            match_number: i + 1,
            round_type: 'winners',
            team1_id: shuffled[i * 2].id,
            team2_id: shuffled[i * 2 + 1].id,
            status: 'pending' as const,
          });
        }

        // Jogos 9-30: Restante do chaveamento
        for (let i = 9; i <= 30; i++) {
          const deps = dependenciesMap[i] || {};
          matchesData.push({
            category_id: categoryId,
            match_number: i,
            round_type: i === 30 ? 'finals' : i === 29 ? 'third_place' : i >= 27 ? 'semifinals' : i >= 17 ? 'losers' : 'winners',
            status: 'pending' as const,
            depends_on_match1: deps.match1 || null,
            depends_on_match2: deps.match2 || null,
            takes_winner_match1: deps.takesWinnerMatch1 !== undefined ? deps.takesWinnerMatch1 : null,
            takes_winner_match2: deps.takesWinnerMatch2 !== undefined ? deps.takesWinnerMatch2 : null,
          });
        }
      }

      const { error } = await supabase
        .from('matches')
        .insert(matchesData);

      if (error) throw error;

      toast.success('Chaveamento gerado com sucesso!');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar chaveamento');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCourt = async (matchId: string, courtNumber: number | null) => {
    try {
      if (courtNumber !== null) {
        // Verify the court is free across the entire tournament (any category)
        const { data: occupant, error: checkErr } = await supabase
          .from('matches')
          .select('id, match_number, category_id')
          .eq('court_number', courtNumber)
          .eq('status', 'in_progress')
          .neq('id', matchId)
          .maybeSingle();
        if (checkErr) throw checkErr;
        if (occupant) {
          toast.error(`Quadra ${courtNumber} já está em uso pelo Jogo ${occupant.match_number}`);
          return;
        }
      }

      const { error } = await supabase
        .from('matches')
        .update(
          courtNumber === null
            ? { court_number: null, status: 'pending' as const }
            : { court_number: courtNumber, status: 'in_progress' as const }
        )
        .eq('id', matchId);
      if (error) throw error;

      toast.success(
        courtNumber === null
          ? 'Jogo retirado da quadra'
          : `Jogo iniciado na Quadra ${courtNumber}`
      );
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar quadra');
    }
  };

  const handleUpdateMatch = async (matchId: string, winnerId: string) => {
    try {
      // Update the match with winner and free up the court
      const { error } = await supabase
        .from('matches')
        .update({ winner_id: winnerId, status: 'completed', court_number: null })
        .eq('id', matchId);

      if (error) throw error;

      // Call edge function to progress the bracket
      // The Supabase client automatically includes the auth token
      const { error: progressError } = await supabase.functions.invoke('progress-bracket', {
        body: { matchId, categoryId }
      });

      if (progressError) {
        console.error('Error progressing bracket:', progressError);
        toast.error('Resultado salvo, mas erro ao avançar times: ' + progressError.message);
      } else {
        toast.success('Resultado atualizado e times avançados!');
      }

      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar resultado');
    }
  };

  const handleResetMatch = async (matchId: string) => {
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;

      // Find all matches that depend on this match
      const dependentMatches = matches.filter(m => 
        m.depends_on_match1 === match.match_number || 
        m.depends_on_match2 === match.match_number
      );

      // Clear the winner and reset status
      const { error: matchError } = await supabase
        .from('matches')
        .update({ 
          winner_id: null, 
          status: 'pending' 
        })
        .eq('id', matchId);

      if (matchError) throw matchError;

      // Clear teams from dependent matches
      for (const depMatch of dependentMatches) {
        const updates: any = { status: 'pending' };
        
        if (depMatch.depends_on_match1 === match.match_number) {
          updates.team1_id = null;
        }
        if (depMatch.depends_on_match2 === match.match_number) {
          updates.team2_id = null;
        }

        const { error: depError } = await supabase
          .from('matches')
          .update(updates)
          .eq('id', depMatch.id);

        if (depError) throw depError;
      }

      toast.success('Resultado resetado com sucesso!');
      loadData();
      setResetMatchId(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao resetar resultado');
    }
  };

  const handleSaveTeamName = async (teamId: string) => {
    if (!editingTeamName.trim()) {
      toast.error('O nome da dupla não pode estar vazio');
      return;
    }

    try {
      const { error } = await supabase
        .from('teams')
        .update({ name: editingTeamName.trim() })
        .eq('id', teamId);

      if (error) throw error;

      toast.success('Nome da dupla atualizado!');
      setEditingTeamId(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar nome');
    }
  };

  const handleCompleteCategory = async () => {
    try {
      const numTeams = category?.num_teams || 16;
      const finalMatchNumber = numTeams === 8 ? 14 : numTeams === 12 ? 22 : numTeams === 16 ? 30 : numTeams === 20 ? 38 : 46;
      const thirdPlaceMatchNumber = numTeams === 8 ? 13 : numTeams === 12 ? 21 : numTeams === 16 ? 29 : numTeams === 20 ? 37 : 45;
      
      // Check if final match is completed
      const finalMatch = matches.find(m => m.match_number === finalMatchNumber);
      const thirdPlaceMatch = matches.find(m => m.match_number === thirdPlaceMatchNumber);
      
      if (!finalMatch?.winner_id || !thirdPlaceMatch?.winner_id) {
        toast.error('É necessário completar a final e o jogo de 3º lugar antes de finalizar a categoria');
        return;
      }

      setLoading(true);
      const { error } = await supabase
        .from('categories')
        .update({ status: 'completed' })
        .eq('id', categoryId);

      if (error) throw error;

      toast.success('Categoria finalizada com sucesso!');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao finalizar categoria');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Gerenciar Duplas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <form onSubmit={handleAddTeam} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Nome da dupla"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
          </form>

          <div className="border-t border-border pt-4">
            <form onSubmit={handleAddBulkTeams} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="bulkTeams">Adicionar Várias Duplas (uma por linha)</Label>
                <Textarea
                  id="bulkTeams"
                  placeholder="Ryan e Mendes&#10;Luquinhas e Enzo&#10;Pedro e João"
                  value={bulkTeamNames}
                  onChange={(e) => setBulkTeamNames(e.target.value)}
                  className="min-h-[120px]"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Cole os nomes das duplas, uma por linha. Exemplo: "Ryan e Mendes"
                </p>
              </div>
              <Button type="submit" disabled={loading} className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                {loading ? 'Adicionando...' : 'Adicionar Múltiplas Duplas'}
              </Button>
            </form>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {teams.length}/{category?.num_teams || 16} duplas cadastradas
          </div>

          {teams.length === (category?.num_teams || 16) && matches.length === 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="shuffleTeams"
                  checked={shuffleTeams}
                  onChange={(e) => setShuffleTeams(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <Label htmlFor="shuffleTeams" className="cursor-pointer text-sm">
                  Sortear duplas aleatoriamente
                </Label>
              </div>
              <Button onClick={handleGenerateBracket} disabled={loading} className="w-full gap-2">
                <Shuffle className="w-4 h-4" />
                <span className="text-sm sm:text-base">
                  {loading ? 'Gerando...' : shuffleTeams ? 'Gerar Chaveamento (Sortear)' : 'Gerar Chaveamento (Manter Ordem)'}
                </span>
              </Button>
            </div>
          )}

          <div className="grid gap-2 mt-4">
            {teams.map((team, idx) => (
              <div key={team.id} className="p-2 sm:p-3 rounded border border-border flex items-center justify-between gap-2">
                {editingTeamId === team.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-medium text-sm sm:text-base">#{idx + 1} -</span>
                    <Input
                      value={editingTeamName}
                      onChange={(e) => setEditingTeamName(e.target.value)}
                      className="flex-1 h-8"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTeamName(team.id);
                        if (e.key === 'Escape') setEditingTeamId(null);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveTeamName(team.id)}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTeamId(null)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-sm sm:text-base">#{idx + 1} - {team.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTeamId(team.id);
                        setEditingTeamName(team.name);
                      }}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Atualizar Resultados</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
              {matches
                .filter((match) => {
                  // Only show matches that have both teams assigned
                  const team1 = teams.find(t => t.id === match.team1_id);
                  const team2 = teams.find(t => t.id === match.team2_id);
                  return team1 && team2;
                })
                .map((match) => {
                  const team1 = teams.find(t => t.id === match.team1_id);
                  const team2 = teams.find(t => t.id === match.team2_id);

                  return (
                    <div key={match.id} className="p-3 sm:p-4 rounded-lg border border-border space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="font-bold text-primary text-sm sm:text-base">Jogo {match.match_number}</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {match.status !== 'completed' && (
                            <>
                              {match.court_number && (
                                <span className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded font-bold">
                                  EM QUADRA {match.court_number}
                                </span>
                              )}
                              <select
                                value={match.court_number ?? ''}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  handleAssignCourt(match.id, v === '' ? null : Number(v));
                                }}
                                className="text-xs bg-background border border-border rounded px-2 py-1"
                              >
                                <option value="">Sem quadra</option>
                                <option value="1">Quadra 1</option>
                                <option value="2">Quadra 2</option>
                                <option value="3">Quadra 3</option>
                                <option value="4">Quadra 4</option>
                              </select>
                            </>
                          )}
                          {match.status === 'completed' && (
                            <>
                              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                                Finalizado
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setResetMatchId(match.id)}
                                className="h-7 px-2 text-muted-foreground hover:text-destructive"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant={match.winner_id === team1!.id ? 'default' : 'outline'}
                          className="flex-1 text-sm sm:text-base"
                          onClick={() => handleUpdateMatch(match.id, team1!.id)}
                          disabled={match.status === 'completed'}
                        >
                          <span className="truncate">{team1!.name}</span>
                        </Button>
                        <Button
                          variant={match.winner_id === team2!.id ? 'default' : 'outline'}
                          className="flex-1 text-sm sm:text-base"
                          onClick={() => handleUpdateMatch(match.id, team2!.id)}
                          disabled={match.status === 'completed'}
                        >
                          <span className="truncate">{team2!.name}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
            {matches.filter(m => {
              const team1 = teams.find(t => t.id === m.team1_id);
              const team2 = teams.find(t => t.id === m.team2_id);
              return team1 && team2;
            }).length === 0 && (
              <p className="text-center py-6 text-muted-foreground text-sm sm:text-base">
                Nenhum jogo disponível ainda. Complete os jogos anteriores primeiro.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {matches.length > 0 && category?.status === 'active' && (
        <Card className="border-green-500/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Finalizar Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Finalize a categoria quando a final e o jogo de 3º lugar estiverem completos. 
                Isso exibirá o pódio com as colocações finais para o público.
              </p>
              <Button 
                onClick={handleCompleteCategory} 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Finalizando...' : 'Finalizar Categoria'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {category?.status === 'completed' && (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="text-center py-6 sm:py-8 px-4">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mx-auto mb-2" />
            <p className="text-base sm:text-lg font-semibold text-green-600">Categoria Finalizada</p>
            <p className="text-sm text-muted-foreground mt-2">
              O pódio está sendo exibido para o público
            </p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!resetMatchId} onOpenChange={(open) => !open && setResetMatchId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar resultado do jogo?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá limpar o vencedor deste jogo e também removerá os times que avançaram automaticamente para as próximas rodadas. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => resetMatchId && handleResetMatch(resetMatchId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Resetar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MatchManager;
