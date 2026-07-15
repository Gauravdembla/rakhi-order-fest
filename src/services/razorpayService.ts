/**
 * Razorpay Payment Service
 * Handles integration with Razorpay checkout and Cloudflare Worker backend
 */

const API_BASE = "https://square-surf-2287.connect-17d.workers.dev";
const BRAND_COLOR = "#d669d8";

import { supabase } from "@/integrations/supabase/client";

export interface PaymentConfig {
  amount: number; // in INR
  name: string;
  email: string;
  phone: string;
  clientOrderId: string;
  address1?: string;
  address2?: string;
  city?: string;
  pincode?: string;
  fanId?: string;
}

export interface PaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface CreateSessionResponse {
  ok: boolean;
  orderId?: string;
  keyId?: string;
  amount?: number;
  currency?: string;
  options?: Record<string, any>;
  clientOrderId?: string;
  err?: string;
  step?: string;
  status?: number;
  body?: string;
}

export interface PaymentOutcome {
  status: "success" | "failed" | "abandoned" | "pending";
  data?: PaymentResponse;
  error?: any;
}

export function escapeHtml(s: string | number): string {
  return String(s || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m] || m));
}

export async function createPaymentSession(
  config: PaymentConfig
): Promise<CreateSessionResponse> {
  try {
    const response = await fetch(`${API_BASE}/create-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: config.amount,
        name: config.name,
        email: config.email,
        phone: config.phone,
        clientOrderId: config.clientOrderId,
        address1: config.address1,
        address2: config.address2,
        city: config.city,
        pincode: config.pincode,
        fanId: config.fanId,
      }),
    });
    const data = await response.json();
    console.log("[razorpayService] create-session response:", data);
    return data;
  } catch (error) {
    console.error("[razorpayService] create-session error:", error);
    return { ok: false, err: String(error) };
  }
}

/**
 * Detects TagMango 409 conflict from the Cloudflare worker response.
 */
function isTagmangoConflict(res: CreateSessionResponse): boolean {
  if (res.ok) return false;
  if (res.status === 409 && res.step === "tm_register") return true;
  const body = res.body || "";
  return /conflictByPhone|conflictByEmail|Conflict by phone/i.test(body);
}

/**
 * Look up an existing TagMango participant by email or phone via our edge function.
 */
export async function lookupTagmangoParticipant(params: {
  email?: string;
  phone?: string;
}): Promise<{
  fanId: string;
  fanName: string;
  fanEmail: string | null;
  phone: string | null;
  dialCode: string | null;
} | null> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "lookup-tagmango-participant",
      { body: params },
    );
    if (error) {
      console.warn("[razorpayService] lookup error:", error);
      return null;
    }
    if (data?.found && data?.participant) return data.participant;
    return null;
  } catch (err) {
    console.warn("[razorpayService] lookup exception:", err);
    return null;
  }
}

/**
 * Create a payment session and, on TagMango 409 conflict, transparently look up
 * the existing participant and retry using their registered email + phone.
 * Returns the successful session plus the (possibly adjusted) config that was used.
 */
export async function createPaymentSessionWithConflictRecovery(
  config: PaymentConfig,
): Promise<{ session: CreateSessionResponse; effectiveConfig: PaymentConfig }> {
  let session = await createPaymentSession(config);
  if (session.ok || !isTagmangoConflict(session)) {
    return { session, effectiveConfig: config };
  }

  console.log("[razorpayService] TagMango conflict — attempting participant lookup");

  // Try by phone first (bare digits — edge function trims country code), then by email.
  const digits = (config.phone || "").replace(/\D+/g, "");
  let participant = digits
    ? await lookupTagmangoParticipant({ phone: digits })
    : null;
  if (!participant && config.email) {
    participant = await lookupTagmangoParticipant({ email: config.email });
  }

  if (!participant) {
    return { session, effectiveConfig: config };
  }

  // participant.phone comes back as digits (e.g. "919871324442"), already includes
  // the country code. Just prepend "+" — do NOT concatenate dialCode again.
  const rebuiltPhone = participant.phone
    ? `+${participant.phone.replace(/\D+/g, "")}`
    : config.phone;

  const retryConfig: PaymentConfig = {
    ...config,
    email: participant.fanEmail || config.email,
    phone: rebuiltPhone,
    fanId: participant.fanId,
  };

  console.log("[razorpayService] Retrying session with matched participant fanId:", participant.fanId);
  session = await createPaymentSession(retryConfig);
  return { session, effectiveConfig: retryConfig };
}

export async function notifyPaymentComplete(
  response: PaymentResponse,
  orderId: string,
  clientOrderId: string
): Promise<void> {
  try {
    const result = await fetch(`${API_BASE}/payment-complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        meta: { orderId },
        clientOrderId,
      }),
    });
    const data = await result.json();
    console.log("[razorpayService] payment-complete response:", data);
  } catch (error) {
    console.warn("[razorpayService] payment-complete error:", error);
  }
}

