/**
 * Fairness & Bias Metrics Service - Barclays Fair Lending compliant
 * Disparate impact, approval rates by segment, statistical parity
 */

export interface BulkResultRow {
  request: { monthly_income: number };
  prediction: { decision: string; risk_band: string; probability_of_default: number };
}

export interface FairnessSegment {
  name: string;
  count: number;
  approved: number;
  rejected: number;
  manualReview: number;
  approvalRate: number;
}

export interface FairnessReport {
  totalApplicants: number;
  overallApprovalRate: number;
  segments: FairnessSegment[];
  disparateImpactRatio: number; // Protected/Reference group approval rate
  disparateImpactCompliant: boolean; // Typically >= 0.8 acceptable
  warning?: string;
}

function getIncomeSegment(monthlyIncome: number): string {
  if (monthlyIncome < 5000) return "Low (<$5k)";
  if (monthlyIncome < 15000) return "Mid ($5k–$15k)";
  return "High (>$15k)";
}

function isApproved(decision: string): boolean {
  return decision === "Approved" || decision === "Conditional Approval";
}

export function computeFairnessReport<
  T extends {
    request: { monthly_income: number };
    prediction: { decision: string; risk_band: string; probability_of_default: number };
  }
>(results: T[]): FairnessReport {
  const total = results.length;
  const approved = results.filter((r) => isApproved(r.prediction.decision)).length;
  const overallApprovalRate = total > 0 ? approved / total : 0;

  const segmentMap = new Map<string, { total: number; approved: number; rejected: number; manual: number }>();

  results.forEach(({ request, prediction }) => {
    const seg = getIncomeSegment(request.monthly_income ?? 0);
    const curr = segmentMap.get(seg) ?? { total: 0, approved: 0, rejected: 0, manual: 0 };
    curr.total += 1;
    if (isApproved(prediction.decision)) curr.approved += 1;
    else if (prediction.decision === "Rejected") curr.rejected += 1;
    else curr.manual += 1;
    segmentMap.set(seg, curr);
  });

  const segments: FairnessSegment[] = ["Low (<$5k)", "Mid ($5k–$15k)", "High (>$15k)"].map((name) => {
    const s = segmentMap.get(name) ?? { total: 0, approved: 0, rejected: 0, manual: 0 };
    return {
      name,
      count: s.total,
      approved: s.approved,
      rejected: s.rejected,
      manualReview: s.manual,
      approvalRate: s.total > 0 ? s.approved / s.total : 0,
    };
  });

  const lowSeg = segments.find((s) => s.name === "Low (<$5k)");
  const highSeg = segments.find((s) => s.name === "High (>$15k)");
  let disparateImpactRatio = 1;
  let warning: string | undefined;

  if (lowSeg && highSeg && lowSeg.count > 0 && highSeg.count > 0 && highSeg.approvalRate > 0) {
    disparateImpactRatio = lowSeg.approvalRate / highSeg.approvalRate;
    if (disparateImpactRatio < 0.8) {
      warning = "Disparate impact ratio below 0.8 — review for potential fair lending concerns.";
    }
  }

  return {
    totalApplicants: total,
    overallApprovalRate,
    segments,
    disparateImpactRatio,
    disparateImpactCompliant: disparateImpactRatio >= 0.8,
    warning,
  };
}
