import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAllFunnels, createFunnel } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const funnels = await getAllFunnels();
    return NextResponse.json({ funnels });
  } catch (error) {
    console.error("Error fetching funnels:", error);
    return NextResponse.json({ error: "Failed to fetch funnels" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const funnel = await createFunnel(data);
    return NextResponse.json({ funnel }, { status: 201 });
  } catch (error) {
    console.error("Error creating funnel:", error);
    return NextResponse.json({ error: "Failed to create funnel" }, { status: 500 });
  }
}
