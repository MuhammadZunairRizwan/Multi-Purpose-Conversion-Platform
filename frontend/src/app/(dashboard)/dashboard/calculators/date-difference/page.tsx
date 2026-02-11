"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { calculatorAPI } from "@/lib/api";
import { parseApiError } from "@/lib/utils";
import { AlertCircle, Loader, Calendar } from "lucide-react";

export default function DateDifferenceCalculatorPage() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (startDate && endDate) {
        try {
          setLoading(true);
          setError(null);
          const response = await calculatorAPI.dateDifferenceCalculator(
            startDate,
            endDate
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
  }, [startDate, endDate]);

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Date Difference Calculator
          </h1>
          <p className="text-gray-600">
            Calculate the difference between two dates
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
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
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Days</p>
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-purple-500" />
                  <p className="text-3xl font-bold text-purple-600">
                    {result.total_days}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">Breakdown</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Years:</span>
                  <span className="font-semibold text-gray-900">
                    {result.years}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Months:</span>
                  <span className="font-semibold text-gray-900">
                    {result.months}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Days:</span>
                  <span className="font-semibold text-gray-900">
                    {result.days}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
