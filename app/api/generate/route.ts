import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { parseInfusionsoftForm } from "@/lib/parsers/infusionsoft";
import { parseWebinarFuelWidget } from "@/lib/parsers/webinarfuel";
import { generateRegistrationPage, generateConfirmationPage, FunnelContext } from "@/lib/ai/claude";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, infusionsoftCode, webinarfuelCode, webinarfuelUrl } = await request.json();

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

    // Generate pages using Claude AI
    const [registrationPage, confirmationPage] = await Promise.all([
      generateRegistrationPage(context),
      generateConfirmationPage(context),
    ]);

    return NextResponse.json({
      registrationPage,
      confirmationPage,
      parsedData: {
        infusionsoft: infusionsoftData,
        webinarfuel: webinarfuelData,
      },
    });
  } catch (error: any) {
    console.error("Error generating pages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate pages" },
      { status: 500 }
    );
  }
}
