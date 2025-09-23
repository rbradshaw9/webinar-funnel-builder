import { NextRequest, NextResponse } from 'next/server';
import { submitRegistration } from '@/lib/api-clients';
import { validateForm, cleanFormData } from '@/lib/form-validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔄 API Registration request received:', {
      email: body.email,
      smsConsent: body.smsConsent,
      includePhoneForWebinarFuel: body.includePhoneForWebinarFuel,
      phoneProvided: !!body.phone?.trim(),
      sessionId: body.session?.webinar_session_id
    });
    
    // Validate required fields (phone only required if SMS consent given)
    const validation = validateForm(body, body.smsConsent);
    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.errors);
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }
    
    // Clean and prepare data
    const cleanData = cleanFormData(body);
    
    // Validate session data
    if (!body.session || !body.session.webinar_session_id || !body.session.scheduled_at) {
      console.error('❌ Missing session data');
      return NextResponse.json(
        { success: false, error: 'Session information is required' },
        { status: 400 }
      );
    }
    
    console.log('📤 Submitting registration with consent flags:', {
      includePhoneForWebinarFuel: body.includePhoneForWebinarFuel,
      smsConsent: body.smsConsent
    });
    
    // Submit to both APIs with phone consent logic
    const result = await submitRegistration(
      cleanData, 
      body.session, 
      body.includePhoneForWebinarFuel
    );
    
    if (result.success) {
      console.log('✅ Registration successful:', {
        cid: result.cid,
        webinarFuelSuccess: result.webinarFuel?.success,
        infusionsoftSuccess: result.infusionsoft?.success
      });
      
      return NextResponse.json({
        success: true,
        cid: result.cid,
        details: {
          webinarFuel: result.webinarFuel,
          infusionsoft: result.infusionsoft
        }
      });
    } else {
      // Log the failure but still check if partial success occurred
      console.error('❌ Registration submission failed:', result);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Registration failed. Please try again.',
          details: {
            webinarFuel: result.webinarFuel,
            infusionsoft: result.infusionsoft
          }
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Registration API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}