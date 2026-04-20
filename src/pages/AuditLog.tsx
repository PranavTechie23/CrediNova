/**
 * Audit Log - Barclays FCA/PRA Model Risk Management compliant
 * Full traceability: timestamp, input, model version, decision
 */

import { useState } from "react";
import { FileText, Clock, Shield, Trash2 } from "lucide-react";
import { getAuditTrail, clearAuditTrail, type AuditEntry } from "@/services/auditTrailService";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>(() => getAuditTrail());

  const handleClear = () => {
    if (confirm("Clear all audit entries? This action cannot be undone.")) {
      clearAuditTrail();
      setEntries([]);
    }
  };

  return (
    <div className="space-y-6 font-['Sora']">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent tracking-tight mb-4 leading-tight max-w-4xl">
            Full traceability of every credit decision, features and outcomes logged.
          </p>
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
            <h1 className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Audit Trail</h1>
          </div>
        </div>
        {entries.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear} className="gap-2 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            Clear Log
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {entries.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-semibold">No audit entries yet</p>
            <p className="text-sm mt-1">Run single or bulk credit assessments to populate the audit trail.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Timestamp</TableHead>
                  <TableHead className="w-[70px]">Type</TableHead>
                  <TableHead>Model Version</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>PD %</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(e.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${e.type === "single"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-purple-500/10 text-purple-600"
                        }`}>
                        {e.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{e.model_version}</TableCell>
                    <TableCell>
                      <span className={`text-sm font-semibold ${e.decision === "Approved" ? "text-green-600" :
                          e.decision === "Rejected" ? "text-red-600" : "text-amber-600"
                        }`}>
                        {e.decision}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{e.risk_band}</TableCell>
                    <TableCell className="font-mono text-sm">{(e.probability_of_default * 100).toFixed(1)}%</TableCell>
                    <TableCell className="font-mono text-sm font-semibold">{e.risk_score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground mb-2">Governance compliance</p>
        <p>Every decision is logged with non-PII input features, model version, and outcome. Supports FCA SYSC 11, PRA model risk management, and GDPR Art 5 (data minimization). PII is never stored in the audit trail.</p>
      </div>
    </div>
  );
}
