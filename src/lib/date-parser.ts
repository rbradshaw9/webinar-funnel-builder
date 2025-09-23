// Date parsing logic for WebinarFuel hidden widget

import { WEBINAR_FUEL_CONFIG } from './api-clients';

interface ParsedSession {
  webinar_session_id: number;
  scheduled_at: string;
  dayOfWeek: 'tuesday' | 'saturday';
}

// Wait for WebinarFuel widget to load and extract date
export const parseSessionDateFromWidget = async (): Promise<ParsedSession | null> => {
  return new Promise((resolve) => {
    const maxAttempts = 20; // 10 seconds max wait
    let attempts = 0;

    const checkForWidget = () => {
      attempts++;
      
      // Look for the WebinarFuel widget container
      const widgetContainer = document.querySelector('.wf_target_KvKUagFa1nobkfcZGaSK3KiP');
      
      if (widgetContainer) {
        // Try to extract date information from the widget
        const dateElements = widgetContainer.querySelectorAll('*');
        
        for (const element of dateElements) {
          const text = element.textContent || '';
          
          // Look for date patterns
          const dateMatch = text.match(/(Tuesday|Saturday)[^\n]*?(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|[A-Za-z]+ \d{1,2}, \d{4})/i);
          
          if (dateMatch) {
            const dayOfWeek = dateMatch[1].toLowerCase() as 'tuesday' | 'saturday';
            const dateStr = dateMatch[2];
            
            try {
              // Parse the date and convert to ISO format
              const parsedDate = new Date(dateStr);
              
              if (!isNaN(parsedDate.getTime())) {
                // Set time to 7:00 PM EST (assuming webinar time)
                parsedDate.setHours(19, 0, 0, 0);
                
                const sessionId = dayOfWeek === 'tuesday' 
                  ? WEBINAR_FUEL_CONFIG.sessionIds.tuesday 
                  : WEBINAR_FUEL_CONFIG.sessionIds.saturday;
                
                resolve({
                  webinar_session_id: sessionId,
                  scheduled_at: parsedDate.toISOString(),
                  dayOfWeek
                });
                return;
              }
            } catch (error) {
              console.warn('Failed to parse date:', dateStr, error);
            }
          }
        }
      }
      
      if (attempts < maxAttempts) {
        setTimeout(checkForWidget, 500);
      } else {
        // Fallback: determine next session based on current date
        resolve(getNextSessionFallback());
      }
    };
    
    // Start checking immediately
    checkForWidget();
  });
};

// Fallback function to determine next session when widget parsing fails
const getNextSessionFallback = (): ParsedSession => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 2 = Tuesday, 6 = Saturday
  
  let nextSessionDate: Date;
  let dayOfWeek: 'tuesday' | 'saturday';
  
  // Find next Tuesday or Saturday
  if (currentDay < 2) {
    // Before Tuesday - next Tuesday
    nextSessionDate = new Date(now);
    nextSessionDate.setDate(now.getDate() + (2 - currentDay));
    dayOfWeek = 'tuesday';
  } else if (currentDay === 2) {
    // Tuesday - check if before 7 PM
    if (now.getHours() < 19) {
      nextSessionDate = new Date(now);
      dayOfWeek = 'tuesday';
    } else {
      // After Tuesday 7 PM - next Saturday
      nextSessionDate = new Date(now);
      nextSessionDate.setDate(now.getDate() + (6 - currentDay));
      dayOfWeek = 'saturday';
    }
  } else if (currentDay < 6) {
    // Wednesday to Friday - next Saturday
    nextSessionDate = new Date(now);
    nextSessionDate.setDate(now.getDate() + (6 - currentDay));
    dayOfWeek = 'saturday';
  } else if (currentDay === 6) {
    // Saturday - check if before 7 PM
    if (now.getHours() < 19) {
      nextSessionDate = new Date(now);
      dayOfWeek = 'saturday';
    } else {
      // After Saturday 7 PM - next Tuesday
      nextSessionDate = new Date(now);
      nextSessionDate.setDate(now.getDate() + (2 + 7 - currentDay));
      dayOfWeek = 'tuesday';
    }
  } else {
    // Sunday - next Tuesday
    nextSessionDate = new Date(now);
    nextSessionDate.setDate(now.getDate() + (2 + 7 - currentDay));
    dayOfWeek = 'tuesday';
  }
  
  // Set to 7:00 PM
  nextSessionDate.setHours(19, 0, 0, 0);
  
  const sessionId = dayOfWeek === 'tuesday' 
    ? WEBINAR_FUEL_CONFIG.sessionIds.tuesday 
    : WEBINAR_FUEL_CONFIG.sessionIds.saturday;
  
  return {
    webinar_session_id: sessionId,
    scheduled_at: nextSessionDate.toISOString(),
    dayOfWeek
  };
};

// Initialize widget loading
export const initializeWebinarFuelWidget = () => {
  // Load WebinarFuel script if not already loaded
  if (!document.querySelector('script[src*="d3pw37i36t41cq.cloudfront.net"]')) {
    const script = document.createElement('script');
    script.src = 'https://d3pw37i36t41cq.cloudfront.net/embed_v2.js';
    script.async = true;
    document.head.appendChild(script);
  }
  
  // Initialize window._wf if not already present
  if (typeof window !== 'undefined') {
    (window as any)._wf = (window as any)._wf || [];
    (window as any)._wf.push({
      id: 'KvKUagFa1nobkfcZGaSK3KiP'
    });
  }
};