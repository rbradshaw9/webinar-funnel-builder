// Enhanced date parsing logic for WebinarFuel hidden widget with Day.js

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { WEBINAR_FUEL_CONFIG } from './api-clients';

// Configure Day.js plugins
dayjs.extend(customParseFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

interface ParsedSession {
  webinar_session_id: number;
  scheduled_at: string;
  dayOfWeek: 'tuesday' | 'saturday';
}

// Enhanced date parsing with multiple format support
const parseWebinarDateString = (dateStr: string): dayjs.Dayjs | null => {
  console.log('🔍 Attempting to parse date string:', dateStr);
  
  // Common date formats found in WebinarFuel widgets
  const formats = [
    'M/D/YYYY',
    'MM/DD/YYYY',
    'YYYY-MM-DD',
    'MMMM D, YYYY',
    'MMM D, YYYY',
    'dddd, MMMM D, YYYY',
    'ddd, MMM D, YYYY'
  ];
  
  for (const format of formats) {
    const parsed = dayjs(dateStr.trim(), format, true);
    if (parsed.isValid()) {
      console.log('✅ Successfully parsed date with format:', format);
      return parsed;
    }
  }
  
  // Fallback to native Date parsing
  const nativeDate = new Date(dateStr.trim());
  if (!isNaN(nativeDate.getTime())) {
    console.log('✅ Successfully parsed date with native Date constructor');
    return dayjs(nativeDate);
  }
  
  console.warn('❌ Failed to parse date string:', dateStr);
  return null;
};

// Wait for WebinarFuel widget to load and extract date
export const parseSessionDateFromWidget = async (): Promise<ParsedSession | null> => {
  console.log('🔄 Starting widget date parsing...');
  
  return new Promise((resolve) => {
    const maxAttempts = 20; // 10 seconds max wait
    let attempts = 0;

    const checkForWidget = () => {
      attempts++;
      console.log(`🔍 Widget check attempt ${attempts}/${maxAttempts}`);
      
      // Look for the WebinarFuel widget container
      const widgetContainer = document.querySelector('.wf_target_KvKUagFa1nobkfcZGaSK3KiP');
      
      if (widgetContainer) {
        console.log('📦 Widget container found, searching for date content...');
        
        // Try to extract date information from the widget
        const dateElements = widgetContainer.querySelectorAll('*');
        
        for (const element of dateElements) {
          const text = element.textContent || '';
          
          // Enhanced regex patterns for better date matching
          const patterns = [
            /(Tuesday|Saturday)[^\n]*?(\d{1,2}\/\d{1,2}\/\d{4})/i,
            /(Tuesday|Saturday)[^\n]*?(\d{4}-\d{2}-\d{2})/i,
            /(Tuesday|Saturday)[^\n]*?([A-Za-z]+ \d{1,2}, \d{4})/i,
            /(Tuesday|Saturday)[^\n]*?(\w{3}, \w{3} \d{1,2}, \d{4})/i
          ];
          
          for (const pattern of patterns) {
            const dateMatch = text.match(pattern);
            
            if (dateMatch) {
              const dayOfWeek = dateMatch[1].toLowerCase() as 'tuesday' | 'saturday';
              const dateStr = dateMatch[2];
              
              console.log('🎯 Found date match:', { dayOfWeek, dateStr });
              
              const parsedDate = parseWebinarDateString(dateStr);
              
              if (parsedDate) {
                // Set time to 7:00 PM EST
                const sessionDate = parsedDate
                  .tz('America/New_York')
                  .hour(19)
                  .minute(0)
                  .second(0)
                  .millisecond(0);
                
                const sessionId = dayOfWeek === 'tuesday' 
                  ? WEBINAR_FUEL_CONFIG.sessionIds.tuesday 
                  : WEBINAR_FUEL_CONFIG.sessionIds.saturday;
                
                const result = {
                  webinar_session_id: sessionId,
                  scheduled_at: sessionDate.utc().toISOString(),
                  dayOfWeek
                };
                
                console.log('✅ Successfully parsed session data:', result);
                resolve(result);
                return;
              }
            }
          }
        }
      } else {
        console.log('⏳ Widget container not found yet...');
      }
      
      if (attempts < maxAttempts) {
        setTimeout(checkForWidget, 500);
      } else {
        console.warn('⚠️ Widget parsing timeout, using fallback logic');
        // Fallback: determine next session based on current date
        resolve(getNextSessionFallback());
      }
    };
    
    // Start checking immediately
    checkForWidget();
  });
};

// Enhanced fallback function using Day.js for next session calculation
const getNextSessionFallback = (): ParsedSession => {
  console.log('🔄 Using fallback logic to determine next session...');
  
  const now = dayjs().tz('America/New_York');
  const currentDay = now.day(); // 0 = Sunday, 2 = Tuesday, 6 = Saturday
  const currentHour = now.hour();
  
  console.log('📅 Current time:', {
    day: now.format('dddd'),
    date: now.format('YYYY-MM-DD'),
    hour: currentHour,
    dayNumber: currentDay
  });
  
  let nextSessionDate: dayjs.Dayjs;
  let dayOfWeek: 'tuesday' | 'saturday';
  
  // Find next Tuesday or Saturday session
  if (currentDay < 2) {
    // Before Tuesday (Sunday/Monday) - next Tuesday
    nextSessionDate = now.day(2);
    dayOfWeek = 'tuesday';
  } else if (currentDay === 2) {
    // Tuesday - check if before 7 PM
    if (currentHour < 19) {
      nextSessionDate = now;
      dayOfWeek = 'tuesday';
    } else {
      // After Tuesday 7 PM - next Saturday
      nextSessionDate = now.day(6);
      dayOfWeek = 'saturday';
    }
  } else if (currentDay < 6) {
    // Wednesday to Friday - next Saturday
    nextSessionDate = now.day(6);
    dayOfWeek = 'saturday';
  } else if (currentDay === 6) {
    // Saturday - check if before 7 PM
    if (currentHour < 19) {
      nextSessionDate = now;
      dayOfWeek = 'saturday';
    } else {
      // After Saturday 7 PM - next Tuesday
      nextSessionDate = now.add(1, 'week').day(2);
      dayOfWeek = 'tuesday';
    }
  } else {
    // Sunday - next Tuesday
    nextSessionDate = now.add(1, 'week').day(2);
    dayOfWeek = 'tuesday';
  }
  
  // Set to 7:00 PM EST
  nextSessionDate = nextSessionDate.hour(19).minute(0).second(0).millisecond(0);
  
  const sessionId = dayOfWeek === 'tuesday' 
    ? WEBINAR_FUEL_CONFIG.sessionIds.tuesday 
    : WEBINAR_FUEL_CONFIG.sessionIds.saturday;
  
  const result = {
    webinar_session_id: sessionId,
    scheduled_at: nextSessionDate.utc().toISOString(),
    dayOfWeek
  };
  
  console.log('📊 Fallback session calculated:', {
    ...result,
    localTime: nextSessionDate.format('dddd, MMMM D, YYYY [at] h:mm A z')
  });
  
  return result;
};

// Enhanced widget initialization with error handling
export const initializeWebinarFuelWidget = () => {
  try {
    console.log('🚀 Initializing WebinarFuel widget...');
    
    // Load WebinarFuel script if not already loaded
    if (!document.querySelector('script[src*="d3pw37i36t41cq.cloudfront.net"]')) {
      console.log('📦 Loading WebinarFuel embed script...');
      const script = document.createElement('script');
      script.src = 'https://d3pw37i36t41cq.cloudfront.net/embed_v2.js';
      script.async = true;
      script.onload = () => console.log('✅ WebinarFuel script loaded successfully');
      script.onerror = () => console.error('❌ Failed to load WebinarFuel script');
      document.head.appendChild(script);
    } else {
      console.log('✅ WebinarFuel script already loaded');
    }
    
    // Initialize window._wf if not already present
    if (typeof window !== 'undefined') {
      const globalWindow = window as unknown as { _wf?: unknown[] };
      globalWindow._wf = globalWindow._wf || [];
      globalWindow._wf.push({
        id: 'KvKUagFa1nobkfcZGaSK3KiP'
      });
      console.log('🔧 WebinarFuel widget configuration pushed to window._wf');
    }
  } catch (error) {
    console.error('💥 Error initializing WebinarFuel widget:', error);
  }
};

// Legacy function for backward compatibility
export const parseWebinarDate = (): string => {
  console.warn('⚠️ parseWebinarDate() is deprecated. Use parseSessionDateFromWidget() instead.');
  const fallback = getNextSessionFallback();
  return fallback.scheduled_at;
};