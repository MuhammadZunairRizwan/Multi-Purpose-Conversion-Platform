"use client";

import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FileText } from "lucide-react";

interface AnonymousUsage {
  used: number;
  remaining: number;
  limit: number;
  canConvert: boolean;
}

export default function Header() {
  const { isSignedIn, isLoaded } = useAuth();
  const pathname = usePathname();
  const [anonymousUsage, setAnonymousUsage] = useState<AnonymousUsage | null>(null);

  // Check if we're on a dashboard page
  const isDashboardPage = pathname?.includes("/dashboard");

  // Fetch anonymous usage when not logged in and on dashboard
  useEffect(() => {
    const fetchAnonymousUsage = async () => {
      if (!isLoaded || isSignedIn) return;
      if (!pathname?.includes("/dashboard")) return;

      try {
        const response = await fetch("/api/anonymous-usage");
        if (response.ok) {
          const data = await response.json();
          setAnonymousUsage(data);
        } else {
          // Set default if API fails
          setAnonymousUsage({ used: 0, remaining: 5, limit: 5, canConvert: true });
        }
      } catch (err) {
        console.error("Failed to fetch anonymous usage:", err);
        // Set default if API fails
        setAnonymousUsage({ used: 0, remaining: 5, limit: 5, canConvert: true });
      }
    };

    fetchAnonymousUsage();
  }, [isLoaded, isSignedIn, pathname]);

  // Listen for usage updates from file converter
  useEffect(() => {
    const handleUsageUpdate = (event: CustomEvent<AnonymousUsage>) => {
      setAnonymousUsage(event.detail);
    };

    window.addEventListener("anonymous-usage-updated", handleUsageUpdate as EventListener);
    return () => {
      window.removeEventListener("anonymous-usage-updated", handleUsageUpdate as EventListener);
    };
  }, []);

  return (
    <header className="glass-navbar sticky top-0 z-50 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="CalcnConvert Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <nav className="flex items-center gap-3">
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-red-500 transition font-medium">
                Dashboard
              </Link>
              <UserButton />
            </div>
          ) : (
            <>
              {/* Anonymous Usage Indicator - File Conversions */}
              {isDashboardPage && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                  anonymousUsage?.canConvert !== false
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">
                    {anonymousUsage ? `${anonymousUsage.remaining}/${anonymousUsage.limit}` : "5/5"} free
                  </span>
                </div>
              )}
              <Link href="/sign-in">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
