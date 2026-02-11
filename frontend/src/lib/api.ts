import axios, { AxiosInstance } from "axios";

// Extend Window interface for Clerk
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken?: () => Promise<string | null>;
      };
    };
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const CURRENCY_API_KEY = process.env.NEXT_PUBLIC_CURRENCY_API_KEY;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Clerk token to requests (compatible with Clerk v5+)
apiClient.interceptors.request.use(async (config) => {
  // Try to get token from Clerk's proper API
  try {
    if (typeof window !== "undefined" && window.Clerk) {
      // Use Clerk's official API if available
      const token = await window.Clerk?.session?.getToken?.();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    // Silently fail - token might not be available yet or Clerk might not be loaded
    console.debug("Token fetch failed (expected during initial load)");
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// File Conversion API
export type FileFormat = "pdf" | "jpg" | "jpeg" | "png" | "doc" | "docx" | "xlsx" | "xls" | "pptx" | "ppt" | "pdf-ocr";

export const fileConversionAPI = {
  convertPdfToJpg: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/convert/pdf-to-jpg", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "blob",
    });
  },

  convertJpgToPdf: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/convert/jpg-to-pdf", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "blob",
    });
  },

  // Generic conversion method for all format conversions
  convertFile: async (file: File, fromFormat: string, toFormat: string) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/convert/${fromFormat}-to-${toFormat}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "blob",
    });
  },

  // PDF OCR - Convert scanned PDF to searchable PDF
  convertPdfOcr: async (file: File, language: string = "eng") => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/convert/pdf-ocr?language=${language}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "blob",
    });
  },

  // Check OCR availability and supported languages
  getOcrStatus: async () => {
    return apiClient.get("/convert/ocr/status");
  },

  // Batch image conversions - combine multiple images into single document
  convertBatchImagesToPdf: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    return apiClient.post("/convert/batch/images-to-pdf", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "blob",
    });
  },

  convertBatchImagesToDocx: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    return apiClient.post("/convert/batch/images-to-docx", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "blob",
    });
  },
};

