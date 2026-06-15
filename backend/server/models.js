/**
 * Database Models & Query Builders
 * Provides structured access to database entities
 */

const { query, transaction } = require('./database');
const cache = require('./cache');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// ============================================================================
// USERS
// ============================================================================

const Users = {
  async create(userData) {
    const { email, password, firstName, lastName, phone, role } = userData;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    const text = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, phone, role, created_at
    `;
    
    const result = await query(text, [email, passwordHash, firstName, lastName, phone, role]);
    return result.rows[0];
  },

  async findById(id) {
    const text = `
      SELECT id, email, first_name, last_name, phone, role, department, 
             active, login_count, last_login_at, created_at
      FROM users WHERE id = $1
    `;
    
    const result = await query(text, [id]);
    return result.rows[0] || null;
  },

  async findByEmail(email) {
    const text = `
      SELECT id, email, password_hash, first_name, last_name, phone, role, 
             department, active, login_count, last_login_at, created_at
      FROM users WHERE email = $1 AND active = true
    `;
    
    const result = await query(text, [email]);
    return result.rows[0] || null;
  },

  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  },

  async updateLastLogin(userId) {
    const text = `
      UPDATE users 
      SET last_login_at = CURRENT_TIMESTAMP, login_count = login_count + 1
      WHERE id = $1
      RETURNING id, email, login_count
    `;
    
    const result = await query(text, [userId]);
    return result.rows[0];
  },

  async list(limit = 50, offset = 0) {
    const text = `
      SELECT id, email, first_name, last_name, role, department, active, created_at
      FROM users
      WHERE active = true
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await query(text, [limit, offset]);
    return result.rows;
  }
};

// ============================================================================
// APPLICATIONS
// ============================================================================

const Applications = {
  async create(appData, userId) {
    const {
      applicantEmail,
      monthlyIncome,
      incomeStability,
      totalEmi,
      creditLimit,
      outstandingBalance,
      loanAmountRequested,
      loanTenure,
      pastDelinquencies,
      monthsSinceLastDq,
      upiVolume,
      ecommerceSpend,
      utilityScore
    } = appData;

    const text = `
      INSERT INTO applications (
        applicant_id, applicant_email, monthly_income, income_stability,
        total_emi, credit_limit, outstanding_balance, loan_amount_requested,
        loan_tenure, past_delinquencies, months_since_last_delinquency,
        upi_volume, ecommerce_spend, utility_score, status, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'submitted', $15)
      RETURNING id, applicant_email, monthly_income, loan_amount_requested, 
                status, created_at
    `;

    const params = [
      userId, applicantEmail, monthlyIncome, incomeStability,
      totalEmi, creditLimit, outstandingBalance, loanAmountRequested,
      loanTenure, pastDelinquencies, monthsSinceLastDq,
      upiVolume, ecommerceSpend, utilityScore, userId
    ];

    const result = await query(text, params);
    return result.rows[0];
  },

  async findById(id) {
    const text = `
      SELECT id, applicant_id, applicant_email, monthly_income, income_stability,
             total_emi, credit_limit, outstanding_balance, loan_amount_requested,
             loan_tenure, past_delinquencies, months_since_last_delinquency,
             upi_volume, ecommerce_spend, utility_score, status, submitted_at,
             reviewed_at, reviewed_by, notes, created_at
      FROM applications WHERE id = $1
    `;

    const result = await query(text, [id]);
    return result.rows[0] || null;
  },

  async list(filters = {}, limit = 50, offset = 0) {
    let text = `
      SELECT id, applicant_email, monthly_income, loan_amount_requested,
             status, submitted_at, created_at
      FROM applications
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      params.push(filters.status);
      text += ` AND status = $${params.length}`;
    }

    if (filters.applicantId) {
      params.push(filters.applicantId);
      text += ` AND applicant_id = $${params.length}`;
    }

    if (filters.createdBy) {
      params.push(filters.createdBy);
      text += ` AND created_by = $${params.length}`;
    }

    text += ` ORDER BY submitted_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(text, params);
    return result.rows;
  },

  async updateStatus(id, status, reviewedBy = null, notes = null) {
    const text = `
      UPDATE applications
      SET status = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2, notes = $3
      WHERE id = $4
      RETURNING id, status, reviewed_at
    `;

    const result = await query(text, [status, reviewedBy, notes, id]);
    return result.rows[0];
  }
};

// ============================================================================
// CREDIT DECISIONS
// ============================================================================

