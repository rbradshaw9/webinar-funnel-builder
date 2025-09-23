// WebinarFuel and Infusionsoft API integration utilities

// Development mode - set to true for local testing
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface WebinarFuelSession {
  webinar_session_id: number;
  scheduled_at: string;
}

interface WebinarFuelPayload {
  webinar_id: number;
  registrant: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string; // Made optional for SMS consent logic
  };
  session: WebinarFuelSession;
}

// WebinarFuel API Configuration
const WEBINAR_FUEL_CONFIG = {
  baseUrl: 'https://api.webinarfuel.com',
  token: 'Dp2kG9Vucpyq5t5RVPqvDxfU',
  webinarId: 75116,
  sessionIds: {
    tuesday: 66235,
    saturday: 66238
  }
};

// Infusionsoft Configuration
const INFUSIONSOFT_CONFIG = {
  account: 'yv932',
  formXid: '2d6fbc78abf8d18ab3268c6cfa02e974',
  formAction: 'https://yv932.infusionsoft.com/app/form/process/2d6fbc78abf8d18ab3268c6cfa02e974'
};

// Retry utility with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let attempt = 1;
  
  while (attempt <= maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      
      const delay = initialDelay * Math.pow(3, attempt - 1); // 1s, 3s, 9s
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }
  
  throw new Error('Max attempts reached');
};

// WebinarFuel API submission
export async function submitToWebinarFuel(
  data: RegistrationData, 
  session: WebinarFuelSession,
  includePhone: boolean = true
): Promise<{ success: boolean; cid?: string; error?: string }> {
  try {
    console.log('🟦 WebinarFuel submission:', {
      email: data.email,
      includePhone,
      phoneProvided: !!data.phone.trim()
    });

    // Development mode - return mock success
    if (IS_DEVELOPMENT) {
      console.log('DEV MODE: Mock WebinarFuel submission for:', data.email);
      return { 
        success: true, 
        cid: `mock-cid-${Date.now()}`
      };
    }

    const registrant: {
      email: string;
      first_name: string;
      last_name: string;
      phone?: string;
    } = {
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName
    };

    // Only include phone if consent is given and phone is provided
    if (includePhone && data.phone.trim()) {
      registrant.phone = data.phone;
      console.log('📞 Including phone number in WebinarFuel submission');
    } else {
      console.log('🚫 Excluding phone number from WebinarFuel submission');
    }

    const payload: WebinarFuelPayload = {
      webinar_id: WEBINAR_FUEL_CONFIG.webinarId,
      registrant,
      session
    };

    const response = await retryWithBackoff(async () => {
      const res = await fetch(`${WEBINAR_FUEL_CONFIG.baseUrl}/api/registrants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WEBINAR_FUEL_CONFIG.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(`WebinarFuel API error: ${res.status} ${res.statusText}`);
      }
      
      return res.json();
    });

    return { 
      success: true, 
      cid: response.registrant_session?.cid || response.cid
    };
  } catch (error) {
    console.error('WebinarFuel submission failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Infusionsoft form submission
export async function submitToInfusionsoft(
  data: RegistrationData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Development mode - return mock success
    if (IS_DEVELOPMENT) {
      console.log('DEV MODE: Mock Infusionsoft submission for:', data.email);
      return { success: true };
    }

    const formData = new FormData();
    formData.append('inf_form_xid', INFUSIONSOFT_CONFIG.formXid);
    formData.append('inf_form_name', 'Income Stacking Web Form submitted - FACEBOOK');
    formData.append('infusionsoft_version', '1.70.0.858820');
    formData.append('inf_field_FirstName', data.firstName);
    formData.append('inf_field_LastName', data.lastName);
    formData.append('inf_field_Email', data.email);
    formData.append('inf_field_Phone1', data.phone);
    
    // Add hidden tracking fields
    formData.append('inf_custom_GaContent', 'null');
    formData.append('inf_custom_GaSource', 'null');
    formData.append('inf_custom_GaMedium', 'null');
    formData.append('inf_custom_GaTerm', 'null');
    formData.append('inf_custom_GaCampaign', 'null');
    formData.append('inf_custom_GaCampaignID', 'null');
    formData.append('inf_custom_GaReferurl', 'null');
    formData.append('inf_custom_fbclid', 'null');

    await retryWithBackoff(async () => {
      const response = await fetch(INFUSIONSOFT_CONFIG.formAction, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // Infusionsoft doesn't support CORS
      });
      
      // With no-cors mode, we can't check response status
      // Consider it successful if no network error occurred
      return response;
    });

    return { success: true };
  } catch (error) {
    console.error('Infusionsoft submission failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Dual submission handler
export async function submitRegistration(
  data: RegistrationData,
  session: WebinarFuelSession,
  includePhoneForWebinarFuel: boolean = true
) {
  console.log('📊 API clients - submission parameters:', {
    includePhoneForWebinarFuel,
    phoneProvided: !!data.phone.trim()
  });

  const results = await Promise.allSettled([
    submitToWebinarFuel(data, session, includePhoneForWebinarFuel),
    submitToInfusionsoft(data) // Always include phone for Infusionsoft
  ]);

  const webinarFuelResult = results[0].status === 'fulfilled' ? results[0].value : { success: false, error: 'Failed to submit' };
  const infusionsoftResult = results[1].status === 'fulfilled' ? results[1].value : { success: false, error: 'Failed to submit' };

  console.log('📈 API submission results:', {
    webinarFuel: webinarFuelResult.success ? 'Success' : 'Failed',
    infusionsoft: infusionsoftResult.success ? 'Success' : 'Failed'
  });

  // Consider success if at least one submission succeeded
  const overallSuccess = webinarFuelResult.success || infusionsoftResult.success;

  return {
    success: overallSuccess,
    webinarFuel: webinarFuelResult,
    infusionsoft: infusionsoftResult,
    cid: webinarFuelResult.cid
  };
}

export { WEBINAR_FUEL_CONFIG };