ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS dispatch_status text NOT NULL DEFAULT 'not_dispatched',
  ADD COLUMN IF NOT EXISTS awb_number text,
  ADD COLUMN IF NOT EXISTS courier text,
  ADD COLUMN IF NOT EXISTS dispatched_at timestamptz;

ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'team';

UPDATE public.admin_users SET role = 'owner' WHERE role = 'team';

CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = _user_id AND role = 'owner')
$$;

DROP POLICY IF EXISTS "Admins can create keys" ON public.webhook_keys;
DROP POLICY IF EXISTS "Admins can delete keys" ON public.webhook_keys;
DROP POLICY IF EXISTS "Admins can update keys" ON public.webhook_keys;
DROP POLICY IF EXISTS "Admins can view keys" ON public.webhook_keys;

CREATE POLICY "Owners can create keys" ON public.webhook_keys FOR INSERT TO authenticated WITH CHECK (public.is_owner(auth.uid()));
CREATE POLICY "Owners can delete keys" ON public.webhook_keys FOR DELETE TO authenticated USING (public.is_owner(auth.uid()));
CREATE POLICY "Owners can update keys" ON public.webhook_keys FOR UPDATE TO authenticated USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));
CREATE POLICY "Owners can view keys" ON public.webhook_keys FOR SELECT TO authenticated USING (public.is_owner(auth.uid()));