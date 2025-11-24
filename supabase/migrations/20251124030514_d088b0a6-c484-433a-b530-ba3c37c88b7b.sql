-- Create table to store calculation history by device
CREATE TABLE public.calculation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  ip_address TEXT,
  current_level INTEGER NOT NULL,
  target_level INTEGER NOT NULL,
  points_needed INTEGER NOT NULL,
  currency_code TEXT NOT NULL,
  amount_calculated DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries by device
CREATE INDEX idx_calculation_history_device_id ON public.calculation_history(device_id);
CREATE INDEX idx_calculation_history_created_at ON public.calculation_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.calculation_history ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public feature)
CREATE POLICY "Anyone can insert calculation history"
ON public.calculation_history
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to view all calculations (for analytics)
CREATE POLICY "Anyone can view calculation history"
ON public.calculation_history
FOR SELECT
TO anon, authenticated
USING (true);

-- Create a view for device statistics
CREATE VIEW public.device_statistics AS
SELECT 
  device_id,
  ip_address,
  COUNT(*) as total_calculations,
  SUM(amount_calculated) as total_amount,
  MIN(created_at) as first_calculation,
  MAX(created_at) as last_calculation,
  currency_code
FROM public.calculation_history
GROUP BY device_id, ip_address, currency_code;