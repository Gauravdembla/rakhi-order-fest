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
  const out: any[] = [];
  for (const email of ['support@shreedembla.com', 'ea@bootstrapdigitalsolutions.com']) {
    const password = randomPassword();
    let userId: string | null = null;
    const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = list?.users?.find((u) => (u.email ?? '').toLowerCase() === email);
      if (!found) { out.push({ email, error: error.message }); continue; }
      userId = found.id;
      await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
    } else userId = created.user!.id;
    const { error: insErr } = await admin.from('admin_users').upsert({ user_id: userId, email, role: 'team' }, { onConflict: 'user_id' });
    out.push({ email, password, error: insErr?.message ?? null });
  }
  return new Response(JSON.stringify({ ok: true, accounts: out }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
