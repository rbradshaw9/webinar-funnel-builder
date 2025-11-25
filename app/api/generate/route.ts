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

    const body = await request.json();
    
    // Check if this is a regenerate request (has funnelId)
    if (body.funnelId) {
      const { getFunnelById, updateFunnelPages } = await import("@/lib/db");
      const funnel = await getFunnelById(body.funnelId);
      
      if (!funnel) {
        return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
      }

      // Use existing funnel data
      const infusionsoftCode = funnel.infusionsoft_form_html;
      const webinarfuelCode = funnel.webinarfuel_widget_html;
      const webinarfuelUrl = funnel.webinarfuel_url;

      if (!infusionsoftCode || !webinarfuelCode) {
        return NextResponse.json(
          { error: "Funnel is missing required form/widget code" },
          { status: 400 }
        );
      }

      // Parse forms
      const infusionsoftData = parseInfusionsoftForm(infusionsoftCode);
      const webinarfuelData = parseWebinarFuelWidget(webinarfuelCode, webinarfuelUrl || undefined);

      if (!infusionsoftData || !webinarfuelData) {
        return NextResponse.json(
          { error: "Failed to parse form/widget code" },
          { status: 400 }
        );
      }

      // Generate with funnel data (all fields already exist in interface)
      const context: FunnelContext = {
        name: funnel.name,
        webinarTitle: funnel.webinar_title || funnel.name,
        webinarDescription: funnel.webinar_description || '',
        targetAudience: funnel.target_audience,
        mainBenefits: funnel.main_benefits,
        socialProof: funnel.social_proof,
        hostInfo: funnel.host_info,
        urgency: funnel.urgency,
        referenceUrl: funnel.reference_url,
        additionalNotes: funnel.additional_notes,
        infusionsoftFields: {
          actionUrl: infusionsoftData.actionUrl,
          xid: infusionsoftData.xid,
          fields: infusionsoftData.fieldMappings,
          hasSmsConsent: infusionsoftData.hasSMSConsent,
          trackingScripts: infusionsoftData.trackingScripts,
          hiddenFields: infusionsoftData.hiddenFields,
        },
        webinarfuelData: {
          webinarId: webinarfuelData.webinarId,
          widgetId: webinarfuelData.widgetId,
          widgetType: webinarfuelData.widgetType,
          schedule: webinarfuelData.schedule,
        },
      };

      console.log('[Generate API] Regenerating pages for funnel:', funnel.id);

      const [registrationPage, confirmationPage] = await Promise.all([
        generateRegistrationPage(context),
        generateConfirmationPage(context),
      ]);

      // Update database
      await updateFunnelPages(funnel.id, registrationPage, confirmationPage);

      console.log('[Generate API] Pages regenerated successfully');

      return NextResponse.json({
        registrationPage,
        confirmationPage,
      });
    }

    // Original flow: new funnel generation
    const { 
      name, 
      webinarTitle,
      webinarDescription,
      targetAudience,
      mainBenefits,
      socialProof,
      hostInfo,
      urgency,
      referenceUrl,
      additionalNotes,
      infusionsoftCode, 
      webinarfuelCode, 
      webinarfuelUrl 
    } = body;

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
      referenceUrl,
      additionalNotes,
      infusionsoftFields: {
        actionUrl: infusionsoftData.actionUrl,
        xid: infusionsoftData.xid,
        fields: infusionsoftData.fieldMappings,
        hasSmsConsent: infusionsoftData.hasSMSConsent,
        trackingScripts: infusionsoftData.trackingScripts,
        hiddenFields: infusionsoftData.hiddenFields,
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
