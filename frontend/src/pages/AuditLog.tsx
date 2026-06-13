import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, Search, ChevronDown, CheckCircle, XCircle, AlertTriangle, FileCode2 } from 'lucide-react';
import { fetchAuditTrail, clearAuditTrail } from '@/services/backendApi';

type AuditEntry = {
  id: string;
  timestamp: string;
  type: string;
  input_features: Record<string, unknown>;
  model_version: string;
  decision: string;
  risk_band: string;
  risk_score: number;
  probability_of_default: number;
  top_features: Array<{ feature: string; impact: number }>;
};

export default function AuditLog() {
  const [auditData, setAuditData] = useState<AuditEntry[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAuditTrail = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAuditTrail();
      setAuditData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error)?.message || 'Unable to load audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditTrail();
  }, []);

  const handleClear = async () => {
    if (!window.confirm('Clear all audit records? This cannot be undone.')) {
      return;
    }

    try {
      await clearAuditTrail();
      setAuditData([]);
      setExpandedRow(null);
    } catch (err) {
      setError((err as Error)?.message || 'Unable to clear audit log.');
    }
  };

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'Low': return 'bg-primary/10 text-primary border-primary/20';
      case 'Medium': return 'bg-accent/10 text-accent border-accent/20';
      case 'High': return 'bg-warning/10 text-warning border-warning/20';
      case 'Critical': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-surface-2 text-text-muted';
    }
  };

  const getDecisionBadge = (decision: string) => {
    switch(decision) {
      case 'Approved': return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-success/10 text-success text-[10px] font-bold border border-success/20 uppercase"><CheckCircle className="w-3 h-3"/> {decision}</span>;
      case 'Rejected': return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-danger/10 text-danger text-[10px] font-bold border border-danger/20 uppercase"><XCircle className="w-3 h-3"/> {decision}</span>;
      case 'Conditional': return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-bold border border-accent/20 uppercase"><AlertTriangle className="w-3 h-3"/> {decision}</span>;
      default: return <span>{decision}</span>;
    }
  };

  return (
    <div className="min-h-screen p-8 text-text-primary animate-fade-in font-body bg-gradient-to-br from-background via-background to-surface-2">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h1 className="text-4xl font-bold font-sora">Immutable Decision Log</h1>
          <p className="text-lg text-text-muted">FCA/PRA-compliant audit trail of all model inferences with full transparency and accountability.</p>
        </motion.div>
        
        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg hover:border-primary/50 transition-all text-sm font-semibold text-primary shadow-lg shadow-primary/10">
              <Download className="w-4 h-4 text-primary" /> Export as JSON
            </button>
            <button type="button" onClick={handleClear} className="flex items-center gap-2 px-4 py-2 bg-danger/10 border border-danger/20 rounded-lg text-danger hover:bg-danger/20 transition-colors text-sm font-semibold">
              <Trash2 className="w-4 h-4" /> Clear Log
            </button>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" placeholder="Search by Audit ID..." className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-semibold hover:border-primary/50 transition-colors">
            Decision Type <ChevronDown className="w-4 h-4 text-text-muted" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-semibold hover:border-primary/50 transition-colors">
            Risk Tier <ChevronDown className="w-4 h-4 text-text-muted" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-semibold hover:border-primary/50 transition-colors">
            Date Range <ChevronDown className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Table */}
        <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/50 border-b border-border">
                  <th className="px-6 py-4 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Audit ID</th>
                  <th className="px-6 py-4 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Risk Score</th>
                  <th className="px-6 py-4 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Tier</th>
                  <th className="px-6 py-4 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Decision</th>
                  <th className="px-6 py-4 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">PD%</th>
                  <th className="px-6 py-4 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Top Feature</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-text-muted">Loading audit trail...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-danger">{error}</td>
                  </tr>
                ) : auditData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-text-muted">No audit entries available.</td>
                  </tr>
                ) : (
                  auditData.map((row) => (
                    <React.Fragment key={row.id}>
                      <tr 
                        onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                        className="border-b border-border/50 hover:bg-primary/5 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 font-mono text-sm text-primary">{row.id}</td>
                        <td className="px-6 py-4 font-mono text-sm text-text-muted">{row.timestamp.replace('T', ' ').slice(0, 19)}</td>
                        <td className="px-6 py-4 text-sm">{row.type}</td>
                        <td className="px-6 py-4 font-mono text-sm">{row.risk_score}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getTierColor(row.risk_band)}`}>
                            {row.risk_band}
                          </span>
                        </td>
                        <td className="px-6 py-4">{getDecisionBadge(row.decision)}</td>
                        <td className="px-6 py-4 font-mono text-sm">{(row.probability_of_default * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4 font-mono text-xs text-text-muted">{row.top_features[0]?.feature || '-'}</td>
                      </tr>
                      <AnimatePresence>
                        {expandedRow === row.id && (
                          <tr>
                            <td colSpan={8} className="p-0 border-b border-border/50">
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: 'auto', opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-[#080C14] overflow-hidden"
                              >
                                <div className="p-6">
                                  <div className="flex items-center gap-2 mb-4 text-sm text-primary font-mono border-b border-border pb-2">
                                    <FileCode2 className="w-4 h-4" /> JSON Payload Export
                                  </div>
                                  <pre className="text-xs font-mono text-text-muted overflow-x-auto custom-scrollbar">
{JSON.stringify({
  audit_id: row.id,
  timestamp: row.timestamp,
  model_version: row.model_version,
  decision_type: row.type,
  inputs: row.input_features,
  outputs: {
    score: row.risk_score,
    tier: row.risk_band,
    pd_percent: Number((row.probability_of_default * 100).toFixed(1)),
    decision: row.decision,
  },
  explainability: {
    top_positive: row.top_features[0]?.feature,
    shap_values: row.top_features,
  },
}, null, 2)}
                                  </pre>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border bg-surface text-center">
            <span className="text-xs font-mono text-text-muted">Max 500 entries — oldest pruned automatically</span>
          </div>
        </div>

      </div>
    </div>
  );
}
