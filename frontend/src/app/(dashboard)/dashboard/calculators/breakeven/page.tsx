"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { calculatorAPI } from "@/lib/api";
import { parseApiError } from "@/lib/utils";
import { AlertCircle, Loader, Target, DollarSign, TrendingUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProfitAnalysisItem {
  units: number;
  revenue: number;
  total_costs: number;
  profit: number;
}

export default function BreakevenCalculatorPage() {
  const [fixedCosts, setFixedCosts] = useState(10000);
  const [pricePerUnit, setPricePerUnit] = useState(50);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(30);
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

  const calculateBreakeven = useCallback(async () => {
    if (fixedCosts < 0 || pricePerUnit <= 0 || variableCostPerUnit < 0) {
      const errorMsg = "Please enter valid values";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (pricePerUnit <= variableCostPerUnit) {
      const errorMsg = "Price per unit must be greater than variable cost per unit";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await calculatorAPI.breakevenCalculator(
        fixedCosts,
        pricePerUnit,
        variableCostPerUnit
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
  }, [fixedCosts, pricePerUnit, variableCostPerUnit]);

  // Auto-calculate when values change
  useEffect(() => {
    if (userTier !== "PRO") return;

    const timer = setTimeout(() => {
      if (pricePerUnit > variableCostPerUnit) {
        calculateBreakeven();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [calculateBreakeven, userTier]);

  // Show upgrade message for non-Pro tiers
  if (userTier !== "PRO") {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Break-even Calculator
            </h1>
            <p className="text-gray-600 mb-6">
              This calculator is available exclusively for Pro tier users.
              Upgrade to calculate break-even points for your business.
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
            <h1 className="text-3xl font-bold text-gray-900">
              Break-even Calculator
            </h1>
            <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
              PRO
            </span>
          </div>
          <p className="text-gray-600">
            Calculate the break-even point for your business in units and revenue
          </p>
        </div>

        {/* Input Form */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fixed Costs */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Fixed Costs (Total)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={fixedCosts}
                  onChange={(e) => setFixedCosts(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 pl-8 border border-gray-300 rounded-lg"
                  min="0"
                  step="100"
                  placeholder="e.g., rent, salaries..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Rent, salaries, insurance, etc.</p>
            </div>

            {/* Price Per Unit */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Price Per Unit
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 pl-8 border border-gray-300 rounded-lg"
                  min="0"
                  step="1"
                  placeholder="Selling price..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">How much you sell each unit for</p>
            </div>

            {/* Variable Cost Per Unit */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Variable Cost Per Unit
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={variableCostPerUnit}
                  onChange={(e) => setVariableCostPerUnit(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 pl-8 border border-gray-300 rounded-lg"
                  min="0"
                  step="1"
                  placeholder="Cost per unit..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Materials, labor per unit, etc.</p>
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
            {/* Main Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Break-even Point</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {Math.ceil(result.breakeven_units).toLocaleString()} units
                    </p>
                  </div>
                  <Target className="w-12 h-12 text-purple-300" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Break-even Revenue</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${result.breakeven_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-300" />
                </div>
              </Card>
            </div>

            {/* Contribution Margin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contribution Margin (per unit)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${result.contribution_margin.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Price - Variable Cost</p>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Contribution Margin Ratio</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {result.contribution_margin_ratio.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">% of revenue covering fixed costs</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-orange-300" />
                </div>
              </Card>
            </div>

            {/* Profit Analysis Table */}
            {result.profit_analysis && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Profit Analysis at Different Sales Levels</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Units Sold</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-700">Revenue</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-700">Total Costs</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-700">Profit/Loss</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.profit_analysis.map((item: ProfitAnalysisItem, index: number) => (
                        <tr
                          key={index}
                          className={`border-b border-gray-100 ${
                            item.profit === 0 ? 'bg-yellow-50' : ''
                          }`}
                        >
                          <td className="py-3 px-2 font-medium">
                            {item.units.toLocaleString()}
                            {item.profit === 0 && (
                              <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                                Break-even
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-right">${item.revenue.toLocaleString()}</td>
                          <td className="py-3 px-2 text-right">${item.total_costs.toLocaleString()}</td>
                          <td className={`py-3 px-2 text-right font-semibold ${
                            item.profit > 0 ? 'text-green-600' : item.profit < 0 ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {item.profit >= 0 ? '+' : ''}${item.profit.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Summary */}
            <Card className="p-6 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">Cost Structure Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fixed Costs:</span>
                  <span className="font-semibold text-gray-900">
                    ${result.fixed_costs.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price Per Unit:</span>
                  <span className="font-semibold text-gray-900">
                    ${result.price_per_unit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Variable Cost Per Unit:</span>
                  <span className="font-semibold text-gray-900">
                    ${result.variable_cost_per_unit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600">Contribution Per Unit:</span>
                  <span className="font-semibold text-green-600">
                    ${result.contribution_margin.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Formula Info */}
        <Card className="p-4 bg-purple-50 border-purple-200">
          <p className="text-sm text-purple-800">
            <strong>Formula:</strong><br />
            Break-even Units = Fixed Costs / (Price per Unit - Variable Cost per Unit)<br />
            Break-even Revenue = Break-even Units x Price per Unit
          </p>
        </Card>
      </div>
    </div>
  );
}
