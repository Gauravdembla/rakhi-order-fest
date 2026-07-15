import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const KV_KEY = "tagmango_token";
const TM_BASE = "https://api-prod-new.tagmango.com";
const TM_WHITELABEL_HOST = "learn.angelsonearthhub.com";
const TM_WHITELABEL_CREATOR = "66f1851e9b5fc4e6c571a7ab";

const sanitize = (s: string) =>
  (s ?? "").trim().replace(/^["']|["']$/g, "").replace(/[^\x20-\x7E]/g, "");

const normPhone = (p?: string) =>
  (p ?? "").replace(/\D+/g, "").replace(/^0+/, "");

const normEmail = (e?: string) => (e ?? "").trim().toLowerCase();

async function getTagmangoToken(): Promise<string> {
  const accountId = Deno.env.get("CF_ACCOUNT_ID");
  const namespaceId = Deno.env.get("CF_NAMESPACE_ID");
  const cfToken = sanitize(Deno.env.get("CF_API_TOKEN") ?? "");
  if (!accountId || !namespaceId || !cfToken) {
    throw new Error("Missing Cloudflare KV env vars");
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${KV_KEY}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${cfToken}` } });
  if (!res.ok) throw new Error(`KV fetch failed: ${res.status}`);

  let raw = (await res.text()).trim();
  if (raw.startsWith("{")) {
    try {
      const obj = JSON.parse(raw);
      raw = obj.token || obj.access_token || "";
    } catch {
      throw new Error("Invalid JSON token in KV");
    }
  }
  const token = sanitize(raw);
  if (!token) throw new Error("TagMango token is empty");
  return token;
}

function tmHeaders(token: string) {
  return {
    "accept": "application/json, text/plain, */*",
    "content-type": "application/json",
    "authorization": `Bearer ${token}`,
    "origin": `https://${TM_WHITELABEL_HOST}`,
    "referer": `https://${TM_WHITELABEL_HOST}/`,
    "x-whitelabel-host": TM_WHITELABEL_HOST,
    "x-whitelabel-creator": TM_WHITELABEL_CREATOR,
    "x-platform": "web",
    "x-timezone-name": "Asia/Calcutta",
    "x-timezone-offset": "330",
    "x-page-url": "/web/dashboard/subscribers",
  };
}

type Lookup = { email?: string; phone?: string };

function toParticipant(match: any) {
  const dialCode = (match.dialCode ?? "").toString();
  const phoneDigits = normPhone(`${dialCode}${match.fanPhone ?? ""}`);
  return {
    fanId: String(match.fanId ?? "").trim(),
    fanName: match.fanName ?? "Unknown",
    fanEmail: match.fanEmail ?? null,
    phone: phoneDigits || null,
    dialCode: dialCode || null,
    profilePicUrl: match.fanProfilePicUrl ?? null,
  };
}

async function searchByTerm(token: string, term: string) {
  const body = {
    page: 1,
    pageSize: 25,
    type: "all",
    affiliateType: "all",
    spreadSubscribers: true,
    term,
  };
  const res = await fetch(`${TM_BASE}/v2/subscribers`, {
    method: "POST",
    headers: tmHeaders(token),
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    throw new Error("TagMango token expired — refresh Cloudflare KV key `tagmango_token`");
  }
  if (!res.ok) {
    const txt = (await res.text()).slice(0, 300);
    throw new Error(`TagMango ${res.status}: ${txt}`);
  }
  const json = await res.json();
  const total = json?.result?.totalUserCount;
  const subs: any[] =
    json?.result?.subscribers ?? json?.result ?? json?.subscribers ?? [];
  console.log(`[lookup] term="${term}" totalUserCount=${total} returned=${subs.length}`);
  return { total, subs };
}

async function findParticipant({ email, phone }: Lookup) {
  const e = normEmail(email);
  const pFull = normPhone(phone);
  if (!e && !pFull) throw new Error("Provide email or phone");

  const token = await getTagmangoToken();

  // Step A — search by phone (bare digits, without country code)
  if (pFull) {
    const pBare = pFull.length > 10 ? pFull.slice(-10) : pFull;
    const { subs } = await searchByTerm(token, pBare);
    const match = subs.find((s: any) => {
      const bare = normPhone(s.fanPhone);
      const full = normPhone(`${s.dialCode ?? ""}${s.fanPhone ?? ""}`);
      return bare === pBare || full.endsWith(pBare) || bare.endsWith(pBare);
    });
    if (match) {
      console.log("[lookup] matched by phone fanId=", match.fanId);
      return toParticipant(match);
    }
  }

  // Step B — search by email
  if (e) {
    const { subs } = await searchByTerm(token, e);
    const match = subs.find((s: any) => normEmail(s.fanEmail) === e);
    if (match) {
      console.log("[lookup] matched by email fanId=", match.fanId);
      return toParticipant(match);
    }
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, phone } = await req.json().catch(() => ({}));
    if (!email && !phone) {
      return new Response(
        JSON.stringify({ error: "email or phone required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const participant = await findParticipant({ email, phone });
    return new Response(
      JSON.stringify({ found: !!participant, participant }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[lookup-tagmango-participant] error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});