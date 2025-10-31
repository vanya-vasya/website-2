import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    // Only allow in development or with specific debug token
    const url = new URL(req.url);
    const debugToken = url.searchParams.get("token");
    
    if (process.env.NODE_ENV === "production" && debugToken !== process.env.DEBUG_TOKEN) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    const { userId, sessionId } = await auth();

    const config = {
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || "not-vercel",
        vercelUrl: process.env.VERCEL_URL || "not-set",
      },
      clerk: {
        publishableKey: {
          value: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "NOT_SET",
          isLive: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_live_") || false,
          isTest: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_") || false,
        },
        secretKey: {
          isSet: !!process.env.CLERK_SECRET_KEY,
          isLive: process.env.CLERK_SECRET_KEY?.startsWith("sk_live_") || false,
          isTest: process.env.CLERK_SECRET_KEY?.startsWith("sk_test_") || false,
        },
        domain: process.env.NEXT_PUBLIC_CLERK_DOMAIN || "NOT_SET",
        frontendApi: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API || "NOT_SET",
        webhookSecret: !!process.env.CLERK_WEBHOOK_SECRET,
      },
      auth: {
        userId: userId || "not-authenticated",
        sessionId: sessionId || "no-session",
        isAuthenticated: !!userId,
      },
      urls: {
        signIn: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in",
        signUp: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up",
        afterSignIn: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "/dashboard",
        afterSignUp: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "/dashboard",
      },
      warnings: [] as string[],
    };

    // Add warnings
    if (!config.clerk.publishableKey.isLive && process.env.NODE_ENV === "production") {
      config.warnings.push("Using TEST publishable key in PRODUCTION environment");
    }
    if (!config.clerk.secretKey.isLive && process.env.NODE_ENV === "production") {
      config.warnings.push("Using TEST secret key in PRODUCTION environment");
    }
    if (config.clerk.publishableKey.value === "NOT_SET") {
      config.warnings.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set");
    }
    if (!config.clerk.secretKey.isSet) {
      config.warnings.push("CLERK_SECRET_KEY is not set");
    }

    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error("Debug config error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

