"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { calculatorAPI } from "@/lib/api";
import { parseApiError } from "@/lib/utils";
import { AlertCircle, Loader, DollarSign } from "lucide-react";

export default function LoanCalculatorPage() {
  const [principal, setPrincipal] = useState(200000);
  const [annualRate, setAnnualRate] = useState(5.5);
  const [years, setYears] = useState(30);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateLoan = useCallback(async () => {
    if (principal <= 0 || annualRate < 0 || years <= 0) {
      const errorMsg = "Please enter valid values";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await calculatorAPI.loanCalculator(
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

  // Auto-calculate when values change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (principal > 0 && annualRate >= 0 && years > 0) {
        calculateLoan();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [calculateLoan]);

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Loan Calculator
          </h1>
          <p className="text-gray-600">
            Calculate your monthly loan payments and total interest
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
                min="1000"
                max="1000000"
                step="1000"
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
                max="20"
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
                max="50"
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
            {/* Monthly Payment */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Monthly Payment</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${result.monthly_payment.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-blue-300" />
              </div>
            </Card>

            {/* Total Payment */}
            <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Amount Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  ${result.total_payment.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </Card>

            {/* Total Interest */}
            <Card className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Interest Paid</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${result.total_interest.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </Card>

            {/* Breakdown */}
            <Card className="p-6 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Principal:</span>
                  <span className="font-semibold text-gray-900">
                    ${result.principal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Rate:</span>
                  <span className="font-semibold text-gray-900">
                    {result.annual_rate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Term:</span>
                  <span className="font-semibold text-gray-900">
                    {result.years} years ({result.years * 12} months)
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Formula Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Formula:</strong> M = P[r(1+r)^n]/[(1+r)^n-1] where M is monthly
            payment, P is principal, r is monthly rate, and n is number of payments.
          </p>
        </Card>
      </div>
    </div>
  );
}
