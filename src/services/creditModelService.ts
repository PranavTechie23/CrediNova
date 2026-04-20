/**
 * Credit Model Service
 * Simulates integration with a deployed SageMaker ML model endpoint
 * Demonstrates production-grade model serving with latency simulation
 */

import type { CreditResponse } from "@/types";

export interface CreditDecisionRequest {
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

export interface ModelPrediction {
  probability_of_default: number;
  risk_band: "Low" | "Medium" | "High";
  recommended_interest_rate: number;
  confidence_score: number;
  decision: "Approved" | "Rejected" | "Manual Review";
  top_features: Array<{ feature: string; impact: number }>;
  model_version: string;
  inference_latency_ms: number;
  timestamp: string;
  shap_values: Record<string, number>;
  business_impact: {
    estimated_annual_value: number;
    approval_precision: number;
    risk_reduction_percentage: number;
    expected_revenue: number;
  };
}

/**
 * Simulates calling a deployed SageMaker endpoint
 * In production: make actual API call to AWS SageMaker
 */
export async function callSageMakerEndpoint(
  request: CreditDecisionRequest,
  approvalThreshold: number = 0.5
): Promise<ModelPrediction> {
  // Simulate API latency (50-200ms typical for SageMaker)
  const latency = Math.random() * 150 + 50;
  await new Promise((resolve) => setTimeout(resolve, latency));

  // Calculate features that influence the model
  const emiRatio = request.monthly_income > 0 ? request.total_emi / request.monthly_income : 0;
  const creditUtil = request.credit_limit > 0 ? request.outstanding_balance / request.credit_limit : 0;
  const incomeStability = request.income_stability / 100;
  const delinquencyRecency = Math.max(1, request.months_since_last_dq / 120); // Normalize to 0-1

  // XGBoost-inspired probability calculation using feature interactions
  let probability_of_default =
    0.1 * emiRatio +
    0.15 * creditUtil +
    0.12 * Math.max(0, request.past_delinquencies / 10) -
    0.08 * incomeStability -
    0.05 * delinquencyRecency +
    0.08 * (request.loan_amount_requested / 100000) +
    Math.random() * 0.1; // Add noise for realism

  // Clamp probability to [0, 1]
  probability_of_default = Math.max(0, Math.min(1, probability_of_default));

  // Determine risk band based on probability
  let risk_band: "Low" | "Medium" | "High";
  if (probability_of_default < 0.15) {
    risk_band = "Low";
  } else if (probability_of_default < 0.35) {
    risk_band = "Medium";
  } else {
    risk_band = "High";
  }

  // Recommend interest rate based on risk
  const base_rate = 5.5;
  const recommended_interest_rate =
    base_rate + (probability_of_default * 8.5) + (emiRatio * 50);

  // Decision logic using approval threshold
  let decision: "Approved" | "Rejected" | "Manual Review";
  if (probability_of_default < approvalThreshold * 0.6) {
    decision = "Approved";
  } else if (probability_of_default < approvalThreshold * 1.2) {
    decision = "Manual Review";
  } else {
    decision = "Rejected";
  }

  // Build SHAP values (feature importance)
  const shap_values = {
    emiRatio: emiRatio * 0.25,
    creditUtilization: creditUtil * 0.28,
    monthlyIncome: Math.min(1, request.monthly_income / 20000) * 0.18,
    incomeStability: (1 - incomeStability) * 0.15,
    pastDelinquencies: Math.min(1, request.past_delinquencies / 5) * 0.08,
    loanAmountRequested: Math.min(1, request.loan_amount_requested / 500000) * 0.06,
  };

  // Top features sorted by impact
  const top_features = Object.entries(shap_values)
    .map(([feature, impact]) => ({
      feature: feature
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()),
      impact: Math.abs(impact as number),
    }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5);

  // Calculate confidence (higher for extreme scores)
  const confidence_score =
    0.65 + Math.abs(probability_of_default - 0.5) * 0.5 + Math.random() * 0.15;

  // Business impact metrics
  const business_impact = {
    estimated_annual_value: Math.max(2500, Math.random() * 15000),
    approval_precision: 0.78 + Math.random() * 0.15,
    risk_reduction_percentage: decision === "Approved" ? 18 + Math.random() * 12 : 35 + Math.random() * 15,
    expected_revenue: request.loan_amount_requested * (recommended_interest_rate / 100) * 0.85,
  };

  return {
    probability_of_default: Math.round(probability_of_default * 1000) / 1000,
    risk_band,
    recommended_interest_rate: Math.round(recommended_interest_rate * 100) / 100,
    confidence_score: Math.round(confidence_score * 1000) / 1000,
    decision,
    top_features,
    model_version: "xgboost-prod-v2.3.1",
    inference_latency_ms: Math.round(latency),
    timestamp: new Date().toISOString(),
    shap_values,
    business_impact,
  };
}

/**
 * Batch prediction for portfolio analysis
 * Simulates calling SageMaker batch prediction job
 */
export async function batchPredictions(
  applications: CreditDecisionRequest[],
  approvalThreshold: number = 0.5
): Promise<ModelPrediction[]> {
  const predictions = await Promise.all(
    applications.map((app) => callSageMakerEndpoint(app, approvalThreshold))
  );
  return predictions;
}

/** Convert model output to CreditResponse for result page / audit */
export function modelPredictionToCreditResponse(p: ModelPrediction): CreditResponse {
  const risk_score = Math.round(300 + (1 - p.probability_of_default) * 600);
  const risk_tier = p.risk_band === "High" ? "High" : p.risk_band === "Medium" ? "Medium" : "Low";
  const top_protective_factors = p.top_features
    .filter((f) => f.impact < 0)
    .map((f) => ({ feature: f.feature, impact: Math.abs(f.impact) }))
    .slice(0, 5);
  return {
    probability_of_default: p.probability_of_default,
    risk_score,
    risk_tier,
    risk_band: p.risk_band,
    recommended_interest_rate: p.recommended_interest_rate,
    decision: p.decision === "Rejected" ? "Rejected" : p.decision === "Manual Review" ? "Manual Review" : "Approved",
    confidence_score: p.confidence_score,
    top_features: p.top_features,
    top_protective_factors: top_protective_factors.length ? top_protective_factors : undefined,
    explanation_summary: `Risk tier: ${p.risk_band}. PD: ${(p.probability_of_default * 100).toFixed(1)}%. Decision: ${p.decision}.`,
    improvement_suggestions: p.risk_band !== "Low" ? ["Reduce DTI.", "Lower credit utilization."] : undefined,
    business_impact: p.business_impact,
    model_version: p.model_version,
    inference_latency_ms: p.inference_latency_ms,
  };
}

/**
 * Model monitoring: Detect data drift using PSI
 * Population Stability Index indicates if test data distribution differs from training
 */
export function calculatePSI(
  actual: number[],
  expected: number[],
  bins: number = 10
): number {
  // Simplified PSI calculation
  const actualBuckets = new Array(bins).fill(0);
  const expectedBuckets = new Array(bins).fill(0);

  const min = Math.min(...actual, ...expected);
  const max = Math.max(...actual, ...expected);
  const binWidth = (max - min) / bins;

  actual.forEach((val) => {
    const binIndex = Math.floor((val - min) / binWidth);
    actualBuckets[Math.min(binIndex, bins - 1)]++;
  });

  expected.forEach((val) => {
    const binIndex = Math.floor((val - min) / binWidth);
    expectedBuckets[Math.min(binIndex, bins - 1)]++;
  });

  const actualPct = actualBuckets.map((v) => v / actual.length);
  const expectedPct = expectedBuckets.map((v) => v / expected.length);

  return actualPct.reduce((sum, pct, i) => {
    return sum + pct * Math.log((pct + 0.0001) / (expectedPct[i] + 0.0001));
  }, 0);
}

/**
 * Model performance metrics
 */
export interface ModelMetrics {
  auc: number;
  gini: number;
  lift_at_10: number;
  lift_at_30: number;
  ks_statistic: number;
  precision: number;
  recall: number;
  f1_score: number;
}

export const productionMetrics: ModelMetrics = {
  auc: 0.78,
  gini: 0.56, // Gini = 2*AUC - 1
  lift_at_10: 2.15,
  lift_at_30: 1.65,
  ks_statistic: 0.42,
  precision: 0.82,
  recall: 0.75,
  f1_score: 0.78,
};

/**
 * Feature monitoring - detect outliers
 */
export interface FeatureStats {
  mean: number;
  std: number;
  min: number;
  max: number;
  p25: number;
  p75: number;
}

export const trainingFeatureStats: Record<string, FeatureStats> = {
  monthly_income: {
    mean: 6250,
    std: 2917,
    min: 1667,
    max: 41667,
    p25: 4167,
    p75: 7917,
  },
  total_emi: {
    mean: 2000,
    std: 1500,
    min: 0,
    max: 15000,
    p25: 800,
    p75: 2800,
  },
  credit_limit: {
    mean: 15000,
    std: 10000,
    min: 1000,
    max: 100000,
    p25: 8000,
    p75: 20000,
  },
  outstanding_balance: {
    mean: 6300,
    std: 4200,
    min: 0,
    max: 65000,
    p25: 2800,
    p75: 8500,
  },
  income_stability: {
    mean: 78,
    std: 15,
    min: 30,
    max: 100,
    p25: 68,
    p75: 88,
  },
  past_delinquencies: {
    mean: 2.1,
    std: 2.8,
    min: 0,
    max: 25,
    p25: 0,
    p75: 3,
  },
};

/**
 * Policy simulation: Adjust approval threshold dynamically
 */
export interface PolicySimulation {
  approvalThreshold: number;
  expectedApprovalRate: number;
  expectedDefaultRate: number;
  expectedRevenue: number;
}

export function simulatePolicy(threshold: number): PolicySimulation {
  return {
    approvalThreshold: threshold,
    expectedApprovalRate: Math.max(10, 90 - threshold * 150),
    expectedDefaultRate: Math.max(2, 15 + threshold * 80),
    expectedRevenue: Math.max(0, 5000000 - threshold * 3000000),
  };
}
