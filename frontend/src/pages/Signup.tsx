import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { Loader2, Mail, Lock, ArrowRight, Sparkles, CheckCircle, User, ShieldCheck, Hexagon, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, isAuthenticated } = useAuth();
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
      await signup(name, email, password);
      navigate(from, { replace: true });
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 25;
    if (password.length < 10) return 50;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return 100;
    return 75;
  };
  
  const strength = getPasswordStrength();

  return (
    <div className="flex h-screen bg-background font-body text-text-primary overflow-hidden">
      
      {/* Left Screen - 55% */}
      <div className="hidden lg:flex flex-col w-[55%] relative overflow-hidden bg-surface border-r border-border">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMUUyRDQwIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDQwaDQwVjBIMHoiLz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-[pulse-slow]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-[pulse_5s_ease-in-out_infinite]"></div>

        <div className="relative z-10 flex flex-col justify-center h-full p-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-sora text-5xl font-bold mb-6 tracking-tight text-text-primary">
              Join the Future of<br/><span className="text-primary">Credit Infrastructure</span>
            </h1>
            <p className="text-lg text-text-muted max-w-xl mb-12">
              Equip your institution with AI-driven, highly auditable risk assessments that eliminate bias and expand markets.
            </p>
          </motion.div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                 <ShieldCheck className="w-6 h-6 text-primary" />
               </div>
               <div>
                 <h4 className="font-sora font-semibold">FCA & PRA Compliant</h4>
                 <p className="text-sm text-text-muted">Immutable audit logs for every decision made.</p>
               </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                 <Sparkles className="w-6 h-6 text-accent" />
               </div>
               <div>
                 <h4 className="font-sora font-semibold">Gemini AI Explanations</h4>
                 <p className="text-sm text-text-muted">No black boxes. Human-readable narratives for all decisions.</p>
               </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-success/10 border border-success/20 flex items-center justify-center">
                 <CheckCircle className="w-6 h-6 text-success" />
               </div>
               <div>
                 <h4 className="font-sora font-semibold">Automated Fairness</h4>
                 <p className="text-sm text-text-muted">Continuous disparate impact monitoring (80% Rule).</p>
               </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Screen - 45% */}
      <div className="flex-1 flex flex-col justify-center items-center relative p-8 bg-background overflow-y-auto custom-scrollbar">
        
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

          <h2 className="text-3xl font-bold font-sora mb-2">Create Account</h2>
          <p className="text-text-muted mb-8">Request access to the CrediNova workspace.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg pl-10 pr-4 py-3 text-sm outline-none transition-all placeholder:text-text-faint"
                  required
                />
              </div>
            </div>

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
              <label className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">Password</label>
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
              
              {/* Strength Indicator */}
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 bg-surface-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        strength === 25 ? 'bg-danger w-1/4' : 
                        strength === 50 ? 'bg-warning w-2/4' : 
                        strength === 75 ? 'bg-primary w-3/4' : 
                        'bg-success w-full'
                      }`}
                    ></div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                    strength === 25 ? 'text-danger' : 
                    strength === 50 ? 'text-warning' : 
                    strength === 75 ? 'text-primary' : 
                    'text-success'
                  }`}>
                    {strength === 25 ? 'Weak' : strength === 50 ? 'Fair' : strength === 75 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger flex items-center gap-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-[#080C14] font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Registration <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Already have an account? <Link to="/login" className="text-primary hover:underline font-semibold">Sign in here</Link>
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