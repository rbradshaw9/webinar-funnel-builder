// Form validation utilities for conversion optimization

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// Email validation
const validateEmail = (email: string): string | null => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

// Phone validation
const validatePhone = (phone: string): string | null => {
  if (!phone || !phone.trim()) {
    return 'Phone number is required';
  }
  
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check for valid US phone number length
  if (cleanPhone.length < 10) {
    return 'Phone number must be at least 10 digits';
  }
  
  return null;
};

// Name validation
const validateName = (name: string, fieldName: string): string | null => {
  if (!name || !name.trim()) {
    return `${fieldName} is required`;
  }
  
  if (name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters`;
  }
  
  return null;
};

// Main validation function
export const validateForm = (data: FormData): ValidationResult => {
  const errors: Record<string, string> = {};
  
  // Validate first name
  const firstNameError = validateName(data.firstName, 'First name');
  if (firstNameError) errors.firstName = firstNameError;
  
  // Validate last name
  const lastNameError = validateName(data.lastName, 'Last name');
  if (lastNameError) errors.lastName = lastNameError;
  
  // Validate email
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  
  // Validate phone
  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Real-time validation for individual fields
export const validateField = (field: string, value: string): string | null => {
  switch (field) {
    case 'firstName':
      return validateName(value, 'First name');
    case 'lastName':
      return validateName(value, 'Last name');
    case 'email':
      return validateEmail(value);
    case 'phone':
      return validatePhone(value);
    default:
      return null;
  }
};

// Clean and normalize form data
export const cleanFormData = (data: FormData): FormData => {
  return {
    firstName: (data.firstName || '').trim(),
    lastName: (data.lastName || '').trim(),
    email: (data.email || '').trim().toLowerCase(),
    phone: (data.phone || '').trim()
  };
};

// Phone number formatting for display
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if not standard format
};

// Email normalization
export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Check if email is from a disposable email provider
export const isDisposableEmail = (email: string): boolean => {
  const disposableDomains = [
    '10minutemail.com',
    'guerrillamail.com',
    'tempmail.org',
    'temp-mail.org',
    'yopmail.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
};

// Convert validation errors to user-friendly messages
export const getFieldErrorMessage = (field: string, error: string): string => {
  const friendlyMessages: Record<string, string> = {
    'firstName': 'Please enter your first name',
    'lastName': 'Please enter your last name', 
    'email': 'Please enter a valid email address',
    'phone': 'Please enter a valid phone number'
  };
  
  return friendlyMessages[field] || error;
};