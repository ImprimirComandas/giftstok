-- Fix numeric overflow issues in calculation_history table
-- First drop the dependent view
DROP VIEW IF EXISTS device_statistics;

-- Change amount_calculated to support larger currency values
ALTER TABLE calculation_history 
ALTER COLUMN amount_calculated TYPE numeric(20,2);

-- Change points_needed from integer to bigint to support values over 2 billion
ALTER TABLE calculation_history 
ALTER COLUMN points_needed TYPE bigint;

-- Recreate the view with updated column types
CREATE VIEW device_statistics WITH (security_invoker=on) AS
SELECT 
  device_id,
  ip_address,
  COUNT(*) as total_calculations,
  SUM(amount_calculated) as total_amount,
  MIN(created_at) as first_calculation,
  MAX(created_at) as last_calculation,
  currency_code
FROM calculation_history
GROUP BY device_id, ip_address, currency_code;