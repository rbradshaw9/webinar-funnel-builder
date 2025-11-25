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

Infusionsoft Form Data (for reference only - form will POST to /api/register):
- Original Action URL: ${context.infusionsoftFields.actionUrl}
- Original XID: ${context.infusionsoftFields.xid}
- All Field Mappings: ${JSON.stringify(context.infusionsoftFields.fields)}
- SMS Consent Field: ${context.infusionsoftFields.hasSmsConsent ? 'Required' : 'Not needed'}
- Hidden Fields: Include ALL hidden fields from original form
- Tracking Scripts: Include these at bottom of page (before </body>):
${context.infusionsoftFields.trackingScripts ? context.infusionsoftFields.trackingScripts.join('\n') : '<!-- No tracking scripts -->'}

WebinarFuel Widget:
- Webinar ID: ${context.webinarfuelData.webinarId}
- Widget ID: ${context.webinarfuelData.widgetId}
- Widget Type: ${context.webinarfuelData.widgetType}

DESIGN REQUIREMENTS (CRITICAL - Apple-level quality):
1. TYPOGRAPHY & CONTRAST:
   - Include Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
   - Hero headline: text-6xl font-bold text-white on dark gradient background
   - Body text: text-lg text-gray-800 on white/light backgrounds (WCAG AAA contrast)
   - Subheadings: text-3xl font-semibold text-gray-900
   - Always use sufficient contrast - white text on dark, dark text on light
   - Line height 1.6 for body copy, 1.2 for headlines

2. LAYOUT & SPACING:
   - Clean, spacious Apple-style design with generous whitespace
   - Container: max-w-4xl mx-auto px-6
   - Section spacing: py-16 md:py-24
   - Element spacing: space-y-8 for major elements, space-y-4 for related content
   - Form inputs: py-3 px-4 text-lg with focus:ring-4 focus:ring-blue-500/20

3. COLOR & VISUAL HIERARCHY:
   - Hero gradient: bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900
   - CTA buttons: bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
   - Accent color: blue-600 for links and highlights
   - Backgrounds: white or bg-gray-50 for alternating sections
   - Borders: border-gray-200 (subtle, not prominent)

4. DIRECT RESPONSE TACTICS:
   - Strong benefit-driven headline above the fold
   - Social proof section with testimonials/stats
   - Scarcity/urgency messaging (limited seats, countdown timer)
   - Clear single call-to-action (CTA)
   - Risk reversal language (free, no credit card, etc)
   - Bullet points highlighting transformation/benefits
   - Authority indicators (credentials, logos, press mentions)

5. FOOTER (REQUIRED - MUST INCLUDE AT BOTTOM OF PAGE):
   - Full-width footer with bg-gray-900 text-gray-400 py-12 px-6
   - Centered content: max-w-4xl mx-auto text-center
   - Company name first: <p class="text-white font-semibold mb-4">© 2024 Tanner Training LLC</p>
   - Links on one line with separators: <a href="https://thecashflowacademy.com/terms-and-conditions/" class="text-gray-400 hover:text-white">Terms of Use</a> <span class="text-gray-600">|</span> <a href="https://thecashflowacademy.com/privacy-policy/" class="text-gray-400 hover:text-white">Privacy Policy</a> <span class="text-gray-600">|</span> <a href="https://thecashflowacademy.com/disclaimer/" class="text-gray-400 hover:text-white">Disclaimer</a>
   - Full disclaimer below in small text (text-xs text-gray-500 mt-6 leading-relaxed): "Tanner Training LLC is providing this training and any related materials (including newsletters, blog posts, and other communications) for educational purposes only. We are not providing legal, accounting, or financial advisory services, and this is not a solicitation or recommendation to buy or sell any stocks, options, or other financial instruments or investments. Examples that address specific assets, stocks, options, or transactions are for illustrative purposes only and may not represent specific trades or transactions that we have conducted. In fact, we may use examples that are different to or the opposite of transactions we have conducted or positions we hold. This training is not intended as a solicitation for any future relationship between the students or participants and the trainer. No express or implied warranties are being made with respect to these services and products. There is no guarantee that use of any of the services or products will result in a profit. All investing and trading in the securities markets involves risk, including the risk of loss. All investing decisions are personal and should only be made after thorough research and the engagement of professional assistance to the extent you believe necessary."

6. TECHNICAL INTEGRATION (CRITICAL - FORM SUBMISSION):
   - Form action="/api/register" method="POST" (THIS IS REQUIRED - NOT Infusionsoft URL!)
   - FIRST hidden field (CRITICAL): <input type="hidden" name="funnel_slug" value="${context.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" />
   - Form field names (use exact names):
     * <input type="email" name="Email" required />
     * <input type="text" name="FirstName" required />
     * <input type="text" name="LastName" required />
     * <input type="tel" name="Phone1" />
     ${context.infusionsoftFields.hasSmsConsent ? '* <input type="checkbox" name="inf_custom_SMSOptInWebinar" value="1" /> SMS opt-in' : ''}
   - WebinarFuel widget below form:
     <div data-webinarfuel-webinar="${context.webinarfuelData.webinarId}" data-webinarfuel-widget="${context.webinarfuelData.widgetId}"></div>
     <script src="https://app.webinarfuel.com/widgets/v2/embed.js"></script>

IMPORTANT: Form action="/api/register" method="POST" (this handles both Infusionsoft AND WebinarFuel submission)

Return ONLY complete HTML (no markdown). Professional Apple-quality design with perfect contrast ratios.`;

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
    // Strip markdown code blocks if present
    let html = content.text;
    html = html.replace(/^```html\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    return html.trim();
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

FOOTER (REQUIRED - SAME AS REGISTRATION PAGE):
- Full-width bg-gray-900 text-gray-400 py-12 px-6
- © 2024 Tanner Training LLC with links to Terms, Privacy, Disclaimer
- Full disclaimer text in text-xs

Return ONLY complete HTML (no markdown, no code blocks). Enthusiastic, professional design with Tailwind.`;

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
    // Strip markdown code blocks if present
    let html = content.text;
    html = html.replace(/^```html\s*\n?/i, '').replace(/\n?```\s*$/i, '');
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
