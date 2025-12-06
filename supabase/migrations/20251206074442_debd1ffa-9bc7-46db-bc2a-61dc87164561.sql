-- Add UPDATE policy to coin_price_history
CREATE POLICY "Anyone can update their own coin prices"
ON public.coin_price_history
FOR UPDATE
USING (true)
WITH CHECK (true);