# Admin backend + Razorpay success API

## 1. Admin login (email + password + 2FA)

- New protected route `/admin` in the app.
- Auth uses Lovable Cloud email/password. I'll pre-create ONE admin account and share the credentials with you in chat after creation.
- On first sign-in, you'll be prompted to enrol **TOTP 2FA** (scan a QR with Google Authenticator / Authy). After that, every future sign-in requires the 6-digit code.
- A tiny `admin_users` table gates who can access `/admin` — even if someone else signs up on your project, they can't see this page.

Suggested admin email: `admin@angelsonearthhub.com` (or tell me the email you want; I'll use whatever you say).

## 2. Admin dashboard (`/admin`)

Single page with:

- **Orders table** — newest first, columns: date, name, email, phone, city, cart (Chakra / Prosperity / Ho'oponopono / total), amount, status (`draft` / `pending` / `success`), Razorpay payment id.
- **Filters** — status, search by name / email / phone / client_order_id, date range.
- **Row actions**
  - `Resend to Pabbly` — re-fires `notify-order-webhook` for that row (event: `manual_resend`). Useful when a row didn't make it into your sheet.
  - `Mark as success` — manual override.
  - `Copy client_order_id`.
- **Stats strip** — counts for today: drafts, pendings, successes, revenue.
- CSV export of the current filtered view.

## 3. Razorpay success → match API

New public edge function **`razorpay-payment-match`** (POST, no JWT).

Request body (flexible — send whatever you have from Razorpay):
```json
{
  "email": "buyer@example.com",
  "phone": "9871324442",
  "client_order_id": "optional-if-you-have-it",
  "razorpay_payment_id": "pay_XXX",
  "razorpay_order_id": "order_XXX",
  "razorpay_signature": "optional",
  "amount": 599,
  "raw": { "...any razorpay payload..." }
}
```

Matching (OR — any one is enough, in this priority):
1. `client_order_id` exact match, else
2. `email` (case-insensitive) match, else
3. `phone` (bare digits, last 10) match.

If multiple candidates, pick the **most recent non-success** row (prefer `pending` over `draft`).

Behaviour:
- Match found → update that row: `status = success`, fill Razorpay ids, merge `raw` into `raw_payload`. Return `{ matched: true, order_id, client_order_id }`.
- No match → **insert a new row** with `status = success` and whatever fields you sent, `client_order_id = "rzp_<payment_id>"` so it's still captured. Return `{ matched: false, inserted: true }`.
- Also fires `notify-order-webhook` with `event: "payment_success"` so your Pabbly sheet updates too.

Auth: protected by a shared secret header `x-webhook-secret` — I'll generate it and show you the value to paste into Razorpay's webhook / your Zapier / Pabbly step. Without that header the endpoint returns 401.

You'll get the exact URL after deploy, in this form:
`https://<project>.functions.supabase.co/razorpay-payment-match`

## 4. Files touched

- `supabase/migrations/…` — `admin_users` table + RLS + grants; enable MFA in auth config.
- `supabase/functions/razorpay-payment-match/index.ts` — new.
- `supabase/functions/notify-order-webhook/index.ts` — no change.
- `src/pages/admin/Login.tsx` — new (email/pw + MFA challenge/enrol).
- `src/pages/admin/Dashboard.tsx` — new (table, filters, actions, stats).
- `src/App.tsx` — add `/admin` and `/admin/login` routes.

## Not in scope
- Multi-admin management UI (I'll just seed one account; more can be added later).
- Editing customer details from the admin.

---

**Two quick confirmations before I build:**
1. Admin email to use? (default: `admin@angelsonearthhub.com`)
2. OK for me to auto-generate the initial password + webhook secret and show them to you here?