import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface FunnelContext {
  name: string;
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
  const prompt = `You are an expert web designer creating a high-converting webinar registration page.

Funnel Name: ${context.name}

Infusionsoft Form Details:
- Action URL: ${context.infusionsoftFields.actionUrl}
- XID: ${context.infusionsoftFields.xid}
- Fields: ${JSON.stringify(context.infusionsoftFields.fields)}
- SMS Consent: ${context.infusionsoftFields.hasSmsConsent}

WebinarFuel Details:
- Widget Type: ${context.webinarfuelData.widgetType}
- Webinar ID: ${context.webinarfuelData.webinarId}
- Widget ID: ${context.webinarfuelData.widgetId}

Create a complete, modern, high-converting registration page with:
1. Professional hero section with compelling headline
2. Registration form with all Infusionsoft fields (use proper name attributes)
3. Form must POST to the Infusionsoft action URL with all hidden fields including inf_field_xid
4. If SMS consent field exists, include checkbox with proper label
5. WebinarFuel widget embedded for session selection
6. Social proof elements
7. Responsive design using Tailwind CSS
8. Modern gradient backgrounds and styling
9. Clear call-to-action button

IMPORTANT: The form must be a standard HTML form that submits to Infusionsoft, not JavaScript-based.
Include all hidden fields and proper field mappings.

Return ONLY the complete HTML (including <!DOCTYPE html>, all CSS in <style> tags, and all necessary markup). 
Do not include any explanations or markdown code blocks.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return content.text;
  }
  
  throw new Error("Failed to generate registration page");
}

export async function generateConfirmationPage(context: FunnelContext): Promise<string> {
  const prompt = `You are an expert web designer creating a webinar confirmation/thank you page.

Funnel Name: ${context.name}

WebinarFuel Details:
- Widget Type: ${context.webinarfuelData.widgetType}
- Webinar ID: ${context.webinarfuelData.webinarId}
- Widget ID: ${context.webinarfuelData.widgetId}

Create a complete, professional confirmation page with:
1. Congratulatory hero section confirming registration
2. Clear next steps section
3. Calendar links section with buttons for:
   - Google Calendar
   - Apple Calendar (.ics download)
   - Outlook Calendar (.ics download)
4. WebinarFuel widget showing their selected session details
5. What to expect section
6. Social sharing buttons (optional)
7. Responsive design using Tailwind CSS
8. Modern, professional styling with gradients
9. Reminder to check email

Use placeholder calendar URLs: 
- Google: /api/calendar/google?email={EMAIL}&session={SESSION}
- ICS: /api/calendar/ics?email={EMAIL}&session={SESSION}

Return ONLY the complete HTML (including <!DOCTYPE html>, all CSS in <style> tags, and all necessary markup).
Do not include any explanations or markdown code blocks.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

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
