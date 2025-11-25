import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { parseInfusionsoftForm } from "@/lib/parsers/infusionsoft";
import { parseWebinarFuelWidget } from "@/lib/parsers/webinarfuel";
import { generateRegistrationPage, generateConfirmationPage, FunnelContext } from "@/lib/ai/claude";

// Vercel Pro allows up to 300s, Hobby allows 10s
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      name, 
      webinarTitle,
      webinarDescription,
      targetAudience,
      mainBenefits,
      socialProof,
      hostInfo,
      urgency,
      infusionsoftCode, 
      webinarfuelCode, 
      webinarfuelUrl 
    } = await request.json();

    // Parse Infusionsoft form
    const infusionsoftData = parseInfusionsoftForm(infusionsoftCode);
    if (!infusionsoftData) {
      return NextResponse.json(
        { error: "Failed to parse Infusionsoft form code" },
        { status: 400 }
      );
    }

    // Parse WebinarFuel widget
    const webinarfuelData = parseWebinarFuelWidget(webinarfuelCode, webinarfuelUrl);
    if (!webinarfuelData) {
      return NextResponse.json(
        { error: "Failed to parse WebinarFuel widget code" },
        { status: 400 }
      );
    }

    // Prepare context for AI generation
    const context: FunnelContext = {
      name,
      webinarTitle: webinarTitle || name,
      webinarDescription,
      targetAudience,
      mainBenefits,
      socialProof,
      hostInfo,
      urgency,
      infusionsoftFields: {
        actionUrl: infusionsoftData.actionUrl,
        xid: infusionsoftData.xid,
        fields: infusionsoftData.fieldMappings,
        hasSmsConsent: infusionsoftData.hasSMSConsent,
      },
      webinarfuelData: {
        webinarId: webinarfuelData.webinarId,
        widgetId: webinarfuelData.widgetId,
        widgetType: webinarfuelData.widgetType,
        schedule: webinarfuelData.schedule,
      },
    };

    console.log('[Generate API] Starting page generation with context');

    // Generate pages using Claude AI with increased timeout
    const [registrationPage, confirmationPage] = await Promise.all([
      generateRegistrationPage(context),
      generateConfirmationPage(context),
    ]);

    console.log('[Generate API] Pages generated successfully');

    return NextResponse.json({
      registrationPage,
      confirmationPage,
      parsedData: {
        infusionsoft: infusionsoftData,
        webinarfuel: webinarfuelData,
      },
    });
  } catch (error: any) {
    console.error("[Generate API] Error generating pages:", error);
    console.error("[Generate API] Error details:", {
      message: error.message,
      status: error.status,
      name: error.name,
      apiKeyPresent: !!process.env.ANTHROPIC_API_KEY,
      apiKeyLength: process.env.ANTHROPIC_API_KEY?.length,
    });
    return NextResponse.json(
      { error: error.message || "Failed to generate pages" },
      { status: 500 }
    );
  }
}
