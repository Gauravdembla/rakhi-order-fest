# Also send draft (autosaved) orders to the Pabbly webhook

## What's actually wrong

The webhook `notify-order-webhook` (which forwards rows to your Pabbly → Google Sheet) is fired **only when the user clicks "Proceed to pay"**. It is NOT fired by the new autosave that saves drafts to the database.

Result:
- Users who click Proceed to pay → in DB **and** in your Pabbly sheet.
- Users who fill the form but never click Proceed to pay → in DB as `draft`, **not** in your Pabbly sheet.

That is exactly why `krishna.verticaleye@gmail.com` is missing from your sheet even though her name, phone, address, and cart are all in the database.

Separately: `janvigupta48480@gmail.com` clicked Proceed to pay, so a webhook *was* fired for her. If she's still missing from the sheet, that is either a Pabbly delivery failure or a filter in Pabbly. I'll pull the edge-function logs for her `client_order_id` to confirm which — but that's an investigation step, not a code change.

## What I'll change

### 1. `src/pages/Index.tsx` — autosave effect also calls the webhook

The existing debounced autosave effect (that writes `status: 'draft'` to `record-order`) will additionally fire `notify-order-webhook` with the same payload, using:

```
event: "draft_saved"
```

Same debounce (800ms), same gating (name entered AND email or 10-digit phone), same `client_order_id`. So every meaningful keystroke pushes the latest snapshot to Pabbly. If the user later clicks Proceed to pay, the existing `event: "checkout_initiated"` webhook still fires — the sheet will just have a newer row overwriting/appending the same `client_order_id`.

### 2. `supabase/functions/notify-order-webhook/index.ts` — no code change required

It already forwards whatever payload it receives. But I'll add the `event` field to the top-level enrichment so your Pabbly workflow can branch on `draft_saved` vs `checkout_initiated` vs `payment_success` if you want to (already the case — no change needed).

### 3. Investigation step (no code)

Pull edge-function logs for `notify-order-webhook` around 15:29 UTC to confirm whether janvi's webhook call actually succeeded to Pabbly, or whether Pabbly rejected it. I'll report the finding so you know whether the sheet-side needs adjusting too.

## What you'll see afterward

Every visitor who enters name + (email or phone) sends a row to your Pabbly sheet within ~1 second of typing — even if they never click Proceed to pay. The row updates as they keep typing. On Proceed to pay you also get the existing `checkout_initiated` event, and on payment success the existing success event.

## Files touched
- `src/pages/Index.tsx` — extend the autosave `useEffect` to also invoke `notify-order-webhook`.
- (no change to the two edge functions)

## Not in scope
- Deduping rows inside your Pabbly workflow / Google Sheet — that's a Pabbly-side setting, best keyed off `client_order_id` so drafts and the final paid row update the same sheet row instead of creating new ones.
- Users who pay via a shared Razorpay link without ever visiting the site — still needs a separate Razorpay webhook receiver.
