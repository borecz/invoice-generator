import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log("Starting migration...");

    // Since we can't use exec_sql, let's try to create a simple test table first
    // to see if we have the right permissions
    const { data: testData, error: testError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .limit(1);

    if (testError) {
      console.error("Database connection test failed:", testError);
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: testError,
        },
        { status: 500 }
      );
    }

    console.log("Database connection successful");

    return NextResponse.json({
      success: true,
      message:
        "Database connection successful. Tables need to be created manually via Supabase dashboard.",
      note: "Please create the tables using the SQL migration file provided.",
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Migration failed",
        details: error,
      },
      { status: 500 }
    );
  }
}
