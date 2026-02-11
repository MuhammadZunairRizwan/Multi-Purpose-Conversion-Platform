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

export default function InvoiceGeneratorPage() {
  const { user } = useUser();
  const { usage } = useUsageLimit();
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // From (Company)
  const [fromCompany, setFromCompany] = useState("Your Company Name");
  const [fromAddress, setFromAddress] = useState("123 Business St");
  const [fromEmail, setFromEmail] = useState("company@example.com");
  const [fromPhone, setFromPhone] = useState("(555) 123-4567");

  // To (Client)
  const [toClient, setToClient] = useState("Client Name");
  const [toAddress, setToAddress] = useState("456 Client Ave");
  const [toEmail, setToEmail] = useState("client@example.com");

  // Line Items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "Service", quantity: 1, rate: 100 },
  ]);

  // Additional
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("Thank you for your business!");

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

  const calculateTotals = () => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );
    const discountAmount = subtotal * (discount / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

  const handleGenerateInvoice = async () => {
    if (lineItems.length === 0 || lineItems.some((item) => !item.description)) {
      const errorMsg = "Please add at least one line item with a description";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const invoiceData = {
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate,
        from_company: fromCompany,
        from_address: fromAddress,
        from_email: fromEmail,
        from_phone: fromPhone,
        to_client: toClient,
        to_address: toAddress,
        to_email: toEmail,
        line_items: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
        })),
        tax_rate: taxRate,
        discount: discount,
        notes: notes,
        tier: usage.tier,
      };

      const response = await documentAPI.generateInvoice(invoiceData);

      // Create download link
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Invoice generated and downloaded successfully!");

      // Add to document history (Starter and Pro only)
      if (user?.id && usage.tier !== "FREE") {
        try {
          await historyAPI.addToHistory(
            user.id,
            "invoice",
            invoiceNumber,
            `Invoice #${invoiceNumber} - ${toClient}`,
            usage.tier
          );
        } catch (historyError) {
          console.error("Failed to add to history:", historyError);
        }
      }
    } catch (err: any) {
      const errorMsg = parseApiError(err, "Failed to generate invoice");
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

      const invoiceData = {
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate,
        from_company: fromCompany,
        from_address: fromAddress,
        from_email: fromEmail,
        from_phone: fromPhone,
        to_client: toClient,
        to_address: toAddress,
        to_email: toEmail,
        line_items: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
        })),
        tax_rate: taxRate,
        discount: discount,
        notes: notes,
        tier: usage.tier,
      };

      const response = await documentAPI.exportInvoiceDocx(invoiceData);

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${invoiceNumber}.docx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Invoice exported to DOCX successfully!");
    } catch (err: any) {
      const errorMsg = parseApiError(err, "Failed to export invoice");
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
            Invoice Generator
          </h1>
          <p className="text-gray-600">
            {usage.tier === "FREE"
              ? "Create professional invoices (watermarked)"
              : "Create professional invoices"}
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
                    ? "Invoices include watermark"
                    : "Watermark-free invoices"}
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
            {/* Invoice Header Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Invoice Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </Card>

            {/* From Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                From (Your Company)
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={fromCompany}
                  onChange={(e) => setFromCompany(e.target.value)}
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
                  type="email"
                  placeholder="Email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={fromPhone}
                  onChange={(e) => setFromPhone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </Card>

            {/* To Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                To (Client)
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Client Name"
                  value={toClient}
                  onChange={(e) => setToClient(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </Card>

            {/* Line Items */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Line Items
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

            {/* Totals & Notes */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Info
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Thank you for your business!"
                />
              </div>
            </Card>

            {/* Generate Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleGenerateInvoice}
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
                Upgrade to Pro to export invoices as editable Word documents
              </p>
            )}
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Discount ({discount}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {taxRate > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Tax ({taxRate}%):</span>
                    <span>+${taxAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-bold text-lg text-red-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {usage.tier === "FREE" ? (
                <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>FREE TIER:</strong> Invoices will have a watermark.
                    Upgrade for watermark-free invoices.
                  </p>
                </div>
              ) : (
                <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-800">
                    <strong>{usage.tier} TIER:</strong> Your invoices are watermark-free!
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
