// Duplicate submission prevention using session storage

const SUBMISSION_KEY_PREFIX = 'webinar_submitted_';
const SUBMISSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface SubmissionRecord {
  email: string;
  timestamp: number;
  cid?: string;
}

// Check if email has already been submitted recently
export const isEmailAlreadySubmitted = (email: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const key = SUBMISSION_KEY_PREFIX + email.toLowerCase().trim();
    const stored = sessionStorage.getItem(key);
    
    if (!stored) return false;
    
    const record: SubmissionRecord = JSON.parse(stored);
    const now = Date.now();
    
    // Check if submission is within timeout period
    if (now - record.timestamp < SUBMISSION_TIMEOUT) {
      return true;
    } else {
      // Remove expired record
      sessionStorage.removeItem(key);
      return false;
    }
  } catch (error) {
    console.warn('Error checking duplicate submission:', error);
    return false;
  }
};

// Mark email as submitted
export const markEmailAsSubmitted = (email: string, cid?: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const key = SUBMISSION_KEY_PREFIX + email.toLowerCase().trim();
    const record: SubmissionRecord = {
      email: email.toLowerCase().trim(),
      timestamp: Date.now(),
      cid
    };
    
    sessionStorage.setItem(key, JSON.stringify(record));
  } catch (error) {
    console.warn('Error marking email as submitted:', error);
  }
};

// Get previous submission details if exists
export const getPreviousSubmission = (email: string): SubmissionRecord | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const key = SUBMISSION_KEY_PREFIX + email.toLowerCase().trim();
    const stored = sessionStorage.getItem(key);
    
    if (!stored) return null;
    
    const record: SubmissionRecord = JSON.parse(stored);
    const now = Date.now();
    
    // Check if submission is still valid
    if (now - record.timestamp < SUBMISSION_TIMEOUT) {
      return record;
    } else {
      // Remove expired record
      sessionStorage.removeItem(key);
      return null;
    }
  } catch (error) {
    console.warn('Error getting previous submission:', error);
    return null;
  }
};

// Clear all submission records (for testing/debugging)
export const clearAllSubmissions = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(SUBMISSION_KEY_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Error clearing submissions:', error);
  }
};