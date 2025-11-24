-- Fix security definer view issue
-- Drop the existing view
DROP VIEW IF EXISTS public.device_statistics;

-- Recreate the view without security definer (views are security invoker by default)
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