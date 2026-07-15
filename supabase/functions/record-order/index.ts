import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();

    const required = ['client_order_id', 'customer_name', 'customer_email', 'customer_phone', 'amount'];
    for (const k of required) {
      if (!body[k]) {
        return new Response(JSON.stringify({ error: `Missing field: ${k}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const row = {
      client_order_id: String(body.client_order_id),
      customer_name: String(body.customer_name),
      customer_email: String(body.customer_email),
      customer_phone: String(body.customer_phone),
      address1: body.address1 ?? null,
      address2: body.address2 ?? null,
      city: body.city ?? null,
      pincode: body.pincode ?? null,
      chakra_qty: Number(body.chakra_qty ?? 0),
      prosperity_qty: Number(body.prosperity_qty ?? 0),
      hooponopono_qty: Number(body.hooponopono_qty ?? 0),
      total_qty: Number(body.total_qty ?? 0),
      amount: Number(body.amount),
      currency: body.currency ?? 'INR',
      status: body.status ?? 'success',
      razorpay_order_id: body.razorpay_order_id ?? null,
      razorpay_payment_id: body.razorpay_payment_id ?? null,
      razorpay_signature: body.razorpay_signature ?? null,
      fan_id: body.fan_id ?? null,
      raw_payload: body.raw_payload ?? body,
    };

    const { data, error } = await supabase
      .from('orders')
      .upsert(row, { onConflict: 'client_order_id' })
      .select()
      .single();

    if (error) {
      console.error('[record-order] db error:', error);
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[record-order] saved order:', data.id);
    return new Response(JSON.stringify({ ok: true, order: data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[record-order] error:', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});