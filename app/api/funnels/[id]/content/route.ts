import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { sql } from "@vercel/postgres";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idString } = await params;
    const id = parseInt(idString);
    const {
      webinarTitle,
      webinarDescription,
      targetAudience,
      mainBenefits,
      socialProof,
      hostInfo,
      urgency,
      referenceUrl,
      additionalNotes,
      confirmationWidgetCode,
    } = await request.json();

    await sql`
      UPDATE funnels
      SET
        webinar_title = ${webinarTitle},
        webinar_description = ${webinarDescription},
        target_audience = ${targetAudience},
        main_benefits = ${mainBenefits},
        social_proof = ${socialProof},
        host_info = ${hostInfo},
        urgency = ${urgency},
        reference_url = ${referenceUrl},
        additional_notes = ${additionalNotes},
        confirmation_widget_code = ${confirmationWidgetCode},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating funnel content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update content" },
      { status: 500 }
    );
  }
}
