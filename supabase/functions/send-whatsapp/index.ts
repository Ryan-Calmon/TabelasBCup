import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Validate auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse request body
    const { match_id, team_id, time_estimate, court_number } = await req.json();

    if (!match_id || !team_id || !time_estimate) {
      return new Response(
        JSON.stringify({ error: 'match_id, team_id, and time_estimate are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Service role client for DB operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 4. Fetch team phone
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('id, name, phone')
      .eq('id', team_id)
      .single();

    if (teamError || !team) {
      return new Response(
        JSON.stringify({ error: 'Team not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!team.phone) {
      return new Response(
        JSON.stringify({ error: 'Team has no phone number registered' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Fetch match details (both team names)
    const { data: match, error: matchError } = await supabaseAdmin
      .from('matches')
      .select(`
        match_number,
        team1:teams!matches_team1_id_fkey(name),
        team2:teams!matches_team2_id_fkey(name)
      `)
      .eq('id', match_id)
      .single();

    if (matchError || !match) {
      return new Response(
        JSON.stringify({ error: 'Match not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const team1Name = (match.team1 as any)?.name ?? 'TBD';
    const team2Name = (match.team2 as any)?.name ?? 'TBD';

    // 6. Send WhatsApp message via Meta Cloud API
    const whatsappToken = Deno.env.get('WHATSAPP_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    const templateName = Deno.env.get('WHATSAPP_TEMPLATE_NAME') ?? 'match_notification';

    if (!whatsappToken || !phoneNumberId) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const whatsappPayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: team.phone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: String(match.match_number) },
              { type: 'text', text: team1Name },
              { type: 'text', text: team2Name },
              { type: 'text', text: String(time_estimate) },
            ],
          },
        ],
      },
    };

    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(whatsappPayload),
      }
    );

    const whatsappResult = await whatsappResponse.json();

    // 7. Record notification in DB
    if (whatsappResponse.ok) {
      await supabaseAdmin.from('match_notifications').insert({
        match_id,
        team_id,
        phone: team.phone,
        time_estimate,
        court_number: court_number ?? null,
        status: 'sent',
      });

      return new Response(
        JSON.stringify({ success: true, message_id: whatsappResult.messages?.[0]?.id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const errorMsg = whatsappResult.error?.message ?? 'Unknown WhatsApp API error';

      await supabaseAdmin.from('match_notifications').insert({
        match_id,
        team_id,
        phone: team.phone,
        time_estimate,
        court_number: court_number ?? null,
        status: 'failed',
        error_message: errorMsg,
      });

      return new Response(
        JSON.stringify({ error: `WhatsApp API error: ${errorMsg}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
