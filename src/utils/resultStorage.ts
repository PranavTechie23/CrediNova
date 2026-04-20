import type { CreditResponse } from "@/types";
import type { ModelPrediction, CreditDecisionRequest } from "@/services/creditModelService";

const KEY = "credit_clarity_latest_result";
const BULK_KEY = "credit_clarity_bulk_results";
const TAB_KEY = "credit_clarity_active_tab";

export function setLatestResult(result: CreditResponse): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(result));
  } catch {
    // ignore
  }
}

export function getLatestResult(): CreditResponse | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CreditResponse;
  } catch {
    return null;
  }
}

export function setBulkStorageResults(results: { request: any; prediction: ModelPrediction }[] | null): void {
  try {
    if (results) sessionStorage.setItem(BULK_KEY, JSON.stringify(results));
    else sessionStorage.removeItem(BULK_KEY);
  } catch {
    // ignore
  }
}

export function getBulkStorageResults(): { request: any; prediction: ModelPrediction }[] | null {
  try {
    const raw = sessionStorage.getItem(BULK_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setActiveTab(tab: string): void {
  sessionStorage.setItem(TAB_KEY, tab);
}

export function getActiveTab(): string | null {
  return sessionStorage.getItem(TAB_KEY);
}
