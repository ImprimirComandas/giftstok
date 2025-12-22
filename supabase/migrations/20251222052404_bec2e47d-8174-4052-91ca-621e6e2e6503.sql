-- Add user_points column to store the points the user actually has
ALTER TABLE public.calculation_history ADD COLUMN user_points bigint;

-- Enable realtime for calculation_history table
ALTER PUBLICATION supabase_realtime ADD TABLE public.calculation_history;