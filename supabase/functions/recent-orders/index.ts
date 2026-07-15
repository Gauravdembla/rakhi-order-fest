import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('customer_name, city, total_qty, created_at')
      .in('status', ['success', 'pending'])
      .gt('total_qty', 0)
      .order('created_at', { ascending: false })
      .limit(40);

    if (error) throw error;

    const sanitized = (data ?? [])
      .filter((r) => r.customer_name && r.city)
      .map((r) => {
        const firstName = titleCase(String(r.customer_name).trim().split(/\s+/)[0] ?? '');
        const city = titleCase(String(r.city).trim());
        return { name: firstName, city, qty: Number(r.total_qty) || 1 };
      })
      .filter((r) => r.name.length > 0 && r.city.length > 0);

    return new Response(JSON.stringify({ orders: sanitized }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[recent-orders] error:', err);
    return new Response(JSON.stringify({ orders: [], error: String(err) }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});