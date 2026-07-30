import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

function randomPassword(len = 14) {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789@#$%';
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => chars[b % chars.length]).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);
  const { data: userData, error: userErr } = await admin.auth.getUser(authHeader.slice(7));
  if (userErr || !userData?.user) return json({ error: 'Unauthorized' }, 401);

  const { data: me } = await admin
    .from('admin_users').select('role').eq('user_id', userData.user.id).maybeSingle();
  if (!me) return json({ error: 'Not an admin' }, 403);
  if (me.role !== 'owner') return json({ error: 'Owner access required' }, 403);

  const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
  const action = body?.action ?? 'list';

  if (action === 'list') {
    const { data, error } = await admin
      .from('admin_users').select('user_id, email, role, created_at').order('created_at');
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, members: data });
  }

  if (action === 'create') {
    const email = String(body.email ?? '').trim().toLowerCase();
    const role = body.role === 'owner' ? 'owner' : 'team';
    if (!email || !email.includes('@')) return json({ error: 'Valid email required' }, 400);
    const password = String(body.password ?? '').trim() || randomPassword();

    let userId: string | null = null;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (createErr) {
      // user may already exist — find and reset their password
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = list?.users?.find((u) => (u.email ?? '').toLowerCase() === email);
      if (!found) return json({ error: createErr.message }, 400);
      userId = found.id;
      await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
    } else {
      userId = created.user!.id;
    }

    const { error: insErr } = await admin
      .from('admin_users').upsert({ user_id: userId, email, role }, { onConflict: 'user_id' });
    if (insErr) return json({ error: insErr.message }, 500);

    return json({ ok: true, email, password, role });
  }

  if (action === 'reset_password') {
    const userId = String(body.user_id ?? '');
    if (!userId) return json({ error: 'user_id required' }, 400);
    const password = randomPassword();
    const { error } = await admin.auth.admin.updateUserById(userId, { password });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, password });
  }

  if (action === 'remove') {
    const userId = String(body.user_id ?? '');
    if (!userId) return json({ error: 'user_id required' }, 400);
    if (userId === userData.user.id) return json({ error: 'You cannot remove yourself' }, 400);
    const { error } = await admin.from('admin_users').delete().eq('user_id', userId);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  return json({ error: 'Unknown action' }, 400);
});
