import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, TrendingUp, TrendingDown, Activity, AlertTriangle, 
  CheckCircle, Clock, ChevronRight, XCircle, Send, Sparkles, MessageSquare
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { PastApplication } from '@/types';
import { getPastApplications } from '@/services/backendApi';

type Tier = 'Low' | 'Medium' | 'High' | 'Critical';
type Decision = 'Approved' | 'Rejected' | 'Conditional' | 'Conditional Approval' | 'Manual Review';

type AnimatedCounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

const AnimatedCounter = ({ value, prefix = "", suffix = "", decimals = 0 }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const stepTime = Math.abs(Math.floor(duration / 60));
    const timer = setInterval(() => {
      start += (value / (duration / stepTime));
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{prefix}{count.toFixed(decimals)}{suffix}</>;
};

export default function Dashboard() {
  const [applications, setApplications] = useState<PastApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      setError(null);

      try {
        const apps = await getPastApplications();
        setApplications(apps);
      } catch (err) {
        setError((err as Error)?.message || 'Unable to load application history.');
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const totalApplications = applications.length;
  const approvedCount = applications.filter((app) => app.decision === 'Approved').length;
  const approvalRate = totalApplications ? (approvedCount / totalApplications) * 100 : 0;
  const avgRiskScore = totalApplications
    ? Math.round(applications.reduce((sum, app) => sum + (app.risk_score ?? 0), 0) / totalApplications)
    : 0;
  const portfolioDefaultRisk = totalApplications
    ? Math.round(applications.reduce((sum, app) => sum + ((app.probability_score ?? 0) * 100), 0) / totalApplications * 10) / 10
    : 0;
  const recentApplications = applications.slice(0, 5);

  const riskCounts = applications.reduce(
    (acc, app) => {
      acc[app.riskBand as Tier] = (acc[app.riskBand as Tier] ?? 0) + 1;
      return acc;
    },
    { Low: 0, Medium: 0, High: 0, Critical: 0 } as Record<Tier, number>
  );

  const donutData = [
    { name: 'Low', value: riskCounts.Low, color: '#00D4FF' },
    { name: 'Medium', value: riskCounts.Medium, color: '#7B61FF' },
    { name: 'High', value: riskCounts.High, color: '#FFB800' },
    { name: 'Critical', value: riskCounts.Critical, color: '#FF4D6A' },
  ];

  const approvalTrendMap = applications.reduce<Record<string, { day: string; approved: number; total: number }>>((acc, app) => {
    const day = app.date;
    if (!acc[day]) acc[day] = { day, approved: 0, total: 0 };
    acc[day].total += 1;
    if (app.decision === 'Approved') acc[day].approved += 1;
    return acc;
  }, {});

  const areaData = Object.values(approvalTrendMap)
    .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
    .map((item) => ({ day: item.day, rate: item.total ? Math.round((item.approved / item.total) * 100) : 0 }));

  const getTierColor = (tier: Tier) => {
    switch(tier) {
      case 'Low': return 'bg-primary/10 text-primary border-primary/20';
      case 'Medium': return 'bg-accent/10 text-accent border-accent/20';
      case 'High': return 'bg-warning/10 text-warning border-warning/20';
      case 'Critical': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-surface-2 text-text-muted border-border/50';
    }
  };

  const getDecisionBadge = (decision: Decision) => {
    switch(decision) {
      case 'Approved': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-bold border border-success/20"><CheckCircle className="w-3 h-3"/> Approved</span>;
      case 'Rejected': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger/10 text-danger text-xs font-bold border border-danger/20"><XCircle className="w-3 h-3"/> Rejected</span>;
      case 'Conditional Approval': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold border border-accent/20"><AlertTriangle className="w-3 h-3"/> Conditional Approval</span>;
      case 'Manual Review': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 text-warning text-xs font-bold border border-warning/20"><Clock className="w-3 h-3"/> Review</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen p-8 text-text-primary animate-fade-in bg-gradient-to-br from-background via-background to-surface-2">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold font-sora">Portfolio Dashboard</h1>
            <p className="text-text-muted mt-2">Real-time credit application analytics</p>
          </div>
          <div className="px-4 py-2 bg-success/10 text-success border border-success/30 rounded-lg text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
            Live Data
          </div>
        </div>
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { label: "Total Applications", value: totalApplications, change: "Real-time portfolio activity", icon: FileText, color: "from-primary", trend: true },
            { label: "Approval Rate", value: `${approvalRate.toFixed(1)}%`, change: "Based on recent decisions", icon: CheckCircle, color: "from-success", trend: approvalRate >= 0 },
            { label: "Avg Risk Score", value: avgRiskScore, change: "Average score across the last batch", icon: Activity, color: "from-accent", trend: false },
            { label: "Portfolio Default Risk", value: `${portfolioDefaultRisk.toFixed(1)}%`, change: "Weighted probability of default", icon: AlertTriangle, color: "from-warning", trend: false },
          ].map((kpi, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.05 + idx * 0.05 }} 
              className={`bg-gradient-to-br ${kpi.color} to-transparent/5 border border-border/50 rounded-2xl p-6 relative overflow-hidden card-hover group`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-white/10 smooth-transition"></div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">{kpi.label}</span>
                <div className={`p-3 bg-gradient-to-br ${kpi.color} to-transparent/10 rounded-xl`}>
                  <kpi.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-bold font-mono text-text-primary mb-3">
                  {typeof kpi.value === "number" ? <AnimatedCounter value={kpi.value} /> : kpi.value}
                </div>
                <div className={`flex items-center gap-2 text-sm font-semibold ${kpi.trend ? 'text-success' : 'text-text-muted'}`}>
                  {kpi.trend && (kpi.change.includes('↑') ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />)}
                  {kpi.change}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 bg-surface/60 border border-border/50 rounded-2xl p-8 card-hover"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold font-sora text-text-primary">Approval Rate Trend</h3>
                <p className="text-sm text-text-muted mt-1">30-day rolling average</p>
              </div>
              <div className="px-3 py-1 bg-success/10 text-success rounded-full text-xs font-bold border border-success/20">+2.5%</div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} strokeOpacity={0.3} />
                  <XAxis dataKey="day" hide />
                  <YAxis stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip />
                  <Area type="monotone" dataKey="rate" stroke="#00D4FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.35 }}
            className="lg:col-span-2 bg-surface/60 border border-border/50 rounded-2xl p-8 card-hover"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold font-sora text-text-primary">Risk Distribution</h3>
              <p className="text-sm text-text-muted mt-1">Applicant tier breakdown</p>
            </div>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%" cy="50%"
                    innerRadius={75} outerRadius={110}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-mono font-bold text-text-primary">{totalApplications}</span>
                <span className="text-xs text-text-muted font-semibold uppercase tracking-widest mt-1">Applications</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-surface/60 border border-border/50 rounded-2xl flex flex-col overflow-hidden"
          >
            <div className="p-8 border-b border-border/50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold font-sora text-text-primary">Recent Applications</h3>
                <p className="text-sm text-text-muted mt-1">Latest decisions and scores</p>
              </div>
              <button className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 smooth-transition group">
                View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 smooth-transition"/>
              </button>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0">
                  <tr className="bg-surface-2/50 border-b border-border/50">
                    <th className="px-6 py-4 text-xs font-mono font-bold text-text-muted uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Applicant</th>
                    <th className="px-6 py-4 text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Score</th>
                    <th className="px-6 py-4 text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Tier</th>
                    <th className="px-6 py-4 text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Decision</th>
                    <th className="px-6 py-4 text-xs font-mono font-bold text-text-muted uppercase tracking-wider">PD%</th>
                    <th className="px-6 py-4 text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app, idx) => (
                    <motion.tr 
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.45 + idx * 0.05 }}
                      className="hover:bg-primary/5 smooth-transition group cursor-pointer border-b border-border/50 last:border-0"
                    >
                      <td className="px-6 py-4 font-mono text-sm font-semibold text-primary">{app.id}</td>
                      <td className="px-6 py-4 font-semibold text-sm text-text-primary group-hover:text-primary smooth-transition">{app.applicant}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold">{app.risk_score ?? '-'}</span>
                          <div className="w-16 h-2 rounded-full bg-surface-2 overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-primary to-accent" 
                              initial={{ width: 0 }}
                              animate={{ width: `${((app.risk_score ?? 0) / 850) * 100}%` }}
                              transition={{ duration: 1, delay: 0.5 + idx * 0.05 }}
                            ></motion.div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border backdrop-blur-sm ${getTierColor(app.riskBand)}`}>
                          {app.riskBand}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getDecisionBadge(app.decision)}</td>
                      <td className="px-6 py-4 font-mono text-sm text-text-muted">
                        {app.probability_score !== undefined ? `${(app.probability_score * 100).toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-muted">{app.date}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-border/50 bg-surface-2/30 flex items-center justify-between text-xs text-text-muted font-mono">
              <span>Showing 1-{recentApplications.length} of {totalApplications} entries</span>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary smooth-transition text-text-muted hover:text-primary">Prev</button>
                <button className="px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary smooth-transition text-text-muted hover:text-primary">Next</button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.45 }}
            className="bg-gradient-to-br from-accent/10 to-primary/5 border border-border/50 rounded-2xl flex flex-col overflow-hidden backdrop-blur-sm"
          >
            <div className="p-6 border-b border-border/50 bg-surface/40 backdrop-blur-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary/80 flex items-center justify-center shadow-lg shadow-accent/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-sm text-text-primary">AI Credit Advisor</h3>
                <p className="text-[11px] font-mono text-success uppercase tracking-widest flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> Online & Ready
                </p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex gap-3 max-w-[90%]">
                <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0 shadow-sm">
                  <MessageSquare className="w-4 h-4 text-accent" />
                </div>
                <div className="p-3 bg-surface/80 border border-border rounded-xl rounded-tl-none text-sm text-text-secondary leading-relaxed font-medium">
                  Ask me about your portfolio, risk trends, or specific applicant profiles. I can also help you simulate threshold changes.
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-border/50 bg-surface/40 backdrop-blur-sm space-y-3">
              <div className="relative group">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-surface/80 border border-border rounded-lg pl-4 pr-12 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none smooth-transition"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-accent to-primary text-white rounded-lg hover:shadow-lg hover:shadow-accent/30 smooth-transition">
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-center">
                <span className="px-3 py-1.5 bg-surface/80 border border-border rounded-lg text-[11px] font-mono text-text-muted flex items-center gap-1.5 hover:border-accent smooth-transition cursor-pointer">
                  <Sparkles className="w-3 h-3 text-accent" /> Powered by Gemini AI
                </span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
