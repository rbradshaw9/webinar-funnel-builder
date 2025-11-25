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
    const { registrationHtml, confirmationHtml } = await request.json();

    await sql`
      UPDATE funnels
      SET
        registration_page_html = ${registrationHtml},
        confirmation_page_html = ${confirmationHtml},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating funnel pages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update pages" },
      { status: 500 }
    );
  }
}
