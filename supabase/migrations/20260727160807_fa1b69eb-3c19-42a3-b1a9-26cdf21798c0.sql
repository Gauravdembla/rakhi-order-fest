CREATE TABLE public.webhook_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  secret text NOT NULL UNIQUE,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhook_keys TO authenticated;
GRANT ALL ON public.webhook_keys TO service_role;

ALTER TABLE public.webhook_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view keys" ON public.webhook_keys
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can create keys" ON public.webhook_keys
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update keys" ON public.webhook_keys
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete keys" ON public.webhook_keys
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));