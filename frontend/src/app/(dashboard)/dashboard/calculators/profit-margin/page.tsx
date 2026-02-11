"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { calculatorAPI } from "@/lib/api";
import { parseApiError } from "@/lib/utils";
import { AlertCircle, Loader, TrendingUp, DollarSign, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProfitMarginCalculatorPage() {
  const [cost, setCost] = useState(50);
  const [revenue, setRevenue] = useState(100);
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

  const calculateProfitMargin = useCallback(async () => {
    if (cost < 0 || revenue <= 0) {
      const errorMsg = "Please enter valid values";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await calculatorAPI.profitMarginCalculator(cost, revenue);
      setResult(response.data);
      toast.success("Calculation completed!");
    } catch (err: any) {
      const errorMsg = parseApiError(err, "Calculation failed");
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [cost, revenue]);

  // Auto-calculate when values change
  useEffect(() => {
    if (userTier === "FREE") return;

    const timer = setTimeout(() => {
      if (cost >= 0 && revenue > 0) {
        calculateProfitMargin();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [calculateProfitMargin, userTier]);

  // Show upgrade message for free tier
  if (userTier === "FREE") {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Profit Margin Calculator
            </h1>
            <p className="text-gray-600 mb-6">
              This calculator is available for Starter and Pro tier users.
              Upgrade to calculate profit margins, gross margins, and markups.
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
              Profit Margin Calculator
            </h1>
            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
              STARTER
            </span>
          </div>
          <p className="text-gray-600">
            Calculate profit, gross margin, and markup percentages
          </p>
        </div>

        {/* Input Form */}
        <Card className="p-6 mb-6">
          <div className="space-y-6">
            {/* Cost */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Cost (Expense): ${cost.toLocaleString()}
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="0"
                step="0.01"
                placeholder="Enter cost..."
              />
            </div>

            {/* Revenue */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Revenue (Selling Price): ${revenue.toLocaleString()}
              </label>
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="0"
                step="0.01"
                placeholder="Enter revenue..."
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
            {/* Profit */}
            <Card className={`p-6 ${result.profit >= 0 ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Profit / Loss</p>
                  <p className={`text-3xl font-bold ${result.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${result.profit.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <DollarSign className={`w-12 h-12 ${result.profit >= 0 ? 'text-green-300' : 'text-red-300'}`} />
              </div>
            </Card>

            {/* Gross Margin */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gross Margin</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {result.gross_margin.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (Revenue - Cost) / Revenue
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-300" />
              </div>
            </Card>

            {/* Markup */}
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Markup</p>
                <p className="text-3xl font-bold text-purple-600">
                  {result.markup.toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  (Revenue - Cost) / Cost
                </p>
              </div>
            </Card>

            {/* Summary */}
            <Card className="p-6 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost:</span>
                  <span className="font-semibold text-gray-900">
                    ${result.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-semibold text-gray-900">
                    ${result.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600">Profit:</span>
                  <span className={`font-semibold ${result.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${result.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Formula Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Formulas:</strong><br />
            Gross Margin = ((Revenue - Cost) / Revenue) x 100<br />
            Markup = ((Revenue - Cost) / Cost) x 100
          </p>
        </Card>
      </div>
    </div>
  );
}
