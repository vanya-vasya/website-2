import { User } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";

import { Heading } from "@/components/heading";
import { Card, CardContent } from "@/components/ui/card";
import { getApiAvailableGenerations, getApiUsedGenerations } from "@/lib/api-limit";

const ProfilePage = async () => {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const apiUsedGenerations = await getApiUsedGenerations();
  const apiAvailableGenerations = await getApiAvailableGenerations();
  const remainingGenerations = apiAvailableGenerations - apiUsedGenerations;

  return ( 
    <div className="bg-white min-h-screen">
      <Heading
        title="Profile"
        description="Manage your profile and account information."
        icon={User}
      />
      <div className="px-4 lg:px-8 space-y-6">
        <Card className="border-gray-200">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start gap-6">
              {user.imageUrl && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
                  <Image 
                    src={user.imageUrl} 
                    alt={`${user.firstName} ${user.lastName}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-gray-600">
                    {user.emailAddresses[0]?.emailAddress}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Account ID</p>
                    <p className="text-xs font-mono text-gray-900 break-all">{user.id}</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Available Credits</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                      {remainingGenerations}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Used Credits</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {apiUsedGenerations}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Account Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-700">Active Account</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm text-gray-700">Email Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                To manage your account settings, security preferences, or update your profile information, 
                please visit your Clerk account dashboard.
              </p>
              <p className="text-xs text-gray-500">
                Member since: {new Date(user.createdAt!).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;

