import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Compliance() {
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRatio(0.92);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const percentage = (ratio / 1.0) * 100;
  const strokeDasharray = `${percentage}, 100`;

  const incomeData = [
    { segment: 'Low Income', approved: 68, rejected: 22, review: 10 },
    { segment: 'Mid Income', approved: 72, rejected: 18, review: 10 },
    { segment: 'High Income', approved: 75, rejected: 15, review: 10 },
  ];

  return (
    <div className="min-h-screen p-8 text-text-primary animate-fade-in font-body bg-gradient-to-br from-background via-background to-surface-2">
      <div className="max-w-[1200px] mx-auto space-y-10">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h1 className="text-4xl font-bold font-sora">Regulatory Compliance Dashboard</h1>
          <p className="text-lg text-text-muted">Real-time monitoring of ECOA, FHA, FCRA, and Equal Credit Opportunity Act compliance metrics.</p>
        </motion.div>
        
        {/* Compliance Status Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`p-8 border rounded-2xl flex items-center justify-between backdrop-blur-sm ${ratio >= 0.8 ? 'bg-gradient-to-r from-success/10 to-success/5 border-success/30 shadow-lg shadow-success/10' : 'bg-gradient-to-r from-danger/10 to-danger/5 border-danger/30 shadow-lg shadow-danger/10'}`}>
          <div className="flex items-center gap-4">
            {ratio >= 0.8 ? (
              <ShieldCheck className="w-10 h-10 text-success animate-pulse" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-danger animate-pulse" />
            )}
            <div>
              <h2 className={`font-sora font-bold text-2xl ${ratio >= 0.8 ? 'text-success' : 'text-danger'}`}>
                {ratio >= 0.8 ? '✓ COMPLIANT — 80% Rule Satisfied' : '⚠ WARNING — Disparate Impact Detected'}
              </h2>
              <p className="text-sm mt-1 text-text-muted">Real-time fairness monitoring across protected classes.</p>
            </div>
          </div>
        </motion.div>

        {/* Top Row: Gauge + Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface border border-border rounded-xl p-8 flex flex-col items-center justify-center relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
             <h3 className="font-sora font-semibold mb-6">Disparate Impact Ratio</h3>
             <div className="w-48 h-48 relative">
               <svg viewBox="0 0 36 36" className="w-full h-full">
                 <path
                   className="text-surface-2"
                   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                   fill="none"
                   stroke="currentColor"
                   strokeWidth="3"
                   strokeDasharray="100, 100"
                 />
                 <motion.path
                   className={ratio >= 0.8 ? 'text-primary' : 'text-danger'}
                   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                   fill="none"
                   stroke="currentColor"
                   strokeWidth="3"
                   initial={{ strokeDasharray: '0, 100' }}
                   animate={{ strokeDasharray: strokeDasharray }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                 />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-5xl font-bold font-mono text-text-primary">{ratio.toFixed(2)}</span>
               </div>
             </div>
             <div className="mt-6 flex flex-col items-center w-full px-8">
               <div className="w-full h-1 bg-surface-2 relative rounded-full">
                 <div className="absolute left-[80%] -top-2 bottom-0 w-0.5 h-5 bg-danger"></div>
                 <div className="absolute left-[80%] -top-6 text-[10px] font-mono text-danger -translate-x-1/2">0.8 Threshold</div>
               </div>
             </div>
          </div>

          <div className="bg-surface-2 border border-border rounded-xl p-8">
            <h3 className="font-sora font-semibold text-lg mb-4">How we measure fairness</h3>
            <p className="text-sm text-text-muted leading-relaxed mb-6">
              The Disparate Impact Ratio compares the approval rate of a protected class to the approval rate of the highest-approved class. By federal guidelines (ECOA), this ratio must be greater than 0.8 (80%) to be considered fair and non-discriminatory.
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-surface border border-border rounded-lg flex justify-between items-center">
                <span className="text-sm font-semibold">Highest Approval Rate (Mid Income)</span>
                <span className="font-mono text-primary">72.4%</span>
              </div>
              <div className="p-4 bg-surface border border-border rounded-lg flex justify-between items-center">
                <span className="text-sm font-semibold">Lowest Approval Rate (Low Income)</span>
                <span className="font-mono text-primary">68.1%</span>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex justify-between items-center">
                <span className="text-sm font-semibold">Current Ratio (68.1 / 72.4)</span>
                <span className="font-mono font-bold text-success">0.94</span>
              </div>
            </div>
          </div>
        </div>

        {/* Income Segments */}
        <div>
          <h3 className="font-sora font-semibold text-xl mb-6">Approval Breakdown by Segment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {incomeData.map((data, idx) => (
              <div key={idx} className="bg-surface border border-border rounded-xl p-6">
                <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">{data.segment}</h4>
                <div className="text-4xl font-mono font-bold mb-6">{data.approved}% <span className="text-sm font-body text-text-muted font-normal">Approval</span></div>
                
                <div className="h-4 flex rounded-sm overflow-hidden mb-4">
                  <div style={{ width: `${data.approved}%` }} className="bg-primary"></div>
                  <div style={{ width: `${data.review}%` }} className="bg-warning"></div>
                  <div style={{ width: `${data.rejected}%` }} className="bg-danger"></div>
                </div>

                <div className="flex justify-between text-xs font-mono text-text-muted">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary"></div> App: {data.approved}%</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-warning"></div> Rev: {data.review}%</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-danger"></div> Rej: {data.rejected}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Standards Table */}
        <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-sora font-semibold text-lg">Regulatory Framework Mapping</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Standard / Framework</th>
                <th className="px-6 py-4 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Monitored Metric</th>
                <th className="px-6 py-4 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'ECOA / 80% Rule', metric: 'Disparate Impact Ratio >= 0.8', status: 'Compliant' },
                { name: 'GDPR Article 25', metric: 'Data Minimization & Bias Checking', status: 'Compliant' },
                { name: 'EU AI Act', metric: 'High-Risk AI System Transparency', status: 'Compliant' },
                { name: 'FCA/PRA MRM', metric: 'Model Risk Management & Validation', status: 'Compliant' },
                { name: 'RBI Model Risk', metric: 'Alternative Data Governance', status: 'Compliant' },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-surface transition-colors">
                  <td className="px-6 py-4 font-semibold text-sm">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-text-muted">{row.metric}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-bold border border-success/20 w-fit">
                      <CheckCircle className="w-3 h-3" /> {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
