-- Fix security definer view issue by adding security_invoker=on
DROP VIEW IF EXISTS public.device_statistics;

CREATE VIEW public.device_statistics
WITH (security_invoker=on)
AS
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