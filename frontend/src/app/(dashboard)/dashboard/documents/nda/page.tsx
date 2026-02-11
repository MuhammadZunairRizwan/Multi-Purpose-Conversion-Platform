"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { documentAPI } from "@/lib/api";
import { parseApiError } from "@/lib/utils";
import { AlertCircle, Loader, Download, Lock, Shield } from "lucide-react";
import Link from "next/link";

export default function NDAGeneratorPage() {
  const [userTier, setUserTier] = useState<string>("FREE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NDA Form State
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [disclosingPartyName, setDisclosingPartyName] = useState("Your Company Name");
  const [disclosingPartyAddress, setDisclosingPartyAddress] = useState("123 Business St, City, State 12345");
  const [receivingPartyName, setReceivingPartyName] = useState("");
  const [receivingPartyAddress, setReceivingPartyAddress] = useState("");
  const [purpose, setPurpose] = useState("business discussions and potential collaboration");
  const [durationYears, setDurationYears] = useState(2);
  const [governingLaw, setGoverningLaw] = useState("the State of Delaware");

  // Fetch user tier
  useEffect(() => {
    const fetchTier = async () => {
      try {
        const response = await fetch("/api/user/tier");
        if (response.ok) {
          const data = await response.json();
          setUserTier(data.tier || "FREE");
        }
      } catch (error) {
        console.error("Failed to fetch tier:", error);
      }
    };
    fetchTier();
  }, []);

  const handleGenerateNDA = async () => {
    if (!receivingPartyName.trim()) {
      const errorMsg = "Please enter the receiving party's name";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const ndaData = {
        effective_date: effectiveDate,
        disclosing_party_name: disclosingPartyName,
        disclosing_party_address: disclosingPartyAddress,
        receiving_party_name: receivingPartyName,
        receiving_party_address: receivingPartyAddress,
        purpose: purpose,
        duration_years: durationYears,
        governing_law: governingLaw,
      };

      const response = await documentAPI.generateNDA(ndaData);

      // Create download link
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      const safeName = receivingPartyName.replace(/\s+/g, "_").slice(0, 20);
      link.setAttribute("download", `NDA_${safeName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("NDA generated and downloaded successfully!");
    } catch (err: any) {
      const errorMsg = parseApiError(err, "Failed to generate NDA");
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Show upgrade message for non-Pro tiers
  if (userTier !== "PRO") {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              NDA Generator
            </h1>
            <p className="text-gray-600 mb-6">
              Create professional Non-Disclosure Agreements with this Pro tier feature.
              Upgrade to generate legally-formatted NDAs for your business.
            </p>
            <Link href="/dashboard/pricing">
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                Upgrade to Pro
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              NDA Generator
            </h1>
            <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
              PRO
            </span>
          </div>
          <p className="text-gray-600">
            Create professional Non-Disclosure Agreements for your business relationships
          </p>
        </div>

        {error && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agreement Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Agreement Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (Years)
                  </label>
                  <select
                    value={durationYears}
                    onChange={(e) => setDurationYears(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value={1}>1 Year</option>
                    <option value={2}>2 Years</option>
                    <option value={3}>3 Years</option>
                    <option value={5}>5 Years</option>
                    <option value={10}>10 Years</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Disclosing Party */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Disclosing Party (Your Company)
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company/Individual Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your Company Name"
                    value={disclosingPartyName}
                    onChange={(e) => setDisclosingPartyName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    placeholder="Full address"
                    value={disclosingPartyAddress}
                    onChange={(e) => setDisclosingPartyAddress(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>
              </div>
            </Card>

            {/* Receiving Party */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Receiving Party
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company/Individual Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter receiving party name"
                    value={receivingPartyName}
                    onChange={(e) => setReceivingPartyName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    placeholder="Full address"
                    value={receivingPartyAddress}
                    onChange={(e) => setReceivingPartyAddress(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>
              </div>
            </Card>

            {/* Purpose & Legal */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Purpose & Legal Terms
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose of Disclosure
                  </label>
                  <textarea
                    placeholder="Describe the purpose of sharing confidential information"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Governing Law
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., the State of Delaware"
                    value={governingLaw}
                    onChange={(e) => setGoverningLaw(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateNDA}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white p-4 text-lg"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Generate & Download NDA
                </>
              )}
            </Button>
          </div>

          {/* Info Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                NDA Overview
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">This NDA includes:</p>
                  <ul className="mt-2 space-y-1 text-gray-600">
                    <li>- Definition of Confidential Information</li>
                    <li>- Obligations of Receiving Party</li>
                    <li>- Term and Termination</li>
                    <li>- Return of Information</li>
                    <li>- Governing Law provisions</li>
                    <li>- Signature blocks</li>
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <p className="font-medium text-gray-700">Summary:</p>
                  <div className="mt-2 space-y-2 text-gray-600">
                    <p><strong>From:</strong> {disclosingPartyName || "Not specified"}</p>
                    <p><strong>To:</strong> {receivingPartyName || "Not specified"}</p>
                    <p><strong>Duration:</strong> {durationYears} year(s)</p>
                    <p><strong>Jurisdiction:</strong> {governingLaw}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs text-purple-800">
                  <strong>PRO Feature:</strong> NDAs generated without watermarks.
                  Professional formatting for legal documents.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
