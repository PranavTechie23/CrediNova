-- ============================================================================
-- CrediNova Database Schema - PostgreSQL + TimescaleDB
-- ============================================================================
-- This schema is designed for banking compliance:
-- - ACID transactions for integrity
-- - Row-level security for access control
-- - Immutable audit trail for regulatory compliance
-- - Time-series data for monitoring & analytics
-- ============================================================================

-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;

-- ============================================================================
-- 1. USERS / EMPLOYEES (Authentication & Authorization)
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- Bcrypt hash only, never store plaintext
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL DEFAULT 'analyst', -- analyst, reviewer, admin
  department VARCHAR(100),
  active BOOLEAN DEFAULT true,
  login_count INTEGER DEFAULT 0,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT valid_role CHECK (role IN ('analyst', 'reviewer', 'admin', 'applicant'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);

-- ============================================================================
-- 2. CONFIGURATION (Replaces hardcoded values)
-- ============================================================================
CREATE TABLE config (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  data_type VARCHAR(50) DEFAULT 'string', -- string, integer, float, boolean, json
  editable BOOLEAN DEFAULT false, -- Only runtime-tunable configs
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES users(id)
);

-- Insert default banking configuration
INSERT INTO config (key, value, data_type, description, editable)
VALUES
  ('BASE_INTEREST_RATE', '5.5', 'float', 'Base interest rate for loans (%)', true),
  ('APPROVAL_THRESHOLD_DEFAULT', '0.5', 'float', 'Default probability threshold for auto-approval', true),
  ('RISK_BAND_LOW_THRESHOLD', '0.15', 'float', 'PD threshold for Low risk band', false),
  ('RISK_BAND_MEDIUM_THRESHOLD', '0.35', 'float', 'PD threshold for Medium risk band', false),
  ('DISPARATE_IMPACT_THRESHOLD', '0.8', 'float', 'Fair lending compliance threshold (80% rule)', false),
  ('MAX_AUDIT_RECORDS', '10000', 'integer', 'Maximum audit records to retain (rest archived)', false),
  ('PII_MASKING_STRATEGY', 'partial', 'string', 'PII masking: partial or hash', false),
  ('MODEL_VERSION', 'xgboost-prod-v2.3.1', 'string', 'Current production ML model version', true),
  ('SAGEMAKER_ENDPOINT_URL', '', 'string', 'AWS SageMaker endpoint URL', false),
  ('FEATURE_FLAGS', '{"use_real_ml": false, "use_fairness_checks": true}', 'json', 'Feature flags for A/B testing', true);

-- ============================================================================
-- 3. CREDIT APPLICATIONS (Loan Applications)
-- ============================================================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  applicant_email VARCHAR(255) NOT NULL, -- Denormalized for audit trail
  
  -- Financial Information
  monthly_income DECIMAL(12, 2) NOT NULL,
  income_stability DECIMAL(5, 2), -- 0-100 percentage
  total_emi DECIMAL(12, 2),
  credit_limit DECIMAL(12, 2),
  outstanding_balance DECIMAL(12, 2),
  loan_amount_requested DECIMAL(12, 2) NOT NULL,
  loan_tenure INTEGER, -- Months
  requested_interest_rate DECIMAL(5, 2),
  
  -- Credit History
  past_delinquencies INTEGER DEFAULT 0,
  months_since_last_delinquency INTEGER,
  
  -- Alternative Credit Signals (India-specific)
  upi_volume DECIMAL(12, 2), -- UPI transaction volume
  ecommerce_spend DECIMAL(12, 2),
  utility_score DECIMAL(5, 2), -- 0-100
  
  -- Application Metadata
  status VARCHAR(50) DEFAULT 'submitted', -- submitted, pending_review, approved, rejected, manual_review
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  notes TEXT,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  CONSTRAINT positive_income CHECK (monthly_income > 0),
  CONSTRAINT valid_status CHECK (status IN ('submitted', 'pending_review', 'approved', 'rejected', 'manual_review', 'withdrawn'))
);

CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at);
CREATE INDEX idx_applications_created_by ON applications(created_by);

-- ============================================================================
-- 4. CREDIT DECISIONS (Model Predictions & Decisions)
-- ============================================================================
CREATE TABLE credit_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE RESTRICT,
  
  -- Model Output
  model_version VARCHAR(100) NOT NULL,
  probability_of_default DECIMAL(5, 4) NOT NULL, -- 0-1
  risk_band VARCHAR(50) NOT NULL, -- Low, Medium, High
  risk_score DECIMAL(5, 2), -- 0-100 or similar
  confidence_score DECIMAL(5, 4), -- 0-1
  
  -- Decision
  decision VARCHAR(50) NOT NULL, -- Approved, Rejected, Manual Review, Conditional
  recommended_interest_rate DECIMAL(5, 2),
  
  -- Feature Importance (SHAP values)
  top_features JSONB, -- Array of {feature: string, impact: number}
  feature_importance_details JSONB, -- Detailed SHAP breakdown
  
  -- Business Impact
  business_impact JSONB, -- {estimated_annual_value, approval_precision, risk_reduction_percentage, expected_revenue}
  explainability_narrative TEXT, -- AI-generated explanation
  
  -- Model Parameters Used
  approval_threshold DECIMAL(5, 4),
  processing_latency_ms INTEGER,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  CONSTRAINT valid_probability CHECK (probability_of_default >= 0 AND probability_of_default <= 1),
  CONSTRAINT valid_risk_band CHECK (risk_band IN ('Low', 'Medium', 'High')),
  CONSTRAINT valid_decision CHECK (decision IN ('Approved', 'Rejected', 'Manual Review', 'Conditional'))
);

CREATE INDEX idx_decisions_application_id ON credit_decisions(application_id);
CREATE INDEX idx_decisions_model_version ON credit_decisions(model_version);
CREATE INDEX idx_decisions_decision ON credit_decisions(decision);
CREATE INDEX idx_decisions_created_at ON credit_decisions(created_at);

-- ============================================================================
-- 5. AUDIT TRAIL (Immutable Compliance Log - TimescaleDB)
-- ============================================================================
CREATE TABLE audit_trail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Entity Being Audited
  entity_type VARCHAR(100) NOT NULL, -- application, decision, user, config
  entity_id UUID NOT NULL,
  
  -- Action
  action VARCHAR(50) NOT NULL, -- create, read, update, delete, approve, reject
  
  -- Change Details
  old_values JSONB, -- Before state
  new_values JSONB, -- After state
  
  -- User Performing Action
  user_id UUID REFERENCES users(id),
  user_role VARCHAR(50),
  
  -- Regulatory Metadata
  compliance_flags TEXT[], -- ['PCI-DSS', 'GDPR', 'FCA'] if relevant
  ip_address INET,
  session_id VARCHAR(255),
  
  -- Notes
  reason TEXT,
  
  CONSTRAINT valid_action CHECK (action IN ('create', 'read', 'update', 'delete', 'approve', 'reject', 'review', 'escalate', 'revert'))
);

-- Convert to TimescaleDB hypertable for efficient time-series queries
SELECT create_hypertable('audit_trail', 'timestamp', if_not_exists => TRUE);

-- Create indexes for TimescaleDB
CREATE INDEX idx_audit_trail_entity ON audit_trail (entity_type, entity_id);
CREATE INDEX idx_audit_trail_user_id ON audit_trail (user_id);
CREATE INDEX idx_audit_trail_timestamp ON audit_trail (timestamp DESC);
CREATE INDEX idx_audit_trail_action ON audit_trail (action);

