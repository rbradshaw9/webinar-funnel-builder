import { NextResponse } from "next/server";
import { getFunnelBySlug, createSubmission, checkDuplicateSubmission, incrementFunnelSubmissions } from "@/lib/db";
import { submitToInfusionsoft, buildInfusionsoftPayload } from "@/lib/parsers/infusionsoft";
import { submitToWebinarFuel, calculateNextSession } from "@/lib/parsers/webinarfuel";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const slug = formData.get("funnel_slug") as string;

    if (!slug) {
      return NextResponse.json({ error: "Missing funnel slug" }, { status: 400 });
    }

    const funnel = await getFunnelBySlug(slug);
    if (!funnel || funnel.status !== "active") {
      return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
    }

    // Extract form data
    const email = formData.get("Email") as string || formData.get("email") as string;
    const firstName = formData.get("FirstName") as string || formData.get("first_name") as string;
    const lastName = formData.get("LastName") as string || formData.get("last_name") as string;
    const phone = formData.get("Phone1") as string || formData.get("phone") as string;
    const smsConsent = formData.get("inf_custom_SMSOptInWebinar") === "1" || 
                       formData.get("sms_consent") === "1";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check for duplicate submission
    const isDuplicate = await checkDuplicateSubmission(funnel.id, email);
    if (isDuplicate) {
      return NextResponse.json(
        { error: "This email has already been registered" },
        { status: 400 }
      );
    }

    // Get IP and User Agent
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Calculate next session for WebinarFuel
    let sessionData = null;
    if (funnel.webinarfuel_widget_type === "recurring" && funnel.webinarfuel_schedule) {
      sessionData = calculateNextSession(funnel.webinarfuel_schedule);
    }

    // Prepare Infusionsoft form data
    const infusionsoftFormData = {
      actionUrl: funnel.infusionsoft_action_url!,
      xid: funnel.infusionsoft_xid!,
      formName: funnel.name,
      fieldMappings: funnel.infusionsoft_field_mappings as Record<string, string>,
      hasPhoneField: !!funnel.infusionsoft_field_mappings?.phone,
      hasSMSConsent: !!funnel.infusionsoft_field_mappings?.["inf_custom_SMSOptInWebinar"],
      smsConsentFieldName: funnel.infusionsoft_field_mappings?.["inf_custom_SMSOptInWebinar"],
      hiddenFields: { inf_form_xid: funnel.infusionsoft_xid!, inf_form_name: funnel.name },
    };

    // Submit to both APIs in parallel
    const [infusionsoftResult, webinarfuelResult] = await Promise.all([
      // Submit to Infusionsoft
      submitToInfusionsoft(infusionsoftFormData, {
        email,
        firstName: firstName || "",
        lastName: lastName || "",
        phone: phone || "",
        smsConsent,
      }).catch(err => ({ success: false, error: err.message })),

      // Submit to WebinarFuel
      submitToWebinarFuel(
        funnel.webinarfuel_webinar_id!,
        sessionData?.sessionId || 0,
        {
          email,
          firstName: firstName || "",
          lastName: lastName || "",
          phone: phone || "",
        },
        process.env.WEBINARFUEL_BEARER_TOKEN!
      ).catch(err => ({ success: false, error: err.message })),
    ]);

    // Record submission in database
    await createSubmission({
      funnel_id: funnel.id,
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      sms_consent: smsConsent,
      session_date: sessionData?.date,
      session_day: sessionData?.dayOfWeek,
      webinarfuel_session_id: sessionData?.sessionId,
      webinarfuel_cid: (webinarfuelResult as any)?.cid,
      infusionsoft_success: infusionsoftResult.success,
      webinarfuel_success: webinarfuelResult.success,
      ip_address: ip,
      user_agent: userAgent,
    });

    // Update funnel stats
    await incrementFunnelSubmissions(funnel.id);

    // Redirect to confirmation page
    return NextResponse.redirect(
      new URL(`/${slug}/confirmation`, request.url),
      { status: 303 }
    );
  } catch (error: any) {
    console.error("Error processing registration:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process registration" },
      { status: 500 }
    );
  }
}
