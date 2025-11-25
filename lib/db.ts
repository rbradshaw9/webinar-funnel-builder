import { sql } from '@vercel/postgres';

export interface Funnel {
  id: number;
  slug: string;
  name: string;
  status: 'draft' | 'active' | 'paused';
  created_at: Date;
  updated_at: Date;
  
  // Infusionsoft
  infusionsoft_form_html?: string;
  infusionsoft_action_url?: string;
  infusionsoft_xid?: string;
  infusionsoft_field_mappings?: Record<string, string>;
  
  // WebinarFuel
  webinarfuel_widget_html?: string;
  webinarfuel_webinar_id?: number;
  webinarfuel_widget_id?: number;
  webinarfuel_version_id?: number;
  webinarfuel_widget_type?: 'dropdown' | 'single_session' | 'recurring';
  webinarfuel_schedule?: Record<string, any>;
  webinarfuel_url?: string;
  webinarfuel_oneclick_key?: string;
  
  // Webinar Content
  webinar_title?: string;
  webinar_description?: string;
  target_audience?: string;
  main_benefits?: string;
  social_proof?: string;
  host_info?: string;
  urgency?: string;
  reference_url?: string;
  additional_notes?: string;
  confirmation_widget_code?: string;
  
  // Generated Content
  registration_page_html?: string;
  registration_page_metadata?: Record<string, any>;
  confirmation_page_html?: string;
  confirmation_page_metadata?: Record<string, any>;
  
  // Analytics
  total_views: number;
  total_submissions: number;
  conversion_rate: number;
}

export interface FunnelSubmission {
  id: number;
  funnel_id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  sms_consent: boolean;
  
  session_date?: Date;
  session_day?: string;
  webinarfuel_session_id?: number;
  webinarfuel_cid?: string;
  
  infusionsoft_success: boolean;
  webinarfuel_success: boolean;
  submitted_at: Date;
  ip_address?: string;
  user_agent?: string;
}

// Funnel CRUD Operations
export async function createFunnel(data: Partial<Funnel>) {
  const result = await sql`
    INSERT INTO funnels (
      slug, name, status,
      infusionsoft_form_html, infusionsoft_action_url, infusionsoft_xid, infusionsoft_field_mappings,
      webinarfuel_widget_html, webinarfuel_webinar_id, webinarfuel_widget_id, 
      webinarfuel_version_id, webinarfuel_widget_type, webinarfuel_schedule
    ) VALUES (
      ${data.slug}, ${data.name}, ${data.status || 'draft'},
      ${data.infusionsoft_form_html}, ${data.infusionsoft_action_url}, 
      ${data.infusionsoft_xid}, ${JSON.stringify(data.infusionsoft_field_mappings || {})},
      ${data.webinarfuel_widget_html}, ${data.webinarfuel_webinar_id}, 
      ${data.webinarfuel_widget_id}, ${data.webinarfuel_version_id},
      ${data.webinarfuel_widget_type}, ${JSON.stringify(data.webinarfuel_schedule || {})}
    )
    RETURNING *
  `;
  return result.rows[0] as Funnel;
}

export async function getFunnelBySlug(slug: string) {
  const result = await sql`
    SELECT * FROM funnels WHERE slug = ${slug} LIMIT 1
  `;
  return result.rows[0] as Funnel | undefined;
}

export async function getFunnelById(id: number) {
  const result = await sql`
    SELECT * FROM funnels WHERE id = ${id} LIMIT 1
  `;
  return result.rows[0] as Funnel | undefined;
}

export async function getAllFunnels() {
  const result = await sql`
    SELECT * FROM funnels ORDER BY updated_at DESC
  `;
  return result.rows as Funnel[];
}

