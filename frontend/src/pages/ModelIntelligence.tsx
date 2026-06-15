import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, LineChart, Line, ReferenceLine
} from 'recharts';

const rocData = [
  { fpr: 0, tpr: 0, random: 0 }, { fpr: 0.1, tpr: 0.45, random: 0.1 },
  { fpr: 0.2, tpr: 0.65, random: 0.2 }, { fpr: 0.3, tpr: 0.78, random: 0.3 },
  { fpr: 0.4, tpr: 0.86, random: 0.4 }, { fpr: 0.6, tpr: 0.94, random: 0.6 },
  { fpr: 0.8, tpr: 0.98, random: 0.8 }, { fpr: 1, tpr: 1, random: 1 }
];

const liftData = [
  { decile: 10, lift: 2.15 }, { decile: 20, lift: 1.95 },
  { decile: 30, lift: 1.65 }, { decile: 40, lift: 1.45 },
  { decile: 50, lift: 1.25 }, { decile: 60, lift: 1.05 },
  { decile: 70, lift: 0.85 }, { decile: 80, lift: 0.65 },
  { decile: 90, lift: 0.45 }, { decile: 100, lift: 0.25 },
];

const featureImportance = [
  { name: 'Income Stability', importance: 0.85 },
  { name: 'UPI Volume', importance: 0.76 },
  { name: 'Credit Limit', importance: 0.64 },
  { name: 'E-commerce Spend', importance: 0.58 },
  { name: 'Utility Score', importance: 0.52 },
  { name: 'Outstanding Balance', importance: 0.46 },
  { name: 'Total EMI', importance: 0.41 },
  { name: 'Past Delinquencies', importance: 0.35 },
];

const driftData = [
  { feature: 'income_stability', trainMean: 82.4, currentMean: 81.9, psi: 0.04, status: 'Stable' },
  { feature: 'upi_volume', trainMean: 2150, currentMean: 2840, psi: 0.24, status: 'Drift Detected' },
  { feature: 'ecommerce_spend', trainMean: 640, currentMean: 655, psi: 0.02, status: 'Stable' },
  { feature: 'past_delinquencies', trainMean: 0.4, currentMean: 0.42, psi: 0.01, status: 'Stable' },
];

export default function ModelIntelligence() {
  return (
    <div className="min-h-screen p-8 text-text-primary animate-fade-in font-body bg-gradient-to-br from-background via-background to-surface-2">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h1 className="text-4xl font-bold font-sora">Model Intelligence & Performance</h1>
          <p className="text-lg text-text-muted">Advanced metrics, drift detection, and model health monitoring</p>
        </motion.div>
        
        {/* Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-r from-success/10 to-success/5 border border-success/30 rounded-xl p-6 flex items-center justify-between shadow-lg shadow-success/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-success animate-[pulse_2s_ease-in-out_infinite]"></div>
            <span className="font-mono text-sm text-success font-semibold tracking-wide">
              Model v2.4.1 — Production | AUC: 0.78 | Last Retrained: 14 days ago | Drift Status: Nominal
            </span>
          </div>
          <button className="px-4 py-1.5 bg-surface-2 border border-border rounded-lg text-xs font-semibold hover:border-primary/50 hover:text-primary transition-colors">
            Trigger Retraining
          </button>
        </motion.div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'AUC (ROC)', value: '0.78', desc: 'Excellent Discrimination' },
            { label: 'Gini Coefficient', value: '0.56', desc: 'High Predictive Power' },
            { label: 'KS Statistic', value: '0.42', desc: 'Strong Separation' },
            { label: 'F1 Score', value: '0.78', desc: 'Harmonic Mean @ 0.5' },
          ].map((kpi, idx) => (
            <div key={idx} className="bg-surface border border-border rounded-xl p-6 relative overflow-hidden card-hover">
              <div className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">{kpi.label}</div>
              <div className="text-3xl font-bold font-mono text-text-primary mb-1">{kpi.value}</div>
              <div className="text-xs text-text-secondary">{kpi.desc}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="font-sora font-semibold text-lg mb-6">ROC Curve</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rocData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis dataKey="fpr" type="number" stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="tpr" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.2} />
                  <Line type="monotone" dataKey="random" stroke="#7B61FF" strokeDasharray="5 5" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="font-sora font-semibold text-lg mb-6">Lift Curve</h3>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={liftData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis dataKey="decile" stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <YAxis stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="lift" stroke="#00E599" strokeWidth={3} dot={{ r: 4, fill: '#00E599' }} />
                  <ReferenceLine y={1} stroke="#7B61FF" strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
              <div className="absolute top-4 right-4 text-xs font-mono text-text-muted bg-surface-2 p-3 rounded-lg border border-border">
                <div className="text-success mb-1">Lift @ 10%: 2.15x</div>
                <div className="text-text-primary">Lift @ 30%: 1.65x</div>
              </div>
            </div>
          </div>

        </div>

        {/* Global Feature Importance */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-sora font-semibold text-lg mb-6">Global Feature Importance (SHAP)</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorImp" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#00D4FF" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="rgb(var(--text-muted))" fontSize={12} width={150} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} itemStyle={{ color: 'rgb(var(--primary))', fontFamily: 'JetBrains Mono' }} />
                <Bar dataKey="importance" fill="url(#colorImp)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drift Monitoring */}
        <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-sora font-semibold text-lg">Data Drift Monitoring</h3>
            <p className="text-sm text-text-muted mt-1">Population Stability Index (PSI) tracking across features.</p>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Feature</th>
                <th className="px-6 py-4 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Mean (Train)</th>
                <th className="px-6 py-4 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Mean (Current)</th>
                <th className="px-6 py-4 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">PSI</th>
                <th className="px-6 py-4 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {driftData.map((row, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-surface transition-colors">
                  <td className="px-6 py-4 font-mono text-sm">{row.feature}</td>
                  <td className="px-6 py-4 font-mono text-sm text-text-muted">{row.trainMean}</td>
                  <td className="px-6 py-4 font-mono text-sm text-text-primary">{row.currentMean}</td>
                  <td className={`px-6 py-4 font-mono text-sm font-bold ${row.psi > 0.2 ? 'text-danger' : 'text-success'}`}>{row.psi.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border ${row.status === 'Stable' ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                      {row.status}
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
