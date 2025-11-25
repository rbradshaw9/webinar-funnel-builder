import Anthropic from "@anthropic-ai/sdk";

// Debug: Check if API key is loaded
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('[Claude AI] ANTHROPIC_API_KEY is not set in environment variables');
}

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
  
  const prompt = `Create a high-converting webinar registration page.

CONTEXT:
Title: ${context.webinarTitle}
Description: ${context.webinarDescription}
${context.targetAudience ? `Audience: ${context.targetAudience}` : ''}
${context.mainBenefits ? `Benefits: ${context.mainBenefits}` : ''}
${context.socialProof ? `Proof: ${context.socialProof}` : ''}
${context.hostInfo ? `Host: ${context.hostInfo}` : ''}

TECHNICAL INTEGRATION:
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

REQUIREMENTS:
- Modern hero with gradients, mobile-responsive Tailwind CSS
- HTML form POST to: ${context.infusionsoftFields.actionUrl}
- Hidden fields: inf_field_xid="${context.infusionsoftFields.xid}"
- Visible fields: ${Object.keys(context.infusionsoftFields.fields).map(k => `inf_field_${k}`).join(', ')}
${context.infusionsoftFields.hasSmsConsent ? '- SMS consent checkbox' : ''}
- WebinarFuel: <div data-webinarfuel-webinar="${context.webinarfuelData.webinarId}" data-webinarfuel-widget="${context.webinarfuelData.widgetId}"></div>
- Script: https://app.webinarfuel.com/widgets/v2/embed.js

Return complete HTML only (no markdown). Include <!DOCTYPE html>, inline CSS, compelling copy based on context.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
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
  
  const prompt = `Create a webinar confirmation/thank you page.

CONTEXT:
Title: ${context.webinarTitle}
Description: ${context.webinarDescription}
${context.socialProof ? `Proof: ${context.socialProof}` : ''}
${context.hostInfo ? `Host: ${context.hostInfo}` : ''}

REQUIREMENTS:
1. Congratulatory hero confirming registration
2. Next steps: Check email, add to calendar
3. Calendar buttons:
   - Google: /api/calendar/google?email={EMAIL}&session={SESSION}
   - ICS: /api/calendar/ics?email={EMAIL}&session={SESSION}
4. WebinarFuel widget:
   <div data-webinarfuel-webinar="${context.webinarfuelData.webinarId}" data-webinarfuel-widget="${context.webinarfuelData.widgetId}"></div>
   <script src="https://app.webinarfuel.com/widgets/v2/embed.js"></script>
5. What to expect section with benefits
6. Excitement builders with social proof

Return complete HTML only (no markdown). Modern design, Tailwind CSS, inline styles/scripts, enthusiastic tone.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
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
