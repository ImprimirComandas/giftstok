-- Create table for coin price history
CREATE TABLE public.coin_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT,
  device_id TEXT NOT NULL,
  price_per_1000 NUMERIC(10,2) NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'BRL',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.coin_price_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can insert and view)
CREATE POLICY "Anyone can insert coin prices"
ON public.coin_price_history
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view coin prices"
ON public.coin_price_history
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_coin_price_history_created_at ON public.coin_price_history(created_at DESC);
CREATE INDEX idx_coin_price_history_currency ON public.coin_price_history(currency_code);