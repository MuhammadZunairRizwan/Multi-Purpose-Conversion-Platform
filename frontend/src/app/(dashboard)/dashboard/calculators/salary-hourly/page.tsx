"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { calculatorAPI } from "@/lib/api";
import { parseApiError } from "@/lib/utils";
import { AlertCircle, Loader, Briefcase, Clock, ArrowLeftRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SalaryHourlyCalculatorPage() {
  const [amount, setAmount] = useState(50000);
  const [conversionType, setConversionType] = useState<"salary_to_hourly" | "hourly_to_salary">("salary_to_hourly");
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [weeksPerYear, setWeeksPerYear] = useState(52);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string>("FREE");

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

  const calculateSalaryHourly = useCallback(async () => {
    if (amount <= 0 || hoursPerWeek <= 0 || weeksPerYear <= 0) {
      const errorMsg = "Please enter valid values";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await calculatorAPI.salaryHourlyCalculator(
        amount,
        conversionType,
        hoursPerWeek,
        weeksPerYear
      );

      setResult(response.data);
      toast.success("Calculation completed!");
    } catch (err: any) {
      const errorMsg = parseApiError(err, "Calculation failed");
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [amount, conversionType, hoursPerWeek, weeksPerYear]);

  // Auto-calculate when values change
  useEffect(() => {
    if (userTier === "FREE") return;

    const timer = setTimeout(() => {
      if (amount > 0 && hoursPerWeek > 0 && weeksPerYear > 0) {
        calculateSalaryHourly();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [calculateSalaryHourly, userTier]);

  // Toggle conversion type
  const toggleConversionType = () => {
    if (conversionType === "salary_to_hourly") {
      setConversionType("hourly_to_salary");
      setAmount(25); // Default hourly rate
    } else {
      setConversionType("salary_to_hourly");
      setAmount(50000); // Default salary
    }
    setResult(null);
  };

  // Show upgrade message for free tier
  if (userTier === "FREE") {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Salary / Hourly Calculator
            </h1>
            <p className="text-gray-600 mb-6">
              This calculator is available for Starter and Pro tier users.
              Upgrade to convert between annual salary and hourly rates.
            </p>
            <Link href="/dashboard/pricing">
              <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
                Upgrade to Starter
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Salary / Hourly Calculator
            </h1>
            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
              STARTER
            </span>
          </div>
          <p className="text-gray-600">
            Convert between annual salary and hourly rate
          </p>
        </div>

        {/* Conversion Type Toggle */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-center gap-4">
            <span className={`font-medium ${conversionType === "salary_to_hourly" ? "text-blue-600" : "text-gray-400"}`}>
              Salary to Hourly
            </span>
            <button
              onClick={toggleConversionType}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            >
              <ArrowLeftRight className="w-5 h-5 text-gray-600" />
            </button>
            <span className={`font-medium ${conversionType === "hourly_to_salary" ? "text-blue-600" : "text-gray-400"}`}>
              Hourly to Salary
            </span>
          </div>
        </Card>

        {/* Input Form */}
        <Card className="p-6 mb-6">
          <div className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {conversionType === "salary_to_hourly"
                  ? `Annual Salary: $${amount.toLocaleString()}`
                  : `Hourly Rate: $${amount.toLocaleString()}`}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="0"
                step={conversionType === "salary_to_hourly" ? "1000" : "0.5"}
                placeholder={conversionType === "salary_to_hourly" ? "Enter annual salary..." : "Enter hourly rate..."}
              />
            </div>

            {/* Hours Per Week */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Hours Per Week: {hoursPerWeek}
              </label>
              <input
                type="range"
                min="10"
                max="60"
                step="1"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(parseFloat(e.target.value))}
                className="w-full"
              />
              <input
                type="number"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(parseFloat(e.target.value) || 40)}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
                min="1"
                max="168"
              />
            </div>

            {/* Weeks Per Year */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Weeks Per Year: {weeksPerYear}
              </label>
              <input
                type="range"
                min="40"
                max="52"
                step="1"
                value={weeksPerYear}
                onChange={(e) => setWeeksPerYear(parseFloat(e.target.value))}
                className="w-full"
              />
              <input
                type="number"
                value={weeksPerYear}
                onChange={(e) => setWeeksPerYear(parseFloat(e.target.value) || 52)}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
                min="1"
                max="52"
              />
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <Card className="p-6 mb-6 text-center">
            <Loader className="w-6 h-6 text-red-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Calculating...</p>
          </Card>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-4 mb-6">
            {/* Primary Result */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {conversionType === "salary_to_hourly" ? "Hourly Rate" : "Annual Salary"}
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${conversionType === "salary_to_hourly"
                      ? result.hourly_rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : result.annual_salary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                {conversionType === "salary_to_hourly"
                  ? <Clock className="w-12 h-12 text-blue-300" />
                  : <Briefcase className="w-12 h-12 text-blue-300" />}
              </div>
            </Card>

            {/* Breakdown */}
            <Card className="p-6 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">Complete Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-xs text-gray-500 uppercase">Hourly</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${result.hourly_rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-xs text-gray-500 uppercase">Daily</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${result.daily_rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-xs text-gray-500 uppercase">Weekly</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${result.weekly_salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-xs text-gray-500 uppercase">Monthly</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${result.monthly_salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-500 uppercase">Annual</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${result.annual_salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </Card>

            {/* Assumptions */}
            <Card className="p-4 bg-gray-100">
              <p className="text-sm text-gray-600">
                <strong>Assumptions:</strong> {result.hours_per_week} hours/week,
                {result.weeks_per_year} weeks/year, 5 work days/week
              </p>
            </Card>
          </div>
        )}

        {/* Formula Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Formula:</strong><br />
            Hourly Rate = Annual Salary / (Hours per Week x Weeks per Year)<br />
            Annual Salary = Hourly Rate x Hours per Week x Weeks per Year
          </p>
        </Card>
      </div>
    </div>
  );
}
