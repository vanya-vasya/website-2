"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

interface ClerkDebugInfo {
  environment: {
    nodeEnv: string;
    vercelEnv: string;
    vercelUrl: string;
  };
  clerk: {
    publishableKey: {
      value: string;
      isLive: boolean;
      isTest: boolean;
    };
    secretKey: {
      isSet: boolean;
      isLive: boolean;
      isTest: boolean;
    };
    domain: string;
    frontendApi: string;
    webhookSecret: boolean;
  };
  auth: {
    userId: string;
    sessionId: string;
    isAuthenticated: boolean;
  };
  urls: {
    signIn: string;
    signUp: string;
    afterSignIn: string;
    afterSignUp: string;
  };
  warnings: string[];
}

export default function ClerkDebugPage() {
  const { userId, sessionId, isLoaded } = useAuth();
  const { user } = useUser();
  const [serverConfig, setServerConfig] = useState<ClerkDebugInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/debug/clerk-config");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setServerConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch config");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const clientConfig = {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "NOT_SET",
    domain: process.env.NEXT_PUBLIC_CLERK_DOMAIN || "NOT_SET",
    frontendApi: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API || "NOT_SET",
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Clerk Authentication Diagnostic</h1>

      {/* Client-side Auth Status */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Client-Side Auth Status</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Auth Loaded:</span>
            <span className={isLoaded ? "text-green-600" : "text-red-600"}>
              {isLoaded ? "✓ Yes" : "✗ No"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">User ID:</span>
            <span className="text-gray-900">{userId || "Not authenticated"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Session ID:</span>
            <span className="text-gray-900">{sessionId || "No session"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">User Email:</span>
            <span className="text-gray-900">{user?.primaryEmailAddress?.emailAddress || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Client-side Config */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Client-Side Configuration</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-gray-700">Publishable Key:</span>
            <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono break-all text-gray-900">
              {clientConfig.publishableKey}
            </div>
            <div className="mt-1">
              <span className={
                clientConfig.publishableKey.startsWith("pk_live_") 
                  ? "text-green-600 text-xs" 
                  : clientConfig.publishableKey.startsWith("pk_test_") 
                    ? "text-yellow-600 text-xs" 
                    : "text-red-600 text-xs"
              }>
                {clientConfig.publishableKey.startsWith("pk_live_") 
                  ? "✓ LIVE (Production)" 
                  : clientConfig.publishableKey.startsWith("pk_test_") 
                    ? "⚠ TEST (Development)" 
                    : "✗ Invalid or not set"}
              </span>
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Domain:</span>
            <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono text-gray-900">
              {clientConfig.domain}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Frontend API:</span>
            <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono text-gray-900">
              {clientConfig.frontendApi}
            </div>
          </div>
        </div>
      </div>

      {/* Server-side Config */}
      {loading && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <p className="text-gray-600">Loading server configuration...</p>
        </div>
      )}

      {error && (
        <div className="mb-8 p-6 bg-red-50 rounded-lg shadow border border-red-200">
          <h2 className="text-xl font-semibold mb-2 text-red-900">Error Loading Server Config</h2>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {serverConfig && (
        <>
          {/* Warnings */}
          {serverConfig.warnings.length > 0 && (
            <div className="mb-8 p-6 bg-yellow-50 rounded-lg shadow border border-yellow-200">
              <h2 className="text-xl font-semibold mb-4 text-yellow-900">⚠ Warnings</h2>
              <ul className="list-disc list-inside space-y-1">
                {serverConfig.warnings.map((warning, idx) => (
                  <li key={idx} className="text-yellow-800">{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Server Config */}
          <div className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Server-Side Configuration</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Environment</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Node ENV:</span>
                    <span className="text-gray-900">{serverConfig.environment.nodeEnv}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vercel ENV:</span>
                    <span className="text-gray-900">{serverConfig.environment.vercelEnv}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Clerk Keys</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Publishable Key Type:</span>
                      <span className={
                        serverConfig.clerk.publishableKey.isLive 
                          ? "text-green-600" 
                          : serverConfig.clerk.publishableKey.isTest 
                            ? "text-yellow-600" 
                            : "text-red-600"
                      }>
                        {serverConfig.clerk.publishableKey.isLive 
                          ? "LIVE" 
                          : serverConfig.clerk.publishableKey.isTest 
                            ? "TEST" 
                            : "UNKNOWN"}
                      </span>
                    </div>
                    <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono break-all text-gray-900">
                      {serverConfig.clerk.publishableKey.value}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Secret Key Set:</span>
                    <span className={serverConfig.clerk.secretKey.isSet ? "text-green-600" : "text-red-600"}>
                      {serverConfig.clerk.secretKey.isSet ? "✓ Yes" : "✗ No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Secret Key Type:</span>
                    <span className={
                      serverConfig.clerk.secretKey.isLive 
                        ? "text-green-600" 
                        : serverConfig.clerk.secretKey.isTest 
                          ? "text-yellow-600" 
                          : "text-red-600"
                    }>
                      {serverConfig.clerk.secretKey.isLive 
                        ? "LIVE" 
                        : serverConfig.clerk.secretKey.isTest 
                          ? "TEST" 
                          : "UNKNOWN"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">URLs</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sign In:</span>
                    <span className="text-gray-900">{serverConfig.urls.signIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sign Up:</span>
                    <span className="text-gray-900">{serverConfig.urls.signUp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">After Sign In:</span>
                    <span className="text-gray-900">{serverConfig.urls.afterSignIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">After Sign Up:</span>
                    <span className="text-gray-900">{serverConfig.urls.afterSignUp}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recommendations */}
      <div className="p-6 bg-blue-50 rounded-lg shadow border border-blue-200">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">Recommendations</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-blue-800">
          <li>Ensure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY starts with <code className="bg-blue-100 px-1 rounded">pk_live_</code> in production</li>
          <li>Ensure CLERK_SECRET_KEY starts with <code className="bg-blue-100 px-1 rounded">sk_live_</code> in production</li>
          <li>Verify Clerk dashboard &gt; API Keys &gt; Frontend API matches your domain</li>
          <li>Check Clerk dashboard &gt; Paths &gt; URLs match your configuration</li>
          <li>Clear build cache and redeploy if keys were recently changed</li>
          <li>Verify OAuth redirect URLs in Clerk dashboard for production domain</li>
        </ul>
      </div>
    </div>
  );
}













