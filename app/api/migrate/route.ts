import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { sql } from "@vercel/postgres";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if column already exists
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'funnels' 
      AND column_name = 'confirmation_widget_code'
    `;

    if (result.rows.length > 0) {
      return NextResponse.json({ 
        message: "Migration already completed",
        columnExists: true,
        details: result.rows
      });
    }

    return NextResponse.json({ 
      message: "Migration needed. Click 'Run Migration' button below to execute.",
      columnExists: false,
      migrationNeeded: true
    });
  } catch (error: any) {
    console.error("Error checking migration status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check migration status" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Add confirmation_widget_code column if it doesn't exist
    await sql`
      ALTER TABLE funnels 
      ADD COLUMN IF NOT EXISTS confirmation_widget_code TEXT
    `;

    // Verify the column was added
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'funnels' 
      AND column_name = 'confirmation_widget_code'
    `;

    return NextResponse.json({ 
      success: true, 
      message: "Migration completed successfully",
      columnExists: result.rows.length > 0,
      details: result.rows
    });
  } catch (error: any) {
    console.error("Error running migration:", error);
    return NextResponse.json(
      { error: error.message || "Failed to run migration" },
      { status: 500 }
    );
  }
}
