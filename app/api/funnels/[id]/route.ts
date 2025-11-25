import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getFunnelById, updateFunnel, deleteFunnel } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const funnel = await getFunnelById(parseInt(id));
    if (!funnel) {
      return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
    }

    return NextResponse.json({ funnel });
  } catch (error) {
    console.error("Error fetching funnel:", error);
    return NextResponse.json({ error: "Failed to fetch funnel" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    const funnel = await updateFunnel(parseInt(id), data);
    
    if (!funnel) {
      return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
    }

    return NextResponse.json({ funnel });
  } catch (error) {
    console.error("Error updating funnel:", error);
    return NextResponse.json({ error: "Failed to update funnel" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteFunnel(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting funnel:", error);
    return NextResponse.json({ error: "Failed to delete funnel" }, { status: 500 });
  }
}
