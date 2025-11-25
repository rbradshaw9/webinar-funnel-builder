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
  referenceUrl?: string;
  additionalNotes?: string;
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
${context.referenceUrl ? `Reference URL: ${context.referenceUrl} - Analyze this page for images, layout, and style inspiration` : ''}
${context.additionalNotes ? `Special Instructions: ${context.additionalNotes}` : ''}

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

STYLING REQUIREMENTS (CRITICAL):
- Include Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
- Professional gradients: bg-gradient-to-br from-blue-600 to-purple-700
- Large headings with text-4xl or text-5xl
- Proper spacing with py-12, px-4, etc.
- Rounded buttons with shadow: rounded-lg shadow-lg px-8 py-4
- Mobile responsive with container mx-auto max-w-4xl

TECHNICAL INTEGRATION:
- HTML form POST to: ${context.infusionsoftFields.actionUrl}
- Hidden field: <input type="hidden" name="inf_field_xid" value="${context.infusionsoftFields.xid}" />
- Form fields: ${Object.keys(context.infusionsoftFields.fields).map(k => `inf_field_${k}`).join(', ')}
${context.infusionsoftFields.hasSmsConsent ? '- SMS consent checkbox with inf_custom_SMSOptInWebinar' : ''}
- WebinarFuel widget: <div data-webinarfuel-webinar="${context.webinarfuelData.webinarId}" data-webinarfuel-widget="${context.webinarfuelData.widgetId}"></div>
- Widget script: <script src="https://app.webinarfuel.com/widgets/v2/embed.js"></script>

Return ONLY complete HTML (no markdown blocks). Must include <!DOCTYPE html>, <head> with Tailwind CDN, compelling sales copy.`;

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

STYLING (CRITICAL):
- Tailwind CDN: <script src="https://cdn.tailwindcss.com"></script>
- Success colors: bg-green-600, text-green-600
- Large celebration text: text-5xl font-bold
- Icons: ✓ checkmark, 📅 calendar, 📧 email
- Professional gradients and shadows

CONTENT SECTIONS:
1. Hero: Big congratulations with checkmark icon
2. Next Steps: Check email (bold), add to calendar
3. Calendar Buttons:
   - <a href="/api/calendar/google" class="bg-blue-600...">Add to Google Calendar</a>
   - <a href="/api/calendar/ics" class="bg-gray-600...">Download ICS</a>
4. WebinarFuel countdown/replay widget:
   <div data-webinarfuel-webinar="${context.webinarfuelData.webinarId}" data-webinarfuel-widget="${context.webinarfuelData.widgetId}"></div>
   <script src="https://app.webinarfuel.com/widgets/v2/embed.js"></script>
5. What to Expect: Bullet points of benefits
6. Social proof section

Return ONLY complete HTML (no markdown). Enthusiastic, professional design with Tailwind.`;

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
