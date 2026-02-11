"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { calculatorAPI } from "@/lib/api";
import { parseApiError } from "@/lib/utils";
import { AlertCircle, Loader, TrendingUp, TrendingDown, DollarSign, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ROICalculatorPage() {
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [finalValue, setFinalValue] = useState(15000);
  const [timeYears, setTimeYears] = useState(1);
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

  const calculateROI = useCallback(async () => {
    if (initialInvestment <= 0 || finalValue < 0 || timeYears <= 0) {
      const errorMsg = "Please enter valid values";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await calculatorAPI.roiCalculator(
        initialInvestment,
        finalValue,
        timeYears
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
  }, [initialInvestment, finalValue, timeYears]);

  // Auto-calculate when values change
  useEffect(() => {
    if (userTier !== "PRO") return;

    const timer = setTimeout(() => {
      if (initialInvestment > 0 && finalValue >= 0 && timeYears > 0) {
        calculateROI();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [calculateROI, userTier]);

  // Show upgrade message for non-Pro tiers
  if (userTier !== "PRO") {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ROI Calculator
            </h1>
            <p className="text-gray-600 mb-6">
              This calculator is available exclusively for Pro tier users.
              Upgrade to calculate Return on Investment and annualized returns.
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              ROI Calculator
            </h1>
            <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
              PRO
            </span>
          </div>
          <p className="text-gray-600">
            Calculate Return on Investment and Annualized ROI (CAGR)
          </p>
        </div>

        {/* Input Form */}
        <Card className="p-6 mb-6">
          <div className="space-y-6">
            {/* Initial Investment */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Initial Investment: ${initialInvestment.toLocaleString()}
              </label>
              <input
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="0"
                step="100"
                placeholder="Enter initial investment..."
              />
            </div>

            {/* Final Value */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Final Value: ${finalValue.toLocaleString()}
              </label>
              <input
                type="number"
                value={finalValue}
                onChange={(e) => setFinalValue(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="0"
                step="100"
                placeholder="Enter final value..."
              />
            </div>

            {/* Time Period */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Investment Period: {timeYears} year(s)
              </label>
              <input
                type="range"
                min="0.5"
                max="30"
                step="0.5"
                value={timeYears}
                onChange={(e) => setTimeYears(parseFloat(e.target.value))}
                className="w-full"
              />
              <input
                type="number"
                value={timeYears}
                onChange={(e) => setTimeYears(parseFloat(e.target.value) || 1)}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
                min="0.1"
                max="100"
                step="0.5"
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
            <Loader className="w-6 h-6 text-purple-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Calculating...</p>
          </Card>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-4 mb-6">
            {/* ROI Percentage */}
            <Card className={`p-6 ${result.is_profit ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Return on Investment (ROI)</p>
                  <p className={`text-4xl font-bold ${result.is_profit ? 'text-green-600' : 'text-red-600'}`}>
                    {result.roi_percent >= 0 ? '+' : ''}{result.roi_percent.toFixed(2)}%
                  </p>
                </div>
                {result.is_profit
                  ? <TrendingUp className="w-14 h-14 text-green-300" />
                  : <TrendingDown className="w-14 h-14 text-red-300" />}
              </div>
            </Card>

            {/* Annualized ROI */}
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Annualized ROI (CAGR)</p>
                <p className="text-3xl font-bold text-purple-600">
                  {result.annualized_roi >= 0 ? '+' : ''}{result.annualized_roi.toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Compound Annual Growth Rate over {result.time_years} year(s)
                </p>
              </div>
            </Card>

            {/* Gain/Loss */}
            <Card className={`p-6 ${result.gain_loss >= 0 ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200' : 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {result.gain_loss >= 0 ? 'Total Gain' : 'Total Loss'}
                  </p>
                  <p className={`text-3xl font-bold ${result.gain_loss >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {result.gain_loss >= 0 ? '+' : '-'}${Math.abs(result.gain_loss).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <DollarSign className={`w-12 h-12 ${result.gain_loss >= 0 ? 'text-blue-300' : 'text-orange-300'}`} />
              </div>
            </Card>

            {/* Summary */}
            <Card className="p-6 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">Investment Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Initial Investment:</span>
                  <span className="font-semibold text-gray-900">
                    ${result.initial_investment.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Final Value:</span>
                  <span className="font-semibold text-gray-900">
                    ${result.final_value.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Investment Period:</span>
                  <span className="font-semibold text-gray-900">
                    {result.time_years} year(s)
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600">{result.is_profit ? 'Profit' : 'Loss'}:</span>
                  <span className={`font-semibold ${result.is_profit ? 'text-green-600' : 'text-red-600'}`}>
                    {result.gain_loss >= 0 ? '+' : ''}${result.gain_loss.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Formula Info */}
        <Card className="p-4 bg-purple-50 border-purple-200">
          <p className="text-sm text-purple-800">
            <strong>Formulas:</strong><br />
            ROI = ((Final Value - Initial Investment) / Initial Investment) x 100<br />
            CAGR = ((Final Value / Initial Investment)^(1/Years) - 1) x 100
          </p>
        </Card>
      </div>
    </div>
  );
}
