import * as cheerio from 'cheerio';

export interface WebinarFuelWidgetData {
  webinarId: number;
  widgetId: number;
  versionId?: number;
  widgetType: 'dropdown' | 'single_session' | 'recurring';
  embedCode: string;
  
  // For single session widgets
  sessionId?: number;
  
  // For recurring schedules
  schedule?: {
    [day: string]: {
      time: string;
      sessionId: number;
    };
  };
}

/**
 * Parse WebinarFuel widget HTML/JavaScript and extract configuration
 */
export function parseWebinarFuelWidget(html: string, widgetUrl?: string): WebinarFuelWidgetData {
  const $ = cheerio.load(html);
  
  // Extract from widget URL if provided
  let webinarId: number | undefined;
  let widgetId: number | undefined;
  let versionId: number | undefined;

  if (widgetUrl) {
    // Parse URL like: https://app.webinarfuel.com/webinars/19570/widgets/80345/132194/elements
    const urlMatch = widgetUrl.match(/webinars\/(\d+)\/widgets\/(\d+)(?:\/(\d+))?/);
    if (urlMatch) {
      webinarId = parseInt(urlMatch[1]);
      widgetId = parseInt(urlMatch[2]);
      versionId = urlMatch[3] ? parseInt(urlMatch[3]) : undefined;
    }
  }

  // Try to extract from script tags if not in URL
  const scripts = $('script').toArray();
  let sessionId: number | undefined;
  
  for (const script of scripts) {
    const scriptContent = $(script).html() || '';
    
    // Look for session ID in various formats
    if (!sessionId) {
      // Format 1: var sessionId = "70047" or sessionId="70047"
      const sessionMatch1 = scriptContent.match(/(?:var|let|const)?\s*sessionId\s*=\s*["']?(\d+)["']?/);
      if (sessionMatch1) {
        sessionId = parseInt(sessionMatch1[1]);
      }
      
      // Format 2: webinar_session_id: 70047
      const sessionMatch2 = scriptContent.match(/webinar_session_id["']?\s*:\s*["']?(\d+)["']?/);
      if (sessionMatch2) {
        sessionId = parseInt(sessionMatch2[1]);
      }
    }
    
    // Look for window._wf configuration
    const wfMatch = scriptContent.match(/window\._wf\s*=\s*window\._wf\s*\|\|\s*\[\]\s*;\s*window\._wf\.push\({\s*[\s\S]*?id:\s*['"]([^'"]+)['"]/);
    if (wfMatch) {
      widgetId = widgetId || parseInt(wfMatch[1].split('_')[0] || '0');
    }

    // Look for webinar ID in embed
    const webinarMatch = scriptContent.match(/webinar[_-]?id['":\s]+(\d+)/i);
    if (webinarMatch) {
      webinarId = webinarId || parseInt(webinarMatch[1]);
    }
  }

  // Check for widget type based on presence of certain elements
  const hasDateSelect = $('.wf-date-select, [class*="date-select"], select[name*="date"]').length > 0;
  const hasSessionSelect = $('.wf-session-select, [class*="session"], select[name*="session"]').length > 0;
  
  let widgetType: 'dropdown' | 'single_session' | 'recurring' = 'single_session';
  
  if (hasDateSelect || hasSessionSelect) {
    widgetType = 'dropdown';
  }

  // Check if script contains embed_v2.js (standard for all widgets)
  const hasEmbedScript = $('script[src*="embed_v2.js"]').length > 0 || 
                          html.includes('embed_v2.js');

  if (!webinarId || !widgetId) {
    throw new Error('Could not extract webinar ID or widget ID from the provided code');
  }

  return {
    webinarId,
    widgetId,
    versionId,
    sessionId,
    widgetType,
    embedCode: html
  };
}

/**
 * Detect if this is a recurring schedule and extract schedule info
 */
export function detectRecurringSchedule(widgetData: WebinarFuelWidgetData): {
  isRecurring: boolean;
  schedule?: Record<string, { time: string; sessionId: number }>;
} {
  // This will need to be manually configured or enhanced with AI parsing
  // For now, return false - will be set by user during funnel setup
  return {
    isRecurring: false
  };
}

/**
 * Submit registration to WebinarFuel using Embed V2 Viewers API
 * This matches the working implementation - uses Bearer token authentication
 * API endpoint: https://embed.webby.app/embed/v2/viewers
 */
export async function submitToWebinarFuel(
  webinarId: number,
  versionId: number,
  sessionId: number,
  userData: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    timeZone?: string;
    source?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
    userAgent?: string;
  },
  bearerToken: string
): Promise<{ success: boolean; cid?: string; error?: string }> {
  try {
    // Build payload matching WebinarFuel Embed V2 API structure
    const payload = {
      version_id: versionId,
      recaptcha_action: 'wf_verify_recaptcha',
      viewer: {
        webinar_session_id: sessionId,
        time_zone: userData.timeZone || 'UTC',
        email: userData.email,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        phone: userData.phone || '',
        lead: false,
        registration_source_widget_type: 'embed',
        registration_source_widget_name: 'embed',
        widget_id: webinarId,
        widget_version_id: versionId,
        source: userData.source || '',
        utm_source: userData.utmSource || '',
        utm_medium: userData.utmMedium || '',
        utm_campaign: userData.utmCampaign || '',
        utm_term: userData.utmTerm || '',
        utm_content: userData.utmContent || '',
      }
    };

    const response = await fetch('https://embed.webby.app/embed/v2/viewers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WebinarFuel API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      cid: result.cid || result.viewer?.cid
    };
    
  } catch (error) {
    console.error('WebinarFuel submission error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Fetch session details from WebinarFuel API
 */
export async function getWebinarSessions(
  webinarId: number,
  bearerToken: string
): Promise<Array<{
  id: number;
  scheduled_at: string;
  status: string;
}>> {
  try {
    const response = await fetch(
      `https://api.webinarfuel.com/api/webinars/${webinarId}/sessions`,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch sessions: ${response.status}`);
    }

    const data = await response.json();
    return data.sessions || [];
  } catch (error) {
    console.error('Error fetching WebinarFuel sessions:', error);
    return [];
  }
}

/**
 * Calculate next available session for recurring schedules
 */
export function calculateNextSession(
  schedule: Record<string, { time: string; sessionId: number }>
): {
  sessionId: number;
  date: Date;
  dayOfWeek: string;
} {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  const currentHour = now.getHours();

  const dayMapping: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };

  // Find the next available session
  const scheduleDays = Object.keys(schedule).map(day => ({
    day,
    dayNum: dayMapping[day.toLowerCase()],
    ...schedule[day]
  })).sort((a, b) => a.dayNum - b.dayNum);

  for (const scheduleDay of scheduleDays) {
    const [hours, minutes] = scheduleDay.time.split(':').map(Number);
    
    // Check if this day hasn't passed yet this week
    if (scheduleDay.dayNum > currentDay || 
        (scheduleDay.dayNum === currentDay && currentHour < hours)) {
      
      const nextDate = new Date();
      const daysUntilNext = scheduleDay.dayNum - currentDay;
      nextDate.setDate(nextDate.getDate() + daysUntilNext);
      nextDate.setHours(hours, minutes, 0, 0);

      return {
        sessionId: scheduleDay.sessionId,
        date: nextDate,
        dayOfWeek: scheduleDay.day
      };
    }
  }

  // If no session found this week, get the first session of next week
  const firstSession = scheduleDays[0];
  const [hours, minutes] = firstSession.time.split(':').map(Number);
  const nextDate = new Date();
  const daysUntilNext = (7 - currentDay + firstSession.dayNum) % 7;
  nextDate.setDate(nextDate.getDate() + daysUntilNext);
  nextDate.setHours(hours, minutes, 0, 0);

  return {
    sessionId: firstSession.sessionId,
    date: nextDate,
    dayOfWeek: firstSession.day
  };
}
