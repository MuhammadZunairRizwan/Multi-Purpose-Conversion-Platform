"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { calculatorAPI } from "@/lib/api";
import { parseApiError } from "@/lib/utils";
import { AlertCircle, Loader, DollarSign, Calendar, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AmortizationScheduleItem {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export default function AmortizationCalculatorPage() {
  const [principal, setPrincipal] = useState(250000);
  const [annualRate, setAnnualRate] = useState(6.5);
  const [years, setYears] = useState(30);
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

  const calculateAmortization = useCallback(async () => {
    if (principal <= 0 || annualRate < 0 || years <= 0) {
      const errorMsg = "Please enter valid values";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await calculatorAPI.amortizationCalculator(
        principal,
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
  }, [principal, annualRate, years]);

  // Auto-calculate when values change (only if user has access)
  useEffect(() => {
    if (userTier === "FREE") return;

    const timer = setTimeout(() => {
      if (principal > 0 && annualRate >= 0 && years > 0) {
        calculateAmortization();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [calculateAmortization, userTier]);

  // Show upgrade message for free tier
  if (userTier === "FREE") {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Amortization Calculator
            </h1>
            <p className="text-gray-600 mb-6">
              This calculator is available for Starter and Pro tier users.
              Upgrade to access detailed amortization schedules.
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Amortization Calculator
            </h1>
            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
              STARTER
            </span>
          </div>
          <p className="text-gray-600">
            View your loan payment schedule with principal and interest breakdown
          </p>
        </div>

        {/* Input Form */}
        <Card className="p-6 mb-6">
          <div className="space-y-6">
            {/* Loan Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Loan Amount: ${principal.toLocaleString()}
              </label>
              <input
                type="range"
                min="10000"
                max="1000000"
                step="5000"
                value={principal}
                onChange={(e) => setPrincipal(parseFloat(e.target.value))}
                className="w-full"
              />
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
                min="0"
                step="1000"
              />
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Annual Interest Rate: {annualRate.toFixed(2)}%
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="0.1"
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

            {/* Loan Term */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Loan Term: {years} years
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
                onChange={(e) => setYears(parseInt(e.target.value) || 0)}
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
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Monthly Payment</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${result.monthly_payment.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-blue-300" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Payment</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${result.total_payment.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Interest</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ${result.total_interest.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </Card>
            </div>

            {/* Amortization Schedule */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  Amortization Schedule (First 12 Months)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">Month</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Payment</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Principal</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Interest</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((item: AmortizationScheduleItem) => (
                      <tr key={item.month} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium">{item.month}</td>
                        <td className="py-3 px-2 text-right">${item.payment.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right text-green-600">${item.principal.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right text-orange-600">${item.interest.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right font-medium">${item.balance.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Total payments: {result.num_payments} months ({result.years} years)
              </p>
            </Card>
          </div>
        )}

        {/* Formula Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Formula:</strong> M = P[r(1+r)^n]/[(1+r)^n-1]. This calculator shows how each
            payment is split between principal and interest over the life of the loan.
          </p>
        </Card>
      </div>
    </div>
  );
}
