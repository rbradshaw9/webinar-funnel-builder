import { NextRequest, NextResponse } from 'next/server';
import { submitRegistration } from '@/lib/api-clients';
import { validateForm, cleanFormData } from '@/lib/form-validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const validation = validateForm(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }
    
    // Clean and prepare data
    const cleanData = cleanFormData(body);
    
    // Validate session data
    if (!body.session || !body.session.webinar_session_id || !body.session.scheduled_at) {
      return NextResponse.json(
        { success: false, error: 'Session information is required' },
        { status: 400 }
      );
    }
    
    // Submit to both APIs
    const result = await submitRegistration(cleanData, body.session);
    
    if (result.success) {
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
      console.error('Registration submission failed:', result);
      
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