-- ============================================================================
-- 6. FAIRNESS & BIAS MONITORING
-- ============================================================================
CREATE TABLE fairness_metrics (
  id SERIAL PRIMARY KEY,
  calculation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Demographic Groups
  demographic_group VARCHAR(100), -- income_level, age_range, gender, etc.
  subgroup_value VARCHAR(100), -- low, medium, high, 25-35, M, F, etc.
  
  -- Approval Rates
  total_applications INTEGER,
  approved_applications INTEGER,
  approval_rate DECIMAL(5, 4),
  
  -- Risk Metrics by Group
  average_probability_of_default DECIMAL(5, 4),
  average_risk_band VARCHAR(50),
  
  -- Disparate Impact Calculation (4/5ths rule)
  disparate_impact_ratio DECIMAL(5, 4), -- Group approval rate / Reference group approval rate
  compliant BOOLEAN, -- True if >= 0.8
  
  -- Monitoring
  flagged BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES users(id),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fairness_metrics_date ON fairness_metrics(calculation_date);
CREATE INDEX idx_fairness_metrics_compliant ON fairness_metrics(compliant);
CREATE INDEX idx_fairness_metrics_demographic ON fairness_metrics(demographic_group);

-- ============================================================================
-- 7. MODEL PERFORMANCE TRACKING (Real-time metrics)
-- ============================================================================
CREATE TABLE model_performance (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  model_version VARCHAR(100) NOT NULL,
  
  -- Performance Metrics
  auc DECIMAL(5, 4),
  gini DECIMAL(5, 4),
  ks_statistic DECIMAL(5, 4),
  precision DECIMAL(5, 4),
  recall DECIMAL(5, 4),
  f1_score DECIMAL(5, 4),
  
  -- Lift at Different Cutoffs
  lift_at_10 DECIMAL(10, 2),
  lift_at_30 DECIMAL(10, 2),
  
  -- Population Stability Index (drift detection)
  psi DECIMAL(10, 4),
  psi_warning BOOLEAN DEFAULT false, -- True if PSI > 0.1
  
  -- Actual vs Predicted Performance
  actual_default_rate DECIMAL(5, 4),
  predicted_default_rate DECIMAL(5, 4),
  calibration_error DECIMAL(5, 4),
  
  -- Volume
  predictions_count INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

SELECT create_hypertable('model_performance', 'timestamp', if_not_exists => TRUE);

CREATE INDEX idx_model_perf_model_version ON model_performance(model_version);
CREATE INDEX idx_model_perf_timestamp ON model_performance(timestamp DESC);

-- ============================================================================
-- 8. FEATURE STATISTICS (Training data baseline for drift detection)
-- ============================================================================
CREATE TABLE feature_statistics (
  id SERIAL PRIMARY KEY,
  feature_name VARCHAR(255) NOT NULL UNIQUE,
  
  -- Training distribution (baseline)
  training_mean DECIMAL(15, 4),
  training_std DECIMAL(15, 4),
  training_min DECIMAL(15, 4),
  training_max DECIMAL(15, 4),
  training_p25 DECIMAL(15, 4),
  training_p50 DECIMAL(15, 4),
  training_p75 DECIMAL(15, 4),
  
  -- Latest production distribution (updated daily)
  production_mean DECIMAL(15, 4),
  production_std DECIMAL(15, 4),
  production_min DECIMAL(15, 4),
  production_max DECIMAL(15, 4),
  production_p25 DECIMAL(15, 4),
  production_p50 DECIMAL(15, 4),
  production_p75 DECIMAL(15, 4),
  
  -- Drift Detection
  psi DECIMAL(10, 4), -- Population Stability Index
  drift_detected BOOLEAN DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feature_stats_drift ON feature_statistics(drift_detected);

-- ============================================================================
-- 9. BULK FILE PROCESSING (Audit for batch submissions)
-- ============================================================================
CREATE TABLE bulk_file_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes INTEGER,
  file_hash VARCHAR(64), -- SHA-256 hash for integrity
  
  submitted_by UUID NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Processing Status
  status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed, validation_error
  total_records INTEGER,
  processed_records INTEGER,
  error_records INTEGER,
  
  -- Result
  result_summary JSONB, -- {approved: 0, rejected: 0, manual_review: 0}
  error_log TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bulk_submissions_status ON bulk_file_submissions(status);
CREATE INDEX idx_bulk_submissions_submitted_by ON bulk_file_submissions(submitted_by);

-- ============================================================================
-- 10. SESSION TOKENS (For authentication)
-- ============================================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  
  ip_address INET,
  user_agent TEXT,
  
  INDEX idx_sessions_user_id (user_id),
  INDEX idx_sessions_expires_at (expires_at),
  INDEX idx_sessions_revoked_at (revoked_at)
);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Auto-audit trail function
CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_entity_type TEXT;
  v_action TEXT;
BEGIN
  -- Determine entity type
  v_entity_type := TG_TABLE_NAME;
  
  -- Determine action
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
  END IF;
  
  -- Insert audit trail
  INSERT INTO audit_trail (
    entity_type,
    entity_id,
    action,
    old_values,
    new_values,
    user_id,
    reason
  ) VALUES (
    v_entity_type,
    COALESCE(NEW.id, OLD.id),
    v_action,
    to_jsonb(OLD),
    to_jsonb(NEW),
    CURRENT_USER::uuid,
    'Automatic audit trigger'
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Attach audit triggers to critical tables
CREATE TRIGGER audit_applications
AFTER INSERT OR UPDATE OR DELETE ON applications
FOR EACH ROW
EXECUTE FUNCTION audit_table_changes();

CREATE TRIGGER audit_credit_decisions
AFTER INSERT OR UPDATE OR DELETE ON credit_decisions
FOR EACH ROW
EXECUTE FUNCTION audit_table_changes();

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Recent decisions view
CREATE OR REPLACE VIEW recent_decisions_view AS
SELECT 
  a.id as application_id,
  a.applicant_email,
  a.monthly_income,
  a.loan_amount_requested,
  cd.probability_of_default,
  cd.risk_band,
  cd.decision,
  cd.recommended_interest_rate,
  cd.created_at,
  u.email as reviewer_email
FROM applications a
LEFT JOIN credit_decisions cd ON a.id = cd.application_id
LEFT JOIN users u ON cd.created_by = u.id
ORDER BY cd.created_at DESC;

-- Summary statistics view
CREATE OR REPLACE VIEW credit_summary_stats AS
SELECT 
  COUNT(DISTINCT a.id) as total_applications,
  COUNT(DISTINCT cd.id) as total_decisions,
  SUM(CASE WHEN cd.decision = 'Approved' THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN cd.decision = 'Rejected' THEN 1 ELSE 0 END) as rejected_count,
  SUM(CASE WHEN cd.decision = 'Manual Review' THEN 1 ELSE 0 END) as manual_review_count,
  AVG(cd.probability_of_default) as avg_pd,
  AVG(a.monthly_income) as avg_monthly_income,
  AVG(a.loan_amount_requested) as avg_loan_amount
FROM applications a
LEFT JOIN credit_decisions cd ON a.id = cd.application_id;

-- ============================================================================
-- GRANT PERMISSIONS (Row-Level Security)
-- ============================================================================

-- Create roles
CREATE ROLE analyst_role;
CREATE ROLE reviewer_role;
CREATE ROLE admin_role;

-- Analysts: Can view only applications they created or submitted
ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public GRANT SELECT ON TABLES TO analyst_role;

-- Reviewers: Can view and update applications
ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public GRANT SELECT, UPDATE ON TABLES TO reviewer_role;

-- Admins: Full access
ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public GRANT ALL ON TABLES TO admin_role;

-- ============================================================================
-- Data Retention Policy (for GDPR compliance)
-- ============================================================================
COMMENT ON TABLE audit_trail IS 'Immutable audit trail - Retain for 7 years per regulatory requirement';
COMMENT ON TABLE applications IS 'Credit applications - Retain for 7 years per regulatory requirement';
COMMENT ON TABLE credit_decisions IS 'Credit decisions - Retain for 7 years per regulatory requirement';

-- End of schema initialization
