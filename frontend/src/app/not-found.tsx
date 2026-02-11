import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-2xl font-semibold text-gray-900 mb-4">
          Page Not Found
        </p>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been
          moved or deleted.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/dashboard">
            <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full" variant="outline">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
