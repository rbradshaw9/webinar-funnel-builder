import Anthropic from "@anthropic-ai/sdk";

// Debug: Check if API key is loaded
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('[Claude AI] ANTHROPIC_API_KEY is not set in environment variables');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface FunnelContext {
  slug: string;
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
  confirmationWidgetCode?: string;
  infusionsoftFields: {
    actionUrl: string;
    xid: string;
    fields: Record<string, string>;
    hasSmsConsent: boolean;
    trackingScripts?: string[];
    hiddenFields?: Record<string, string>;
  };
  webinarfuelData: {
    webinarId: number;
    widgetId: number;
    widgetType: string;
    schedule?: any;
  };
}

export async function generateRegistrationPage(context: FunnelContext, variant: 'A' | 'B' = 'A'): Promise<string> {
  console.log(`[Claude AI] Generating registration page variant ${variant}...`);
  console.log(`[Claude AI] Context:`, {
    title: context.webinarTitle,
    hasDescription: !!context.webinarDescription,
    hasTargetAudience: !!context.targetAudience,
    hasBenefits: !!context.mainBenefits,
    hasSocialProof: !!context.socialProof,
    hasHostInfo: !!context.hostInfo,
  });
  
  const variantNote = variant === 'B' ? '\n\nVARIANT B REQUIREMENTS:\n- Use a DIFFERENT design approach than variant A\n- Try different: color scheme, layout structure, or headline angle\n- Maintain same conversion elements but with fresh presentation\n- Still modern and professional but visually distinct' : '';
  
  const prompt = `Webinar registration page${variant === 'B' ? ' Variant B (different design)' : ''}.

${context.webinarTitle}
${context.webinarDescription}
${context.targetAudience ? `Target: ${context.targetAudience}` : ''}
${context.mainBenefits ? `Benefits: ${context.mainBenefits}` : ''}
${context.socialProof ? `Social Proof: ${context.socialProof}` : ''}
${context.hostInfo ? `Host: ${context.hostInfo}` : ''}

DESIGN: Modern, high-contrast (WCAG AAA), responsive. Creative multi-column layouts preferred. Include Tailwind CDN.
${variantNote}

FOOTER (MANDATORY - dark bg, centered):
© 2025 Tanner Training LLC
Links: Terms | Privacy | Disclaimer (https://thecashflowacademy.com/[terms-and-conditions|privacy-policy|disclaimer]/)
Disclaimer text-xs: "Tanner Training LLC is providing this training and any related materials (including newsletters, blog posts, and other communications) for educational purposes only. We are not providing legal, accounting, or financial advisory services, and this is not a solicitation or recommendation to buy or sell any stocks, options, or other financial instruments or investments. Examples that address specific assets, stocks, options, or transactions are for illustrative purposes only and may not represent specific trades or transactions that we have conducted. In fact, we may use examples that are different to or the opposite of transactions we have conducted or positions we hold. This training is not intended as a solicitation for any future relationship between the students or participants and the trainer. No express or implied warranties are being made with respect to these services and products. There is no guarantee that use of any of the services or products will result in a profit. All investing and trading in the securities markets involves risk, including the risk of loss. All investing decisions are personal and should only be made after thorough research and the engagement of professional assistance to the extent you believe necessary."

FORM (action="/api/register" method="POST"):
Hidden: <input type="hidden" name="funnel_slug" value="${context.slug}" />
Fields: Email, FirstName, LastName, Phone1${context.infusionsoftFields.hasSmsConsent ? ', inf_custom_SMSOptInWebinar checkbox' : ''}
Widget: <div data-webinarfuel-webinar="${context.webinarfuelData.webinarId}" data-webinarfuel-widget="${context.webinarfuelData.widgetId}"></div><script src="https://d3pw37i36t41cq.cloudfront.net/embed_v2.js" data-wf-load="wf-widget-embed"></script>

Return complete HTML only.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096, // Reduced to fit within rate limits (3 pages × 4096 = 12288 tokens total)
    messages: [{ role: "user", content: prompt }],
  }, {
    timeout: 120000, // 2 minute timeout
  });

  console.log('[Claude AI] Registration page response:', {
    variant,
    stopReason: message.stop_reason,
    inputTokens: message.usage?.input_tokens,
    outputTokens: message.usage?.output_tokens,
    contentLength: message.content[0].type === 'text' ? message.content[0].text.length : 0,
  });

  if (message.stop_reason === 'max_tokens') {
    console.warn('[Claude AI] WARNING: Response was truncated due to max_tokens limit!');
    console.warn('[Claude AI] Try simplifying the prompt or reducing content requirements');
  }

  const content = message.content[0];
  if (content.type === "text") {
    // Strip markdown code blocks if present
    let html = content.text;
    html = html.replace(/^```html\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    
    // Check if HTML looks incomplete (no closing body/html tags)
    if (!html.includes('</body>') || !html.includes('</html>')) {
      console.error('[Claude AI] ERROR: Generated HTML appears incomplete (missing closing tags)');
      console.error('[Claude AI] Last 200 chars:', html.slice(-200));
    }
    
    return html.trim();
  }
  
  throw new Error("Failed to generate registration page");
}

export async function generateConfirmationPage(context: FunnelContext, registrationPageHtml?: string): Promise<string> {
  console.log('[Claude AI] Generating confirmation page...');
  console.log('[Claude AI] Using registration page HTML for style matching:', !!registrationPageHtml);
  
  const styleRef = registrationPageHtml ? `Match colors/typography from: ${registrationPageHtml.substring(0, 1500)}` : '';

  const prompt = `Confirmation page matching registration design.

${context.webinarTitle}
${styleRef}

CONTENT: Success message (✓/🎉), next steps, calendar buttons with JS, WebinarFuel widget, benefits, social proof
CALENDAR JS: Extract ?session param, build links to /api/calendar/google and /api/calendar/ics with title/desc params
WIDGET: ${context.confirmationWidgetCode || `<div data-webinarfuel-webinar="${context.webinarfuelData.webinarId}" data-webinarfuel-widget="${context.webinarfuelData.widgetId}"></div><script src="https://d3pw37i36t41cq.cloudfront.net/embed_v2.js" data-wf-load="wf-widget-embed"></script>`}
FOOTER: Same as registration - © 2025 Tanner Training LLC, Terms|Privacy|Disclaimer links, full disclaimer text

Return complete HTML.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096, // Reduced to fit within rate limits
    messages: [{ role: "user", content: prompt }],
  }, {
    timeout: 120000, // 2 minute timeout
  });

  console.log('[Claude AI] Confirmation page response:', {
    stopReason: message.stop_reason,
    inputTokens: message.usage?.input_tokens,
    outputTokens: message.usage?.output_tokens,
    contentLength: message.content[0].type === 'text' ? message.content[0].text.length : 0,
  });

  if (message.stop_reason === 'max_tokens') {
    console.warn('[Claude AI] WARNING: Confirmation page was truncated due to max_tokens limit!');
    console.warn('[Claude AI] Try simplifying the prompt or reducing content requirements');
  }

  const content = message.content[0];
  if (content.type === "text") {
    // Strip markdown code blocks if present
    let html = content.text;
    html = html.replace(/^```html\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    
    // Check if HTML looks incomplete
    if (!html.includes('</body>') || !html.includes('</html>')) {
      console.error('[Claude AI] ERROR: Confirmation page HTML appears incomplete (missing closing tags)');
      console.error('[Claude AI] Last 200 chars:', html.slice(-200));
    }
    
    return html.trim();
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
