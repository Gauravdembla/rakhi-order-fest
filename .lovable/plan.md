# Save order details progressively (draft-as-you-type)

## Problem
Right now `record-order` is only called at the moment the user clicks "Proceed to pay", and it's fire-and-forget — if the edge function fails, or the user fills the form but never clicks pay, or they pay via a shared Razorpay Payment Page link, we lose everything: name, email, phone, address, and which rakhis + quantities they selected.

## Goal
Persist the customer's details + current cart to the `orders` table **while they are filling the form**, with `status = 'draft'`. When they actually click "Proceed to pay", the same row is upgraded to `status = 'pending'` (already the current behavior via upsert on `client_order_id`). If they abandon, we still have the draft — including product + quantity breakdown — and can follow up.

## How it works

1. **Stable client_order_id per session.** Generate one `client_order_id` when the checkout form first becomes relevant (already exists — reuse it, don't regenerate on every keystroke). Store it in `useRef` so it survives re-renders.

2. **Debounced autosave in `Index.tsx`.**
   - A `useEffect` watches `customerName`, `customerEmail`, `customerPhone`, `address1`, `address2`, `city`, `pincode`, and the cart quantities (`chakraQty`, `prosperityQty`, `hooponoponoQty`, `totalQty`, `totalAmount`).
   - Debounce 800ms after the last change.
   - Only fire once the user has entered **at least a name AND (email or 10-digit phone)** — avoids junk rows from someone who just clicked into the name field.
   - Calls `supabase.functions.invoke("record-order", { body: { ..., status: "draft" } })` with the same `client_order_id`. The existing upsert on `client_order_id` means repeated calls just update the same row.

3. **Edge function change (`supabase/functions/record-order/index.ts`).**
   - Relax the "required fields" check when `status === 'draft'`: only `client_order_id` is required; name/email/phone/amount become optional and default to empty string / 0.
   - For non-draft calls (existing "Proceed to pay" flow), keep the current strict validation untouched.
   - Never downgrade status: if the existing row is already `pending` / `success` / `failed`, ignore an incoming `draft` write (small guard using `.select().single()` before upsert, or a conditional update).

4. **"Proceed to pay" unchanged for the user.** Same button, same validation, same redirect. The only difference is the row already exists as a draft, so the upsert just flips `status` to `pending` and fills any missing fields.

5. **Nothing changes for successful payments** — the Cloudflare Worker / webhook still marks them `success` by `client_order_id`.

## What you'll see in the backend afterward

For every visitor who typed enough to identify themselves, one row with:
- name, email, phone, address, city, pincode (whatever they filled)
- chakra_qty / prosperity_qty / hooponopono_qty / total_qty / amount (their current cart at last edit)
- `status = 'draft'` → they never clicked pay
- `status = 'pending'` → they clicked pay, at Razorpay now
- `status = 'success'` → paid

You can then filter `status = 'draft'` to see abandoned carts with full product + quantity info and follow up.

## Files touched
- `src/pages/Index.tsx` — add debounced autosave effect; ensure `client_order_id` is stable via `useRef`.
- `supabase/functions/record-order/index.ts` — allow draft rows with relaxed validation; add "don't downgrade status" guard.

## Not in scope (call out only)
- The separate issue of people paying via a **shared Razorpay Payment Page link without ever visiting the site** — those visitors never touch our form, so autosave can't capture them either. If you want those too, that needs a Razorpay webhook receiver, which we can plan as a follow-up.
