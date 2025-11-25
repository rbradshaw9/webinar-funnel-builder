-- Database Schema for AI-Powered Funnel Builder
-- Run this after connecting Vercel Postgres

CREATE TABLE IF NOT EXISTS funnels (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Infusionsoft Configuration
  infusionsoft_form_html TEXT,
  infusionsoft_action_url TEXT,
  infusionsoft_xid VARCHAR(255),
  infusionsoft_field_mappings JSONB,
  
  -- WebinarFuel Configuration
  webinarfuel_widget_html TEXT,
  webinarfuel_webinar_id INTEGER,
  webinarfuel_widget_id INTEGER,
  webinarfuel_version_id INTEGER,
  webinarfuel_widget_type VARCHAR(50), -- 'dropdown', 'single_session', 'recurring'
  webinarfuel_schedule JSONB, -- For recurring schedules: {tuesday: {time: '19:00', session_id: 66235}, saturday: {...}}
  
  -- Page Content (AI Generated + User Edited)
  registration_page_html TEXT,
  registration_page_metadata JSONB, -- colors, fonts, custom settings
  confirmation_page_html TEXT,
  confirmation_page_metadata JSONB,
  
  -- Analytics
  total_views INTEGER DEFAULT 0,
  total_submissions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.00
);

CREATE INDEX IF NOT EXISTS idx_slug ON funnels(slug);
CREATE INDEX IF NOT EXISTS idx_status ON funnels(status);

CREATE TABLE IF NOT EXISTS funnel_submissions (
  id SERIAL PRIMARY KEY,
  funnel_id INTEGER REFERENCES funnels(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  sms_consent BOOLEAN DEFAULT FALSE,
  
  -- Session Information
  session_date TIMESTAMP,
  session_day VARCHAR(20), -- 'tuesday', 'saturday', etc.
  webinarfuel_session_id INTEGER,
  webinarfuel_cid VARCHAR(255), -- Contact ID from WebinarFuel
  
  -- Submission Status
  infusionsoft_success BOOLEAN DEFAULT FALSE,
  webinarfuel_success BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_funnel_email ON funnel_submissions(funnel_id, email);
CREATE INDEX IF NOT EXISTS idx_submitted_at ON funnel_submissions(submitted_at);

CREATE TABLE IF NOT EXISTS funnel_versions (
  id SERIAL PRIMARY KEY,
  funnel_id INTEGER REFERENCES funnels(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  
  -- Version Content
  registration_page_html TEXT,
  registration_page_metadata JSONB,
  confirmation_page_html TEXT,
  confirmation_page_metadata JSONB,
  
  -- Version Performance
  views INTEGER DEFAULT 0,
  submissions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.00,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(funnel_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_funnel_active ON funnel_versions(funnel_id, is_active);

CREATE TABLE IF NOT EXISTS funnel_analytics (
  id SERIAL PRIMARY KEY,
  funnel_id INTEGER REFERENCES funnels(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Daily Metrics
  views INTEGER DEFAULT 0,
  submissions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.00,
  
  -- Traffic Sources
  traffic_sources JSONB, -- {direct: 10, organic: 5, paid: 20, ...}
  
  UNIQUE(funnel_id, date)
);

CREATE INDEX IF NOT EXISTS idx_funnel_date ON funnel_analytics(funnel_id, date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for funnels table
CREATE TRIGGER update_funnels_updated_at 
  BEFORE UPDATE ON funnels 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
