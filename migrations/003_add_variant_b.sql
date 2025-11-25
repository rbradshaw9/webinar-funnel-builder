-- Add registration_page_html_variant_b column for A/B testing
ALTER TABLE funnels 
ADD COLUMN IF NOT EXISTS registration_page_html_variant_b TEXT;
