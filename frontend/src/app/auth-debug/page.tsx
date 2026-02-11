"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AuthDebugPage() {
  const { isLoaded, userId, isSignedIn } = useAuth();
  const { user, isLoaded: userIsLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setMounted(true);
    setCurrentPath(window.location.pathname);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Auth Debug Console</h1>

          {/* Auth State */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold mb-4 text-blue-900">Auth State</h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">isLoaded:</span>
                <span className={isLoaded ? "text-green-600" : "text-red-600"}>
                  {String(isLoaded)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">isSignedIn:</span>
                <span className={isSignedIn ? "text-green-600" : "text-red-600"}>
                  {String(isSignedIn)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">userId:</span>
                <span className={userId ? "text-green-600" : "text-red-600"}>
                  {userId || "null"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">userIsLoaded:</span>
                <span className={userIsLoaded ? "text-green-600" : "text-red-600"}>
                  {String(userIsLoaded)}
                </span>
              </div>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold mb-4 text-green-900">User Info</h2>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">Email:</span>
                  <span>{user.emailAddresses[0]?.emailAddress || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">First Name:</span>
                  <span>{user.firstName || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Last Name:</span>
                  <span>{user.lastName || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Environment Variables */}
          <div className="mb-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h2 className="text-lg font-semibold mb-4 text-purple-900">Environment Variables</h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:</span>
                <span>{process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:</span>
                <span>{process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "not set"}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h2 className="text-lg font-semibold mb-4 text-yellow-900">Actions</h2>
            <div className="space-y-2">
              {isSignedIn ? (
                <>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
                  >
                    Go to Home
                  </button>
                </>
              ) : (
                <>
                  <Link href="/sign-in" className="block">
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                      Go to Sign In
                    </button>
                  </Link>
                  <Link href="/sign-up" className="block">
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                      Go to Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Current Path */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Current Path:</h3>
            <p className="font-mono text-sm">{currentPath}</p>
          </div>

          {/* Console Info */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">💡 Tips:</h3>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
              <li>Check your browser console (F12) for detailed logs</li>
              <li>Look for messages starting with [SignIn], [SignUp], or [DashboardLayout]</li>
              <li>Verify that isLoaded becomes true within a few seconds</li>
              <li>If isSignedIn is false after loading, check your Clerk configuration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
