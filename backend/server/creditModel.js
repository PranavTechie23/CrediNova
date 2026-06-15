/**
 * Credit Model Service
 * Handles ML model predictions - supports both real SageMaker and simulation mode
 */

const axios = require('axios');
const { Config, Applications, CreditDecisions, FeatureStatistics, ModelPerformance } = require('./models');
const cache = require('./cache');

// Constants
const CONFIDENCE_CLAMP = (val) => Math.max(0, Math.min(1, val));
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

function buildApplicationPayload(request) {
  return {
    applicantEmail: request.applicant_email || 'anonymous@credinova.ai',
    monthlyIncome: request.monthly_income,
    incomeStability: request.income_stability,
    totalEmi: request.total_emi,
    creditLimit: request.credit_limit,
    outstandingBalance: request.outstanding_balance,
    loanAmountRequested: request.loan_amount_requested,
    loanTenure: request.loan_tenure,
    pastDelinquencies: request.past_delinquencies,
    monthsSinceLastDq: request.months_since_last_dq,
    upiVolume: request.upi_volume,
    ecommerceSpend: request.ecommerce_spend,
    utilityScore: request.utility_score
  };
}

async function persistPrediction(request, prediction, userId = null) {
  const application = await Applications.create(buildApplicationPayload(request), userId);

  await CreditDecisions.create(application.id, {
    modelVersion: prediction.model_version,
    probabilityOfDefault: prediction.probability_of_default,
    riskBand: prediction.risk_band,
    riskScore: prediction.risk_score,
    confidenceScore: prediction.confidence_score,
    decision: prediction.decision,
    recommendedInterestRate: prediction.recommended_interest_rate,
    topFeatures: prediction.top_features,
    featureImportanceDetails: prediction.feature_importance_details,
    businessImpact: prediction.business_impact,
    explainabilityNarrative: prediction.explanation_summary,
    approvalThreshold: prediction.approval_threshold,
    processingLatencyMs: prediction.inference_latency_ms
  }, userId);

  await cache.applicationCache.set(application.id, { request, prediction }, 3600);
  return application;
}

function validateCreditDecisionRequest(request) {
  const fields = [
    'monthly_income',
    'income_stability',
    'total_emi',
    'credit_limit',
    'outstanding_balance',
    'past_delinquencies',
    'months_since_last_dq',
    'loan_amount_requested',
    'loan_tenure',
    'upi_volume',
    'ecommerce_spend',
    'utility_score',
  ];

  if (!request || typeof request !== 'object') {
    return false;
  }

  return fields.every((key) => {
    const value = request[key];
    return typeof value === 'number' && Number.isFinite(value);
  });
}

/**
 * Call ML Model - Routes to real or mock endpoint based on configuration
 */
async function callSageMakerEndpoint(request, approvalThreshold = null) {
  const savedFeatureFlags = await Config.get('FEATURE_FLAGS') || {};
  const useRealML = savedFeatureFlags.use_real_ml === true || process.env.USE_REAL_ML === 'true';
  const defaultThreshold = await Config.get('APPROVAL_THRESHOLD_DEFAULT') ?? 0.5;
  const effectiveThreshold = typeof approvalThreshold === 'number' ? approvalThreshold : defaultThreshold;

  if (useRealML) {
    return await callRealSageMaker(request, effectiveThreshold);
  } else {
    return await callSimulatedModel(request, effectiveThreshold);
  }
}

/**
 * REAL SageMaker Endpoint Call
 * This calls actual AWS SageMaker ML endpoint
 */
