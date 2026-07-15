import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const PABBLY_URL = "https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjYwNTZlMDYzMjA0MzA1MjZmNTUzNjUxM2Ii_pc";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const payload = await req.json();
    const enriched = {
      event: payload.event || "checkout_initiated",
      timestamp: new Date().toISOString(),
      ...payload,
    };

    const resp = await fetch(PABBLY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enriched),
    });
    const text = await resp.text();
    console.log("[notify-order-webhook] pabbly status:", resp.status, text.slice(0, 200));

    return new Response(
      JSON.stringify({ ok: resp.ok, status: resp.status }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    console.error("[notify-order-webhook] error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});