import * as cheerio from 'cheerio';

export interface InfusionsoftFormData {
  actionUrl: string;
  xid: string;
  formName: string;
  fieldMappings: Record<string, string>; // Field name -> input name mapping
  hasPhoneField: boolean;
  hasSMSConsent: boolean;
  smsConsentFieldName?: string;
  hiddenFields: Record<string, string>;
  trackingScripts?: string[]; // Infusionsoft tracking scripts to preserve
  rawFormHtml?: string; // Complete form HTML for reference
}

/**
 * Parse Infusionsoft form HTML and extract all necessary data
 */
export function parseInfusionsoftForm(html: string): InfusionsoftFormData {
  const $ = cheerio.load(html);
  const form = $('form').first();
  
  if (!form.length) {
    throw new Error('No form element found in the provided HTML');
  }

  // Extract action URL
  const actionUrl = form.attr('action');
  if (!actionUrl) {
    throw new Error('Form action URL not found');
  }

  // Extract XID from hidden field
  const xid = $('input[name="inf_form_xid"]').val() as string;
  if (!xid) {
    throw new Error('Infusionsoft form XID not found');
  }

  // Extract form name
  const formName = $('input[name="inf_form_name"]').val() as string || 'Webinar Registration';

  // Extract ALL input fields (not just standard ones)
  const fieldMappings: Record<string, string> = {};
  const hiddenFields: Record<string, string> = {};
  
  // Get all input fields
  $('input').each((_, el) => {
    const $input = $(el);
    const name = $input.attr('name');
    const type = $input.attr('type') || 'text';
    const value = $input.attr('value') || '';
    
    if (!name) return;
    
    // Store hidden fields with their values
    if (type === 'hidden') {
      hiddenFields[name] = value;
    }
    // Map visible input fields
    else if (type !== 'submit' && type !== 'button') {
      // Map to simplified key for easier access
      if (name === 'inf_field_FirstName') fieldMappings.firstname = name;
      else if (name === 'inf_field_LastName') fieldMappings.lastname = name;
      else if (name === 'inf_field_Email') fieldMappings.email = name;
      else if (name === 'inf_field_Phone1') fieldMappings.phone = name;
      else if (type === 'checkbox') {
        // Store checkbox fields by their name
        fieldMappings[name] = name;
      } else {
        // Store all other fields by their name
        fieldMappings[name] = name;
      }
    }
  });

  // Check for phone field
  const hasPhoneField = !!fieldMappings.phone;

  // Check for SMS consent checkbox
  const smsConsentInput = $('input[type="checkbox"]').filter((_, el) => {
    const name = $(el).attr('name') || '';
    return name.toLowerCase().includes('text') || 
           name.toLowerCase().includes('sms') ||
           $(el).next('label').text().toLowerCase().includes('text message') ||
           $(el).siblings('label').text().toLowerCase().includes('text message');
  });
  
  const hasSMSConsent = smsConsentInput.length > 0;
  const smsConsentFieldName = hasSMSConsent ? smsConsentInput.attr('name') : undefined;

  // Extract tracking scripts
  const trackingScripts: string[] = [];
  $('script').each((_, el) => {
    const $script = $(el);
    const src = $script.attr('src') || '';
    
    // Preserve Infusionsoft tracking scripts
    if (src.includes('infusionsoft.com') || src.includes('webTracking') || 
        src.includes('timezone') || src.includes('jquery') || src.includes('overwriteReferer')) {
      // Get full script tag as string
      trackingScripts.push($.html($script));
    }
  });

  return {
    actionUrl,
    xid,
    formName,
    fieldMappings,
    hasPhoneField,
    hasSMSConsent,
    smsConsentFieldName,
    hiddenFields,
    trackingScripts,
    rawFormHtml: html
  };
}

/**
 * Validate parsed Infusionsoft form data
 */
export function validateInfusionsoftForm(data: InfusionsoftFormData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.actionUrl || !data.actionUrl.includes('infusionsoft.com')) {
    errors.push('Invalid Infusionsoft action URL');
  }

  if (!data.xid) {
    errors.push('Missing form XID');
  }

  if (!data.fieldMappings.email) {
    errors.push('Email field mapping not found');
  }

  if (!data.fieldMappings.firstname && !data.fieldMappings.lastname) {
    errors.push('At least one name field (first or last) is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Build submission payload for Infusionsoft
 */
export function buildInfusionsoftPayload(
  formData: InfusionsoftFormData,
  userData: {
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    smsConsent?: boolean;
  }
): Record<string, string> {
  const payload: Record<string, string> = {};

  // Add all hidden fields
  Object.entries(formData.hiddenFields).forEach(([key, value]) => {
    payload[key] = value;
  });

  // Map user data to Infusionsoft fields
  if (userData.firstName && formData.fieldMappings.firstname) {
    payload[formData.fieldMappings.firstname] = userData.firstName;
  }

  if (userData.lastName && formData.fieldMappings.lastname) {
    payload[formData.fieldMappings.lastname] = userData.lastName;
  }

  if (formData.fieldMappings.email) {
    payload[formData.fieldMappings.email] = userData.email;
  }

  // Always include phone if provided (even without SMS consent)
  if (userData.phone && formData.fieldMappings.phone) {
    payload[formData.fieldMappings.phone] = userData.phone;
  }

  // Add SMS consent if applicable
  if (userData.smsConsent && formData.smsConsentFieldName) {
    payload[formData.smsConsentFieldName] = formData.hiddenFields[formData.smsConsentFieldName] || '1';
  }

  return payload;
}

/**
 * Submit data to Infusionsoft
 */
export async function submitToInfusionsoft(
  formData: InfusionsoftFormData,
  userData: {
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    smsConsent?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = buildInfusionsoftPayload(formData, userData);

    // Convert payload to URL-encoded form data
    const formBody = Object.entries(payload)
      .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
      .join('&');

    const response = await fetch(formData.actionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    if (!response.ok) {
      throw new Error(`Infusionsoft submission failed: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Infusionsoft submission error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
