import { Sparkles } from "lucide-react";

import { Heading } from "@/components/heading";
import { getApiAvailableGenerations, getApiUsedGenerations } from "@/lib/api-limit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BuyGenerationsButton } from "@/components/buy-generations";

const CreditsPage = async () => {
  const apiUsedGenerations = await getApiUsedGenerations();
  const apiAvailableGenerations = await getApiAvailableGenerations();
  const remainingGenerations = apiAvailableGenerations - apiUsedGenerations;
  const usagePercentage = (apiUsedGenerations / apiAvailableGenerations) * 100;

  return ( 
    <div className="bg-white min-h-screen">
      <Heading
        title="Buy Credits"
        description="Purchase additional credits to continue creating amazing content."
        icon={Sparkles}
      />
      <div className="px-4 lg:px-8 space-y-6">
        {/* Current Balance Card */}
        <Card className="border-0 shadow-lg shadow-indigo-500/20 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 opacity-20 blur-lg"></div>
                <div className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 p-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Your Credit Balance
              </span>
            </CardTitle>
            <CardDescription>Track your available and used credits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Available Credits</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  {remainingGenerations}
                </p>
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Used Credits</p>
                <p className="text-3xl font-bold text-gray-900">
                  {apiUsedGenerations}
                </p>
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Total Credits</p>
                <p className="text-3xl font-bold text-gray-900">
                  {apiAvailableGenerations}
                </p>
              </div>
            </div>

            {/* Usage Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>Usage</span>
                <span className="font-semibold">{usagePercentage.toFixed(1)}%</span>
              </div>
              <div className="relative w-full h-3 rounded-full overflow-hidden bg-gray-200">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 transition-all duration-500"
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Card */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Purchase More Credits</CardTitle>
            <CardDescription>
              Buy more credits to unlock unlimited creative possibilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p>✨ Each credit allows you to generate unique AI content</p>
              <p>🎨 Use credits for images, videos, music, code, and more</p>
              <p>💳 Secure payment processing via NetworkX Pay</p>
              <p>⚡ Credits are added instantly to your account</p>
            </div>

            <div className="pt-4">
              <BuyGenerationsButton />
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
          <CardHeader>
            <CardTitle className="text-lg">How Credits Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold">Purchase Credits</p>
                <p className="text-gray-600">Choose the number of credits you want to buy and complete the secure payment.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold">Instant Activation</p>
                <p className="text-gray-600">Your credits are automatically added to your account after successful payment.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <p className="font-semibold">Start Creating</p>
                <p className="text-gray-600">Use your credits across all AI tools to generate amazing content.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreditsPage;

