/**
 * Parse bulk applicant files (CSV, JSON, Excel, HTML) into CreditDecisionRequest[].
 * Column names are normalized (e.g. "Monthly Income", "monthly_income", "monthlyIncome").
 * PII columns (email, name, phone, aadhaar, etc.) are masked before processing — never passed to model.
 */

import * as XLSX from "xlsx";
import type { CreditApplication } from "@/types";
import { isPiiColumn, maskPii } from "@/services/piiMasking";

export type CreditDecisionRequest = CreditApplication;

/** Normalize header/column name to our schema key */
const COLUMN_ALIASES: Record<string, keyof CreditApplication> = {
  monthlyincome: "monthly_income",
  monthly_income: "monthly_income",
  "monthly income": "monthly_income",
  "monthly income ($)": "monthly_income",
  income: "monthly_income",
  income_stability: "income_stability",
  monthlyincomestability: "income_stability",
  monthly_income_stability: "income_stability",
  "monthly income stability": "income_stability",
  totalemi: "total_emi",
  total_emi: "total_emi",
  "total emi": "total_emi",
  "total emi ($)": "total_emi",
  existingemiobligations: "total_emi",
  existing_emi_obligations: "total_emi",
  "existing emi obligations ($)": "total_emi",
  emi: "total_emi",
  creditlimit: "credit_limit",
  credit_limit: "credit_limit",
  "credit limit": "credit_limit",
  "credit limit ($)": "credit_limit",
  outstandingbalance: "outstanding_balance",
  outstanding_balance: "outstanding_balance",
  "outstanding balance": "outstanding_balance",
  "outstanding balance ($)": "outstanding_balance",
  pastdelinquencies: "past_delinquencies",
  past_delinquencies: "past_delinquencies",
  "past delinquencies": "past_delinquencies",
  delinquencies: "past_delinquencies",
  monthssincelastdq: "months_since_last_dq",
  months_since_last_dq: "months_since_last_dq",
  "months since last dq": "months_since_last_dq",
  monthssincelastdelinquency: "months_since_last_dq",
  months_since_last_delinquency: "months_since_last_dq",
  "months since last delinquency": "months_since_last_dq",
  loanamountrequested: "loan_amount_requested",
  loan_amount_requested: "loan_amount_requested",
  "loan amount requested ($)": "loan_amount_requested",
  loan_amount: "loan_amount_requested",
  loanamount: "loan_amount_requested",
  loantenure: "loan_tenure",
  loan_tenure: "loan_tenure",
  "loan tenure": "loan_tenure",
  "loan tenure (months)": "loan_tenure",
  tenure: "loan_tenure",
  upivolume: "upi_volume",
  upi_volume: "upi_volume",
  "upi volume": "upi_volume",
  "upi monthly volume": "upi_volume",
  upitransactionvolume: "upi_volume",
  upi_transaction_volume: "upi_volume",
  ecommercespend: "ecommerce_spend",
  ecommerce_spend: "ecommerce_spend",
  "ecommerce spend": "ecommerce_spend",
  "e-commerce monthly spend": "ecommerce_spend",
  utilityscore: "utility_score",
  utility_score: "utility_score",
  "utility score": "utility_score",
  "utility bill history": "utility_score",
  utilitybillscore: "utility_score",
  utility_bill_score: "utility_score",
};

function normalizeKey(raw: string): keyof CreditApplication | null {
  const k = String(raw || "").trim().toLowerCase().replace(/\s+/g, " ");
  const withDollar = raw?.trim() ?? "";
  for (const [alias, key] of Object.entries(COLUMN_ALIASES)) {
    if (k === alias.toLowerCase() || withDollar.toLowerCase() === alias.toLowerCase()) return key;
  }
  const noPunct = k.replace(/[^a-z0-9]/g, "");
  for (const [alias, key] of Object.entries(COLUMN_ALIASES)) {
    if (alias.replace(/[^a-z0-9]/g, "") === noPunct) return key;
  }
  return null;
}

function toNum(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[,$%\s]/g, ""));
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function rowToRequest(row: Record<string, unknown>): CreditDecisionRequest {
  const get = (key: keyof CreditApplication) => {
    const val = row[key as string] ?? row[String(key).replace(/([A-Z])/g, "_$1").toLowerCase()];
    return toNum(val);
  };
  
  const creditLimit = get("credit_limit") || 1; // Ensure credit_limit > 0
  const loanTenure = get("loan_tenure") || 1; // Ensure loan_tenure > 0
  const utilityScore = Math.max(0, Math.min(100, get("utility_score") || 0)); // Clamp utility_score to 0-100
  
  return {
    monthly_income: get("monthly_income") || 0,
    income_stability: get("income_stability") || 0,
    total_emi: get("total_emi") || 0,
    credit_limit: creditLimit > 0 ? creditLimit : 1, // Cannot be 0
    outstanding_balance: get("outstanding_balance") || 0,
    past_delinquencies: get("past_delinquencies") || 0,
    months_since_last_dq: get("months_since_last_dq") || 0,
    loan_amount_requested: get("loan_amount_requested") || 0,
    loan_tenure: loanTenure > 0 ? loanTenure : 1, // Must be > 0
    upi_volume: get("upi_volume") || 0,
    ecommerce_spend: get("ecommerce_spend") || 0,
    utility_score: utilityScore, // Between 0-100
  };
}

