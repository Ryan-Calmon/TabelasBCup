import { supabase } from '@/integrations/supabase/client';

const DEFAULT_TOURNAMENT_NAME = 'BrothersCup';

export const getOrCreateDefaultTournament = async () => {
  // Check if default tournament exists by name
  let { data: tournaments, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('name', DEFAULT_TOURNAMENT_NAME)
    .limit(1);

  // If it exists, return the first one
  if (tournaments && tournaments.length > 0) {
    return tournaments[0];
  }

  // If it doesn't exist, create it (without specifying ID - let DB generate UUID)
  const { data: newTournament, error: createError } = await supabase
    .from('tournaments')
    .insert({
      name: DEFAULT_TOURNAMENT_NAME,
      status: 'active'
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating default tournament:', createError);
    return null;
  }

  return newTournament;
};

export const getDefaultTournamentId = async () => {
  const tournament = await getOrCreateDefaultTournament();
  return tournament?.id || null;
};
