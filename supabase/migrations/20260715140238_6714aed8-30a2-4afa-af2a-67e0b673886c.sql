
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_order_id TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address1 TEXT,
  address2 TEXT,
  city TEXT,
  pincode TEXT,
  chakra_qty INTEGER NOT NULL DEFAULT 0,
  prosperity_qty INTEGER NOT NULL DEFAULT 0,
  hooponopono_qty INTEGER NOT NULL DEFAULT 0,
  total_qty INTEGER NOT NULL DEFAULT 0,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'success',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  fan_id TEXT,
  raw_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.orders
  FOR ALL
  USING (false)
  WITH CHECK (false);

CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_email ON public.orders(customer_email);