async function callRealSageMaker(request, approvalThreshold = 0.5) {
  const startTime = Date.now();
  
  try {
    const endpointUrl = process.env.SAGEMAKER_ENDPOINT_URL;
    if (!endpointUrl) {
      throw new Error('SAGEMAKER_ENDPOINT_URL not configured');
    }

    // Prepare features for model (must match training features)
    const features = {
      monthly_income: request.monthly_income,
      income_stability: request.income_stability,
      total_emi: request.total_emi || 0,
      credit_limit: request.credit_limit || 0,
      outstanding_balance: request.outstanding_balance || 0,
      loan_amount_requested: request.loan_amount_requested,
      loan_tenure: request.loan_tenure || 24,
      past_delinquencies: request.past_delinquencies || 0,
      months_since_last_delinquency: request.months_since_last_dq || 0,
      upi_volume: request.upi_volume || 0,
      ecommerce_spend: request.ecommerce_spend || 0,
      utility_score: request.utility_score || 50
    };

    // Call SageMaker endpoint
    const response = await axios.post(
      endpointUrl,
      {
        instances: [features]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AWS_SAGEMAKER_TOKEN}`
        },
        timeout: 10000 // 10 second timeout
      }
    );

    const latency = Date.now() - startTime;

    // Extract predictions from SageMaker response
    const predictions = response.data.predictions[0];
    
    // SageMaker XGBoost typically returns: [probability_class_0, probability_class_1]
    // We want probability of default (class 1)
    const probability_of_default = Array.isArray(predictions) 
      ? predictions[1] 
      : predictions.probability_of_default;

    // Process and format response
    return await formatModelPrediction(
      request,
      probability_of_default,
      approvalThreshold,
      latency,
      features
    );

  } catch (error) {
    console.error('❌ SageMaker API Error:', error.message);
    
    // Fallback to simulation if real ML fails
    console.log('⚠️  Falling back to simulated model');
    return await callSimulatedModel(request, approvalThreshold);
  }
}

/**
 * SIMULATED Model (for development/testing)
 * Deterministic simulation of ML model behavior
 */
async function callSimulatedModel(request, approvalThreshold = 0.5) {
  const startTime = Date.now();

  const monthlyIncome = Math.max(1, request.monthly_income || 5000);
  const incomeStability = Math.max(0, Math.min(1, (request.income_stability || 80) / 100));
  const totalEmi = Math.max(0, request.total_emi || 1200);
  const creditLimit = Math.max(1, request.credit_limit || 10000);
  const outstandingBalance = Math.max(0, request.outstanding_balance || 0);
  const loanAmountRequested = Math.max(0, request.loan_amount_requested || 15000);
  const pastDelinquencies = Math.max(0, request.past_delinquencies || 0);
  const delinquencyRecency = request.months_since_last_dq >= 0 ? Math.min(1, request.months_since_last_dq / 48) : 0;
  const alternativeDataScore = Math.max(0, Math.min(1, ((request.upi_volume || 0) / 20000 + (request.ecommerce_spend || 0) / 12000 + (request.utility_score || 50) / 100) / 3));

  const emiRatio = Math.min(1, totalEmi / monthlyIncome);
  const creditUtil = Math.min(1, outstandingBalance / creditLimit);
  const loanSizeRatio = Math.min(1, loanAmountRequested / 150000);
  const stabilityFactor = incomeStability * 0.75 + alternativeDataScore * 0.25;

  let probability_of_default =
    0.14 * emiRatio +
    0.18 * creditUtil +
    0.20 * Math.min(1, pastDelinquencies / 10) -
    0.12 * stabilityFactor -
    0.06 * delinquencyRecency +
    0.06 * loanSizeRatio;

  probability_of_default = clamp(probability_of_default, 0, 1);

  const latency = Math.round(90 + emiRatio * 20 + creditUtil * 15 + (1 - stabilityFactor) * 12);

  const features = {
    monthly_income: monthlyIncome,
    income_stability: request.income_stability,
    total_emi: totalEmi,
    credit_limit: creditLimit,
    outstanding_balance: outstandingBalance,
    loan_amount_requested: loanAmountRequested,
    loan_tenure: request.loan_tenure || 24,
    past_delinquencies: pastDelinquencies,
    months_since_last_delinquency: request.months_since_last_dq || 0,
    upi_volume: request.upi_volume || 0,
    ecommerce_spend: request.ecommerce_spend || 0,
    utility_score: request.utility_score || 50,
    alternative_data_score: alternativeDataScore,
  };

  return await formatModelPrediction(
    request,
    probability_of_default,
    approvalThreshold,
    latency,
    features
  );
}

/**
 * Format Model Prediction into Standard Response
 */
async function formatModelPrediction(
  request,
  probabilityOfDefault,
  approvalThreshold,
  processingLatency,
  features
) {
  const lowThreshold = await Config.get('RISK_BAND_LOW_THRESHOLD') ?? 0.15;
  const mediumThreshold = await Config.get('RISK_BAND_MEDIUM_THRESHOLD') ?? 0.35;
  const baseRate = await Config.get('BASE_INTEREST_RATE') ?? 5.5;

  let risk_band;
  if (probabilityOfDefault < lowThreshold) {
    risk_band = 'Low';
  } else if (probabilityOfDefault < mediumThreshold) {
    risk_band = 'Medium';
  } else {
    risk_band = 'High';
  }

  const emiRatio = request.monthly_income ? request.total_emi / request.monthly_income : 0;
  const utilization = request.credit_limit ? request.outstanding_balance / request.credit_limit : 0;

  const recommended_interest_rate =
    baseRate +
    probabilityOfDefault * 10 +
    emiRatio * 40 +
    utilization * 12 +
    Math.min(3, features.alternative_data_score * 5);

  let decision;
  if (probabilityOfDefault < approvalThreshold * 0.6) {
    decision = 'Approved';
  } else if (probabilityOfDefault < approvalThreshold * 1.2) {
    decision = 'Manual Review';
  } else {
    decision = 'Rejected';
  }

  const shap_values = {
    emiRatio: emiRatio * 0.22,
    creditUtilization: utilization * 0.30,
    monthlyIncome: Math.min(1, request.monthly_income / 20000) * 0.16,
    incomeStability: (1 - Math.max(0, Math.min(1, request.income_stability / 100))) * 0.14,
    pastDelinquencies: Math.min(1, request.past_delinquencies / 5) * 0.10,
    loanAmountRequested: Math.min(1, request.loan_amount_requested / 500000) * 0.08,
    alternativeData: features.alternative_data_score * 0.10,
  };

  const top_features = Object.entries(shap_values)
    .map(([feature, impact]) => ({
      feature: feature
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase()),
      impact: Math.abs(impact),
    }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5);

  const thresholdDistance = Math.abs(probabilityOfDefault - approvalThreshold);
  const confidence_score = CONFIDENCE_CLAMP(
    0.55 + (1 - probabilityOfDefault) * 0.18 + features.alternative_data_score * 0.12 - thresholdDistance * 0.08
  );

  const business_impact = {
    estimated_annual_value: Math.round(Math.max(2500, request.loan_amount_requested * 0.22 + request.monthly_income * 0.35)),
    approval_precision: CONFIDENCE_CLAMP(0.60 + (1 - probabilityOfDefault) * 0.25 + features.alternative_data_score * 0.12),
    risk_reduction_percentage: decision === 'Approved'
      ? Math.round(10 + (1 - probabilityOfDefault) * 18)
      : Math.round(28 + probabilityOfDefault * 15),
    expected_revenue: Math.round(request.loan_amount_requested * (recommended_interest_rate / 100) * 0.85),
  };

  const modelVersion = await Config.get('MODEL_VERSION') || 'xgboost-prod-v2.3.1';

  return {
    probability_of_default: Math.round(probabilityOfDefault * 1000) / 1000,
    risk_band,
    risk_score: Math.round(probabilityOfDefault * 100),
    confidence_score: Math.round(confidence_score * 1000) / 1000,
    decision,
    recommended_interest_rate: Math.round(recommended_interest_rate * 100) / 100,
    top_features,
    feature_importance_details: shap_values,
    business_impact,
    model_version: modelVersion,
    approval_threshold: approvalThreshold,
    inference_latency_ms: Math.round(processingLatency),
    timestamp: new Date().toISOString(),
    shap_values,
  };
}

/**
 * Batch Score Multiple Applications
 */
async function batchPredictions(applications, approvalThreshold = 0.5) {
  const predictions = await Promise.all(
    applications.map((app) => callSageMakerEndpoint(app, approvalThreshold))
  );

  // Track metrics
  const approvalCount = predictions.filter(p => p.decision === 'Approved').length;
  const rejectionCount = predictions.filter(p => p.decision === 'Rejected').length;
  const manualReviewCount = predictions.filter(p => p.decision === 'Manual Review').length;

  await cache.metrics.incrementPredictions(applications.length);
  if (approvalCount > 0) await cache.metrics.incrementApprovals(approvalCount);
  if (rejectionCount > 0) await cache.metrics.incrementRejections(rejectionCount);
  if (manualReviewCount > 0) await cache.metrics.incrementManualReviews(manualReviewCount);

  return predictions;
}

function modelPredictionToCreditResponse(prediction) {
  const risk_score = Math.round(300 + (1 - prediction.probability_of_default) * 600);
  const risk_tier = prediction.risk_band === 'High' ? 'High' : prediction.risk_band === 'Medium' ? 'Medium' : 'Low';
  const top_protective_factors = prediction.top_features
    .filter((feature) => feature.impact < 0)
    .map((feature) => ({ feature: feature.feature, impact: Math.abs(feature.impact) }))
    .slice(0, 5);

  return {
    probability_of_default: prediction.probability_of_default,
    risk_score,
    risk_tier,
    risk_band: prediction.risk_band,
    recommended_interest_rate: prediction.recommended_interest_rate,
    decision: prediction.decision === 'Rejected' ? 'Rejected' : prediction.decision === 'Manual Review' ? 'Manual Review' : 'Approved',
    confidence_score: prediction.confidence_score,
    top_features: prediction.top_features,
    top_protective_factors: top_protective_factors.length ? top_protective_factors : undefined,
    explanation_summary: `Risk tier: ${prediction.risk_band}. PD: ${(prediction.probability_of_default * 100).toFixed(1)}%. Decision: ${prediction.decision}.`,
    improvement_suggestions:
      prediction.risk_band !== 'Low' ? ['Reduce DTI.', 'Lower credit utilization.'] : undefined,
    business_impact: prediction.business_impact,
    model_version: prediction.model_version,
    inference_latency_ms: prediction.inference_latency_ms,
  };
}

/**
 * Policy Simulation - What-if scenarios
 */
function simulatePolicy(threshold) {
  return {
    approvalThreshold: threshold,
    expectedApprovalRate: Math.max(10, 90 - threshold * 150),
    expectedDefaultRate: Math.max(2, 15 + threshold * 80),
    expectedRevenue: Math.max(0, 5000000 - threshold * 3000000),
  };
}

module.exports = {
  validateCreditDecisionRequest,
  callSageMakerEndpoint,
  batchPredictions,
  modelPredictionToCreditResponse,
  callRealSageMaker,
  callSimulatedModel,
  formatModelPrediction,
  simulatePolicy,
  persistPrediction
};
