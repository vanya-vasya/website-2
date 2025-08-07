import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import prismadb from "@/lib/prismadb";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/settings");

interface RequestBody {
  generationsCount: number;
}

export const maxDuration = 60;

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

    let userGenerations = await prismadb.user.findUnique({
      where: {
        id: userId,
      },
    });

    return new NextResponse("Internal Error", { status: 500 });

    // const newAvailableGenerations = userGenerations.availableGenerations - userGenerations.usedGenerations + generationsCount;
    // const newUsedGenerations = 0;

    // await prismadb.userApiLimit.update({
    //   where: {
    //     userId,
    //   },
    //   data: {
    //     availableGenerations: newAvailableGenerations,
    //     usedGenerations: newUsedGenerations,
    //   },
    // });

    // return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.log("[GENERATIONS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
