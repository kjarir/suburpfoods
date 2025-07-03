
-- Add ship_token column to orders table for secure shipping status updates
ALTER TABLE public.orders 
ADD COLUMN ship_token TEXT;
