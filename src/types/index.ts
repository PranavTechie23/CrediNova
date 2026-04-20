export interface CreditApplication {
  monthly_income: number;
  income_stability: number;
  total_emi: number;
  credit_limit: number;
  outstanding_balance: number;
  past_delinquencies: number;
  months_since_last_dq: number;
  loan_amount_requested: number;
  loan_tenure: number;
  upi_volume: number;
  ecommerce_spend: number;
  utility_score: number;
}

/** Risk tier from Hybrid ML Engine (scaled 300–900) */
export type RiskTier = "Low" | "Medium" | "High" | "Critical";

export interface AIReport {
  risk_explanation: string;
  visual_insights: string;
  improvement_suggestions: string[];
  what_if_scenarios: { scenario: string; impact: string }[];
  chart_data: { subject: string; A: number; fullMark: number }[];
}

export interface CreditResponse {
  probability_of_default: number;
  /** Scaled risk score 300–900 (core AUC weapon output) */
  risk_score: number;
  /** Risk tier: Low / Medium / High / Critical */
  risk_tier: RiskTier;
  /** @deprecated Use risk_tier */
  risk_band: "Low" | "Medium" | "High";
  recommended_interest_rate: number;
  decision: "Approved" | "Rejected" | "Manual Review" | "Conditional Approval";
  confidence_score: number;
  /** Top risk drivers (positive SHAP impact) */
  top_features: { feature: string; impact: number }[];
  /** Top protective factors (negative SHAP impact) */
  top_protective_factors?: { feature: string; impact: number }[];
  /** Explainability Agent: human-readable summary */
  explanation_summary?: string;
  /** Explainability Agent: improvement suggestions */
  improvement_suggestions?: string[];
  /** Optional extended fields for full decision report */
  business_impact?: {
    expected_revenue: number;
    risk_reduction_percentage: number;
    approval_precision: number;
    estimated_annual_value: number;
  };
  model_version?: string;
  inference_latency_ms?: number;
  income_stability?: number;
  monthly_income?: number;
  ai_report?: AIReport;
}

/** Alias for API/display usage */
export type PredictionResponse = CreditResponse;

export interface User {
  email: string;
  id: string;
  name?: string;
}

export interface PastApplication {
  id: string;
  date: string;
  amount: number;
  decision: "Approved" | "Rejected" | "Manual Review" | "Conditional Approval";
  riskBand: "Low" | "Medium" | "High";
  risk_score?: number;
  risk_tier?: RiskTier;
  probability_score?: number;
}
