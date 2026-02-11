"use client";

import { useState, useCallback, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fileConversionAPI, usageAPI, historyAPI, FileFormat } from "@/lib/api";
import { parseApiError } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils";
import { Upload, CheckCircle, AlertCircle, Crown, X, Download, Layers, UserPlus, FileSearch, GripVertical } from "lucide-react";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import Link from "next/link";

type Status = "idle" | "uploading" | "converting" | "success" | "error";

interface BatchFile {
  file: File;
  status: Status;
  downloadUrl?: string;
  error?: string;
  preview?: string; // Base64 preview image
}

interface AnonymousUsage {
  used: number;
  remaining: number;
  limit: number;
  canConvert: boolean;
}

export default function FileConverterPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { usage, loading: usageLoading } = useUsageLimit();

  // Anonymous usage tracking
  const [anonymousUsage, setAnonymousUsage] = useState<AnonymousUsage | null>(null);
  const [anonymousLoading, setAnonymousLoading] = useState(true);

  const isLoggedIn = userLoaded && !!user;

  // Fetch anonymous (IP-based) usage for anonymous users AND FREE tier logged-in users
  // This prevents users from gaming the system by signing up after exhausting anonymous quota
  useEffect(() => {
    const fetchAnonymousUsage = async () => {
      if (!userLoaded) return;

      // For STARTER/PRO users, skip IP tracking - they use user-based tracking
      if (isLoggedIn && (usage.tier === "STARTER" || usage.tier === "PRO")) {
        setAnonymousLoading(false);
        return;
      }

      // For anonymous users AND FREE tier logged-in users, use IP-based tracking
      try {
        const response = await fetch("/api/anonymous-usage");
        if (response.ok) {
          const data = await response.json();
          setAnonymousUsage(data);
        }
      } catch (err) {
        console.error("Failed to fetch anonymous usage:", err);
      } finally {
        setAnonymousLoading(false);
      }
    };

    fetchAnonymousUsage();
  }, [userLoaded, isLoggedIn, usage.tier]);
  const [fromFormat, setFromFormat] = useState<FileFormat>("pdf");
  const [toFormat, setToFormat] = useState<FileFormat>("docx");
  const [file, setFile] = useState<File | null>(null);
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const isPro = usage.tier === "PRO";

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (batchMode) {
      handleBatchFiles(droppedFiles);
    } else if (droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  }, [batchMode, fromFormat, usage]);

  const getMimeTypes = (format: FileFormat): string[] => {
    const types: Record<FileFormat, string[]> = {
      pdf: ["application/pdf"],
      jpg: ["image/jpeg"],
      jpeg: ["image/jpeg"],
      png: ["image/png"],
      doc: ["application/msword"],
      docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      xls: ["application/vnd.ms-excel"],
      pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
      ppt: ["application/vnd.ms-powerpoint"],
      "pdf-ocr": ["application/pdf"] // OCR accepts PDF input
    };
    return types[format];
  };

  const validateFile = (selectedFile: File): string | null => {
    const validTypes = getMimeTypes(fromFormat);
    if (!validTypes.includes(selectedFile.type)) {
      return `Invalid file type. Expected ${fromFormat.toUpperCase()}`;
    }

    // Use 10MB limit for anonymous users, otherwise use tier limit
    const maxSizeMB = isLoggedIn ? usage.fileSizeLimitMB : 10;
    const maxSize = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      return `File too large. Maximum size is ${maxSizeMB}MB${!isLoggedIn ? " (sign up for more)" : ""}`;
    }

    return null;
  };

  const validateAndSetFile = (selectedFile: File) => {
    const errorMsg = validateFile(selectedFile);
    if (errorMsg) {
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Check limits based on login status
    if (isLoggedIn && !usage.canConvert) {
      const errorMsg = "Daily conversion limit reached. Upgrade for more conversions.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!isLoggedIn && anonymousUsage && !anonymousUsage.canConvert) {
      const errorMsg = "Daily limit reached. Sign up for more conversions!";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setStatus("idle");
    setDownloadUrl(null);
    toast.success("File selected successfully");
  };

  const generatePreview = async (file: File): Promise<string | undefined> => {
    // Only generate previews for image files
    if (!file.type.startsWith("image/")) {
      return undefined;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => {
        resolve(undefined);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleBatchFiles = async (files: File[]) => {
    const newBatchFiles: BatchFile[] = [];
    let validCount = 0;

    for (const f of files) {
      const error = validateFile(f);
      if (error) {
        toast.error(`${f.name}: ${error}`);
        continue;
      }

      // Generate preview for image files
      const preview = await generatePreview(f);
      newBatchFiles.push({ file: f, status: "idle", preview });
      validCount++;
    }

    if (validCount > 0) {
      setBatchFiles([...batchFiles, ...newBatchFiles]);
      toast.success(`${validCount} file(s) added`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.currentTarget.files || []);
    if (batchMode) {
      handleBatchFiles(selectedFiles);
    } else if (selectedFiles.length > 0) {
      validateAndSetFile(selectedFiles[0]);
    }
    e.currentTarget.value = "";
  };

  const removeBatchFile = (index: number) => {
    setBatchFiles(batchFiles.filter((_, i) => i !== index));
  };

  const handleBatchDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleBatchDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Reorder the batch files
    const newBatchFiles = [...batchFiles];
    const draggedFile = newBatchFiles[draggedIndex];

    // Remove from old position
    newBatchFiles.splice(draggedIndex, 1);
    // Insert at new position
    newBatchFiles.splice(index, 0, draggedFile);

    setBatchFiles(newBatchFiles);
    setDraggedIndex(index);
  };

  const handleBatchDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleConvert = async () => {
    if (!file) return;

    // Determine if we should use IP-based tracking
    // Use IP tracking for: anonymous users AND FREE tier logged-in users
    const useIpTracking = !isLoggedIn || usage.tier === "FREE";

    // Check limits based on tracking type
    if (useIpTracking && anonymousUsage && !anonymousUsage.canConvert) {
      toast.error("Daily limit reached. Upgrade for more conversions!");
      return;
    }

    // For STARTER/PRO users, check user-based limits
    if (isLoggedIn && (usage.tier === "STARTER" || usage.tier === "PRO") && !usage.canConvert) {
      toast.error("Daily conversion limit reached. Upgrade for more conversions.");
      return;
    }

    // Allow same format only for OCR (pdf to pdf-ocr)
    if (fromFormat === toFormat && toFormat !== "pdf-ocr") {
      toast.error("Cannot convert to the same format");
      return;
    }

    try {
      setStatus("converting");
      setError(null);
      setProgress(0);

      // Record usage based on tracking type
      if (useIpTracking) {
        // Use IP-based tracking for anonymous AND FREE tier users
        const usageResponse = await fetch("/api/anonymous-usage", {
          method: "POST",
        });
        if (!usageResponse.ok) {
          const data = await usageResponse.json();
          if (usageResponse.status === 429) {
            setAnonymousUsage(data);
            window.dispatchEvent(new CustomEvent("anonymous-usage-updated", { detail: data }));
            throw new Error("Daily limit reached. Upgrade for more conversions!");
          }
          throw new Error(data.error || "Failed to record usage");
        }
        const data = await usageResponse.json();
        setAnonymousUsage(data);
        window.dispatchEvent(new CustomEvent("anonymous-usage-updated", { detail: data }));
      } else if (isLoggedIn && user?.id) {
        // Use user-based tracking for STARTER/PRO users
        await usageAPI.recordConversion(user.id, "FILE", usage.tier);
      }

      // Use OCR API for pdf-ocr conversion, otherwise use regular conversion
      const response = toFormat === "pdf-ocr"
        ? await fileConversionAPI.convertPdfOcr(file)
        : await fileConversionAPI.convertFile(file, fromFormat, toFormat);

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatus("success");
      setProgress(100);
      toast.success("File converted successfully!");

      // Save to history for logged-in users with Starter/Pro tier
      if (isLoggedIn && user?.id && (usage.tier === "STARTER" || usage.tier === "PRO")) {
        try {
          const documentName = `${file.name} → ${toFormat.toUpperCase()}`;
          const documentId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await historyAPI.addToHistory(
            user.id,
            "file_conversion",
            documentId,
            documentName,
            usage.tier
          );
        } catch (historyErr) {
          console.error("Failed to save to history:", historyErr);
          // Don't show error to user - conversion was successful
        }
      }
    } catch (err: any) {
      setStatus("error");
      const errorMsg = parseApiError(err, "Conversion failed");
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleBatchConvert = async () => {
    if (batchFiles.length === 0) return;

    if (fromFormat === toFormat) {
      toast.error("Cannot convert to the same format");
      return;
    }

    // Detect if this should be combined into one document
    const isImageFormat = ["jpg", "jpeg", "png"].includes(fromFormat);
    const isCombinableTarget = ["pdf", "docx"].includes(toFormat);
    const shouldCombine = isImageFormat && isCombinableTarget;

    // If this is an image batch that should be combined, use the combined handler
    if (shouldCombine) {
      await handleCombinedBatchConvert();
      return;
    }

    // Determine if we should use IP-based tracking
    const useIpTracking = !isLoggedIn || usage.tier === "FREE";

    // Check limits based on tracking type
    if (useIpTracking && anonymousUsage && !anonymousUsage.canConvert) {
      toast.error("Daily limit reached. Upgrade for more conversions!");
      return;
    }

    if (isLoggedIn && (usage.tier === "STARTER" || usage.tier === "PRO") && !usage.canConvert) {
      toast.error("Daily conversion limit reached. Upgrade for more conversions.");
      return;
    }

    setStatus("converting");
    const updatedFiles = [...batchFiles];

    // Record usage ONCE for the entire batch (counts as 1 conversion)
    try {
      if (useIpTracking) {
        const usageResponse = await fetch("/api/anonymous-usage", {
          method: "POST",
        });
        if (!usageResponse.ok) {
          const data = await usageResponse.json();
          if (usageResponse.status === 429) {
            setAnonymousUsage(data);
            window.dispatchEvent(new CustomEvent("anonymous-usage-updated", { detail: data }));
            toast.error("Daily limit reached. Upgrade for more conversions!");
            setStatus("idle");
            return;
          }
          throw new Error(data.error || "Failed to record usage");
        }
        const data = await usageResponse.json();
        setAnonymousUsage(data);
        window.dispatchEvent(new CustomEvent("anonymous-usage-updated", { detail: data }));
      } else if (isLoggedIn && user?.id) {
        await usageAPI.recordConversion(user.id, "FILE", usage.tier);
      }
    } catch (err: any) {
      toast.error("Failed to record usage");
      setStatus("idle");
      return;
    }

    for (let i = 0; i < updatedFiles.length; i++) {
      const batchFile = updatedFiles[i];
      updatedFiles[i] = { ...batchFile, status: "converting" };
      setBatchFiles([...updatedFiles]);

      try {
        const response = await fileConversionAPI.convertFile(
          batchFile.file,
          fromFormat,
          toFormat
        );

        const blob = new Blob([response.data], {
          type: response.headers["content-type"],
        });

        const url = URL.createObjectURL(blob);
        updatedFiles[i] = { ...batchFile, status: "success", downloadUrl: url };

        // Save to history for Starter/Pro tier
        if (isLoggedIn && user?.id && (usage.tier === "STARTER" || usage.tier === "PRO")) {
          try {
            const documentName = `${batchFile.file.name} → ${toFormat.toUpperCase()}`;
            const documentId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await historyAPI.addToHistory(
              user.id,
              "file_conversion",
              documentId,
              documentName,
              usage.tier
            );
          } catch (historyErr) {
            console.error("Failed to save to history:", historyErr);
          }
        }
      } catch (err: any) {
        const errorMsg = parseApiError(err, "Conversion failed");
        updatedFiles[i] = { ...batchFile, status: "error", error: errorMsg };
      }

      setBatchFiles([...updatedFiles]);
      setProgress(Math.round(((i + 1) / updatedFiles.length) * 100));
    }

    setStatus("success");
    toast.success("Batch conversion complete!");
  };

  const handleCombinedBatchConvert = async () => {
    if (batchFiles.length === 0) return;

    // Determine if we should use IP-based tracking
    const useIpTracking = !isLoggedIn || usage.tier === "FREE";

    // Check limits based on tracking type
    if (useIpTracking && anonymousUsage && !anonymousUsage.canConvert) {
      toast.error("Daily limit reached. Upgrade for more conversions!");
      return;
    }

    if (isLoggedIn && (usage.tier === "STARTER" || usage.tier === "PRO") && !usage.canConvert) {
      toast.error("Daily conversion limit reached. Upgrade for more conversions.");
      return;
    }

    // Set all files to converting state
    const updatedFiles = batchFiles.map((bf) => ({ ...bf, status: "converting" as Status }));
    setBatchFiles(updatedFiles);
    setStatus("converting");
    setProgress(50);

    // Record usage ONCE for the entire batch (counts as 1 conversion)
    try {
      if (useIpTracking) {
        const usageResponse = await fetch("/api/anonymous-usage", {
          method: "POST",
        });
        if (!usageResponse.ok) {
          const data = await usageResponse.json();
          if (usageResponse.status === 429) {
            setAnonymousUsage(data);
            window.dispatchEvent(new CustomEvent("anonymous-usage-updated", { detail: data }));
            toast.error("Daily limit reached. Upgrade for more conversions!");
            setStatus("idle");
            return;
          }
          throw new Error(data.error || "Failed to record usage");
        }
        const data = await usageResponse.json();
        setAnonymousUsage(data);
        window.dispatchEvent(new CustomEvent("anonymous-usage-updated", { detail: data }));
      } else if (isLoggedIn && user?.id) {
        await usageAPI.recordConversion(user.id, "FILE", usage.tier);
      }
    } catch (err: any) {
      toast.error("Failed to record usage");
      setStatus("idle");
      return;
    }

    try {
      // Get all files from batch
      const allFiles = batchFiles.map((bf) => bf.file);

      // Single API call to combine all images
      const response =
        toFormat === "pdf"
          ? await fileConversionAPI.convertBatchImagesToPdf(allFiles)
          : await fileConversionAPI.convertBatchImagesToDocx(allFiles);

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = URL.createObjectURL(blob);

      // All files share the same download URL (combined document)
      const successFiles = batchFiles.map((bf) => ({
        ...bf,
        status: "success" as Status,
        downloadUrl: url,
      }));
      setBatchFiles(successFiles);

      // Save to history for Starter/Pro tier
      if (isLoggedIn && user?.id && (usage.tier === "STARTER" || usage.tier === "PRO")) {
        try {
          const imageCount = batchFiles.length;
          const documentName = `${imageCount} images combined → ${toFormat.toUpperCase()}`;
          const documentId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await historyAPI.addToHistory(
            user.id,
            "file_conversion",
            documentId,
            documentName,
            usage.tier
          );
        } catch (historyErr) {
          console.error("Failed to save to history:", historyErr);
        }
      }

      setStatus("success");
      setProgress(100);
      toast.success(
        `All ${batchFiles.length} images combined into one ${toFormat.toUpperCase()}!`
      );
    } catch (err: any) {
      const errorMsg = parseApiError(err, "Batch conversion failed");
      const errorFiles = batchFiles.map((bf) => ({
        ...bf,
        status: "error" as Status,
        error: errorMsg,
      }));
      setBatchFiles(errorFiles);
      setStatus("error");
      toast.error(errorMsg);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;

    const a = document.createElement("a");
    a.href = downloadUrl;
    // Check if it's a multi-page to image conversion (returns ZIP)
    const isMultiPageToImage = (fromFormat === "pdf" || fromFormat === "docx" || fromFormat === "xlsx" || fromFormat === "xls" || fromFormat === "pptx" || fromFormat === "ppt") &&
      (toFormat === "jpg" || toFormat === "jpeg" || toFormat === "png");
    // Check if it's OCR conversion (returns PDF)
    const isOcr = toFormat === "pdf-ocr";
    // Get extension from blob URL's content type if possible, default to toFormat
    a.download = isMultiPageToImage
      ? `converted_images.zip`
      : isOcr
        ? `searchable.pdf`
        : `converted.${toFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadBatchFile = (index: number) => {
    const batchFile = batchFiles[index];
    if (!batchFile.downloadUrl) return;

    const originalName = batchFile.file.name.replace(/\.[^/.]+$/, "");
    const a = document.createElement("a");
    a.href = batchFile.downloadUrl;
    a.download = `${originalName}.${toFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllBatch = () => {
    const successFiles = batchFiles.filter((bf) => bf.status === "success");
    if (successFiles.length === 0) return;

    const firstUrl = successFiles[0]?.downloadUrl;
    const isCombined = successFiles.every((bf) => bf.downloadUrl === firstUrl);

    if (isCombined && firstUrl) {
      // Download once (combined document)
      const a = document.createElement("a");
      a.href = firstUrl;
      a.download = `combined_images.${toFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Combined document downloaded!");
    } else {
      // Download each file separately
      batchFiles.forEach((bf, i) => {
        if (bf.status === "success" && bf.downloadUrl) {
          setTimeout(() => downloadBatchFile(i), i * 200);
        }
      });
    }
  };

  const handleClear = () => {
    setFile(null);
    setBatchFiles([]);
    setStatus("idle");
    setProgress(0);
    setError(null);
    setDownloadUrl(null);
  };

  const handleSwap = () => {
    // Don't swap if toFormat is pdf-ocr (it's not a valid source format)
    if (toFormat === "pdf-ocr") {
      toast.error("Cannot swap - OCR is only available as a target format for PDFs");
      return;
    }
    const temp = fromFormat;
    setFromFormat(toFormat);
    setToFormat(temp);
    setFile(null);
    setBatchFiles([]);
    setStatus("idle");
    setError(null);
  };

  const toggleBatchMode = () => {
    setBatchMode(!batchMode);
    handleClear();
  };

  // Show loading state while data is being fetched
  if (!userLoaded || (anonymousLoading && usageLoading)) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading converter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            File Converter
          </h1>
          <p className="text-gray-600">
            Convert files between different formats
          </p>

          {/* Anonymous User Info */}
          {!isLoggedIn && anonymousUsage && (
            <div className={`mt-3 p-3 rounded-lg border ${
              anonymousUsage.canConvert
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-semibold text-gray-800">
                    FREE TRIAL:
                  </span>
                  <span className="ml-2 text-gray-700">
                    {anonymousUsage.remaining} of {anonymousUsage.limit} free conversions remaining
                  </span>
                </div>
                <Link href="/sign-up">
                  <Button size="sm" className="text-xs gap-1 bg-green-600 hover:bg-green-700">
                    <UserPlus className="w-3 h-3" />
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Limit Reached for Anonymous Users */}
          {!isLoggedIn && anonymousUsage && !anonymousUsage.canConvert && (
            <div className="mt-3 p-4 rounded-lg border bg-red-50 border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-red-800">Daily limit reached!</p>
                  <p className="text-sm text-red-700">
                    Sign up for a free account to get more conversions, or upgrade for unlimited access.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href="/sign-up">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      Sign Up Free
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Logged In FREE Tier User Info - Uses IP-based tracking */}
          {isLoggedIn && usage.tier === "FREE" && anonymousUsage && (
            <div className={`mt-3 p-3 rounded-lg border ${
              anonymousUsage.canConvert
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-semibold text-gray-800">
                    FREE TIER:
                  </span>
                  <span className="ml-2 text-gray-700">
                    {anonymousUsage.remaining} of {anonymousUsage.limit} conversions remaining
                  </span>
                </div>
                <Link href="/dashboard/pricing">
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    <Crown className="w-3 h-3" />
                    Upgrade
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Limit Reached for FREE tier logged-in users */}
          {isLoggedIn && usage.tier === "FREE" && anonymousUsage && !anonymousUsage.canConvert && (
            <div className="mt-3 p-4 rounded-lg border bg-red-50 border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-red-800">Daily limit reached!</p>
                  <p className="text-sm text-red-700">
                    Upgrade to Starter or Pro for more conversions.
                  </p>
                </div>
                <Link href="/dashboard/pricing">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Logged In STARTER/PRO User Info */}
          {isLoggedIn && (usage.tier === "STARTER" || usage.tier === "PRO") && (
            <div className={`mt-3 p-3 rounded-lg border ${
              usage.tier === "PRO"
                ? "bg-purple-50 border-purple-200"
                : "bg-blue-50 border-blue-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className={`font-semibold ${
                    usage.tier === "PRO"
                      ? "text-purple-800"
                      : "text-blue-800"
                  }`}>
                    {usage.tier} TIER:
                  </span>
                  <span className={`ml-2 ${
                    usage.tier === "PRO"
                      ? "text-purple-700"
                      : "text-blue-700"
                  }`}>
                    {usage.isUnlimited
                      ? "Unlimited conversions"
                      : `${usage.remainingConversions} of ${usage.conversionsLimit} conversions remaining`
                    }
                    {isPro && " | Batch conversion available"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Batch Mode Toggle */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Batch Conversion</h3>
                <p className="text-sm text-gray-600">Convert multiple files at once</p>
              </div>
            </div>
            <Button
              variant={batchMode ? "default" : "outline"}
              size="sm"
              onClick={toggleBatchMode}
              className={batchMode ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {batchMode ? "Batch Mode ON" : "Enable Batch"}
            </Button>
          </div>
        </Card>

        {/* Format Selector */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Select Conversion Type
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <select
                value={fromFormat}
                onChange={(e) => {
                  const newFrom = e.target.value as FileFormat;
                  setFromFormat(newFrom);

                  // Set a valid default toFormat that isn't the same as newFrom
                  const allFormats: FileFormat[] = ["pdf", "doc", "docx", "xlsx", "xls", "pptx", "ppt", "jpg", "jpeg", "png"];
                  const availableFormats = allFormats.filter(f => f !== newFrom);
                  if (toFormat === newFrom || !availableFormats.includes(toFormat)) {
                    setToFormat(availableFormats[0]);
                  }

                  handleClear();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="pdf">PDF</option>
                <option value="doc">Word (DOC)</option>
                <option value="docx">Word (DOCX)</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="xls">Excel (XLS)</option>
                <option value="pptx">PowerPoint (PPTX)</option>
                <option value="ppt">PowerPoint (PPT)</option>
                <option value="jpg">JPG</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
              </select>
            </div>

            <div className="pt-8">
              <button
                onClick={handleSwap}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-semibold text-gray-700"
                title="Swap formats"
              >
                ↔
              </button>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <select
                value={toFormat}
                onChange={(e) => {
                  setToFormat(e.target.value as FileFormat);
                  handleClear();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {/* Show all formats except the currently selected "from" format */}
                {fromFormat !== "pdf" && <option value="pdf">PDF</option>}
                {fromFormat !== "docx" && fromFormat !== "doc" && <option value="docx">Word (DOCX)</option>}
                {fromFormat !== "jpg" && <option value="jpg">JPG</option>}
                {fromFormat !== "jpeg" && <option value="jpeg">JPEG</option>}
                {fromFormat !== "png" && <option value="png">PNG</option>}
                {/* PDF OCR option - only show when converting from PDF */}
                {fromFormat === "pdf" && <option value="pdf-ocr">Searchable PDF (OCR)</option>}
                {/* DOC to DOCX conversion */}
                {fromFormat === "doc" && <option value="docx">Word (DOCX)</option>}
                {/* XLS to XLSX conversion */}
                {fromFormat === "xls" && <option value="xlsx">Excel (XLSX)</option>}
                {/* PPT to PPTX conversion */}
                {fromFormat === "ppt" && <option value="pptx">PowerPoint (PPTX)</option>}
              </select>
            </div>
          </div>
          {/* Info about multi-page documents */}
          {(fromFormat === "pdf" || fromFormat === "docx" || fromFormat === "xlsx" || fromFormat === "xls" || fromFormat === "pptx" || fromFormat === "ppt") && (toFormat === "jpg" || toFormat === "jpeg" || toFormat === "png") && (
            <p className="text-sm text-blue-600 mt-3 bg-blue-50 p-2 rounded">
              Multi-page documents will be converted to a ZIP file containing one image per page.
            </p>
          )}
          {/* Info about PDF OCR */}
          {toFormat === "pdf-ocr" && (
            <div className="mt-3 bg-purple-50 p-3 rounded border border-purple-200">
              <div className="flex items-start gap-2">
                <FileSearch className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-800">PDF OCR (Optical Character Recognition)</p>
                  <p className="text-sm text-purple-700 mt-1">
                    Converts scanned or image-based PDFs into searchable PDFs. After conversion, you&apos;ll be able to select, copy, and search text in the document.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Upload Area */}
        <Card className="p-6 mb-6">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition"
          >
            {(!file && batchFiles.length === 0) ? (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {batchMode ? "Drag and drop your files here" : "Drag and drop your file here"}
                </h3>
                <p className="text-gray-600 mb-4">
                  or click to select {batchMode ? "files" : "a file"} from your computer
                </p>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept={
                    fromFormat === "pdf" ? ".pdf" :
                    fromFormat === "jpg" || fromFormat === "jpeg" ? ".jpg,.jpeg" :
                    fromFormat === "png" ? ".png" :
                    fromFormat === "doc" ? ".doc" :
                    fromFormat === "xlsx" ? ".xlsx" :
                    fromFormat === "xls" ? ".xls" :
                    fromFormat === "pptx" ? ".pptx" :
                    fromFormat === "ppt" ? ".ppt" :
                    ".docx"
                  }
                  className="hidden"
                  id="file-input"
                  multiple={batchMode}
                />
                <label htmlFor="file-input">
                  <Button
                    onClick={() => document.getElementById("file-input")?.click()}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Browse Files
                  </Button>
                </label>
              </>
            ) : batchMode && batchFiles.length > 0 ? (
              <>
                <div className="max-h-96 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                  <div className="space-y-3">
                    {batchFiles.map((bf, index) => (
                      <div
                        key={index}
                        draggable={bf.status !== "converting" && status !== "converting"}
                        onDragStart={() => handleBatchDragStart(index)}
                        onDragOver={(e) => handleBatchDragOver(e, index)}
                        onDragEnd={handleBatchDragEnd}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-move transition border-2 ${
                          draggedIndex === index ? "opacity-60 bg-blue-100 border-blue-400 shadow-lg" : "border-gray-200"
                        } ${
                          bf.status === "success"
                            ? "bg-green-50"
                            : bf.status === "error"
                              ? "bg-red-50"
                              : bf.status === "converting"
                                ? "bg-yellow-50"
                                : "bg-white"
                        } hover:shadow-md`}
                      >
                        {/* Thumbnail */}
                        {bf.preview ? (
                          <img
                            src={bf.preview}
                            alt={bf.file.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-300"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-gray-600">No preview</span>
                          </div>
                        )}

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-red-500 min-w-8">#{index + 1}</span>
                            {bf.status !== "converting" && status !== "converting" ? (
                              <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            ) : null}
                            {bf.status === "success" ? (
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : bf.status === "error" ? (
                              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            ) : bf.status === "converting" ? (
                              <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                            ) : (
                              <div className="w-3 h-3 bg-gray-300 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="font-medium text-sm text-gray-900 truncate mt-1">{bf.file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(bf.file.size)}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {bf.status === "success" && bf.downloadUrl && (
                            <button
                              onClick={() => downloadBatchFile(index)}
                              className="p-2 text-green-600 hover:bg-green-200 rounded-lg transition"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          {bf.status !== "converting" && status !== "converting" && (
                            <button
                              onClick={() => removeBatchFile(index)}
                              className="p-2 text-red-600 hover:bg-red-200 rounded-lg transition"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex gap-2 justify-center">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept={
                      fromFormat === "pdf" ? ".pdf" :
                      fromFormat === "jpg" || fromFormat === "jpeg" ? ".jpg,.jpeg" :
                      fromFormat === "png" ? ".png" :
                      fromFormat === "doc" ? ".doc" :
                      fromFormat === "xlsx" ? ".xlsx" :
                      fromFormat === "xls" ? ".xls" :
                      fromFormat === "pptx" ? ".pptx" :
                      fromFormat === "ppt" ? ".ppt" :
                      ".docx"
                    }
                    className="hidden"
                    id="file-input-more"
                    multiple
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("file-input-more")?.click()}
                    disabled={status === "converting"}
                  >
                    Add More Files
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    disabled={status === "converting"}
                  >
                    Clear All
                  </Button>
                </div>
              </>
            ) : file && (
              <>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button onClick={handleClear} variant="outline" className="mr-2">
                  Change File
                </Button>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept={
                    fromFormat === "pdf" ? ".pdf" :
                    fromFormat === "jpg" || fromFormat === "jpeg" ? ".jpg,.jpeg" :
                    fromFormat === "png" ? ".png" :
                    fromFormat === "doc" ? ".doc" :
                    fromFormat === "xlsx" ? ".xlsx" :
                    fromFormat === "xls" ? ".xls" :
                    fromFormat === "pptx" ? ".pptx" :
                    fromFormat === "ppt" ? ".ppt" :
                    ".docx"
                  }
                  className="hidden"
                  id="file-input"
                />
                <Button
                  onClick={() => document.getElementById("file-input")?.click()}
                  variant="outline"
                >
                  Upload Different File
                </Button>
              </>
            )}
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

        {/* Progress */}
        {status === "converting" && (
          <Card className="p-6 mb-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-gray-600">
                {batchMode
                  ? `Converting files... ${progress}%`
                  : "Converting your file..."}
              </p>
            </div>
          </Card>
        )}

        {/* Success Message - Single File */}
        {status === "success" && !batchMode && downloadUrl && (
          <Card className="p-6 mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">
                  {toFormat === "pdf-ocr" ? "OCR conversion successful!" : "Conversion successful!"}
                </p>
                {(fromFormat === "pdf" || fromFormat === "docx" || fromFormat === "xlsx" || fromFormat === "xls" || fromFormat === "pptx" || fromFormat === "ppt") &&
                  (toFormat === "jpg" || toFormat === "jpeg" || toFormat === "png") && (
                  <p className="text-sm text-green-700">
                    Multi-page documents are packaged as a ZIP file.
                  </p>
                )}
                {toFormat === "pdf-ocr" && (
                  <p className="text-sm text-green-700">
                    Your PDF is now searchable. You can select and copy text from it.
                  </p>
                )}
              </div>
            </div>
            <Button onClick={handleDownload} className="w-full bg-green-600 hover:bg-green-700">
              {(fromFormat === "pdf" || fromFormat === "docx" || fromFormat === "xlsx" || fromFormat === "xls" || fromFormat === "pptx" || fromFormat === "ppt") &&
                (toFormat === "jpg" || toFormat === "jpeg" || toFormat === "png")
                ? "Download Images (ZIP)"
                : toFormat === "pdf-ocr"
                  ? "Download Searchable PDF"
                  : "Download Converted File"}
            </Button>
          </Card>
        )}

        {/* Success Message - Batch */}
        {status === "success" && batchMode && batchFiles.some(bf => bf.status === "success") && (
          <Card className="p-6 mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <p className="font-semibold text-green-800">
                Batch conversion complete! {batchFiles.filter(bf => bf.status === "success").length} of {batchFiles.length} files converted.
              </p>
            </div>
            <Button onClick={downloadAllBatch} className="w-full bg-green-600 hover:bg-green-700">
              Download All Converted Files
            </Button>
          </Card>
        )}

        {/* Action Buttons */}
        {((file && !batchMode) || (batchMode && batchFiles.length > 0)) && status !== "success" && (
          <div className="flex gap-4">
            <Button
              onClick={batchMode ? handleBatchConvert : handleConvert}
              disabled={status === "converting"}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              {status === "converting"
                ? "Converting..."
                : batchMode
                  ? `Convert ${batchFiles.length} File${batchFiles.length > 1 ? "s" : ""}`
                  : "Convert"}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="flex-1"
              disabled={status === "converting"}
            >
              Clear
            </Button>
          </div>
        )}

        {/* Info Box */}
        <Card className="p-4 mt-6 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Your files are processed securely on our servers and automatically deleted after conversion. We do not store any of your files.
          </p>
        </Card>

      </div>
    </div>
  );
}
