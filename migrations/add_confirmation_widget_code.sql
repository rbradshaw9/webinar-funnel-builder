-- Migration: Add confirmation_widget_code column to funnels table
-- Run this in Vercel Postgres Storage console or via psql

ALTER TABLE funnels 
ADD COLUMN IF NOT EXISTS confirmation_widget_code TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'funnels' 
AND column_name = 'confirmation_widget_code';
