import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const SECRET = Deno.env.get('RAZORPAY_MATCH_WEBHOOK_SECRET') ?? '';
const PROJECT_ID = 'pmwnxcyltqbdziwufwxs';
const NOTIFY_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/notify-order-webhook`;

const digits = (v: unknown) => String(v ?? '').replace(/\D/g, '');
const last10 = (v: unknown) => digits(v).slice(-10);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const provided = req.headers.get('x-webhook-secret') ?? '';
  let authorized = !!SECRET && provided === SECRET;
  let usedKeyId: string | null = null;
  if (!authorized && provided) {
    const { data: keyRow } = await supabase
      .from('webhook_keys')
      .select('id, revoked_at')
      .eq('secret', provided)
      .maybeSingle();
    if (keyRow && !keyRow.revoked_at) {
      authorized = true;
      usedKeyId = keyRow.id;
    }
  }
  if (!authorized) return json({ error: 'Unauthorized' }, 401);
  if (usedKeyId) {
    supabase.from('webhook_keys').update({ last_used_at: new Date().toISOString() }).eq('id', usedKeyId).then(() => {});
  }

  let body: any = {};
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const email = String(body.email ?? '').trim().toLowerCase();
  const phone10 = last10(body.phone);
  const clientOrderId = body.client_order_id ? String(body.client_order_id) : null;
  const paymentId = body.razorpay_payment_id ? String(body.razorpay_payment_id) : null;

  // Find candidate by priority: client_order_id > email > phone
  let match: any = null;

  if (clientOrderId) {
    const { data } = await supabase.from('orders').select('*').eq('client_order_id', clientOrderId).maybeSingle();
    if (data) match = data;
  }
  if (!match && email) {
    const { data } = await supabase.from('orders').select('*')
      .ilike('customer_email', email)
      .neq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data && data.length) {
      match = data.find((r: any) => r.status === 'pending') ?? data[0];
    }
  }
  if (!match && phone10) {
    const { data } = await supabase.from('orders').select('*')
      .neq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) {
      const filtered = data.filter((r: any) => last10(r.customer_phone) === phone10);
      if (filtered.length) match = filtered.find((r: any) => r.status === 'pending') ?? filtered[0];
    }
  }

  const updateFields = {
    status: 'success',
    razorpay_payment_id: paymentId,
    razorpay_order_id: body.razorpay_order_id ?? null,
    razorpay_signature: body.razorpay_signature ?? null,
    amount: body.amount != null ? Number(body.amount) : (match?.amount ?? 0),
  };

  let saved: any = null;
  let matched = false;

  if (match) {
    matched = true;
    const mergedRaw = { ...(match.raw_payload ?? {}), razorpay_match: body };
    const { data, error } = await supabase.from('orders')
      .update({ ...updateFields, raw_payload: mergedRaw })
      .eq('id', match.id)
      .select()
      .single();
    if (error) return json({ ok: false, error: error.message }, 500);
    saved = data;
  } else {
    // No match — insert a new success row so it's still captured
    const newClientId = clientOrderId ?? (paymentId ? `rzp_${paymentId}` : `rzp_${Date.now()}`);
    const row = {
      client_order_id: newClientId,
      customer_name: String(body.customer_name ?? body.name ?? 'Unknown'),
      customer_email: email || 'unknown@unknown',
      customer_phone: digits(body.phone) || 'unknown',
      amount: Number(body.amount ?? 0),
      currency: body.currency ?? 'INR',
      status: 'success',
      razorpay_payment_id: paymentId,
      razorpay_order_id: body.razorpay_order_id ?? null,
      razorpay_signature: body.razorpay_signature ?? null,
      raw_payload: { razorpay_match: body },
    };
    const { data, error } = await supabase.from('orders').insert(row).select().single();
    if (error) return json({ ok: false, error: error.message }, 500);
    saved = data;
  }

  // Notify Pabbly
  try {
    await fetch(NOTIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'payment_success', ...saved }),
    });
  } catch (err) {
    console.error('[razorpay-payment-match] pabbly notify failed:', err);
  }

  return json({ ok: true, matched, order_id: saved.id, client_order_id: saved.client_order_id });
});