const CreditDecisions = {
  async create(appId, decisionData, userId) {
    const {
      modelVersion,
      probabilityOfDefault,
      riskBand,
      riskScore,
      confidenceScore,
      decision,
      recommendedInterestRate,
      topFeatures,
      featureImportanceDetails,
      businessImpact,
      explainabilityNarrative,
      approvalThreshold,
      processingLatencyMs
    } = decisionData;

    const text = `
      INSERT INTO credit_decisions (
        application_id, model_version, probability_of_default, risk_band,
        risk_score, confidence_score, decision, recommended_interest_rate,
        top_features, feature_importance_details, business_impact,
        explainability_narrative, approval_threshold, processing_latency_ms,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, application_id, decision, probability_of_default, risk_band, created_at
    `;

    const params = [
      appId, modelVersion, probabilityOfDefault, riskBand, riskScore,
      confidenceScore, decision, recommendedInterestRate,
      JSON.stringify(topFeatures), JSON.stringify(featureImportanceDetails),
      JSON.stringify(businessImpact), explainabilityNarrative,
      approvalThreshold, processingLatencyMs, userId
    ];

    const result = await query(text, params);
    return result.rows[0];
  },

  async findByApplicationId(applicationId) {
    const text = `
      SELECT id, application_id, model_version, probability_of_default,
             risk_band, risk_score, confidence_score, decision,
             recommended_interest_rate, top_features, feature_importance_details,
             business_impact, explainability_narrative, created_at
      FROM credit_decisions
      WHERE application_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await query(text, [applicationId]);
    return result.rows[0] || null;
  },

  async getDecisionStats(startDate = null, endDate = null) {
    let text = `
      SELECT
        decision,
        COUNT(*) as count,
        AVG(probability_of_default) as avg_pd,
        AVG(risk_score) as avg_risk_score
      FROM credit_decisions
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      params.push(startDate);
      text += ` AND created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      text += ` AND created_at <= $${params.length}`;
    }

    text += ` GROUP BY decision`;

    const result = await query(text, params);
    return result.rows;
  }
};

// ============================================================================
// AUDIT TRAIL
// ============================================================================

const AuditTrail = {
  async log(auditData) {
    const {
      entityType,
      entityId,
      action,
      oldValues,
      newValues,
      userId,
      userRole,
      complianceFlags,
      ipAddress,
      sessionId,
      reason
    } = auditData;

    const text = `
      INSERT INTO audit_trail (
        entity_type, entity_id, action, old_values, new_values,
        user_id, user_role, compliance_flags, ip_address, session_id, reason
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, timestamp
    `;

    const params = [
      entityType, entityId, action,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      userId, userRole, complianceFlags, ipAddress, sessionId, reason
    ];

    const result = await query(text, params);
    return result.rows[0];
  },

  async get(entityType, entityId) {
    const text = `
      SELECT id, timestamp, entity_type, entity_id, action, old_values, new_values,
             user_id, user_role, compliance_flags, reason
      FROM audit_trail
      WHERE entity_type = $1 AND entity_id = $2
      ORDER BY timestamp DESC
    `;

    const result = await query(text, [entityType, entityId]);
    return result.rows;
  },

  async getRecent(limit = 100) {
    const text = `
      SELECT id, timestamp, entity_type, entity_id, action, user_id, user_role, reason,
             old_values, new_values, compliance_flags
      FROM audit_trail
      ORDER BY timestamp DESC
      LIMIT $1
    `;

    const result = await query(text, [limit]);
    return result.rows;
  },

  async clearAll() {
    const text = `DELETE FROM audit_trail`;
    const result = await query(text);
    return result.rowCount;
  }
};

// ============================================================================
// CONFIGURATION
// ============================================================================

const Config = {
  async get(key) {
    // Try cache first
    let value = await cache.configCache.get(key);
    if (value !== null) {
      return value;
    }

    // Query database
    const text = `
      SELECT value, data_type FROM config WHERE key = $1
    `;

    const result = await query(text, [key]);
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    let parsedValue = row.value;

    // Parse based on data type
    if (row.data_type === 'integer') {
      parsedValue = parseInt(row.value);
    } else if (row.data_type === 'float') {
      parsedValue = parseFloat(row.value);
    } else if (row.data_type === 'boolean') {
      parsedValue = row.value === 'true';
    } else if (row.data_type === 'json') {
      parsedValue = JSON.parse(row.value);
    }

    // Cache for 1 hour
    await cache.configCache.set(key, parsedValue, 3600);
    return parsedValue;
  },

  async set(key, value, userId) {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    const text = `
      INSERT INTO config (key, value, updated_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (key) DO UPDATE SET value = $2, updated_by = $3
      RETURNING key, value
    `;

    const result = await query(text, [key, stringValue, userId]);
    
    // Invalidate cache
    await cache.configCache.invalidate(key);
    
    return result.rows[0];
  },

  async getAll() {
    const text = `SELECT key, value, data_type FROM config ORDER BY key`;
    const result = await query(text);
    
    const config = {};
    for (const row of result.rows) {
      let value = row.value;
      if (row.data_type === 'integer') value = parseInt(row.value);
      else if (row.data_type === 'float') value = parseFloat(row.value);
      else if (row.data_type === 'boolean') value = row.value === 'true';
      else if (row.data_type === 'json') value = JSON.parse(row.value);
      
      config[row.key] = value;
    }
    
    return config;
  }
};

// ============================================================================
// FAIRNESS METRICS
// ============================================================================

const FairnessMetrics = {
  async record(metricsData) {
    const {
      demographicGroup,
      subgroupValue,
      totalApplications,
      approvedApplications,
      averagePd,
      averageRiskBand,
      disparateImpactRatio,
      compliant,
      flagged
    } = metricsData;

    const text = `
      INSERT INTO fairness_metrics (
        demographic_group, subgroup_value, total_applications,
        approved_applications, approval_rate, average_probability_of_default,
        average_risk_band, disparate_impact_ratio, compliant, flagged
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, calculation_date
    `;

    const approvalRate = totalApplications > 0 ? approvedApplications / totalApplications : 0;

    const params = [
      demographicGroup, subgroupValue, totalApplications,
      approvedApplications, approvalRate, averagePd,
      averageRiskBand, disparateImpactRatio, compliant, flagged
    ];

    const result = await query(text, params);
    return result.rows[0];
  },

  async getFlaggedMetrics() {
    const text = `
      SELECT id, demographic_group, subgroup_value, approval_rate,
             disparate_impact_ratio, calculation_date
      FROM fairness_metrics
      WHERE flagged = true
      ORDER BY calculation_date DESC
    `;

    const result = await query(text);
    return result.rows;
  }
};

// ============================================================================
// MODEL PERFORMANCE
// ============================================================================

const ModelPerformance = {
  async record(performanceData) {
    const {
      modelVersion,
      auc,
      gini,
      ksStatistic,
      precision,
      recall,
      f1Score,
      liftAt10,
      liftAt30,
      psi,
      psiWarning,
      actualDefaultRate,
      predictedDefaultRate,
      calibrationError,
      predictionsCount
    } = performanceData;

    const text = `
      INSERT INTO model_performance (
        model_version, auc, gini, ks_statistic, precision, recall,
        f1_score, lift_at_10, lift_at_30, psi, psi_warning,
        actual_default_rate, predicted_default_rate, calibration_error,
        predictions_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, timestamp
    `;

    const params = [
      modelVersion, auc, gini, ksStatistic, precision, recall,
      f1Score, liftAt10, liftAt30, psi, psiWarning,
      actualDefaultRate, predictedDefaultRate, calibrationError, predictionsCount
    ];

    const result = await query(text, params);
    return result.rows[0];
  },

  async getLatestByModel(modelVersion) {
    const text = `
      SELECT * FROM model_performance
      WHERE model_version = $1
      ORDER BY timestamp DESC
      LIMIT 1
    `;

    const result = await query(text, [modelVersion]);
    return result.rows[0] || null;
  }
};

// ============================================================================
// FEATURE STATISTICS
// ============================================================================

const FeatureStatistics = {
  async update(featureName, stats) {
    const {
      trainingMean, trainingStd, trainingMin, trainingMax,
      trainingP25, trainingP50, trainingP75,
      productionMean, productionStd, productionMin, productionMax,
      productionP25, productionP50, productionP75,
      psi, driftDetected
    } = stats;

    const text = `
      INSERT INTO feature_statistics (
        feature_name, training_mean, training_std, training_min, training_max,
        training_p25, training_p50, training_p75,
        production_mean, production_std, production_min, production_max,
        production_p25, production_p50, production_p75, psi, drift_detected
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (feature_name) DO UPDATE SET
        production_mean = $9, production_std = $10, production_min = $11,
        production_max = $12, production_p25 = $13, production_p50 = $14,
        production_p75 = $15, psi = $16, drift_detected = $17,
        last_updated = CURRENT_TIMESTAMP
      RETURNING feature_name, drift_detected
    `;

    const params = [
      featureName,
      trainingMean, trainingStd, trainingMin, trainingMax,
      trainingP25, trainingP50, trainingP75,
      productionMean, productionStd, productionMin, productionMax,
      productionP25, productionP50, productionP75, psi, driftDetected
    ];

    const result = await query(text, params);
    return result.rows[0];
  },

  async getAll() {
    const text = `SELECT * FROM feature_statistics ORDER BY feature_name`;
    const result = await query(text);
    return result.rows;
  },

  async getDriftedFeatures() {
    const text = `SELECT * FROM feature_statistics WHERE drift_detected = true`;
    const result = await query(text);
    return result.rows;
  }
};

module.exports = {
  Users,
  Applications,
  CreditDecisions,
  AuditTrail,
  Config,
  FairnessMetrics,
  ModelPerformance,
  FeatureStatistics
};