export async function notifyPaymentFailed(
  orderId: string,
  error: any,
  clientOrderId: string
): Promise<void> {
  try {
    await fetch(`${API_BASE}/payment-failed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, error, clientOrderId }),
    });
  } catch (err) {
    console.warn("[razorpayService] payment-failed error:", err);
  }
}

export async function notifyPaymentAbandoned(
  orderId: string,
  reason: string,
  clientOrderId: string
): Promise<void> {
  try {
    await fetch(`${API_BASE}/payment-abandoned`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, reason, clientOrderId }),
    });
  } catch (err) {
    console.warn("[razorpayService] payment-abandoned error:", err);
  }
}

export function openRazorpayCheckout(
  sessionData: CreateSessionResponse,
  config: PaymentConfig,
  onSuccess: (response: PaymentResponse) => void,
  onFailed: (error: any) => void,
  onDismiss: () => void
): void {
  if (!window.Razorpay) {
    console.error("[razorpayService] Razorpay script not loaded");
    onFailed({ description: "Payment gateway not available" });
    return;
  }

  let outcome: "success" | "failed" | "pending" = "pending";
  const color = sessionData.options?.["theme.color"] || BRAND_COLOR;

  const rzpOptions: any = {
    key: sessionData.keyId,
    order_id: sessionData.orderId,
    amount: Number(sessionData.amount) * 100,
    currency: sessionData.currency || "INR",
    name: sessionData.options?.name,
    description: sessionData.options?.description,
    image: sessionData.options?.image,
    redirect: false,
    retry: sessionData.options?.retry === false ? false : { enabled: false },
    theme: { color },
    modal: {
      ondismiss: async function () {
        console.log("[razorpayService] Modal dismissed by user");
        if (outcome === "pending") {
          await notifyPaymentAbandoned(
            sessionData.orderId || "",
            "user_closed",
            config.clientOrderId
          );
          onDismiss();
        }
      },
    },
    prefill: {
      name: config.name,
      email: config.email,
      contact: config.phone,
    },
    handler: function (response: PaymentResponse) {
      outcome = "success";
      console.log("[razorpayService] Payment success:", response);
      onSuccess(response);
      void notifyPaymentComplete(
        response,
        sessionData.orderId || "",
        config.clientOrderId
      );
    },
  };

  rzpOptions["theme.color"] = color;

  const rzp = new window.Razorpay(rzpOptions);

  rzp.on("payment.failed", async function (resp: any) {
    outcome = "failed";
    console.log("[razorpayService] Payment failed:", resp);
    await notifyPaymentFailed(
      sessionData.orderId || "",
      resp?.error,
      config.clientOrderId
    );
    try {
      rzp.close();
    } catch {}
    onFailed(resp?.error);
  });

  rzp.open();
}

export function ensureRazorpayScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      console.error("[razorpayService] Failed to load Razorpay script");
      resolve();
    };
    document.head.appendChild(script);
  });
}

declare global {
  interface Window {
    Razorpay: any;
  }
}