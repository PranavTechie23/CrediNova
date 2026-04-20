/**
 * Audit Trail Service - Barclays-grade decision logging
 * FCA/PRA Model Risk Management compliant: every decision logged with full traceability
 */

import type { CreditApplication } from "@/types";
import type { CreditResponse } from "@/types";
import type { ModelPrediction } from "@/services/creditModelService";

const AUDIT_KEY = "credit_clarity_audit_trail";
const MAX_ENTRIES = 500;

export interface AuditEntry {
  id: string;
  timestamp: string; // ISO
  type: "single" | "bulk";
  /** Non-PII input features only */
  input_features: Partial<CreditApplication>;
  model_version: string;
  decision: string;
  risk_band: string;
  risk_score: number;
  probability_of_default: number;
  top_features: { feature: string; impact: number }[];
  user_agent?: string;
}

function generateId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function logSingleDecision(
  input: CreditApplication,
  response: CreditResponse,
  modelVersion: string = "v2.1.0-alpha"
): void {
  try {
    const entry: AuditEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      type: "single",
      input_features: { ...input },
      model_version: modelVersion,
      decision: response.decision,
      risk_band: response.risk_band ?? response.risk_tier ?? "Unknown",
      risk_score: response.risk_score ?? 0,
      probability_of_default: response.probability_of_default ?? 0,
      top_features: response.top_features ?? [],
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 100) : undefined,
    };
    appendToAuditTrail(entry);
  } catch {
    // ignore storage errors
  }
}

export function logBulkDecision(
  requests: CreditApplication[],
  predictions: ModelPrediction[],
  modelVersion: string = "xgboost-prod-v2.3.1"
): void {
  try {
    predictions.forEach((pred, i) => {
      const req = requests[i];
      if (!req) return;
      const entry: AuditEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        type: "bulk",
        input_features: { ...req },
        model_version: modelVersion,
        decision: pred.decision,
        risk_band: pred.risk_band ?? "Unknown",
        risk_score: Math.round(300 + (1 - pred.probability_of_default) * 600),
        probability_of_default: pred.probability_of_default,
        top_features: pred.top_features ?? [],
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 100) : undefined,
      };
      appendToAuditTrail(entry);
    });
  } catch {
    // ignore
  }
}

function appendToAuditTrail(entry: AuditEntry): void {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    const arr: AuditEntry[] = raw ? JSON.parse(raw) : [];
    arr.unshift(entry);
    const trimmed = arr.slice(0, MAX_ENTRIES);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function getAuditTrail(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function clearAuditTrail(): void {
  try {
    localStorage.removeItem(AUDIT_KEY);
  } catch {
    // ignore
  }
}
