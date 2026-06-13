import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Zap, Activity, ShieldAlert, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { scoreApplication } from '@/services/backendApi';

export default function CreditApplication() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [formData, setFormData] = useState({
    monthly_income: 5000,
    income_stability: 85,
    total_emi: 1200,
    credit_limit: 10000,
    outstanding_balance: 4500,
    past_delinquencies: 0,
    months_since_last_dq: 24,
    loan_amount_requested: 15000,
    loan_tenure: 36,
    upi_volume: 2500,
    ecommerce_spend: 800,
    utility_score: 92,
  });
  const [threshold, setThreshold] = useState(0.5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const dti = formData.monthly_income > 0 ? formData.total_emi / formData.monthly_income : 0;
  const util = formData.credit_limit > 0 ? (formData.outstanding_balance / formData.credit_limit) * 100 : 0;
  const dqScore = Math.max(0, 100 - formData.past_delinquencies * 20 + Math.min(20, formData.months_since_last_dq));

  const thresholdLabel = threshold < 0.4 ? 'Conservative (7% approval)' : threshold < 0.7 ? 'Balanced (68% approval)' : 'Aggressive (92% approval)';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await scoreApplication(formData, threshold);
      navigate('/risk-assessment', { state: { result: response } });
    } catch (err) {
      setError((err as Error)?.message || 'Unable to score application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-8 text-text-primary animate-fade-in font-body">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Tabs */}
        <div className="flex items-center gap-4 mb-12 border-b border-border/50 flex-wrap">
          <button 
            onClick={() => setActiveTab('single')}
            className={`px-6 py-4 font-sora font-bold text-sm smooth-transition relative ${activeTab === 'single' ? 'text-primary' : 'text-text-muted hover:text-text-primary'}`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Single Application
            </span>
            {activeTab === 'single' && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></motion.div>}
          </button>
          <button 
            onClick={() => setActiveTab('bulk')}
            className={`px-6 py-4 font-sora font-bold text-sm smooth-transition relative ${activeTab === 'bulk' ? 'text-primary' : 'text-text-muted hover:text-text-primary'}`}
          >
            <span className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4" />
              Bulk Upload
            </span>
            {activeTab === 'bulk' && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></motion.div>}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'single' ? (
            <motion.div key="single" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col lg:flex-row gap-8">
              
              {/* Form Content */}
              <div className="flex-1 space-y-6">
                <form id="app-form" onSubmit={handleSubmit}>
                  
                  {/* Section 1 */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-primary/5 to-transparent border border-border/50 rounded-2xl p-8 card-hover">
                    <h3 className="font-sora font-bold text-xl mb-8 flex items-center gap-3 text-text-primary">
                      <div className="p-2 bg-gradient-to-br from-primary to-accent/80 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      Financial Profile
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Monthly Income ($)</label>
                        <input type="number" name="monthly_income" value={formData.monthly_income} onChange={handleInputChange} className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:shadow-md focus:shadow-primary/10 outline-none smooth-transition" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider flex justify-between">
                          <span>Income Stability</span>
                          <span className="text-primary bg-primary/10 px-2 py-1 rounded">{formData.income_stability}%</span>
                        </label>
                        <input type="range" name="income_stability" min="0" max="100" value={formData.income_stability} onChange={handleInputChange} className="w-full accent-primary h-2.5 bg-surface-2 rounded-full appearance-none cursor-pointer mt-3" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Total EMI ($)</label>
                        <input type="number" name="total_emi" value={formData.total_emi} onChange={handleInputChange} className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:shadow-md focus:shadow-primary/10 outline-none smooth-transition" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Credit Limit ($)</label>
                        <input type="number" name="credit_limit" value={formData.credit_limit} onChange={handleInputChange} className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:shadow-md focus:shadow-primary/10 outline-none smooth-transition" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Section 2 */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-warning/5 to-transparent border border-border/50 rounded-2xl p-8 card-hover">
                    <h3 className="font-sora font-bold text-xl mb-8 flex items-center gap-3 text-text-primary">
                      <div className="p-2 bg-gradient-to-br from-warning to-accent rounded-lg">
                        <ShieldAlert className="w-5 h-5 text-white" />
                      </div>
                      Credit Position & Risk
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Outstanding Balance ($)</label>
                        <input type="number" name="outstanding_balance" value={formData.outstanding_balance} onChange={handleInputChange} className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-sm focus:border-warning focus:shadow-md focus:shadow-warning/10 outline-none smooth-transition" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Past Delinquencies</label>
                        <input type="number" name="past_delinquencies" value={formData.past_delinquencies} onChange={handleInputChange} className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-sm focus:border-warning focus:shadow-md focus:shadow-warning/10 outline-none smooth-transition" />
                      </div>
                      <div className="space-y-3 md:col-span-2">
                        <label className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Months Since Last Delinquency</label>
                        <input type="number" name="months_since_last_dq" value={formData.months_since_last_dq} onChange={handleInputChange} className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-sm focus:border-warning focus:shadow-md focus:shadow-warning/10 outline-none smooth-transition" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Section 3 */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-accent/5 to-transparent border border-border/50 rounded-2xl p-8 card-hover">
                    <h3 className="font-sora font-bold text-xl mb-8 flex items-center gap-3 text-text-primary">
                      <div className="p-2 bg-gradient-to-br from-accent to-primary rounded-lg">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      Loan Request & Alternative Signals
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Requested Amount ($)</label>
                        <input type="number" name="loan_amount_requested" value={formData.loan_amount_requested} onChange={handleInputChange} className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-sm focus:border-accent focus:shadow-md focus:shadow-accent/10 outline-none smooth-transition" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Tenure (Months)</label>
                        <input type="number" name="loan_tenure" value={formData.loan_tenure} onChange={handleInputChange} className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-sm focus:border-accent focus:shadow-md focus:shadow-accent/10 outline-none smooth-transition" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">UPI Volume ($/month)</label>
                        <input type="number" name="upi_volume" value={formData.upi_volume} onChange={handleInputChange} className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-sm focus:border-accent focus:shadow-md focus:shadow-accent/10 outline-none smooth-transition" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">E-Commerce Spend ($/month)</label>
                        <input type="number" name="ecommerce_spend" value={formData.ecommerce_spend} onChange={handleInputChange} className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-sm focus:border-accent focus:shadow-md focus:shadow-accent/10 outline-none smooth-transition" />
                      </div>
                      <div className="space-y-3 md:col-span-2">
                        <label className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider flex justify-between">
                          <span>Utility Consistency Score</span>
                          <span className="text-accent bg-accent/10 px-2 py-1 rounded">{formData.utility_score}%</span>
                        </label>
                        <input type="range" name="utility_score" min="0" max="100" value={formData.utility_score} onChange={handleInputChange} className="w-full accent-accent h-2.5 bg-surface-2 rounded-full appearance-none cursor-pointer mt-3" />
                      </div>
                    </div>
                  </motion.div>

                </form>
              </div>

              {/* Sticky Sidebar */}
              <div className="w-full lg:w-96 flex-shrink-0 relative">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="sticky top-24 bg-gradient-to-br from-surface/80 to-surface-2/50 border border-border/50 rounded-2xl p-8 shadow-xl backdrop-blur-sm card-hover">
                  <h3 className="font-sora font-bold text-xl mb-8 text-text-primary border-b border-border/50 pb-6 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Live Analysis
                  </h3>
                  
                  <div className="space-y-4 mb-10">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.35 }} className={`p-4 rounded-xl border-2 ${dti > 0.4 ? 'bg-danger/5 border-danger/30' : 'bg-success/5 border-success/30'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-text-muted">DTI Ratio</span>
                        <span className={`font-mono font-bold text-lg ${dti > 0.4 ? 'text-danger' : 'text-success'}`}>{dti.toFixed(2)}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden">
                        <motion.div className={`h-full ${dti > 0.4 ? 'bg-danger' : 'bg-success'}`} initial={{ width: 0 }} animate={{ width: `${Math.min(dti * 100, 100)}%` }} transition={{ duration: 0.8 }}></motion.div>
                      </div>
                    </motion.div>

                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }} className={`p-4 rounded-xl border-2 ${util > 70 ? 'bg-warning/5 border-warning/30' : 'bg-primary/5 border-primary/30'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-text-muted">Credit Utilization</span>
                        <span className={`font-mono font-bold text-lg ${util > 70 ? 'text-warning' : 'text-primary'}`}>{util.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden">
                        <motion.div className={`h-full ${util > 70 ? 'bg-warning' : 'bg-primary'}`} initial={{ width: 0 }} animate={{ width: `${Math.min(util, 100)}%` }} transition={{ duration: 0.8 }}></motion.div>
                      </div>
                    </motion.div>

                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.45 }} className="p-4 rounded-xl border-2 bg-accent/5 border-accent/30">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-text-muted">Delinquency Score</span>
                        <span className="font-mono font-bold text-lg text-accent">{dqScore}/100</span>
                      </div>
                    </motion.div>
                  </div>

                  <div className="mb-10 pb-8 border-b border-border/50">
                    <label className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider flex justify-between mb-4">
                      <span>Risk Threshold</span>
                      <span className="text-primary">{(threshold * 100).toFixed(0)}%</span>
                    </label>
                    <input 
                      type="range" min="0.1" max="0.9" step="0.1" 
                      value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} 
                      className="w-full accent-primary h-2.5 bg-surface-2 rounded-full appearance-none cursor-pointer" 
                    />
                    <div className="mt-4 p-3 bg-surface/80 rounded-lg border border-border/50">
                      <p className="text-xs font-mono text-primary font-bold text-center">{thresholdLabel}</p>
                    </div>
                  </div>

                  <motion.button 
                    form="app-form"
                    type="submit"
                    whileHover={{ scale: submitting ? 1 : 1.02 }}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                    disabled={submitting}
                    className={`w-full ${submitting ? 'bg-primary/40 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/30'} text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 smooth-transition`}
                  >
                    <Zap className="w-5 h-5" /> {submitting ? 'Scoring...' : 'Analyze Application'}
                  </motion.button>
                  {error && <p className="mt-4 text-sm text-danger font-medium text-center">{error}</p>}
                  <p className="text-center text-xs font-mono text-text-muted mt-4 bg-surface/50 p-3 rounded-lg">~0.3s inference • XGBoost + LightGBM</p>
                </motion.div>
              </div>

            </motion.div>
          ) : (
            <motion.div key="bulk" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-gradient-to-br from-primary/5 to-transparent border border-border/50 rounded-2xl p-12 card-hover">
              
              <div className="max-w-2xl mx-auto">
                <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-2xl p-16 flex flex-col items-center justify-center text-center cursor-pointer group bg-surface-2/50">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-sora font-bold text-xl mb-2">Drop CSV, JSON, XLSX, or HTML table here</h3>
                  <p className="text-text-muted mb-6">Drag and drop your batch application file.</p>
                  
                  <div className="flex gap-2 justify-center mb-6">
                    {['CSV', 'JSON', 'XLSX'].map(fmt => (
                      <span key={fmt} className="px-3 py-1 bg-background border border-border rounded text-xs font-mono font-bold text-text-secondary">{fmt}</span>
                    ))}
                  </div>
                  
                  <button className="text-primary font-semibold hover:underline">Or browse files</button>
                </div>

                <div className="mt-8 pt-8 border-t border-border hidden">
                  {/* Will show preview after upload */}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
