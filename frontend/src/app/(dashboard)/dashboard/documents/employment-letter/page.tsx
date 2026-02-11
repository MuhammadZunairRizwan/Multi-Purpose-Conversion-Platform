"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { documentAPI } from "@/lib/api";
import { parseApiError } from "@/lib/utils";
import { AlertCircle, Loader, Download, Lock, Briefcase, ArrowLeftRight } from "lucide-react";
import Link from "next/link";

export default function EmploymentLetterGeneratorPage() {
  const [userTier, setUserTier] = useState<string>("FREE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Letter Type
  const [letterType, setLetterType] = useState<"offer" | "confirmation">("offer");

  // Company Info
  const [companyName, setCompanyName] = useState("Your Company Name");
  const [companyAddress, setCompanyAddress] = useState("123 Business St, City, State 12345");
  const [companyPhone, setCompanyPhone] = useState("(555) 123-4567");
  const [companyEmail, setCompanyEmail] = useState("hr@company.com");

  // Employee Info
  const [employeeName, setEmployeeName] = useState("");
  const [employeeAddress, setEmployeeAddress] = useState("");

  // Position Details
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [salary, setSalary] = useState(50000);
  const [salaryFrequency, setSalaryFrequency] = useState("annually");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [hireDate, setHireDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reportingManager, setReportingManager] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("Full-time");
  const [benefits, setBenefits] = useState("");
  const [additionalTerms, setAdditionalTerms] = useState("");

  // HR Details
  const [hrName, setHrName] = useState("");
  const [hrTitle, setHrTitle] = useState("Human Resources Manager");
  const [letterDate, setLetterDate] = useState(
    new Date().toISOString().split("T")[0]
  );

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

  const handleGenerateLetter = async () => {
    if (!employeeName.trim()) {
      const errorMsg = "Please enter the employee's name";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!position.trim()) {
      const errorMsg = "Please enter the position";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const letterData = {
        letter_type: letterType,
        letter_date: letterDate,
        company_name: companyName,
        company_address: companyAddress,
        company_phone: companyPhone,
        company_email: companyEmail,
        employee_name: employeeName,
        employee_address: employeeAddress,
        position: position,
        department: department,
        salary: salary,
        salary_frequency: salaryFrequency,
        start_date: letterType === "offer" ? startDate : undefined,
        hire_date: letterType === "confirmation" ? hireDate : undefined,
        reporting_manager: reportingManager,
        employment_status: employmentStatus,
        benefits: benefits,
        additional_terms: additionalTerms,
        hr_name: hrName,
        hr_title: hrTitle,
      };

      const response = await documentAPI.generateEmploymentLetter(letterData);

      // Create download link
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      const safeName = employeeName.replace(/\s+/g, "_").slice(0, 20);
      const typeLabel = letterType === "offer" ? "Offer" : "Confirmation";
      link.setAttribute("download", `Employment_${typeLabel}_${safeName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Employment letter generated successfully!");
    } catch (err: any) {
      const errorMsg = parseApiError(err, "Failed to generate letter");
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
              Employment Letter Generator
            </h1>
            <p className="text-gray-600 mb-6">
              Create professional offer letters and employment confirmation letters with this Pro tier feature.
              Upgrade to generate HR documents for your organization.
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Employment Letter Generator
            </h1>
            <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
              PRO
            </span>
          </div>
          <p className="text-gray-600">
            Create professional offer letters and employment confirmation letters
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

        {/* Letter Type Toggle */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-center gap-4">
            <span className={`font-medium ${letterType === "offer" ? "text-purple-600" : "text-gray-400"}`}>
              Offer Letter
            </span>
            <button
              onClick={() => setLetterType(letterType === "offer" ? "confirmation" : "offer")}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            >
              <ArrowLeftRight className="w-5 h-5 text-gray-600" />
            </button>
            <span className={`font-medium ${letterType === "confirmation" ? "text-purple-600" : "text-gray-400"}`}>
              Confirmation Letter
            </span>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Letter Date & HR Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Letter Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Letter Date
                  </label>
                  <input
                    type="date"
                    value={letterDate}
                    onChange={(e) => setLetterDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HR Representative Name *
                  </label>
                  <input
                    type="text"
                    placeholder="John Smith"
                    value={hrName}
                    onChange={(e) => setHrName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HR Title
                  </label>
                  <input
                    type="text"
                    placeholder="Human Resources Manager"
                    value={hrTitle}
                    onChange={(e) => setHrTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </Card>

            {/* Company Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Company Information
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </Card>

            {/* Employee Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Employee Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    placeholder="Employee's full address"
                    value={employeeAddress}
                    onChange={(e) => setEmployeeAddress(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>
              </div>
            </Card>

            {/* Position Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Position Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Software Engineer"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary
                  </label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    min="0"
                    step="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pay Frequency
                  </label>
                  <select
                    value={salaryFrequency}
                    onChange={(e) => setSalaryFrequency(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="annually">Annually</option>
                    <option value="monthly">Monthly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
                {letterType === "offer" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hire Date
                    </label>
                    <input
                      type="date"
                      value={hireDate}
                      onChange={(e) => setHireDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Status
                  </label>
                  <select
                    value={employmentStatus}
                    onChange={(e) => setEmploymentStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>
                {letterType === "offer" && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reporting Manager
                    </label>
                    <input
                      type="text"
                      placeholder="Manager name"
                      value={reportingManager}
                      onChange={(e) => setReportingManager(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Additional Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Information
              </h3>
              <div className="space-y-4">
                {letterType === "offer" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Benefits (Optional)
                    </label>
                    <textarea
                      placeholder="Health insurance, 401k, PTO, etc."
                      value={benefits}
                      onChange={(e) => setBenefits(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Terms (Optional)
                  </label>
                  <textarea
                    placeholder="Any additional terms or conditions"
                    value={additionalTerms}
                    onChange={(e) => setAdditionalTerms(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateLetter}
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
                  Generate & Download {letterType === "offer" ? "Offer Letter" : "Confirmation Letter"}
                </>
              )}
            </Button>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Letter Summary
              </h3>

              <div className="space-y-4 text-sm">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-800">
                    {letterType === "offer" ? "Offer Letter" : "Employment Confirmation"}
                  </p>
                </div>

                <div className="space-y-2 text-gray-600">
                  <p><strong>Company:</strong> {companyName}</p>
                  <p><strong>Employee:</strong> {employeeName || "Not specified"}</p>
                  <p><strong>Position:</strong> {position || "Not specified"}</p>
                  <p><strong>Department:</strong> {department || "Not specified"}</p>
                  <p><strong>Salary:</strong> ${salary.toLocaleString()} {salaryFrequency}</p>
                  {letterType === "offer" ? (
                    <p><strong>Start Date:</strong> {startDate}</p>
                  ) : (
                    <p><strong>Hire Date:</strong> {hireDate}</p>
                  )}
                  <p><strong>Status:</strong> {employmentStatus}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500">
                    {letterType === "offer"
                      ? "This letter will include an acceptance signature section for the employee."
                      : "This letter confirms employment details for HR records."}
                  </p>
                </div>
              </div>

              <div className="mt-6 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs text-purple-800">
                  <strong>PRO Feature:</strong> Professional employment letters
                  without watermarks. Suitable for official HR documentation.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