function mapRowWithHeaders(headers: string[], values: unknown[]): CreditDecisionRequest {
  const row: Record<string, unknown> = {};
  headers.forEach((h, i) => {
    let val = values[i];
    if (isPiiColumn(h) && val != null) {
      val = maskPii(val);
    }
    const key = normalizeKey(h);
    if (key) row[key] = val;
  });
  return rowToRequest(row);
}

/** Parse CSV string (first row = headers) */
function parseCSV(text: string): CreditDecisionRequest[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headerLine = lines[0];
  const headers = headerLine.split(/[,;\t]/).map((h) => h.replace(/^["']|["']$/g, "").trim());
  const rows: CreditDecisionRequest[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(/[,;\t]/).map((p) => p.replace(/^["']|["']$/g, "").trim());
    const req = mapRowWithHeaders(headers, parts);
    if (req.monthly_income > 0 || req.loan_amount_requested > 0) rows.push(req);
  }
  return rows;
}

/** Parse JSON: array of objects or { applicants: [...] } */
function parseJSON(text: string): CreditDecisionRequest[] {
  const data = JSON.parse(text) as unknown;
  let arr: Record<string, unknown>[] = [];
  if (Array.isArray(data)) arr = data;
  else if (data && typeof data === "object" && Array.isArray((data as { applicants?: unknown }).applicants)) arr = (data as { applicants: Record<string, unknown>[] }).applicants;
  else if (data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)) arr = (data as { data: Record<string, unknown>[] }).data;
  else return [];
  return arr.map((row) => rowToRequest(row)).filter((r) => r.monthly_income > 0 || r.loan_amount_requested > 0);
}

/** Parse HTML: first table, first row = headers */
function parseHTML(text: string): CreditDecisionRequest[] {
  const doc = new DOMParser().parseFromString(text, "text/html");
  const table = doc.querySelector("table");
  if (!table) return [];
  const rows = table.querySelectorAll("tr");
  if (rows.length < 2) return [];
  const headerCells = rows[0].querySelectorAll("th, td");
  const headers = Array.from(headerCells).map((c) => c.textContent?.trim() ?? "");
  const out: CreditDecisionRequest[] = [];
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll("td");
    const values = Array.from(cells).map((c) => c.textContent?.trim() ?? "");
    const req = mapRowWithHeaders(headers, values);
    if (req.monthly_income > 0 || req.loan_amount_requested > 0) out.push(req);
  }
  return out;
}

/** Parse Excel (first sheet, first row = headers) */
function parseXLSX(buffer: ArrayBuffer): CreditDecisionRequest[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const first = wb.SheetNames[0];
  if (!first) return [];
  const sheet = wb.Sheets[first];
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { header: 1, defval: "" }) as unknown[][];
  if (data.length < 2) return [];
  const headers = (data[0] as unknown[]).map((h) => String(h ?? "").trim());
  const out: CreditDecisionRequest[] = [];
  for (let i = 1; i < data.length; i++) {
    const req = mapRowWithHeaders(headers, data[i] as unknown[]);
    if (req.monthly_income > 0 || req.loan_amount_requested > 0) out.push(req);
  }
  return out;
}

const ACCEPT = ".csv,.json,.xlsx,.xls,.html";
const ACCEPT_TYPES = "text/csv,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/html";

export const BULK_ACCEPT = ACCEPT;
export const BULK_ACCEPT_TYPES = ACCEPT_TYPES;

export async function parseBulkFile(file: File): Promise<CreditDecisionRequest[]> {
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (ext === "csv" || file.type === "text/csv") {
    const text = await file.text();
    return parseCSV(text);
  }
  if (ext === "json" || file.type === "application/json") {
    const text = await file.text();
    return parseJSON(text);
  }
  if (ext === "html" || ext === "htm" || file.type === "text/html") {
    const text = await file.text();
    return parseHTML(text);
  }
  if (ext === "xlsx" || ext === "xls" || file.type?.includes("spreadsheet") || file.type?.includes("excel")) {
    const buffer = await file.arrayBuffer();
    return parseXLSX(buffer);
  }
  throw new Error("Unsupported format. Use CSV, JSON, Excel (.xlsx/.xls), or HTML.");
}
