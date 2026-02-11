"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Links Row */}
        <div className="flex flex-wrap justify-center gap-8 mb-6">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
          <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
        </div>

        {/* Contact Row */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Support:</span>
            <a href="mailto:support@calcnconvert.net" className="text-red-400 hover:text-red-300 transition">
              support@calcnconvert.net
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Enquiries:</span>
            <a href="mailto:info@calcnconvert.net" className="text-red-400 hover:text-red-300 transition">
              info@calcnconvert.net
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-sm">&copy; 2025 CalcnConvert. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
