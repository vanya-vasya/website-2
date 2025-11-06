import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/settings");

interface RequestBody {
  generationsCount: number;
}

export const maxDuration = 300;

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body: RequestBody = await req.json();
    const generationsCount = Number(body.generationsCount);

    const { userId } = auth();
    const user = await currentUser();

    if (!generationsCount) {
      return new NextResponse("Generations count is empty", { status: 400 });
    }

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userResult = await db.query(
      'SELECT * FROM "User" WHERE "clerkId" = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return new NextResponse("User not found", { status: 404 });
    }

    const userGenerations = userResult.rows[0];
    const newAvailableGenerations = userGenerations.availableGenerations - userGenerations.usedGenerations + generationsCount;
    const newUsedGenerations = 0;

    await db.query(
      'UPDATE "User" SET "availableGenerations" = $1, "usedGenerations" = $2 WHERE "clerkId" = $3',
      [newAvailableGenerations, newUsedGenerations, userId]
    );

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.log("[GENERATIONS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
