"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { documentAPI, historyAPI } from "@/lib/api";
import { useUser } from "@clerk/nextjs";
import { parseApiError } from "@/lib/utils";
import { Trash2, Plus, AlertCircle, Loader, Download, Crown, FileText } from "lucide-react";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import Link from "next/link";

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
}

export default function ReceiptGeneratorPage() {
  const { user } = useUser();
  const { usage } = useUsageLimit();
  const [receiptNumber, setReceiptNumber] = useState("RCP-001");
  const [receiptDate, setReceiptDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // From (Business)
  const [fromBusiness, setFromBusiness] = useState("Your Business");
  const [fromAddress, setFromAddress] = useState("123 Business St");
  const [fromPhone, setFromPhone] = useState("(555) 123-4567");
  const [fromEmail, setFromEmail] = useState("business@example.com");

  // Customer (Optional)
  const [customerName, setCustomerName] = useState("");

  // Line Items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "Item", quantity: 1, rate: 50 },
  ]);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, rate: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    const updated = [...lineItems];
    if (field === "description") {
      updated[index].description = value as string;
    } else {
      updated[index][field] = parseFloat(value as string) || 0;
    }
    setLineItems(updated);
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  };

  const total = calculateTotal();

  const handleGenerateReceipt = async () => {
    if (lineItems.length === 0 || lineItems.some((item) => !item.description)) {
      const errorMsg = "Please add at least one line item with a description";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const receiptData = {
        receipt_number: receiptNumber,
        receipt_date: receiptDate,
        from_business: fromBusiness,
        from_address: fromAddress,
        from_phone: fromPhone,
        from_email: fromEmail,
        customer_name: customerName || undefined,
        line_items: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
        })),
        payment_method: paymentMethod,
        tier: usage.tier,
      };

      const response = await documentAPI.generateReceipt(receiptData);

      // Create download link
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt_${receiptNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Receipt generated and downloaded successfully!");

      // Add to document history (Starter and Pro only)
      if (user?.id && usage.tier !== "FREE") {
        try {
          await historyAPI.addToHistory(
            user.id,
            "receipt",
            receiptNumber,
            `Receipt #${receiptNumber} - ${fromBusiness}`,
            usage.tier
          );
        } catch (historyError) {
          console.error("Failed to add to history:", historyError);
        }
      }
    } catch (err: any) {
      const errorMsg = parseApiError(err, "Failed to generate receipt");
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleExportDocx = async () => {
    if (lineItems.length === 0 || lineItems.some((item) => !item.description)) {
      const errorMsg = "Please add at least one line item with a description";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (usage.tier !== "PRO") {
      toast.error("DOCX export is a Pro feature");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const receiptData = {
        receipt_number: receiptNumber,
        receipt_date: receiptDate,
        from_business: fromBusiness,
        from_address: fromAddress,
        from_phone: fromPhone,
        from_email: fromEmail,
        customer_name: customerName || undefined,
        line_items: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
        })),
        payment_method: paymentMethod,
        tier: usage.tier,
      };

      const response = await documentAPI.exportReceiptDocx(receiptData);

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt_${receiptNumber}.docx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Receipt exported to DOCX successfully!");
    } catch (err: any) {
      const errorMsg = parseApiError(err, "Failed to export receipt");
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Receipt Generator
          </h1>
          <p className="text-gray-600">
            {usage.tier === "FREE"
              ? "Create professional receipts (watermarked)"
              : "Create professional receipts"}
          </p>
          <div className={`mt-3 p-3 rounded-lg border ${
            usage.tier === "PRO"
              ? "bg-purple-50 border-purple-200"
              : usage.tier === "STARTER"
                ? "bg-blue-50 border-blue-200"
                : "bg-gray-50 border-gray-200"
          }`}>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className={`font-semibold ${
                  usage.tier === "PRO"
                    ? "text-purple-800"
                    : usage.tier === "STARTER"
                      ? "text-blue-800"
                      : "text-gray-800"
                }`}>
                  {usage.tier} TIER:
                </span>
                <span className={`ml-2 ${
                  usage.tier === "PRO"
                    ? "text-purple-700"
                    : usage.tier === "STARTER"
                      ? "text-blue-700"
                      : "text-gray-700"
                }`}>
                  {usage.tier === "FREE"
                    ? "Receipts include watermark"
                    : "Watermark-free receipts"}
                </span>
              </div>
              {usage.tier === "FREE" && (
                <Link href="/dashboard/pricing">
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    <Crown className="w-3 h-3" />
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {error && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Receipt Header Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Receipt Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receipt Number
                  </label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receipt Date
                  </label>
                  <input
                    type="date"
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </Card>

            {/* From Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                From (Your Business)
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Business Name"
                  value={fromBusiness}
                  onChange={(e) => setFromBusiness(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={fromPhone}
                  onChange={(e) => setFromPhone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </Card>

            {/* Customer Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer (Optional)
              </h3>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </Card>

            {/* Line Items */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Items
                </h3>
                <Button
                  onClick={addLineItem}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(index, "description", e.target.value)
                      }
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(index, "quantity", e.target.value)
                      }
                      className="w-16 p-2 border border-gray-300 rounded-lg text-sm"
                      min="1"
                      step="1"
                    />
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) =>
                        updateLineItem(index, "rate", e.target.value)
                      }
                      className="w-24 p-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                      step="0.01"
                    />
                    <div className="w-20 p-2 bg-gray-100 rounded-lg text-sm font-semibold">
                      ${(item.quantity * item.rate).toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeLineItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Method
              </h3>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option>Cash</option>
                <option>Credit Card</option>
                <option>Debit Card</option>
                <option>Check</option>
                <option>Bank Transfer</option>
              </select>
            </Card>

            {/* Generate Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleGenerateReceipt}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white p-4 text-lg"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
              {usage.tier === "PRO" && (
                <Button
                  onClick={handleExportDocx}
                  disabled={loading}
                  variant="outline"
                  className="p-4 text-lg border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Export DOCX
                </Button>
              )}
            </div>
            {usage.tier !== "PRO" && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Upgrade to Pro to export receipts as editable Word documents
              </p>
            )}
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Summary
              </h3>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Receipt #:</span>
                  <span className="font-semibold">{receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">{receiptDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-semibold">{paymentMethod}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Items Count:</span>
                  <span className="text-sm font-semibold">{lineItems.length}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-bold text-lg text-red-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {usage.tier === "FREE" ? (
                <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>FREE TIER:</strong> Receipts will have a watermark.
                    Upgrade for watermark-free receipts.
                  </p>
                </div>
              ) : (
                <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-800">
                    <strong>{usage.tier} TIER:</strong> Your receipts are watermark-free!
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
