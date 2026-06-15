const { query } = require('./database');

function buildApplicationRecord(application) {
  return {
    id: application.id,
    date: application.submitted_at?.slice(0, 10) || application.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    amount: Number(application.loan_amount_requested) || 0,
    riskBand: application.risk_band || 'Unknown',
    risk_tier: application.risk_band || 'Unknown',
    risk_score: application.risk_score ?? 0,
    probability_score: application.probability_of_default ?? 0,
    decision: application.decision || application.status || 'Unknown',
    applicant: application.applicant_email || `Applicant ${application.id.slice(-6).toUpperCase()}`,
  };
}

async function getPastApplications() {
  const text = `
    SELECT
      a.id,
      a.applicant_email,
      a.monthly_income,
      a.loan_amount_requested,
      a.status,
      a.submitted_at,
      a.created_at,
      cd.probability_of_default,
      cd.risk_band,
      cd.risk_score,
      cd.decision
    FROM applications a
    LEFT JOIN LATERAL (
      SELECT probability_of_default, risk_band, risk_score, decision
      FROM credit_decisions
      WHERE application_id = a.id
      ORDER BY created_at DESC
      LIMIT 1
    ) cd ON true
    ORDER BY a.submitted_at DESC
    LIMIT 100
  `;

  const result = await query(text);
  return result.rows.map(buildApplicationRecord);
}

async function getApplicationById(id) {
  const text = `
    SELECT
      a.id,
      a.applicant_email,
      a.monthly_income,
      a.loan_amount_requested,
      a.status,
      a.submitted_at,
      a.created_at,
      cd.probability_of_default,
      cd.risk_band,
      cd.risk_score,
      cd.decision
    FROM applications a
    LEFT JOIN LATERAL (
      SELECT probability_of_default, risk_band, risk_score, decision
      FROM credit_decisions
      WHERE application_id = a.id
      ORDER BY created_at DESC
      LIMIT 1
    ) cd ON true
    WHERE a.id = $1
  `;

  const result = await query(text, [id]);
  if (result.rows.length === 0) {
    return null;
  }

  return buildApplicationRecord(result.rows[0]);
}

module.exports = {
  getPastApplications,
  getApplicationById,
};
