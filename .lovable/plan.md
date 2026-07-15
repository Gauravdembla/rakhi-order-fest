## Fix TagMango participant lookup (400 → working)

### Root cause
TagMango's `/v2/subscribers` search parameter is `term`. The edge function currently tries `searchQuery`, `searchText`, `q`, `keyword`, `filter.search` — all rejected with `"search" is not allowed`, so the function 500s and the conflict-recovery wrapper falls through to the "existing account with different contact details" toast.

### Changes — `supabase/functions/lookup-tagmango-participant/index.ts`
1. Replace the `candidateBodies` probing with a single canonical body:
   `{ page:1, pageSize:25, type:"all", affiliateType:"all", spreadSubscribers:true, term:"<searchTerm>" }`.
2. Add missing header `x-whitelabel-creator: 66f1851e9b5fc4e6c571a7ab` (matches the working browser call).
3. Two-step lookup:
   - **Step A — by phone.** `term` = phone digits **without country code** (last 10 digits for IN numbers). Match on `fanPhone` (bare / suffix). If found → return participant; caller retries with its `fanEmail`.
   - **Step B — by email.** Only if Step A didn't match (or no phone provided). `term` = email. Match on `fanEmail` (case-insensitive). If found → return participant; caller retries with its `fanPhone` + `dialCode`.
4. Empty result (`result.subscribers` empty or `totalUserCount` absent) → move to next step.
5. Return shape unchanged: `{ found, participant: { fanId, fanName, fanEmail, phone, dialCode, profilePicUrl } | null }`.

### Changes — `src/services/razorpayService.ts`
In `createPaymentSessionWithConflictRecovery`, reorder to try **phone first, then email**. No other behavior change — silent retry; existing toast surfaces only if both lookups fail.

### Not changing
- No UI changes in `src/pages/Index.tsx`.
- Cloudflare Worker, pricing, inventory, secrets, KV token fetch — untouched.

### Verification
1. Redeploy the edge function.
2. Reproduce the 409 case (existing account, different email typed). Expected: no user-visible error, Razorpay modal opens.
3. Function logs should show 200 from TagMango and `[lookup] matched by phone/email fanId=...`.
