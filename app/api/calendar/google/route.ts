import { NextResponse } from "next/server";
import { generateGoogleCalendarUrl, calculateWebinarDuration } from "@/lib/calendar";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionDate = searchParams.get("session");
    const title = searchParams.get("title") || "Webinar Registration";
    const description = searchParams.get("description") || "Join us for this exclusive webinar";

    if (!sessionDate) {
      return NextResponse.json({ error: "Session date required" }, { status: 400 });
    }

    const startTime = new Date(sessionDate);
    const endTime = calculateWebinarDuration(startTime, 60);

    const url = generateGoogleCalendarUrl({
      title,
      description,
      location: "Online Webinar",
      startTime,
      endTime,
      timezone: "America/New_York",
    });

    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Error generating Google Calendar link:", error);
    return NextResponse.json(
      { error: "Failed to generate calendar link" },
      { status: 500 }
    );
  }
}