export async function updateFunnel(id: number, data: Partial<Funnel>) {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'id' && value !== undefined) {
      updates.push(`${key} = $${paramIndex}`);
      values.push(typeof value === 'object' ? JSON.stringify(value) : value);
      paramIndex++;
    }
  });

  if (updates.length === 0) return null;

  values.push(id);
  const query = `
    UPDATE funnels 
    SET ${updates.join(', ')} 
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await sql.query(query, values);
  return result.rows[0] as Funnel;
}

export async function deleteFunnel(id: number) {
  await sql`DELETE FROM funnels WHERE id = ${id}`;
}

// Submission Operations
export async function createSubmission(data: Partial<FunnelSubmission>) {
  const result = await sql`
    INSERT INTO funnel_submissions (
      funnel_id, email, first_name, last_name, phone, sms_consent,
      session_date, session_day, webinarfuel_session_id, webinarfuel_cid,
      infusionsoft_success, webinarfuel_success, ip_address, user_agent
    ) VALUES (
      ${data.funnel_id}, ${data.email}, ${data.first_name}, ${data.last_name}, 
      ${data.phone}, ${data.sms_consent || false},
      ${data.session_date?.toISOString()}, ${data.session_day}, ${data.webinarfuel_session_id}, 
      ${data.webinarfuel_cid},
      ${data.infusionsoft_success || false}, ${data.webinarfuel_success || false},
      ${data.ip_address}, ${data.user_agent}
    )
    RETURNING *
  `;
  return result.rows[0] as FunnelSubmission;
}

export async function getSubmissionsByFunnel(funnelId: number, limit: number = 100) {
  const result = await sql`
    SELECT * FROM funnel_submissions 
    WHERE funnel_id = ${funnelId}
    ORDER BY submitted_at DESC
    LIMIT ${limit}
  `;
  return result.rows as FunnelSubmission[];
}

export async function checkDuplicateSubmission(funnelId: number, email: string) {
  const result = await sql`
    SELECT id FROM funnel_submissions 
    WHERE funnel_id = ${funnelId} AND email = ${email}
    LIMIT 1
  `;
  return result.rows.length > 0;
}

// Analytics Operations
export async function incrementFunnelViews(funnelId: number) {
  await sql`
    UPDATE funnels 
    SET total_views = total_views + 1 
    WHERE id = ${funnelId}
  `;
  
  // Also update daily analytics
  const today = new Date().toISOString().split('T')[0];
  await sql`
    INSERT INTO funnel_analytics (funnel_id, date, views)
    VALUES (${funnelId}, ${today}, 1)
    ON CONFLICT (funnel_id, date)
    DO UPDATE SET views = funnel_analytics.views + 1
  `;
}

export async function incrementFunnelSubmissions(funnelId: number) {
  await sql`
    UPDATE funnels 
    SET total_submissions = total_submissions + 1,
        conversion_rate = COALESCE((total_submissions + 1)::DECIMAL / NULLIF(total_views, 0) * 100, 0)
    WHERE id = ${funnelId}
  `;
  
  // Also update daily analytics
  const today = new Date().toISOString().split('T')[0];
  await sql`
    INSERT INTO funnel_analytics (funnel_id, date, submissions)
    VALUES (${funnelId}, ${today}, 1)
    ON CONFLICT (funnel_id, date)
    DO UPDATE SET 
      submissions = funnel_analytics.submissions + 1,
      conversion_rate = COALESCE((funnel_analytics.submissions + 1)::DECIMAL / NULLIF(funnel_analytics.views, 0) * 100, 0)
  `;
}

export async function getFunnelAnalytics(funnelId: number, days: number = 30) {
  const result = await sql`
    SELECT * FROM funnel_analytics 
    WHERE funnel_id = ${funnelId}
    AND date >= CURRENT_DATE - INTERVAL '${days} days'
    ORDER BY date DESC
  `;
  return result.rows;
}

export async function updateFunnelPages(
  id: number,
  registrationHtml: string,
  confirmationHtml: string
): Promise<void> {
  await sql`
    UPDATE funnels
    SET
      registration_page_html = ${registrationHtml},
      confirmation_page_html = ${confirmationHtml},
      updated_at = NOW()
    WHERE id = ${id}
  `;
}
