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
  
  const prompt = `Create a high-converting webinar registration page${variant === 'B' ? ' (Variant B for A/B testing)' : ''}.

CONTEXT:
Title: ${context.webinarTitle}
Description: ${context.webinarDescription}
${context.targetAudience ? `Audience: ${context.targetAudience}` : ''}
${context.mainBenefits ? `Benefits: ${context.mainBenefits}` : ''}
${context.socialProof ? `Proof: ${context.socialProof}` : ''}
${context.hostInfo ? `Host: ${context.hostInfo}` : ''}
${context.referenceUrl ? `Reference URL: ${context.referenceUrl} - Analyze this page for images, layout, and style inspiration` : ''}
${context.additionalNotes ? `Special Instructions: ${context.additionalNotes}` : ''}

TECHNICAL: WebinarFuel ID=${context.webinarfuelData.webinarId}, Widget=${context.webinarfuelData.widgetId}${context.infusionsoftFields.hasSmsConsent ? ', SMS consent checkbox required' : ''}

DESIGN REQUIREMENTS (Modern, High-Converting, Creative):

CREATIVE FREEDOM:
You have full creative control! Feel free to use:
- Multi-column layouts, split screens, asymmetric designs, zigzag sections
- Creative hero sections with overlapping elements or unique shapes
- Interesting card layouts, feature grids, or timeline designs  
- Beautiful backgrounds (gradients, patterns, subtle textures, images)
- Dynamic spacing and modern visual hierarchy
- Trendy UI elements where appropriate (but keep it professional)
- Different layout structures - NOT just single column!

CORE PRINCIPLES (Non-Negotiable):
- Include Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
- HIGH CONTRAST: WCAG AAA - all text must be easily readable (7:1 ratio minimum)
- RESPONSIVE: Perfect on mobile, tablet, and desktop
- PROFESSIONAL: High-quality, polished - worthy of Apple or premium brands
- FAST: Optimized for performance

SUGGESTED ELEMENTS (Use creatively):
- Bold, attention-grabbing headlines
- Compelling CTAs with visual prominence
- Social proof (testimonials, stats, trust badges)
- Benefit-focused content
- Visual hierarchy that guides the eye
- Modern typography and spacing

IMPORTANT: Create layouts that are visually interesting and different from typical single-column landing pages. Use creative multi-column sections, split layouts, and interesting visual arrangements!

5. FOOTER (ABSOLUTELY MANDATORY - CANNOT BE OMITTED):
   THIS FOOTER MUST APPEAR ON EVERY PAGE NO MATTER WHAT THE DESIGN IS
   
   Required Structure:
   - Full-width footer section at bottom of page
   - Dark background (bg-gray-900 or similar)
   - Padding: py-12 px-6
   - Center-aligned: max-w-4xl mx-auto text-center
   
   Required Content:
   a) Copyright: <p class="text-white font-semibold mb-4">© 2025 Tanner Training LLC</p>
   
   b) Legal links with separators:
      <a href="https://thecashflowacademy.com/terms-and-conditions/" class="text-gray-400 hover:text-white transition-colors">Terms and Conditions</a>
      <span class="text-gray-600 mx-2">|</span>
      <a href="https://thecashflowacademy.com/privacy-policy/" class="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
      <span class="text-gray-600 mx-2">|</span>
      <a href="https://thecashflowacademy.com/disclaimer/" class="text-gray-400 hover:text-white transition-colors">Disclaimer</a>
   
   c) Full disclaimer (text-xs text-gray-500 mt-6 leading-relaxed max-w-3xl mx-auto):
      "Tanner Training LLC is providing this training and any related materials (including newsletters, blog posts, and other communications) for educational purposes only. We are not providing legal, accounting, or financial advisory services, and this is not a solicitation or recommendation to buy or sell any stocks, options, or other financial instruments or investments. Examples that address specific assets, stocks, options, or transactions are for illustrative purposes only and may not represent specific trades or transactions that we have conducted. In fact, we may use examples that are different to or the opposite of transactions we have conducted or positions we hold. This training is not intended as a solicitation for any future relationship between the students or participants and the trainer. No express or implied warranties are being made with respect to these services and products. There is no guarantee that use of any of the services or products will result in a profit. All investing and trading in the securities markets involves risk, including the risk of loss. All investing decisions are personal and should only be made after thorough research and the engagement of professional assistance to the extent you believe necessary."
   
   CRITICAL: All content above MUST be included. Footer can match your design but content is non-negotiable.

6. TECHNICAL INTEGRATION (CRITICAL - FORM SUBMISSION):
   - Form action="/api/register" method="POST" (THIS IS REQUIRED - NOT Infusionsoft URL!)
   - FIRST hidden field (CRITICAL): <input type="hidden" name="funnel_slug" value="${context.slug}" />
   - Form field names (use exact names):
     * <input type="email" name="Email" required />
     * <input type="text" name="FirstName" required />
     * <input type="text" name="LastName" required />
     * <input type="tel" name="Phone1" />
     ${context.infusionsoftFields.hasSmsConsent ? '* <input type="checkbox" name="inf_custom_SMSOptInWebinar" value="1" /> SMS opt-in' : ''}
   - WebinarFuel widget below form:
     <div data-webinarfuel-webinar="${context.webinarfuelData.webinarId}" data-webinarfuel-widget="${context.webinarfuelData.widgetId}"></div>
     <script src="https://d3pw37i36t41cq.cloudfront.net/embed_v2.js" data-wf-load="wf-widget-embed"></script>

IMPORTANT: Form action="/api/register" method="POST" (this handles both Infusionsoft AND WebinarFuel submission)
${variantNote}

Return ONLY complete HTML (no markdown). Modern, professional, visually stunning design.`;

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
  
  const registrationStylesSection = registrationPageHtml ? `

REGISTRATION PAGE HTML (for style reference):
\`\`\`html
${registrationPageHtml.substring(0, 3000)}
\`\`\`

CRITICAL: Extract and REUSE the exact same:
- Color scheme (gradients, button colors, text colors)
- Typography (font families, sizes, weights)
- Button styles (padding, rounded corners, shadows, hover effects)
- Section spacing and layout patterns
- Footer structure and styling
` : '';

  const prompt = `Create a webinar confirmation/thank you page that MATCHES the registration page design.

CONTEXT:
Title: ${context.webinarTitle}
Description: ${context.webinarDescription}
${context.socialProof ? `Proof: ${context.socialProof}` : ''}
${context.hostInfo ? `Host: ${context.hostInfo}` : ''}
${registrationStylesSection}

DESIGN REQUIREMENTS (CRITICAL - MUST MATCH REGISTRATION PAGE):
- Use Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
- USE THE EXACT SAME: color scheme, gradients, typography, spacing, and overall aesthetic as registration page
- Hero should use similar gradient background (swap in success/green accents)
- Buttons should match registration page CTA style
- Section layouts should feel cohesive with registration page
- Footer must be IDENTICAL to registration page

SUCCESS ELEMENTS:
- Large checkmark icon (✓) or celebration emoji (🎉)
- Success headline: "You're Registered!" or "Success! See You Soon!"
- Success colors: Green accents mixed with your chosen brand colors

CONTENT SECTIONS:
1. Hero Success Message: Big congratulations with icon
2. Next Steps Section:
   - "Check your email" (bold, emphasized)
   - "Add to calendar" (with buttons below)
   - Email confirmation details
3. Calendar Buttons (styled like registration CTAs):
   - Add JavaScript to extract session date from URL and update calendar links:
   <script>
   // Extract session date from URL query parameter
   var params = new URLSearchParams(window.location.search);
   var sessionDate = params.get('session');
   var calendarBase = '/api/calendar/';
   var queryParams = sessionDate ? '?session=' + encodeURIComponent(sessionDate) + '&title=${encodeURIComponent(context.webinarTitle)}&description=${encodeURIComponent(context.webinarDescription)}' : '?title=${encodeURIComponent(context.webinarTitle)}&description=${encodeURIComponent(context.webinarDescription)}';
   </script>
   - <a href="#" onclick="window.location.href='/api/calendar/google' + queryParams; return false;" class="[match registration button styles]">📅 Add to Google Calendar</a>
   - <a href="#" onclick="window.location.href='/api/calendar/ics' + queryParams; return false;" class="[match registration button styles]">📅 Download ICS File</a>
4. WebinarFuel Widget Section (IMPORTANT):
${context.confirmationWidgetCode ? `   - Use this EXACT custom widget code:\n${context.confirmationWidgetCode}` : `   - Use default: <div data-webinarfuel-webinar="${context.webinarfuelData.webinarId}" data-webinarfuel-widget="${context.webinarfuelData.widgetId}"></div><script src="https://d3pw37i36t41cq.cloudfront.net/embed_v2.js" data-wf-load="wf-widget-embed"></script>`}
5. What to Expect: Bullet points of webinar benefits/agenda
6. Social Proof: Same style as registration page

FOOTER (ABSOLUTELY MANDATORY - IDENTICAL TO REGISTRATION PAGE):
Copy the EXACT footer structure from the registration page.
Must include:
- © 2025 Tanner Training LLC
- Links to Terms and Conditions | Privacy Policy | Disclaimer (with separators)
- Full disclaimer text in small print
- Same styling as registration page footer

Return ONLY complete HTML (no markdown, no code blocks). Enthusiastic, professional design with Tailwind.`;

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
