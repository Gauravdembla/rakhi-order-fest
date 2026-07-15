## Goal
Disable the existing per-quantity checkout redirect links and instead charge the customer directly via Razorpay using the calculated total (`getPricing(totalQuantity)`).

## Changes

### 1. New file: `src/services/razorpayService.ts`
Paste the Razorpay service code you provided verbatim (create-session, notify complete/failed/abandoned, `openRazorpayCheckout`, `ensureRazorpayScript`, `escapeHtml`, types, `window.Razorpay` global). Backend: `https://square-surf-2287.connect-17d.workers.dev`. Brand color: `#d669d8`.

### 2. Load Razorpay script early
In `src/pages/Index.tsx`, call `ensureRazorpayScript()` inside a `useEffect` on mount so checkout opens instantly when the button is clicked.

### 3. Add a small customer-details form (needed by Razorpay `prefill` + backend)
Before the "Proceed to pay" button on the checkout slide, add three inputs:
- Full Name (required)
- Email (required, validated)
- Phone (required, 10-digit Indian mobile validated)

Validate with a lightweight zod schema (already recommended in project guidelines). Show inline errors. Persist values in local component state.

### 4. Replace `handleBuyNow` redirect logic with Razorpay flow
Remove the 90-entry checkout link map and its lookup. New behavior when the user clicks "Proceed to pay ₹X":
1. Validate name/email/phone and that `1 ≤ totalQuantity ≤ 12`.
2. Compute `amount = getPricing(totalQuantity)` (INR, whole rupees — service multiplies by 100 for paise).
3. Generate `clientOrderId` = `rakhi_<timestamp>_<random>` and include quantity breakdown (e.g. `C{chakraQty}_P{prosperityQty}`) for traceability.
4. `await ensureRazorpayScript()`.
5. `createPaymentSession({ amount, name, email, phone, clientOrderId })`.
6. If `ok`, call `openRazorpayCheckout(sessionData, config, onSuccess, onFailed, onDismiss)`.
7. Handlers:
   - `onSuccess` → show a success screen/toast with payment id, reset the form, optionally advance to a new "Thank you" slide.
   - `onFailed` → toast with error description; keep user on checkout so they can retry.
   - `onDismiss` → silent (abandonment already reported by service).
8. Add a loading state on the button ("Processing…", disabled) while the session is being created / checkout is opening.

### 5. Remove now-unused code
- Delete the `checkoutLinks` (Chakra-Prosperity) map.
- Delete any helper that built the redirect URL.
- Keep the Google Sheet stock-fetch logic untouched.

### 6. Keep unchanged
- Google Sheet inventory read (B2/C2, −5 buffer, SOLD OUT logic).
- Pricing table (`getPricing`).
- Both mobile and desktop checkout slides — apply the same button + form changes to both (lines ~471-478 and ~679-686).

## Technical notes
- Amount passed to `createPaymentSession` is in INR rupees; the service converts to paise internally (`Number(sessionData.amount) * 100`).
- `window.Razorpay` typing is declared inside the service file — no extra `.d.ts` needed.
- No secrets are added to the codebase; the Cloudflare Worker holds Razorpay keys.
- No Lovable Cloud / Supabase changes required.

## Out of scope
- Persisting orders in a database.
- Decrementing Google Sheet stock after payment (sheet is read-only from client). Can be added later via the Worker if desired.
- Post-payment email/receipt customization (handled by Worker).