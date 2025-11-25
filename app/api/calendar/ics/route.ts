import { NextResponse } from "next/server";
import { generateICSFile, calculateWebinarDuration } from "@/lib/calendar";

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
