"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Application error:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Oops!</h1>
        <p className="text-2xl font-semibold text-gray-900 mb-4">
          Something went wrong
        </p>
        <p className="text-gray-600 mb-4">
          We encountered an unexpected error. Please try again or contact support
          if the problem persists.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-xs font-mono text-gray-700 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={reset}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
