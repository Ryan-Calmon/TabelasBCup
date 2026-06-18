import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { progressionRules8, progressionRules9, progressionRules12, progressionRules14, progressionRules16, progressionRules18, progressionRules20, progressionRules24, progressionRules25 } from './bracket-rules.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header (Supabase automatically validates JWT when verify_jwt is enabled)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No auth token provided' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Create authenticated Supabase client (will use RLS policies)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { Authorization: authHeader } 
        }
      }
    );

    // Verify admin role using RLS-protected query
    // This will automatically fail if user is not authenticated or not admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.log('Admin role verification failed:', roleError?.message || 'No admin role found');
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: corsHeaders }
      );
    }

    const { matchId, categoryId } = await req.json();

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!matchId || !categoryId || !uuidRegex.test(matchId) || !uuidRegex.test(categoryId)) {
      console.log('Invalid UUID format for matchId or categoryId');
      return new Response(
        JSON.stringify({ error: 'Invalid ID format' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize admin client for database operations after authorization
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Fetch the completed match
    const { data: completedMatch, error: matchError } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !completedMatch) {
      console.error('Error fetching match:', matchError);
      return new Response(
        JSON.stringify({ error: 'Match not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Validate match belongs to specified category
    if (completedMatch.category_id !== categoryId) {
      console.log('Match does not belong to specified category');
      return new Response(
        JSON.stringify({ error: 'Match does not belong to specified category' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate match is completed
    if (completedMatch.status !== 'completed') {
      console.log('Match is not in completed status:', completedMatch.status);
      return new Response(
        JSON.stringify({ error: 'Match is not completed' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch category to determine bracket type
    const { data: categoryData, error: categoryError } = await supabaseAdmin
      .from('categories')
      .select('num_teams')
      .eq('id', categoryId)
      .single();

    if (categoryError || !categoryData) {
      console.error('Error fetching category:', categoryError);
      return new Response(
        JSON.stringify({ error: 'Category not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Select appropriate progression rules based on number of teams
    const progressionRules = categoryData.num_teams === 8 ? progressionRules8 
      : categoryData.num_teams === 9 ? progressionRules9
      : categoryData.num_teams === 12 ? progressionRules12 
      : categoryData.num_teams === 14 ? progressionRules14
      : categoryData.num_teams === 16 ? progressionRules16
      : categoryData.num_teams === 18 ? progressionRules18
      : categoryData.num_teams === 20 ? progressionRules20
      : categoryData.num_teams === 25 ? progressionRules25
      : progressionRules24;

    // Fetch all matches for this category
    const { data: allMatches, error: allMatchesError } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('category_id', categoryId);

    if (allMatchesError) {
      console.error('Error fetching all matches:', allMatchesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch matches' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Filter progression rules for the completed match
    const applicableRules = progressionRules.filter(
      rule => rule.sourceMatch === completedMatch.match_number
    );

    console.log(`Processing ${applicableRules.length} progression rules for match ${completedMatch.match_number}`);

    // Process each applicable rule
    for (const rule of applicableRules) {
      // Determine which team advances
      const advancingTeamId = rule.takesWinner 
        ? completedMatch.winner_id 
        : (completedMatch.team1_id === completedMatch.winner_id 
            ? completedMatch.team2_id 
            : completedMatch.team1_id);

      // Find the target match
      const targetMatch = allMatches?.find(m => m.match_number === rule.targetMatch);
      
      if (!targetMatch) {
        console.error(`Target match ${rule.targetMatch} not found`);
        continue;
      }

      // Update the target match with the advancing team
      const updateData: any = {};
      if (rule.position === 'team1') {
        updateData.team1_id = advancingTeamId;
      } else {
        updateData.team2_id = advancingTeamId;
      }

      // If both teams are now assigned, set status to pending
      if (
        (rule.position === 'team1' && targetMatch.team2_id) ||
        (rule.position === 'team2' && targetMatch.team1_id)
      ) {
        updateData.status = 'pending';
      }

      const { error: updateError } = await supabaseAdmin
        .from('matches')
        .update(updateData)
        .eq('id', targetMatch.id);

      if (updateError) {
        console.error(`Error updating match ${rule.targetMatch}:`, updateError);
      } else {
        console.log(`Updated match ${rule.targetMatch} - ${rule.position} = ${advancingTeamId}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in progress-bracket:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});
