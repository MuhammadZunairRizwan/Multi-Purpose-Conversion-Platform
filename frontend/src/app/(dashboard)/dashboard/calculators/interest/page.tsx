"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { calculatorAPI } from "@/lib/api";
import { parseApiError } from "@/lib/utils";
import { AlertCircle, Loader } from "lucide-react";

export default function InterestCalculatorPage() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(5);
  const [time, setTime] = useState(2);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (principal > 0 && rate >= 0 && time > 0) {
        try {
          setLoading(true);
          setError(null);
          const response = await calculatorAPI.interestCalculator(
            principal,
            rate,
            time
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
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [principal, rate, time]);

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Simple Interest Calculator
          </h1>
          <p className="text-gray-600">
            Calculate simple interest on your investment or loan
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Principal Amount: ${principal.toLocaleString()}
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="0"
                step="100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Annual Interest Rate: {rate}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full"
              />
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Time Period (Years): {time}
              </label>
              <input
                type="range"
                min="0.1"
                max="50"
                step="0.1"
                value={time}
                onChange={(e) => setTime(parseFloat(e.target.value))}
                className="w-full"
              />
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
                min="0.1"
                step="0.1"
              />
            </div>
          </div>
        </Card>

        {error && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </Card>
        )}

        {loading && (
          <Card className="p-6 mb-6 text-center">
            <Loader className="w-6 h-6 text-red-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Calculating...</p>
          </Card>
        )}

        {result && !loading && (
          <div className="space-y-4 mb-6">
            <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Interest Amount</p>
                <p className="text-3xl font-bold text-green-600">
                  ${result.interest.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${result.total_amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </Card>
          </div>
        )}

        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Formula:</strong> SI = (P × R × T) / 100
          </p>
        </Card>
      </div>
    </div>
  );
}
