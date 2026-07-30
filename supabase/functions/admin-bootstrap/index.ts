import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  // Public status check: is an admin already set up?
  if (req.method === 'GET') {
    const { count, error } = await admin.from('admin_users').select('*', { count: 'exact', head: true });
    if (error) return json({ error: error.message }, 500);
    return json({ bootstrapped: (count ?? 0) > 0 });
  }

  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);
  const token = authHeader.slice(7);

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: userData, error: userErr } = await userClient.auth.getUser(token);
  if (userErr || !userData?.user) return json({ error: 'Unauthorized' }, 401);
  const user = userData.user;

  // Only allow bootstrap when admin_users is empty (first-run)
  const { count, error: countErr } = await admin
    .from('admin_users')
    .select('*', { count: 'exact', head: true });
  if (countErr) return json({ error: countErr.message }, 500);

  if ((count ?? 0) > 0) {
    // Already bootstrapped — check if the caller is one of the admins
    const { data: existing } = await admin
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (existing) return json({ ok: true, isAdmin: true, alreadyBootstrapped: true });
    return json({ ok: false, error: 'Admin already exists. Contact the existing admin to be added.' }, 403);
  }

  const { error: insErr } = await admin
    .from('admin_users')
    .insert({ user_id: user.id, email: user.email ?? '' });
  if (insErr) return json({ ok: false, error: insErr.message }, 500);

  return json({ ok: true, isAdmin: true, bootstrapped: true });
});