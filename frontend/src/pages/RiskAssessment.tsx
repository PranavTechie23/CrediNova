import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Clock, ChevronRight, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link, useLocation } from 'react-router-dom';
import type { CreditResponse } from '@/types';

const riskDrivers = [
  { name: 'Recent Inquiries', value: 0.12 },
  { name: 'Credit Utilization', value: 0.08 },
  { name: 'DTI Ratio', value: 0.05 },
  { name: 'Utility Delinquency', value: 0.03 },
  { name: 'Age of Accounts', value: 0.02 },
];

const protectiveFactors = [
  { name: 'UPI Volume (Avg)', value: -0.15 },
  { name: 'Income Stability', value: -0.09 },
  { name: 'E-commerce Spend', value: -0.06 },
  { name: 'Savings Balance', value: -0.04 },
  { name: 'Loan Tenure', value: -0.02 },
];

const AnimatedGauge = ({ value, max, label, color, format = (v: number) => v }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const percentage = (currentValue / max) * 100;
  const strokeDasharray = `${percentage}, 100`;

  return (
    <div className="flex flex-col items-center p-6 bg-surface border border-border rounded-xl shadow-md card-hover relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary-glow rounded-full blur-2xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="w-32 h-32 relative">
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
            className={color}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            initial={{ strokeDasharray: '0, 100' }}
            animate={{ strokeDasharray: strokeDasharray }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold font-mono">{format(value)}</span>
        </div>
      </div>
      <span className="mt-4 text-text-muted text-sm uppercase tracking-wider">{label}</span>
    </div>
  );
};

export default function RiskAssessment() {
  const location = useLocation();
  const [threshold, setThreshold] = useState(0.5);
  const [simExpanded, setSimExpanded] = useState(false);
  const [result, setResult] = useState<CreditResponse | null>(null);

  useEffect(() => {
    if (location.state && typeof location.state === 'object' && 'result' in location.state) {
      setResult((location.state as { result?: CreditResponse }).result ?? null);
    }
  }, [location.state]);

  const approvalRate = result ? Math.round(100 - result.probability_of_default * 100) : Math.round(100 - threshold * 100);
  const defaultRate = result ? Math.max(1.2, Math.round(result.probability_of_default * 1000) / 10) : Math.max(1.2, Math.round(threshold * 10 * 10) / 10);
  const revenue = result ? Math.round((result.risk_score / 900) * 1500) : Math.round(approvalRate * 1250);
  const decision = result?.decision || 'Approved';
  const decisionDisplay = decision === 'Approved' ? 'APPROVED' : decision === 'Rejected' ? 'REJECTED' : decision === 'Manual Review' ? 'MANUAL REVIEW' : 'CONDITIONAL';
  const statusClass = decision === 'Approved' ? 'text-success' : decision === 'Rejected' ? 'text-danger' : decision === 'Manual Review' ? 'text-warning' : 'text-accent';

  return (
    <div className="min-h-screen p-8 text-text-primary animate-fade-in bg-gradient-to-br from-background via-background to-surface-2">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h1 className="text-4xl font-bold font-sora text-text-primary">Risk Assessment Dashboard</h1>
          <p className="text-text-muted text-lg">Comprehensive analysis of default probability, risk drivers, and portfolio impact</p>
        </motion.div>
        {/* Header / Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="text-text-muted text-sm font-mono uppercase tracking-widest flex items-center gap-2">
            <span>Credit Engine</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary">Decision Result</span>
          </div>
          <div className="text-sm text-text-muted font-mono">
            App ID: <span className="text-text-primary">#APP-992-FX</span>
          </div>
        </div>

        {/* Hero Decision Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-16 bg-surface-2 border border-border rounded-2xl relative overflow-hidden shadow-glow-success"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[rgba(0,229,153,0.1)] to-transparent opacity-50"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border shadow-[0_0_30px_rgba(0,229,153,0.3)] animate-[pulse_3s_ease-in-out_infinite] ${decision === 'Approved' ? 'bg-[rgba(0,229,153,0.1)] border-success/30' : decision === 'Rejected' ? 'bg-[rgba(255,77,106,0.12)] border-danger/30' : 'bg-[rgba(255,184,0,0.12)] border-warning/30'}`}>
              {decision === 'Approved' ? (
                <CheckCircle className="w-12 h-12 text-success" />
              ) : decision === 'Rejected' ? (
                <XCircle className="w-12 h-12 text-danger" />
              ) : (
                <Clock className="w-12 h-12 text-warning" />
              )}
            </div>
            <h1 className={`text-5xl font-bold font-sora tracking-tight mb-3 ${statusClass}`}>{decisionDisplay}</h1>
            <p className="text-text-muted uppercase tracking-[0.2em] text-sm font-semibold">
              Confidence: <span className="text-text-primary">{result ? `${Math.round(result.confidence_score * 100)}%` : '94.2%'}</span>
            </p>
          </div>
        </motion.div>

        {/* 3-Column Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedGauge value={742} max={850} label="Risk Score" color="text-primary" />
          <AnimatedGauge value={3.8} max={20} label="Probability of Default" color="text-danger" format={(v) => `${v}%`} />
          <div className="flex flex-col items-center justify-center p-6 bg-surface border border-border rounded-xl shadow-md card-hover relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-[rgba(123,97,255,0.1)] rounded-full blur-2xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
             <div className="text-4xl font-bold font-mono text-accent mb-2">
            {result ? `${result.recommended_interest_rate.toFixed(1)}%` : '11.4%'}
            <span className="text-xl text-text-muted">p.a.</span>
          </div>
             <span className="mt-4 text-text-muted text-sm uppercase tracking-wider">Recommended Rate</span>
          </div>
        </div>

        {/* Two-column SHAP summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-xl p-6 flex flex-col">
            <h3 className="text-xl font-semibold font-sora mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              Risk Drivers
            </h3>
            <div className="flex-1 h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDrivers} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="rgb(var(--text-muted))" fontSize={12} width={120} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} itemStyle={{ color: 'rgb(var(--danger))', fontFamily: 'JetBrains Mono' }} />
                  <Bar dataKey="value" fill="#FF4D6A" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 flex flex-col">
            <h3 className="text-xl font-semibold font-sora mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Protective Factors
            </h3>
            <div className="flex-1 h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={protectiveFactors} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="rgb(var(--text-muted))" fontSize={12} width={120} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} itemStyle={{ color: 'rgb(var(--success))', fontFamily: 'JetBrains Mono' }} />
                  <Bar dataKey="value" fill="#00E599" radius={[4, 0, 0, 4]} barSize={20}>
                    {protectiveFactors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#00E599" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Policy Simulation Panel */}
        <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
          <button 
            onClick={() => setSimExpanded(!simExpanded)}
            className="w-full p-6 flex items-center justify-between hover:bg-surface transition-colors"
          >
            <div className="flex flex-col text-left">
              <h3 className="text-lg font-semibold font-sora text-primary">Policy Simulation Panel</h3>
              <p className="text-sm text-text-muted mt-1">Adjust threshold to view real-time portfolio impact</p>
            </div>
            <ChevronDown className={`w-6 h-6 text-text-muted transition-transform ${simExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          {simExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="p-6 border-t border-border bg-surface"
            >
              <div className="mb-8">
                <div className="flex justify-between text-sm font-mono text-text-muted mb-4">
                  <span>Conservative</span>
                  <span className="text-primary font-bold">Threshold: {threshold.toFixed(2)}</span>
                  <span>Aggressive</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" max="0.9" step="0.05" 
                  value={threshold} 
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full accent-primary h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-surface-2 rounded-lg border border-border">
                  <div className="text-sm text-text-muted mb-1">Expected Approval Rate</div>
                  <div className="text-2xl font-mono text-text-primary">{approvalRate}%</div>
                </div>
                <div className="p-4 bg-surface-2 rounded-lg border border-border">
                  <div className="text-sm text-text-muted mb-1">Expected Default Rate</div>
                  <div className="text-2xl font-mono text-danger">{defaultRate}%</div>
                </div>
                <div className="p-4 bg-surface-2 rounded-lg border border-border">
                  <div className="text-sm text-text-muted mb-1">Estimated Revenue</div>
                  <div className="text-2xl font-mono text-success">${revenue.toLocaleString()}k</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Business Impact Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-surface rounded-xl border border-border flex flex-col justify-center">
            <span className="text-sm text-text-muted uppercase tracking-wider mb-2">Expected Revenue</span>
            <span className="text-2xl font-mono text-text-primary">$4,250</span>
          </div>
          <div className="p-6 bg-surface rounded-xl border border-border flex flex-col justify-center">
            <span className="text-sm text-text-muted uppercase tracking-wider mb-2">Risk Reduction</span>
            <span className="text-2xl font-mono text-success">14%</span>
          </div>
          <div className="p-6 bg-surface rounded-xl border border-border flex flex-col justify-center">
            <span className="text-sm text-text-muted uppercase tracking-wider mb-2">Approval Precision</span>
            <span className="text-2xl font-mono text-primary">92%</span>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex justify-end pt-4 pb-12">
          <Link 
            to="/explainability" 
            className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]"
          >
            View Explainability Report
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
