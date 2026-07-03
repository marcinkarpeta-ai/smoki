import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLAYER_EMAIL = 'player@smoki.local';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Brak autoryzacji' }, 401);
    }

    // Verify caller is admin
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return json({ error: 'Nieautoryzowany dostęp' }, 401);
    }
    const currentUserId = claimsData.claims.sub;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: currentUserId,
      _role: 'admin'
    });
    if (roleError || !isAdmin) {
      return json({ error: 'Tylko administrator może zmienić hasło zawodnika' }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const password = typeof body?.password === 'string' ? body.password : '';
    if (password.length < 8) {
      return json({ error: 'Hasło musi mieć co najmniej 8 znaków' }, 400);
    }
    if (password.length > 128) {
      return json({ error: 'Hasło jest za długie' }, 400);
    }

    // Find existing player user by email
    let playerUserId: string | null = null;
    let page = 1;
    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) {
        console.error('listUsers error:', error);
        return json({ error: 'Błąd wyszukiwania konta zawodnika' }, 500);
      }
      const found = data.users.find(u => u.email === PLAYER_EMAIL);
      if (found) { playerUserId = found.id; break; }
      if (data.users.length < 200) break;
      page++;
      if (page > 50) break;
    }

    if (playerUserId) {
      const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(playerUserId, {
        password,
      });
      if (updErr) {
        console.error('updateUserById error:', updErr);
        return json({ error: updErr.message }, 400);
      }
    } else {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: PLAYER_EMAIL,
        password,
        email_confirm: true,
      });
      if (createErr || !created.user) {
        console.error('createUser error:', createErr);
        return json({ error: createErr?.message ?? 'Nie udało się utworzyć konta zawodnika' }, 400);
      }
      playerUserId = created.user.id;
    }

    // Ensure the 'player' role is assigned (single role per user in this app)
    await supabaseAdmin.from('user_roles').delete().eq('user_id', playerUserId);
    const { error: roleInsErr } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: playerUserId, role: 'player' });
    if (roleInsErr) {
      console.error('role insert error:', roleInsErr);
      return json({ error: 'Hasło ustawione, ale nie udało się przypisać roli' }, 500);
    }

    // Record hash for audit / future features (optional, best-effort)
    try {
      await supabaseAdmin.from('player_access').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabaseAdmin.from('player_access').insert({
        password_hash: 'stored-in-auth-users',
        updated_by: currentUserId,
      });
    } catch (_) { /* non-fatal */ }

    return json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return json({ error: 'Wystąpił nieoczekiwany błąd' }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}