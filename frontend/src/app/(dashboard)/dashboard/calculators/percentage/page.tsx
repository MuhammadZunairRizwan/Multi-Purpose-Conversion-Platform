"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculatorAPI } from "@/lib/api";
import { parseApiError } from "@/lib/utils";
import { AlertCircle, Loader } from "lucide-react";

type OperationType = "is_percent_of" | "percent_of" | "increase" | "decrease";

export default function PercentageCalculatorPage() {
  const [operation, setOperation] = useState<OperationType>("percent_of");
  const [x, setX] = useState(25);
  const [y, setY] = useState(100);
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (x >= 0 && y >= 0) {
        try {
          setLoading(true);
          setError(null);

          let values = {};
          if (operation === "is_percent_of") {
            values = { x, y };
          } else if (operation === "percent_of") {
            values = { percent: x, value: y };
          } else if (operation === "increase" || operation === "decrease") {
            values = { value: x, percent: y };
          }

          const response = await calculatorAPI.percentageCalculator(
            operation,
            values
          );
          setResult(response.data.result);
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
  }, [operation, x, y]);

  const getLabel = () => {
    switch (operation) {
      case "is_percent_of":
        return `${x} is what % of ${y}?`;
      case "percent_of":
        return `What is ${x}% of ${y}?`;
      case "increase":
        return `${x} increased by ${y}%`;
      case "decrease":
        return `${x} decreased by ${y}%`;
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Percentage Calculator
          </h1>
          <p className="text-gray-600">
            Calculate percentages in various ways
          </p>
        </div>

        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Select Operation
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(
              [
                { type: "is_percent_of", label: "X is % of Y" },
                { type: "percent_of", label: "X% of Y" },
                { type: "increase", label: "X + Y%" },
                { type: "decrease", label: "X - Y%" },
              ] as { type: OperationType; label: string }[]
            ).map((op) => (
              <Button
                key={op.type}
                onClick={() => setOperation(op.type)}
                variant={operation === op.type ? "default" : "outline"}
                className={`${
                  operation === op.type ? "bg-red-500 hover:bg-red-600" : ""
                }`}
              >
                {op.label}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {operation === "is_percent_of" ? "X Value" : "Value"}
              </label>
              <input
                type="number"
                value={x}
                onChange={(e) => setX(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {operation === "is_percent_of" ? "Y Value" : "Percentage"}
              </label>
              <input
                type="number"
                value={y}
                onChange={(e) => setY(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="0"
                step="0.01"
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

        {result !== null && !loading && (
          <Card className="p-6 mb-6 bg-green-50 border-green-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">{getLabel()}</p>
              <p className="text-4xl font-bold text-green-600">
                {result.toFixed(4).replace(/\.?0+$/, "")}
                {operation === "is_percent_of" ? "%" : ""}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
