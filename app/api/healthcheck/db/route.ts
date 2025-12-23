import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  try {
    const res = await db.query<{ now: string }>("SELECT NOW() as now");
    return NextResponse.json({
      ok: true,
      now: res.rows[0]?.now ?? null,
      ms: Date.now() - startedAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        ms: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}


