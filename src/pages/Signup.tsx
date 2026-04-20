import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  Shield,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  User,
  CheckCircle2,
  Eye,
  EyeOff,
  Check,
  X,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import CrediNovaLogo from "@/components/CrediNovaLogo";

type Step = 1 | 2 | 3;

/* ─── Password rules ─────────────────────────────────────────────── */
const PW_RULES = [
  { id: "len",     label: "At least 8 characters",          test: (p: string) => p.length >= 8 },
  { id: "upper",   label: "One uppercase letter (A–Z)",      test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower",   label: "One lowercase letter (a–z)",      test: (p: string) => /[a-z]/.test(p) },
  { id: "digit",   label: "One number (0–9)",                test: (p: string) => /[0-9]/.test(p) },
  { id: "special", label: "One special character (!@#$…)",   test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

function getStrength(p: string) {
  const passed = PW_RULES.filter(r => r.test(p)).length;
  if (p.length === 0) return 0;
  return passed; // 0–5
}

const STRENGTH_META = [
  { label: "",         color: "transparent",  bg: "bg-transparent" },
  { label: "Very Weak", color: "#ef4444",     bg: "bg-red-500" },
  { label: "Weak",      color: "#f97316",     bg: "bg-orange-500" },
  { label: "Fair",      color: "#eab308",     bg: "bg-yellow-500" },
  { label: "Good",      color: "#3b82f6",     bg: "bg-blue-500" },
  { label: "Strong",    color: "#10b981",     bg: "bg-emerald-500" },
];

/* ─── Step definitions ───────────────────────────────────────────── */
const STEPS = [
  { n: 1, label: "Identity",  icon: User },
  { n: 2, label: "Security",  icon: Lock },
  { n: 3, label: "Confirm",   icon: CheckCircle2 },
];

/* ─── Animated background orbs ─────────────────────────────────── */
function Orbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div style={{
        position: "absolute", top: "-20%", right: "-10%",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
        animation: "orbFloat 12s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "-15%", left: "-10%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
        animation: "orbFloat 15s ease-in-out infinite reverse",
      }} />
      <div style={{
        position: "absolute", top: "40%", left: "40%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
        animation: "orbFloat 18s ease-in-out infinite 3s",
      }} />
      <style>{`
        @keyframes orbFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(40px,-30px) scale(1.05); }
          66% { transform: translate(-20px,20px) scale(0.97); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkPop {
          0%   { transform: scale(0) rotate(-12deg); opacity: 0; }
          60%  { transform: scale(1.2) rotate(4deg); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes progressBar {
          from { width: 0; }
        }
        .step-content { animation: fadeSlideIn 0.35s cubic-bezier(.22,1,.36,1) both; }
        .check-pop { animation: checkPop 0.3s cubic-bezier(.22,1,.36,1) both; }
        .pw-bar { animation: progressBar 0.5s cubic-bezier(.22,1,.36,1) both; }
        .glass-card {
          background: rgba(15,17,26,0.72);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .input-glow:focus-within {
          box-shadow: 0 0 0 3px rgba(99,102,241,0.25);
          border-color: rgba(99,102,241,0.7) !important;
        }
        .btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%);
          background-size: 200% 200%;
          transition: background-position 0.4s ease, transform 0.15s, box-shadow 0.15s;
        }
        .btn-primary:hover:not(:disabled) {
          background-position: right center;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(99,102,241,0.4);
        }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .rule-row { transition: color 0.2s, opacity 0.2s; }
        .shimmer-text {
          background: linear-gradient(90deg, #a5b4fc, #c4b5fd, #67e8f9, #a5b4fc);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer {
          from { background-position: 0% center; }
          to   { background-position: 300% center; }
        }
      `}</style>
    </div>
  );
}

/* ─── Field wrapper ──────────────────────────────────────────────── */
function Field({ label, icon: Icon, children }: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(165,180,252,0.9)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <Icon size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(139,92,246,0.7)", pointerEvents: "none" }} />
        {children}
      </div>
    </div>
  );
}

