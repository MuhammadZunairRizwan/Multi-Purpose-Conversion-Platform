"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { unitAPI } from "@/lib/api";
import { parseApiError } from "@/lib/utils";
import { AlertCircle, Loader } from "lucide-react";

type UnitCategory = "length" | "weight" | "temperature" | "volume" | "area" | "speed" | "time";

const UNIT_CATEGORIES: Record<UnitCategory, Record<string, string>> = {
  length: {
    m: "Meter",
    km: "Kilometer",
    mile: "Mile",
    ft: "Foot",
    inch: "Inch",
    cm: "Centimeter",
    mm: "Millimeter",
    yd: "Yard",
  },
  weight: {
    g: "Gram",
    kg: "Kilogram",
    lb: "Pound",
    oz: "Ounce",
    ton: "Ton",
    mg: "Milligram",
  },
  temperature: {
    C: "Celsius",
    F: "Fahrenheit",
    K: "Kelvin",
  },
  volume: {
    l: "Liter",
    ml: "Milliliter",
    fl_oz: "Oz",
    cup: "Cup",
    pint: "Pint",
    quart: "Quart",
    gallon: "Gallon",
    m3: "Cubic Meter",
    cm3: "Cubic Centimeter",
  },
  area: {
    m2: "Square Meter",
    km2: "Square Kilometer",
    ft2: "Square Foot",
    acre: "Acre",
    hectare: "Hectare",
  },
  speed: {
    "m/s": "Meter per Second",
    "km/h": "Kilometer per Hour",
    mph: "Mile per Hour",
    "ft/s": "Foot per Second",
    knot: "Knot",
  },
  time: {
    s: "Second",
    min: "Minute",
    h: "Hour",
    day: "Day",
    week: "Week",
    month: "Month",
    year: "Year",
  },
};

export default function UnitConverterPage() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("km");
  const [value, setValue] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performConversion = async () => {
    const numValue = parseFloat(value);
    if (!value || isNaN(numValue) || numValue < 0) {
      const errorMsg = "Please enter a valid value";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Determine which conversion function to call
      let response;
      switch (category) {
        case "length":
          response = await unitAPI.convertLength(numValue, fromUnit, toUnit);
          break;
        case "weight":
          response = await unitAPI.convertWeight(numValue, fromUnit, toUnit);
          break;
        case "temperature":
          response = await unitAPI.convertTemperature(numValue, fromUnit, toUnit);
          break;
        case "volume":
          response = await unitAPI.convertVolume(numValue, fromUnit, toUnit);
          break;
        case "area":
          response = await unitAPI.convertArea(numValue, fromUnit, toUnit);
          break;
        case "speed":
          response = await unitAPI.convertSpeed(numValue, fromUnit, toUnit);
          break;
        case "time":
          response = await unitAPI.convertTime(numValue, fromUnit, toUnit);
          break;
      }

      setResult(response.data.value);
      toast.success("Conversion successful!");
    } catch (err: any) {
      const errorMsg = parseApiError(err, "Conversion failed");
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (newCategory: UnitCategory) => {
    setCategory(newCategory);
    const units = Object.keys(UNIT_CATEGORIES[newCategory]);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
    setValue("");
    setResult(null);
  };

  const handleUnitChange = (type: "from" | "to", unit: string) => {
    if (type === "from") {
      setFromUnit(unit);
    } else {
      setToUnit(unit);
    }
    setResult(null);
  };

  const units = Object.entries(UNIT_CATEGORIES[category]);

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Unit Converter
          </h1>
          <p className="text-gray-600">
            Convert between different units of measurement
          </p>
        </div>

        {/* Category Selector */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Select Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(
              [
                "length",
                "weight",
                "temperature",
                "volume",
                "area",
                "speed",
                "time",
              ] as UnitCategory[]
            ).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`p-3 rounded-lg font-medium capitalize transition ${
                  category === cat
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Card>

        {/* Main Converter */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* From Unit */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                From
              </label>
              <select
                value={fromUnit}
                onChange={(e) => handleUnitChange("from", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {units.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <span className="text-gray-400">→</span>
            </div>

            {/* To Unit */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                To
              </label>
              <select
                value={toUnit}
                onChange={(e) => handleUnitChange("to", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {units.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Value Input */}
        <Card className="p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Enter {UNIT_CATEGORIES[category][fromUnit]}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setResult(null);
            }}
            placeholder="Enter value"
            className="w-full text-2xl p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            min="0"
            step="any"
          />
          <Button
            onClick={performConversion}
            disabled={loading || !value}
            className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white p-4 text-lg"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Converting...
              </>
            ) : (
              "Convert"
            )}
          </Button>
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

        {/* Result */}
        {result !== null && !loading && (
          <Card className="p-6 mb-6 bg-green-50 border-green-200">
            <div className="text-center">
              <p className="text-gray-600 mb-2">
                {value} {UNIT_CATEGORIES[category][fromUnit]} equals
              </p>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {result.toFixed(6).replace(/\.?0+$/, "")} {UNIT_CATEGORIES[category][toUnit]}
              </div>
              <p className="text-sm text-gray-600">
                Conversion factor:{" "}
                <span className="font-semibold">
                  1 {UNIT_CATEGORIES[category][fromUnit]} ={" "}
                  {(result / parseFloat(value)).toFixed(6).replace(/\.?0+$/, "")}{" "}
                  {UNIT_CATEGORIES[category][toUnit]}
                </span>
              </p>
            </div>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <Card className="p-6 mb-6 text-center">
            <Loader className="w-6 h-6 text-red-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Converting...</p>
          </Card>
        )}

        {/* Info Box */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Unit conversion is completely free and unlimited. Conversions are calculated in real-time with high precision.
          </p>
        </Card>
      </div>
    </div>
  );
}
