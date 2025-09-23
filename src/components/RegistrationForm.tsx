'use client';

import { useState, useEffect } from 'react';
import { validateField, formatPhoneNumber, type FormData } from '@/lib/form-validation';
import { isEmailAlreadySubmitted, markEmailAsSubmitted } from '@/lib/duplicate-prevention';
import { parseSessionDateFromWidget, initializeWebinarFuelWidget } from '@/lib/date-parser';

interface RegistrationFormProps {
  onSuccess: (cid?: string) => void;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  general?: string;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionData, setSessionData] = useState<{ 
    webinar_session_id: number; 
    scheduled_at: string; 
    dayOfWeek?: string;
  } | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  
  // Initialize WebinarFuel widget and parse session data
  useEffect(() => {
    initializeWebinarFuelWidget();
    
    const loadSessionData = async () => {
      try {
        const session = await parseSessionDateFromWidget();
        setSessionData(session);
      } catch (error) {
        console.error('Failed to parse session data:', error);
      } finally {
        setIsLoadingSession(false);
      }
    };
    
    // Wait a bit for widget to load, then parse
    setTimeout(loadSessionData, 2000);
  }, []);
  
  const handleInputChange = (field: keyof FormData, value: string) => {
    // Format phone number as user types
    if (field === 'phone') {
      value = formatPhoneNumber(value);
    }
    
    setFormData((prev: FormData) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev: FormErrors) => ({ ...prev, [field]: undefined }));
    }
  };
  
  const handleBlur = (field: keyof FormData) => {
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Check for duplicate submission
    if (isEmailAlreadySubmitted(formData.email)) {
      setErrors({ general: 'You have already registered for this webinar. Check your email for confirmation details.' });
      return;
    }
    
    // Validate all fields
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key as keyof FormData, formData[key as keyof FormData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (!sessionData) {
      setErrors({ general: 'Session information is loading. Please wait a moment and try again.' });
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          session: sessionData
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Mark email as submitted to prevent duplicates
        markEmailAsSubmitted(formData.email, result.cid);
        onSuccess(result.cid);
      } else {
        setErrors({ general: result.error || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Hidden WebinarFuel widget for date parsing */}
      <div className="hidden">
        <div className="wf_target wf_target_KvKUagFa1nobkfcZGaSK3KiP"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your first name"
            disabled={isSubmitting}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>
        
        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your last name"
            disabled={isSubmitting}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
        
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your email address"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        
        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="(555) 123-4567"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
        
        {/* Session Info Display */}
        {sessionData && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              🗓️ Next Session: {sessionData.dayOfWeek === 'tuesday' ? 'Tuesday' : 'Saturday'} at 7:00 PM EST
            </p>
          </div>
        )}
        
        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        )}
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoadingSession}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Securing Your Spot...
            </div>
          ) : isLoadingSession ? (
            'Loading Session Info...'
          ) : (
            '🎯 SECURE MY FREE SPOT NOW!'
          )}
        </button>
        
        {/* Trust Signals */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🔒 Your information is secure and will not be shared
          </p>
        </div>
      </form>
    </div>
  );
}