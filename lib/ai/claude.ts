import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface FunnelContext {
  name: string;
  webinarTitle: string;
  webinarDescription: string;
  targetAudience?: string;
  mainBenefits?: string;
  socialProof?: string;
  hostInfo?: string;
  urgency?: string;
  infusionsoftFields: {
    actionUrl: string;
    xid: string;
    fields: Record<string, string>;
    hasSmsConsent: boolean;
  };
  webinarfuelData: {
    webinarId: number;
    widgetId: number;
    widgetType: string;
    schedule?: any;
  };
}

export async function generateRegistrationPage(context: FunnelContext): Promise<string> {
  console.log('[Claude AI] Generating registration page...');
  
  const prompt = `You are an expert conversion copywriter and web designer. You will create a high-converting webinar registration page.

STEP 1: RESEARCH & ANALYSIS
First, analyze this webinar information and research the niche:

Webinar Title: ${context.webinarTitle}
Description: ${context.webinarDescription}
${context.targetAudience ? `Target Audience: ${context.targetAudience}` : ''}
${context.mainBenefits ? `Key Benefits:\n${context.mainBenefits}` : ''}
${context.socialProof ? `Social Proof: ${context.socialProof}` : ''}
${context.hostInfo ? `Host Info: ${context.hostInfo}` : ''}
${context.urgency ? `Urgency Elements: ${context.urgency}` : ''}

Based on this information:
1. Identify the specific niche/industry and typical pain points
2. Research what messaging resonates with this audience
3. Determine the best psychological triggers for this market
4. Identify common objections and how to overcome them

STEP 2: CREATE HIGH-CONVERTING COPY
Using your research, craft:
- A compelling, benefit-driven headline that speaks to the core desire
- Subheadline that amplifies curiosity or urgency
- 3-5 bullet points highlighting transformational benefits (not features)
- Social proof that builds credibility and trust
- Clear, action-oriented CTA that reduces friction

STEP 3: TECHNICAL INTEGRATION
Integrate these technical requirements seamlessly:

Infusionsoft Form:
- Action URL: ${context.infusionsoftFields.actionUrl}
- XID: ${context.infusionsoftFields.xid}
- Field Mappings: ${JSON.stringify(context.infusionsoftFields.fields)}
- SMS Consent Field: ${context.infusionsoftFields.hasSmsConsent ? 'Required' : 'Not needed'}

WebinarFuel Widget:
- Webinar ID: ${context.webinarfuelData.webinarId}
- Widget ID: ${context.webinarfuelData.widgetId}
- Widget Type: ${context.webinarfuelData.widgetType}

DESIGN REQUIREMENTS:
1. Modern, professional hero section with gradient backgrounds
2. Clean, mobile-responsive layout using Tailwind CSS
3. Standard HTML form (NOT JavaScript-based) that POSTs to Infusionsoft
4. All hidden fields included (inf_field_FirstName, inf_field_LastName, inf_field_Email, inf_field_xid, etc.)
5. WebinarFuel widget div with proper data attributes: data-webinarfuel-webinar="${context.webinarfuelData.webinarId}"
6. Visible form fields matching Infusionsoft mappings
7. Trust badges, testimonials, or social proof if provided
8. Conversion-optimized button copy (avoid generic "Submit")
9. Professional color scheme appropriate for the niche

CRITICAL RULES:
- The form MUST submit directly to Infusionsoft action URL (method="POST")
- ALL field names must match exactly: inf_field_FirstName, inf_field_LastName, inf_field_Email, etc.
- Include inf_field_xid as hidden field with value "${context.infusionsoftFields.xid}"
- If SMS consent exists, include as checkbox with proper label
- WebinarFuel widget MUST be embedded in the page (not in form)
- Return ONLY complete HTML - no explanations, no markdown backticks
- Include <!DOCTYPE html> and complete <head> with meta tags
- All CSS must be in <style> tags
- All JavaScript must be inline <script> tags

Generate a professional, conversion-optimized registration page now.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  }, {
    timeout: 120000, // 2 minute timeout
  });

  console.log('[Claude AI] Registration page generated');

  const content = message.content[0];
  if (content.type === "text") {
    return content.text;
  }
  
  throw new Error("Failed to generate registration page");
}

export async function generateConfirmationPage(context: FunnelContext): Promise<string> {
  console.log('[Claude AI] Generating confirmation page...');
  
  const prompt = `You are an expert conversion copywriter creating a webinar confirmation/thank you page.

WEBINAR CONTEXT:
Title: ${context.webinarTitle}
Description: ${context.webinarDescription}
${context.socialProof ? `Social Proof: ${context.socialProof}` : ''}
${context.hostInfo ? `Host: ${context.hostInfo}` : ''}

GOAL: Create a confirmation page that:
1. Reinforces the decision to register (reduces buyer's remorse)
2. Increases attendance by making it easy to add to calendar
3. Builds excitement for the upcoming webinar
4. Sets clear expectations for what happens next

PAGE STRUCTURE:
1. **Hero Section**
   - Congratulatory message confirming registration
   - Reinforce the value they'll receive
   - Brief reminder of date/time (WebinarFuel will show this)

2. **Next Steps Section**
   - Clear, numbered action items
   - Add to calendar (with prominent buttons)
   - Check email for access link
   - Join Facebook group or follow on social (if applicable)

3. **Calendar Integration**
   Use these placeholder URLs (JavaScript will populate with actual session data):
   - Google Calendar: /api/calendar/google?email={EMAIL}&session={SESSION}
   - Apple/Outlook (.ics): /api/calendar/ics?email={EMAIL}&session={SESSION}
   
   Create prominent, colorful calendar buttons with icons

4. **WebinarFuel Widget**
   Embed widget to show their specific session details:
   <div data-webinarfuel-webinar="${context.webinarfuelData.webinarId}" 
        data-webinarfuel-widget="${context.webinarfuelData.widgetId}"></div>
   <script src="https://app.webinarfuel.com/widgets/v2/embed.js"></script>

5. **What to Expect Section**
   - What they'll learn (use benefits from context)
   - How long the webinar will be
   - What they need to prepare (if anything)
   - Replay availability (if applicable)

6. **Excitement Builders**
   ${context.socialProof ? `- Social proof: ${context.socialProof}` : '- Include testimonials or success stories'}
   - "See you soon" message from host
   - Preview of bonus materials or special offers

DESIGN REQUIREMENTS:
- Modern, celebratory design with gradients
- Mobile-responsive using Tailwind CSS
- Professional color scheme matching registration page
- Clear visual hierarchy guiding eye through action steps
- Trust-building elements throughout
- Optimistic, enthusiastic tone

TECHNICAL REQUIREMENTS:
- Complete HTML with <!DOCTYPE html>
- All CSS in <style> tags
- Inline JavaScript for calendar link population
- WebinarFuel widget properly embedded
- Meta tags for social sharing
- NO explanations or markdown - ONLY HTML

Generate the confirmation page now.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  }, {
    timeout: 120000, // 2 minute timeout
  });

  console.log('[Claude AI] Confirmation page generated');

  const content = message.content[0];
  if (content.type === "text") {
    return content.text;
  }
  
  throw new Error("Failed to generate confirmation page");
}

export async function refinePageWithFeedback(
  currentHtml: string,
  feedback: string
): Promise<string> {
  const prompt = `You are refining a webinar funnel page based on user feedback.

Current HTML:
${currentHtml}

User Feedback:
${feedback}

Make the requested changes while maintaining the overall structure and functionality.
Return ONLY the complete updated HTML. Do not include explanations or markdown code blocks.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return content.text;
  }
  
  throw new Error("Failed to refine page");
}