// Currency Conversion API
export const currencyAPI = {
  getExchangeRate: async (from: string, to: string) => {
    try {
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${CURRENCY_API_KEY}/latest/${from}`
      );
      return response.data.conversion_rates[to];
    } catch (error) {
      console.error("Currency conversion error:", error);
      throw error;
    }
  },

  convert: async (amount: number, from: string, to: string) => {
    const rate = await currencyAPI.getExchangeRate(from, to);
    return amount * rate;
  },
};

// Unit Conversion API
export const unitAPI = {
  convertLength: async (value: number, from: string, to: string) => {
    return apiClient.post("/convert/length", { value, from_unit: from, to_unit: to });
  },

  convertWeight: async (value: number, from: string, to: string) => {
    return apiClient.post("/convert/weight", { value, from_unit: from, to_unit: to });
  },

  convertTemperature: async (value: number, from: string, to: string) => {
    return apiClient.post("/convert/temperature", { value, from_unit: from, to_unit: to });
  },

  convertVolume: async (value: number, from: string, to: string) => {
    return apiClient.post("/convert/volume", { value, from_unit: from, to_unit: to });
  },

  convertArea: async (value: number, from: string, to: string) => {
    return apiClient.post("/convert/area", { value, from_unit: from, to_unit: to });
  },

  convertSpeed: async (value: number, from: string, to: string) => {
    return apiClient.post("/convert/speed", { value, from_unit: from, to_unit: to });
  },

  convertTime: async (value: number, from: string, to: string) => {
    return apiClient.post("/convert/time", { value, from_unit: from, to_unit: to });
  },
};

// Calculator API
export const calculatorAPI = {
  // Free Tier Calculators
  loanCalculator: async (principal: number, rate: number, years: number) => {
    return apiClient.post("/calculate/loan", { principal, annual_rate: rate, years });
  },

  interestCalculator: async (principal: number, rate: number, time: number) => {
    return apiClient.post("/calculate/interest", { principal, rate, time });
  },

  percentageCalculator: async (operation: string, values: Record<string, number>) => {
    return apiClient.post("/calculate/percentage", { operation, values });
  },

  dateDifferenceCalculator: async (startDate: string, endDate: string) => {
    return apiClient.post("/calculate/date-difference", { start_date: startDate, end_date: endDate });
  },

  unitPriceCalculator: async (totalPrice: number, quantity: number) => {
    return apiClient.post("/calculate/unit-price", { total_price: totalPrice, quantity });
  },

  // Starter Tier Calculators
  amortizationCalculator: async (principal: number, rate: number, years: number) => {
    return apiClient.post("/calculate/amortization", { principal, annual_rate: rate, years });
  },

  profitMarginCalculator: async (cost: number, revenue: number) => {
    return apiClient.post("/calculate/profit-margin", { cost, revenue });
  },

  salaryHourlyCalculator: async (amount: number, conversionType: string, hoursPerWeek: number = 40, weeksPerYear: number = 52) => {
    return apiClient.post("/calculate/salary-hourly", {
      amount,
      conversion_type: conversionType,
      hours_per_week: hoursPerWeek,
      weeks_per_year: weeksPerYear
    });
  },

  savingsCalculator: async (initialDeposit: number, monthlyContribution: number, annualRate: number, years: number) => {
    return apiClient.post("/calculate/savings", {
      initial_deposit: initialDeposit,
      monthly_contribution: monthlyContribution,
      annual_rate: annualRate,
      years
    });
  },

  // Pro Tier Calculators
  roiCalculator: async (initialInvestment: number, finalValue: number, timeYears: number = 1) => {
    return apiClient.post("/calculate/roi", {
      initial_investment: initialInvestment,
      final_value: finalValue,
      time_years: timeYears
    });
  },

  breakevenCalculator: async (fixedCosts: number, pricePerUnit: number, variableCostPerUnit: number) => {
    return apiClient.post("/calculate/breakeven", {
      fixed_costs: fixedCosts,
      price_per_unit: pricePerUnit,
      variable_cost_per_unit: variableCostPerUnit
    });
  },
};

// Document Generation API
export const documentAPI = {
  generateInvoice: async (invoiceData: Record<string, any>) => {
    return apiClient.post("/documents/generate-invoice", invoiceData, {
      responseType: "blob",
    });
  },

  generateReceipt: async (receiptData: Record<string, any>) => {
    return apiClient.post("/documents/generate-receipt", receiptData, {
      responseType: "blob",
    });
  },

  // Pro Tier Documents
  generateNDA: async (ndaData: Record<string, any>) => {
    return apiClient.post("/documents/generate-nda", ndaData, {
      responseType: "blob",
    });
  },

  generateEmploymentLetter: async (letterData: Record<string, any>) => {
    return apiClient.post("/documents/generate-employment-letter", letterData, {
      responseType: "blob",
    });
  },

  // Pro Tier - DOCX Export
  exportInvoiceDocx: async (invoiceData: Record<string, any>) => {
    return apiClient.post("/documents/export-invoice-docx", invoiceData, {
      responseType: "blob",
    });
  },

  exportReceiptDocx: async (receiptData: Record<string, any>) => {
    return apiClient.post("/documents/export-receipt-docx", receiptData, {
      responseType: "blob",
    });
  },
};

// Usage Tracking API
export const usageAPI = {
  getDailyUsage: async (userId: string, tier: string = "FREE") => {
    return apiClient.get(`/usage/daily/${userId}?tier=${tier}`);
  },

  recordConversion: async (userId: string, type: string, tier: string = "FREE") => {
    return apiClient.post(`/usage/record`, { user_id: userId, conversion_type: type, tier });
  },

  getConversionHistory: async (userId: string) => {
    return apiClient.get(`/usage/history/${userId}`);
  },
};

// Document History API (Starter: 1, Pro: 5) - Now uses Next.js API routes with database
export interface DocumentHistoryItem {
  document_type: string;
  document_id: string;
  document_name: string;
  created_at: string;
  tier: string;
}

export const historyAPI = {
  addToHistory: async (
    userId: string,
    documentType: string,
    documentId: string,
    documentName: string,
    tier: string
  ) => {
    return axios.post("/api/history", {
      user_id: userId,
      document_type: documentType,
      document_id: documentId,
      document_name: documentName,
      tier,
    });
  },

  getHistory: async (userId: string, tier: string) => {
    return axios.get(`/api/history?userId=${userId}&tier=${tier}`);
  },

  deleteFromHistory: async (userId: string, documentId: string) => {
    return axios.delete(`/api/history/${documentId}?userId=${userId}`);
  },

  clearHistory: async (userId: string) => {
    return axios.delete(`/api/history?userId=${userId}`);
  },
};

export default apiClient;
