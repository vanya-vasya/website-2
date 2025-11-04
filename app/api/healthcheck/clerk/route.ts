import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    
    const clerkConfig = {
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "NOT_SET",
      secretKey: process.env.CLERK_SECRET_KEY ? "SET (hidden)" : "NOT_SET",
      domain: process.env.NEXT_PUBLIC_CLERK_DOMAIN || "NOT_SET",
      webhookSecret: process.env.CLERK_WEBHOOK_SECRET ? "SET (hidden)" : "NOT_SET",
      signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in",
      signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up",
      afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "/dashboard",
      afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "/dashboard",
      isProduction: process.env.NODE_ENV === "production",
      currentUser: userId ? "Authenticated" : "Not authenticated",
    };

    // Check if keys are LIVE or TEST
    const keyType = clerkConfig.publishableKey.startsWith("pk_live_") 
      ? "LIVE (Production)" 
      : clerkConfig.publishableKey.startsWith("pk_test_") 
        ? "TEST (Development)" 
        : "Unknown";

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      clerk: clerkConfig,
      keyType,
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || "not-vercel",
    });
  } catch (error) {
    console.error("Healthcheck error:", error);
    return NextResponse.json(
      { 
        status: "error", 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}





