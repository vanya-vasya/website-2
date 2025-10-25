import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

// import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { MODEL_GENERATIONS_PRICE } from "@/constants";

const configuration = {
  apiKey: process.env.OPEN_API_KEY,
};

const openai = new OpenAI(configuration);

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    console.log("[CONVERSATION] User ID:", userId);

    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      console.error("[CONVERSATION] No user ID found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!configuration.apiKey) {
      console.error("[CONVERSATION] OpenAI API key not configured");
      return new NextResponse("OpenAI API Key not configured.", {
        status: 500,
      });
    }

    if (!messages) {
      console.error("[CONVERSATION] No messages provided");
      return new NextResponse("Messages are required", { status: 400 });
    }

    console.log("[CONVERSATION] Checking API limit for user:", userId);
    const apiGenerations = await checkApiLimit(
      MODEL_GENERATIONS_PRICE.conversation
    );
    console.log("[CONVERSATION] API limit check result:", apiGenerations);

    if (!apiGenerations) {
      console.error("[CONVERSATION] User has insufficient credits");
      return new NextResponse(
        "Your generation limit has been reached. Please purchase additional generations.",
        { status: 403 }
      );
    }

    console.log("[CONVERSATION] Calling OpenAI API");
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });
    console.log("[CONVERSATION] OpenAI API response received");

    console.log("[CONVERSATION] Incrementing API limit");
    await incrementApiLimit(MODEL_GENERATIONS_PRICE.conversation);
    console.log("[CONVERSATION] API limit incremented successfully");

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.error("[CONVERSATION_ERROR]", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("[CONVERSATION_ERROR] Message:", error.message);
      console.error("[CONVERSATION_ERROR] Stack:", error.stack);
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
