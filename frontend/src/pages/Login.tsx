import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { Loader2, Mail, Lock, ArrowRight, Sparkles, CheckCircle, TrendingUp, Hexagon, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  if (isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background font-body text-text-primary overflow-hidden">
      
      {/* Left Screen - 55% */}
      <div className="hidden lg:flex flex-col w-[55%] relative overflow-hidden bg-surface border-r border-border">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMUUyRDQwIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDQwaDQwVjBIMHoiLz48L2c+PC9zdmc+')] opacity-20"></div>
        
        {/* Abstract animated gradient */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-[pulse-slow]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-[pulse_5s_ease-in-out_infinite]"></div>

        <div className="relative z-10 flex flex-col justify-center h-full p-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-sora text-5xl font-bold mb-6 tracking-tight text-text-primary">
              The Intelligence Engine<br/>for <span className="text-primary">Financial Inclusion</span>
            </h1>
            <p className="text-lg text-text-muted max-w-xl mb-12">
              CrediNova scores 1.4B unbanked users using alternative data signals. Fully explainable, highly accurate, and 100% fair-lending compliant.
            </p>
          </motion.div>

          {/* Floating Metric Cards */}
          <div className="relative h-[300px]">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute left-0 top-0 w-64 glass-panel rounded-xl p-4 shadow-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-text-muted">Approval Rate</span>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div className="text-3xl font-mono font-bold text-success">68.4%</div>
              <div className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">+12% vs baseline</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute left-32 top-24 w-72 glass-panel-accent rounded-xl p-4 shadow-lg z-10"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-xs font-sora font-semibold text-text-primary">Gemini Narrative</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                "Applicant's UPI velocity and stable utility payments offset the lack of credit history, yielding a highly resilient risk profile."
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute left-0 top-48 w-56 glass-panel rounded-xl p-4 shadow-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-text-muted">Fairness Monitor</span>
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-mono font-bold text-text-primary">0.92</div>
              <div className="text-[10px] text-primary mt-1 uppercase tracking-widest">Complies w/ 80% Rule</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Screen - 45% */}
      <div className="flex-1 flex flex-col justify-center items-center relative p-8 bg-background">
        
        <div className="w-full max-w-md py-12">
          {/* Logo and Theme Toggle */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2">
               <div className="relative flex items-center justify-center w-8 h-8">
                 <Hexagon className="w-8 h-8 text-primary absolute" strokeWidth={2} />
                 <div className="w-2.5 h-2.5 bg-primary rounded-full absolute" />
               </div>
               <span className="font-sora font-bold text-2xl tracking-wide">CrediNova</span>
            </div>
            <button onClick={toggleTheme} className="text-text-muted hover:text-text-primary transition-colors p-2 bg-surface-2 rounded-full border border-border">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <h2 className="text-3xl font-bold font-sora mb-2">Welcome Back</h2>
          <p className="text-text-muted mb-8">Sign in to your risk analysis workspace.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@credinova.com"
                  className="w-full bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg pl-10 pr-4 py-3 text-sm outline-none transition-all placeholder:text-text-faint"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg pl-10 pr-4 py-3 text-sm outline-none transition-all placeholder:text-text-faint"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-border bg-surface-2 accent-primary" />
              <label htmlFor="remember" className="text-sm text-text-secondary">Remember me</label>
            </div>

            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger flex items-center gap-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-[#080C14] font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In Workspace <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Don't have an account? <Link to="/signup" className="text-primary hover:underline font-semibold">Request access</Link>
          </p>

          {/* Gemini Badge */}
          <div className="mt-16 flex justify-center">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-2 border border-border rounded-full text-xs text-text-muted font-mono">
               <Sparkles className="w-3.5 h-3.5 text-accent" />
               Powered by Gemini AI
             </div>
          </div>

        </div>
      </div>

    </div>
  );
}
