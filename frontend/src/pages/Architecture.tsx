import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Zap, ShieldAlert, Cpu, BarChart3, LineChart, Network, Activity } from 'lucide-react';

const agentData = {
  decision: {
    title: 'Decision Agent',
    icon: <Zap className="w-5 h-5 text-primary" />,
    desc: 'Runs the primary Hybrid ML Engine (XGBoost + LightGBM). Evaluates rules and scores the application.',
    color: 'bg-primary/20 text-primary border-primary/30',
  },
  explainability: {
    title: 'Explainability Agent',
    icon: <Network className="w-5 h-5 text-accent" />,
    desc: 'Computes SHAP values and prompts Gemini 1.5 to generate a human-readable narrative of the decision.',
    color: 'bg-accent/20 text-accent border-accent/30',
  },
  fairness: {
    title: 'Fairness Agent',
    icon: <ShieldAlert className="w-5 h-5 text-success" />,
    desc: 'Monitors disparate impact ratio (80% rule) in real-time across protected demographic classes.',
    color: 'bg-success/20 text-success border-success/30',
  },
  drift: {
    title: 'Drift Agent',
    icon: <Activity className="w-5 h-5 text-warning" />,
    desc: 'Calculates PSI and KS statistics continuously to detect feature distribution shifts and trigger retraining.',
    color: 'bg-warning/20 text-warning border-warning/30',
  }
};

const FlowArrow = ({ className = "" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="w-8 md:w-16 h-0.5 bg-border relative">
      <div className="absolute inset-0 bg-primary animate-[pulse_2s_ease-in-out_infinite] opacity-50"></div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-primary transform rotate-45"></div>
    </div>
  </div>
);

export default function Architecture() {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  return (
    <div className="min-h-screen p-8 text-text-primary animate-fade-in bg-gradient-to-br from-background via-background to-surface-2">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold font-sora text-text-primary mb-3">System Architecture</h1>
          <p className="text-lg text-text-muted">Interactive pipeline visualization of the CrediNova Operating System — from ingestion to decision delivery</p>
        </motion.div>

        {/* Pipeline Diagram */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-surface/60 to-surface/30 border border-border/50 rounded-2xl p-8 overflow-x-auto shadow-lg">
          <div className="min-w-[800px] flex items-center justify-between gap-4">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-4 w-48 shrink-0 group relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl flex items-center justify-center shadow-lg shadow-primary/10 transition-all group-hover:border-primary/60 group-hover:shadow-xl group-hover:shadow-primary/20 group-hover:scale-110">
                <Database className="w-8 h-8 text-primary transition-colors" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold font-sora text-sm text-text-primary">Data Ingestion</h3>
                <p className="text-xs text-text-muted mt-1">APIs, Webhooks, Batch</p>
              </div>
              
              {/* Tooltip */}
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 p-4 bg-[rgba(13,20,33,0.95)] border border-border rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 backdrop-blur-md shadow-xl">
                <h4 className="font-bold text-sm mb-1 text-primary">Ingestion Layer</h4>
                <p className="text-xs text-text-secondary">Parses incoming streams from utility companies, UPI gateways, and traditional bureaus.</p>
              </div>
            </div>

            <FlowArrow />

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-4 w-48 shrink-0 group relative">
              <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-xl flex items-center justify-center shadow-lg shadow-accent/10 transition-all group-hover:border-accent/60 group-hover:shadow-xl group-hover:shadow-accent/20 group-hover:scale-110">
                <Cpu className="w-8 h-8 text-accent transition-colors" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold font-sora text-sm">Feature Engineering</h3>
                <p className="text-xs text-text-muted mt-1">Real-time transformations</p>
              </div>
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 p-4 bg-[rgba(13,20,33,0.95)] border border-border rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 backdrop-blur-md">
                <h4 className="font-bold text-sm mb-1 text-primary">Feature Store</h4>
                <p className="text-xs text-text-secondary">Computes velocity aggregations (e.g. 30-day avg spend) and normalizes distributions.</p>
              </div>
            </div>

            <FlowArrow />

            {/* Step 3 - Agentic Layer (Expanded) */}
            <div className="flex-1 shrink-0 bg-surface border border-primary/30 rounded-2xl p-6 relative shadow-[0_0_30px_rgba(0,212,255,0.05)]">
              <div className="absolute -top-3 left-6 bg-surface-2 px-3 py-1 border border-primary/30 rounded-full text-xs font-bold text-primary tracking-wider uppercase">
                Agentic Layer
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                {Object.entries(agentData).map(([key, agent]) => (
                  <div 
                    key={key}
                    onMouseEnter={() => setActiveAgent(key)}
                    onMouseLeave={() => setActiveAgent(null)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${activeAgent === key ? agent.color + ' shadow-lg scale-[1.02]' : 'bg-surface-2 border-border text-text-muted hover:border-text-muted/50'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-background border ${activeAgent === key ? 'border-current' : 'border-border'}`}>
                        {agent.icon}
                      </div>
                      <h4 className={`font-semibold text-sm ${activeAgent === key ? '' : 'text-text-primary'}`}>{agent.title}</h4>
                    </div>
                    <AnimatePresence>
                      {activeAgent === key && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs mt-2 text-current opacity-80"
                        >
                          {agent.desc}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>

        {/* Tech Stack Grid */}
        <div>
          <h2 className="text-xl font-bold font-sora mb-6">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 bg-surface border border-border rounded-xl">
              <h3 className="text-sm uppercase tracking-widest text-text-muted mb-4 font-semibold">Frontend Application</h3>
              <div className="flex flex-wrap gap-2">
                {['React 18', 'TypeScript', 'Vite', 'Tailwind CSS 3', 'Framer Motion', 'Recharts'].map(tech => (
                  <span key={tech} className="px-3 py-1 bg-surface-2 border border-border rounded-full text-sm font-mono">{tech}</span>
                ))}
              </div>
            </div>

            <div className="p-6 bg-surface border border-border rounded-xl">
              <h3 className="text-sm uppercase tracking-widest text-text-muted mb-4 font-semibold">AI / ML Core</h3>
              <div className="flex flex-wrap gap-2">
                {['Gemini 1.5 Flash', 'XGBoost', 'LightGBM', 'SHAP', 'Scikit-learn'].map(tech => (
                  <span key={tech} className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-mono">{tech}</span>
                ))}
              </div>
            </div>

            <div className="p-6 bg-surface border border-border rounded-xl">
              <h3 className="text-sm uppercase tracking-widest text-text-muted mb-4 font-semibold">Infrastructure (Target)</h3>
              <div className="flex flex-wrap gap-2">
                {['AWS SageMaker', 'FastAPI', 'PostgreSQL', 'DynamoDB', 'Docker'].map(tech => (
                  <span key={tech} className="px-3 py-1 bg-surface-2 border border-border rounded-full text-sm font-mono">{tech}</span>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
