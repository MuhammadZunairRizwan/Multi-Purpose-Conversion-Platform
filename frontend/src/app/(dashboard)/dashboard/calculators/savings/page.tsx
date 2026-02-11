"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { calculatorAPI } from "@/lib/api";
import { parseApiError } from "@/lib/utils";
import { AlertCircle, Loader, PiggyBank, TrendingUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface YearlyBreakdown {
  year: number;
  balance: number;
}

export default function SavingsCalculatorPage() {
  const [initialDeposit, setInitialDeposit] = useState(5000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [annualRate, setAnnualRate] = useState(5);
  const [years, setYears] = useState(10);
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

  const calculateSavings = useCallback(async () => {
    if (initialDeposit < 0 || monthlyContribution < 0 || annualRate < 0 || years <= 0) {
      const errorMsg = "Please enter valid values";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await calculatorAPI.savingsCalculator(
        initialDeposit,
        monthlyContribution,
        annualRate,
        years
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
  }, [initialDeposit, monthlyContribution, annualRate, years]);

  // Auto-calculate when values change
  useEffect(() => {
    if (userTier === "FREE") return;

    const timer = setTimeout(() => {
      if (years > 0) {
        calculateSavings();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [calculateSavings, userTier]);

  // Show upgrade message for free tier
  if (userTier === "FREE") {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Savings Calculator
            </h1>
            <p className="text-gray-600 mb-6">
              This calculator is available for Starter and Pro tier users.
              Upgrade to calculate future savings with compound interest.
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Savings Calculator
            </h1>
            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
              STARTER
            </span>
          </div>
          <p className="text-gray-600">
            Calculate the future value of your savings with compound interest
          </p>
        </div>

        {/* Input Form */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Initial Deposit */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Initial Deposit: ${initialDeposit.toLocaleString()}
              </label>
              <input
                type="number"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="0"
                step="100"
                placeholder="Enter initial deposit..."
              />
            </div>

            {/* Monthly Contribution */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Monthly Contribution: ${monthlyContribution.toLocaleString()}
              </label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="0"
                step="50"
                placeholder="Enter monthly contribution..."
              />
            </div>

            {/* Annual Rate */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Annual Interest Rate: {annualRate.toFixed(1)}%
              </label>
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={annualRate}
                onChange={(e) => setAnnualRate(parseFloat(e.target.value))}
                className="w-full"
              />
              <input
                type="number"
                value={annualRate}
                onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
                min="0"
                max="30"
                step="0.1"
              />
            </div>

            {/* Years */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Time Period: {years} years
              </label>
              <input
                type="range"
                min="1"
                max="40"
                step="1"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value))}
                className="w-full"
              />
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value) || 1)}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
                min="1"
                max="50"
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
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Future Value</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${result.future_value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <PiggyBank className="w-10 h-10 text-green-300" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Contributions</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${result.total_contributions.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Interest Earned</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${result.total_interest.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-purple-300" />
                </div>
              </Card>
            </div>

            {/* Year-by-Year Growth */}
            {result.yearly_breakdown && result.yearly_breakdown.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Growth Over Time</h3>
                <div className="space-y-3">
                  {result.yearly_breakdown.map((item: YearlyBreakdown) => (
                    <div key={item.year} className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 w-16">Year {item.year}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full"
                          style={{
                            width: `${(item.balance / result.future_value) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-28 text-right">
                        ${item.balance.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Summary */}
            <Card className="p-6 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">Investment Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Initial Deposit:</span>
                  <span className="font-semibold text-gray-900">
                    ${result.initial_deposit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Contribution:</span>
                  <span className="font-semibold text-gray-900">
                    ${result.monthly_contribution.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Interest Rate:</span>
                  <span className="font-semibold text-gray-900">
                    {result.annual_rate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Period:</span>
                  <span className="font-semibold text-gray-900">
                    {result.years} years
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600">Interest Earned:</span>
                  <span className="font-semibold text-green-600">
                    ${result.total_interest.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Formula Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Formula:</strong> FV = P(1+r)^n + PMT x [((1+r)^n - 1) / r]<br />
            Where P = Initial deposit, PMT = Monthly contribution, r = Monthly rate, n = Number of months
          </p>
        </Card>
      </div>
    </div>
  );
}
