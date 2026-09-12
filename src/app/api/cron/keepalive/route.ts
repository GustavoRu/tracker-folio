import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase pauses free-tier projects after ~7 days without database activity.
// The /api/quotes/* routes never touch Postgres, so public traffic does not count.
// This endpoint issues one trivial query to keep the project alive.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Vercel sends this header when CRON_SECRET is configured
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { ok: false, error: "Missing Supabase env vars" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  // Assets are publicly readable, so the anon key is enough
  const { count, error } = await supabase
    .from("assets")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    assets: count,
    checkedAt: new Date().toISOString(),
  });
}
