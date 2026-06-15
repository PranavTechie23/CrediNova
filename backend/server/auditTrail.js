const { AuditTrail } = require('./models');

async function logDecision(
  entityId,
  input,
  response,
  modelVersion = 'v2.1.0-alpha',
  userId = null,
  userRole = 'system',
  ipAddress = null,
  sessionId = null
) {
  const newValues = {
    decision: response.decision,
    risk_band: response.risk_band ?? response.risk_tier ?? 'Unknown',
    risk_score: response.risk_score ?? 0,
    probability_of_default: response.probability_of_default ?? 0,
    recommended_interest_rate: response.recommended_interest_rate,
    confidence_score: response.confidence_score,
    top_features: response.top_features ?? [],
    business_impact: response.business_impact ?? {},
    explanation_summary: response.explanation_summary,
    model_version: modelVersion,
    input_features: { ...input }
  };

  const auditEntry = await AuditTrail.log({
    entityType: 'decision',
    entityId,
    action: 'create',
    oldValues: null,
    newValues,
    userId,
    userRole,
    complianceFlags: ['PCI-DSS', 'GDPR'],
    ipAddress,
    sessionId,
    reason: 'Credit decision recorded'
  });

  return {
    id: entityId,
    timestamp: auditEntry.timestamp,
    ...newValues,
    audit_id: auditEntry.id
  };
}

async function getAuditTrail() {
  const rows = await AuditTrail.getRecent(500);
  return rows.map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    action: row.action,
    user_id: row.user_id,
    user_role: row.user_role,
    compliance_flags: row.compliance_flags,
    reason: row.reason,
    old_values: row.old_values && typeof row.old_values === 'string' ? JSON.parse(row.old_values) : row.old_values,
    new_values: row.new_values && typeof row.new_values === 'string' ? JSON.parse(row.new_values) : row.new_values,
  }));
}

async function clearAuditTrail() {
  return AuditTrail.clearAll();
}

module.exports = {
  logDecision,
  getAuditTrail,
  clearAuditTrail,
};
