## Goal (superseded — see "TagMango lookup fix" below)
1. Split checkout into a **two-step flow**: Step 1 = item selection, Step 2 = customer + shipping details + pay.
2. Gracefully recover from the TagMango **409 "Conflict by phone and email"** by looking up the existing participant and reusing them, so the customer never sees the error.

---

## Part A — Two-step checkout UI (`src/pages/Index.tsx`)

Add a local `checkoutStep` state: `"items" | "details"`.

**Step 1 — Items (default)**
- Show only: quantity selectors for Chakra / Prosperity / Test Rakhi, live price summary, "Shipping Charges Included (India Only)" note.
- Primary button: **"Continue to details →"** (disabled until `grandTotalItems ≥ 1`).
- Remove the customer/address inputs from this view.

**Step 2 — Details**
- Show a compact **order summary** at top (items + total, non-editable) with an "← Edit items" link that returns to Step 1 (values preserved).
- Below it: Full Name, Email, Country-code + Mobile, Address 1, Address 2, City, Pincode (placeholders only, as already done).
- Primary button: **"Proceed to pay ₹X"** → runs the existing `handleBuyNow` Razorpay flow.

Apply the same two-step behavior to **both** mobile and desktop layouts. No changes to pricing, inventory, or Razorpay service beyond what Part B requires.

---

## Part B — Handle the 409 conflict silently

### B1. Enable Lovable Cloud
Needed to host the TagMango lookup edge function (keeps CF/TagMango tokens off the client).

### B2. Store three secrets (via `add_secret`)
- `CF_ACCOUNT_ID`
- `CF_NAMESPACE_ID`
- `CF_API_TOKEN` (Workers KV Storage: Read on that namespace)

Optional: `TAGMANGO_MANGO_ID` if the search should be scoped to one mango.

The user must supply all of these — they're third-party credentials.

### B3. New edge function `lookup-tagmango-participant`
Exactly as specified in the prompt:
- Reads `tagmango_token` from Cloudflare KV using the CF secrets.
- Sanitizes header values (strip quotes/whitespace/non-ASCII).
- POSTs to `https://api-prod-new.tagmango.com/v2/subscribers` with the whitelabel / timezone headers.
- Returns `{ found: boolean, participant: { fanId, fanName, fanEmail, phone, dialCode, ... } | null }`.
- CORS enabled; input validated with zod (`email` or `phone` required).
- Never logs tokens; never returns tokens to the client.

### B4. Update `src/services/razorpayService.ts`
- Extend `createPaymentSession` result handling: when the worker returns the 409 shape (`step: "tm_register"`, `body` includes `conflictByPhone` / `conflictByEmail`), do NOT surface the error.
- New helper `resolveTagmangoConflict(email, phone)`:
  1. Call the new edge function with the entered email.
  2. If not found, call again with the entered phone.
  3. Return the matched participant or `null`.
- New retry helper `createPaymentSessionWithConflictRecovery(config)`:
  1. Try `createPaymentSession(config)`.
  2. On 409: look up the participant, then retry `createPaymentSession` using **that participant's registered email + phone** (keep the customer's typed name and address for shipping). Pass `fanId` through in `customFields` for backend traceability.
  3. If still 409 or lookup fails → surface a friendly toast: "We found an existing account with different contact details. Please use the email or phone you originally registered with."
- `handleBuyNow` in `Index.tsx` calls the new wrapper instead of `createPaymentSession` directly.

### B5. Extend `PaymentConfig`
Add optional `fanId?: string` and pass it into the worker payload so the Cloudflare Worker can attach it to the TagMango session (backend already accepts arbitrary `customFields`).

---

## Out of scope
- Changing the Cloudflare Worker (`square-surf-2287…`) itself.
- Persisting orders in Lovable Cloud DB.
- Modifying the Google Sheet stock read or pricing table.

## Files touched
- `src/pages/Index.tsx` — two-step flow, wire up conflict-recovery wrapper.
- `src/services/razorpayService.ts` — conflict detection + retry, `fanId` support.
- `supabase/functions/lookup-tagmango-participant/index.ts` — new edge function.
- Secrets: `CF_ACCOUNT_ID`, `CF_NAMESPACE_ID`, `CF_API_TOKEN` (+ optional `TAGMANGO_MANGO_ID`).

---

# TagMango lookup fix (current task)

## Root cause
TagMango `/v2/subscribers` search parameter is `term`. The edge function currently tries `searchQuery`, `searchText`, `q`, `keyword`, `filter.search` — all rejected with `"search" is not allowed`, so the function 500s and the conflict-recovery wrapper falls through to the "existing account with different contact details" toast.

## Changes — `supabase/functions/lookup-tagmango-participant/index.ts`
1. Replace the `candidateBodies` probing with a single canonical body:
   `{ page:1, pageSize:25, type:"all", affiliateType:"all", spreadSubscribers:true, term:"<searchTerm>" }`.
2. Add missing header `x-whitelabel-creator: 66f1851e9b5fc4e6c571a7ab`.
3. Two-step lookup:
   - **Step A — by phone.** `term` = phone digits **without country code** (last 10 digits for IN numbers). Match on `fanPhone` (bare or suffix). If found, return participant → caller retries with its `fanEmail`.
   - **Step B — by email.** Only if Step A didn't match (or no phone provided). `term` = email. Match on `fanEmail` (case-insensitive). If found, return participant → caller retries with its `fanPhone` + `dialCode`.
4. Empty-result detection: `result.subscribers` empty (or `totalUserCount` absent) → move to next step.
5. Return shape unchanged: `{ found, participant: { fanId, fanName, fanEmail, phone, dialCode, profilePicUrl } | null }`.

## Changes — `src/services/razorpayService.ts`
In `createPaymentSessionWithConflictRecovery`, reorder to try **phone first, then email** (matches the new flow). No other behavior change — silent retry; existing toast only if both lookups fail.

## Not changing
- No UI changes in `src/pages/Index.tsx`.
- Cloudflare Worker, pricing, inventory, secrets, KV token fetch — untouched.

## Verification
1. Redeploy edge function.
2. Reproduce 409 case. Expected: no user-visible error, Razorpay modal opens.
3. Logs should show 200 from TagMango and `[lookup] matched by phone/email fanId=...`.