/* ─── Password rule row ─────────────────────────────────────────── */
function RuleRow({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div className="rule-row" style={{ display: "flex", alignItems: "center", gap: 8, opacity: passed ? 1 : 0.55 }}>
      <span style={{
        width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        background: passed ? "rgba(16,185,129,0.18)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${passed ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.1)"}`,
        transition: "all 0.25s",
      }}>
        {passed
          ? <Check size={10} className="check-pop" style={{ color: "#10b981" }} />
          : <X size={10} style={{ color: "rgba(255,255,255,0.25)" }} />
        }
      </span>
      <span style={{ fontSize: 12.5, color: passed ? "#d1fae5" : "rgba(200,210,230,0.6)", transition: "color 0.25s" }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function Signup() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, name: false, confirm: false });
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, [step]);

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const strength = getStrength(password);
  const allRulesPassed = PW_RULES.every(r => r.test(password));

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const nameValid = name.trim().length >= 2;
  const confirmMatch = password === confirm && confirm.length > 0;

  const canStep1 = emailValid && nameValid;
  const canStep2 = allRulesPassed && confirmMatch;

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#f1f5f9",
    height: 46,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 14.5,
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const goNext = () => {
    setError("");
    if (step === 1) {
      setTouched(t => ({ ...t, email: true, name: true }));
      if (!canStep1) { setError("Please fill in all fields with valid information."); return; }
      setStep(2);
    } else if (step === 2) {
      setTouched(t => ({ ...t, confirm: true }));
      if (!allRulesPassed) { setError("Please meet all password requirements."); return; }
      if (!confirmMatch) { setError("Passwords do not match."); return; }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) { goNext(); return; }
    setLoading(true);
    setError("");
    try {
      await signup(email, password);
      sessionStorage.setItem("login_success", "true");
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Sign up failed. Please try again.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Orbs />

      {/* Back link */}
      <Link to="/" style={{
        position: "fixed", top: 24, left: 28, display: "flex", alignItems: "center", gap: 6,
        color: "rgba(165,180,252,0.7)", fontSize: 13, fontWeight: 500, textDecoration: "none",
        transition: "color 0.2s",
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "#a5b4fc")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(165,180,252,0.7)")}
      >
        <ArrowLeft size={14} /> Back to Home
      </Link>

      {/* Layout */}
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 16px",
        background: "linear-gradient(135deg, #080a12 0%, #0c0e1a 50%, #090b15 100%)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        <div style={{ width: "100%", maxWidth: 460 }}>

          {/* Logo + Headline */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 24px rgba(99,102,241,0.4)",
              }}>
                <Shield size={22} color="#fff" />
              </div>
              <CrediNovaLogo />
            </div>
            <h1 className="shimmer-text" style={{ fontSize: 28, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.5px" }}>
              Create your account
            </h1>
            <p style={{ color: "rgba(148,163,184,0.8)", fontSize: 14, margin: 0 }}>
              Join the Credit Intelligence Platform
            </p>
          </div>

          {/* Step progress */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
            {STEPS.map((s, i) => {
              const state = step > s.n ? "done" : step === s.n ? "active" : "idle";
              const Icon = s.icon;
              return (
                <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : undefined }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: state === "done" ? "rgba(16,185,129,0.15)"
                        : state === "active" ? "rgba(99,102,241,0.2)"
                        : "rgba(255,255,255,0.04)",
                      border: `2px solid ${state === "done" ? "#10b981"
                        : state === "active" ? "#6366f1"
                        : "rgba(255,255,255,0.08)"}`,
                      transition: "all 0.3s",
                    }}>
                      {state === "done"
                        ? <Check size={16} style={{ color: "#10b981" }} />
                        : <Icon size={15} style={{ color: state === "active" ? "#a5b4fc" : "rgba(255,255,255,0.25)" }} />
                      }
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
                      color: state === "active" ? "#a5b4fc"
                        : state === "done" ? "#6ee7b7"
                        : "rgba(255,255,255,0.25)",
                      textTransform: "uppercase",
                    }}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, margin: "0 10px", marginBottom: 18, borderRadius: 2,
                      background: step > s.n
                        ? "linear-gradient(90deg,#10b981,#6366f1)"
                        : "rgba(255,255,255,0.07)",
                      transition: "background 0.4s",
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Card */}
          <div className="glass-card" style={{ borderRadius: 20, padding: "32px 36px" }}>
            <form onSubmit={handleSubmit}>

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div className="step-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>Your identity</h2>
                    <p style={{ margin: 0, fontSize: 13.5, color: "rgba(148,163,184,0.75)" }}>Tell us who you are to get started.</p>
                  </div>

                  <Field label="Full Name" icon={User}>
                    <input
                      ref={firstInputRef as any}
                      className="input-glow"
                      style={{
                        ...inputStyle,
                        borderColor: touched.name && !nameValid ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)",
                      }}
                      placeholder="Jane Smith"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onBlur={() => setTouched(t => ({ ...t, name: true }))}
                      autoComplete="name"
                    />
                    {touched.name && !nameValid && (
                      <p style={{ margin: "4px 0 0 2px", fontSize: 12, color: "#f87171" }}>Enter at least 2 characters</p>
                    )}
                  </Field>

                  <Field label="Email Address" icon={Mail}>
                    <input
                      className="input-glow"
                      style={{
                        ...inputStyle,
                        borderColor: touched.email && !emailValid ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)",
                      }}
                      placeholder="jane@example.com"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onBlur={() => setTouched(t => ({ ...t, email: true }))}
                      autoComplete="email"
                    />
                    {touched.email && !emailValid && (
                      <p style={{ margin: "4px 0 0 2px", fontSize: 12, color: "#f87171" }}>Enter a valid email address</p>
                    )}
                  </Field>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <div className="step-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>Secure your account</h2>
                    <p style={{ margin: 0, fontSize: 13.5, color: "rgba(148,163,184,0.75)" }}>Choose a strong password to protect your data.</p>
                  </div>

                  <Field label="Password" icon={Lock}>
                    <input
                      ref={firstInputRef as any}
                      className="input-glow"
                      style={{ ...inputStyle, paddingRight: 44 }}
                      type={showPw ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "rgba(148,163,184,0.6)", padding: 2,
                      }}
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </Field>

                  {/* Strength meter */}
                  {password.length > 0 && (
                    <div style={{ marginTop: -8 }}>
                      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} style={{
                            flex: 1, height: 4, borderRadius: 4,
                            background: i <= strength ? STRENGTH_META[strength].color : "rgba(255,255,255,0.07)",
                            transition: "background 0.3s",
                          }} />
                        ))}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: STRENGTH_META[strength].color }}>
                          {STRENGTH_META[strength].label}
                        </span>
                        <span style={{ fontSize: 11.5, color: "rgba(148,163,184,0.5)" }}>
                          {strength}/5 requirements
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Rules checklist */}
                  <div style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12, padding: "14px 16px",
                    display: "flex", flexDirection: "column", gap: 8,
                  }}>
                    {PW_RULES.map(rule => (
                      <RuleRow key={rule.id} passed={rule.test(password)} label={rule.label} />
                    ))}
                  </div>

                  <Field label="Confirm Password" icon={Lock}>
                    <input
                      className="input-glow"
                      style={{
                        ...inputStyle, paddingRight: 44,
                        borderColor: touched.confirm && confirm.length > 0 && !confirmMatch
                          ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)",
                      }}
                      type={showCf ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCf(v => !v)}
                      style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "rgba(148,163,184,0.6)", padding: 2,
                      }}
                    >
                      {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </Field>

                  {confirm.length > 0 && (
                    <p style={{ margin: "-12px 0 0 2px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 5,
                      color: confirmMatch ? "#6ee7b7" : "#f87171" }}>
                      {confirmMatch
                        ? <><Check size={13} /> Passwords match — great!</>
                        : <><X size={13} /> Passwords do not match</>
                      }
                    </p>
                  )}
                </div>
              )}

              {/* ── STEP 3 ── */}
              {step === 3 && (
                <div className="step-content" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: "50%", margin: "0 auto 16px",
                      background: "rgba(99,102,241,0.12)", border: "2px solid rgba(99,102,241,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Sparkles size={26} style={{ color: "#a5b4fc" }} />
                    </div>
                    <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>You're all set!</h2>
                    <p style={{ margin: 0, fontSize: 13.5, color: "rgba(148,163,184,0.75)" }}>
                      Review your details before creating your account.
                    </p>
                  </div>

                  <div style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12, overflow: "hidden",
                  }}>
                    {[
                      { icon: User, label: "Full Name", value: name },
                      { icon: Mail, label: "Email", value: email },
                      { icon: Lock, label: "Password", value: "•".repeat(Math.min(password.length, 16)) },
                    ].map((row, i, arr) => (
                      <div key={row.label} style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                        borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : undefined,
                      }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                          background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <row.icon size={15} style={{ color: "#a5b4fc" }} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 11, color: "rgba(148,163,184,0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {row.label}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 14, color: "#e2e8f0", fontWeight: 500 }}>
                            {row.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px",
                    background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)",
                    borderRadius: 10,
                  }}>
                    <Shield size={15} style={{ color: "#6ee7b7", marginTop: 1, flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: 12.5, color: "rgba(209,250,229,0.8)", lineHeight: 1.5 }}>
                      Your data is encrypted and stored securely. We never share your information with third parties.
                    </p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{
                  marginTop: 18, padding: "12px 14px", borderRadius: 10,
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                  display: "flex", alignItems: "center", gap: 9,
                }}>
                  <X size={15} style={{ color: "#f87171", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#fca5a5" }}>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, marginTop: 24, alignItems: "center" }}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => { setError(""); setStep(s => (s - 1) as Step); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 7, padding: "0 18px", height: 46,
                      borderRadius: 10, background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)", color: "rgba(203,213,225,0.85)",
                      cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    flex: 1, height: 46, borderRadius: 10, border: "none",
                    color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    opacity: loading ? 0.75 : 1,
                  }}
                >
                  {loading
                    ? <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> Creating account…</>
                    : step === 3
                    ? <><Sparkles size={16} /> Create Account</>
                    : <>Continue <ChevronRight size={16} /></>
                  }
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <p style={{ textAlign: "center", marginTop: 22, fontSize: 13.5, color: "rgba(148,163,184,0.6)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#a5b4fc", fontWeight: 600, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
            >
              Sign in
            </Link>
          </p>
          <p style={{ textAlign: "center", marginTop: 8, fontSize: 11.5, color: "rgba(100,116,139,0.5)" }}>
            Demo: any email + any password (mock auth)
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}