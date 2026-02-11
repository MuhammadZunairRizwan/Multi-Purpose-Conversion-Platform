"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { historyAPI, DocumentHistoryItem } from "@/lib/api";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { FileText, Receipt, FileCheck, Briefcase, Trash2, Clock, Crown, RefreshCw } from "lucide-react";
import Link from "next/link";

const documentTypeIcons: Record<string, React.ReactNode> = {
  invoice: <FileText className="w-5 h-5 text-blue-500" />,
  receipt: <Receipt className="w-5 h-5 text-green-500" />,
  nda: <FileCheck className="w-5 h-5 text-purple-500" />,
  employment_letter: <Briefcase className="w-5 h-5 text-orange-500" />,
  file_conversion: <RefreshCw className="w-5 h-5 text-red-500" />,
};

const documentTypeLabels: Record<string, string> = {
  invoice: "Invoice",
  receipt: "Receipt",
  nda: "NDA",
  employment_letter: "Employment Letter",
  file_conversion: "File Conversion",
};

export default function DocumentHistory() {
  const { user } = useUser();
  const { usage } = useUsageLimit();
  const [history, setHistory] = useState<DocumentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLimit, setHistoryLimit] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id || usage.tier === "FREE") {
        setLoading(false);
        return;
      }

      try {
        const response = await historyAPI.getHistory(user.id, usage.tier);
        setHistory(response.data.history || []);
        setHistoryLimit(response.data.history_limit || 0);
      } catch (error) {
        console.error("Failed to fetch document history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id, usage.tier]);

  const handleDelete = async (documentId: string) => {
    if (!user?.id) return;

    try {
      await historyAPI.deleteFromHistory(user.id, documentId);
      setHistory(history.filter((item) => item.document_id !== documentId));
    } catch (error) {
      console.error("Failed to delete from history:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Free tier - show upgrade prompt
  if (usage.tier === "FREE") {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Document History</h3>
        </div>
        <div className="text-center py-8">
          <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Document history is available for Starter and Pro tiers.
          </p>
          <Link href="/dashboard/pricing">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
              Upgrade Now
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Document History</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(historyLimit || 1)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Document History</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          usage.tier === "PRO"
            ? "bg-purple-100 text-purple-700"
            : "bg-blue-100 text-blue-700"
        }`}>
          {usage.tier}: {historyLimit} {historyLimit === 1 ? "document" : "documents"}
        </span>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No documents in history yet.</p>
          <p className="text-sm mt-2">Generate a document to see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, index) => (
            <div
              key={`${item.document_id}-${index}`}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  {documentTypeIcons[item.document_type] || <FileText className="w-5 h-5 text-gray-400" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.document_name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="capitalize">
                      {documentTypeLabels[item.document_type] || item.document_type}
                    </span>
                    <span>|</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(item.document_id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Remove from history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
