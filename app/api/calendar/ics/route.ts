import { NextResponse } from "next/server";
import { generateICSFile, calculateWebinarDuration } from "@/lib/calendar";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionDate = searchParams.get("session");
    const title = searchParams.get("title") || "Webinar Registration";
    const description = searchParams.get("description") || "Join us for this exclusive webinar";

    // If no session date provided, use a placeholder date (7 days from now)
    const startTime = sessionDate ? new Date(sessionDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const endTime = calculateWebinarDuration(startTime, 60);

    const icsContent = generateICSFile({
      title,
      description,
      location: "Online Webinar",
      startTime,
      endTime,
    });

    return new NextResponse(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="webinar-${startTime.getTime()}.ics"`,
      },
    });
  } catch (error) {
    console.error("Error generating ICS file:", error);
    return NextResponse.json(
      { error: "Failed to generate ICS file" },
      { status: 500 }
    );
  }
}
