import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { funnelId, pageType, prompt, currentHtml } = await request.json();

    if (!currentHtml || !prompt || !pageType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert web developer and designer. The user will provide:
1. Current HTML for a ${pageType === 'registration' ? 'webinar registration' : 'webinar confirmation'} page
2. A natural language instruction for changes they want

Your task:
- Apply the requested changes to the HTML
- Maintain all existing functionality (forms, scripts, etc.)
- Keep the same structure unless the user explicitly asks to change it
- Use Tailwind CSS for any styling changes
- Ensure responsive design is maintained
- Return ONLY the complete updated HTML (no explanations, no markdown)

Important:
- If the user mentions "contrast" or "readability", ensure WCAG AAA contrast ratios (7:1 for normal text, 4.5:1 for large)
- If the user mentions "spacing", use generous padding/margins (py-16 md:py-24 for sections)
- If the user mentions "professional" or "polished", add subtle shadows, smooth transitions, and clean typography
- If the user mentions colors, use Tailwind's color palette (slate, blue, etc.)
- Preserve all form fields and their names exactly as they are
- Keep any JavaScript functionality intact`;

    const userPrompt = `Current HTML:
${currentHtml}

User's requested changes:
${prompt}

Return the complete updated HTML:`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const updatedHtml = message.content[0].type === "text" 
      ? message.content[0].text 
      : "";

    if (!updatedHtml) {
      throw new Error("Failed to generate updated HTML");
    }

    return NextResponse.json({ html: updatedHtml });
  } catch (error: any) {
    console.error("Error in AI edit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to apply AI edits" },
      { status: 500 }
    );
  }
}
