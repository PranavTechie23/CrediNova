import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { ArrowRight, PlayCircle, Sun, Moon } from "lucide-react";

/* ─── types ──────────────────────────────────────────────────────────── */
interface ShapEntry {
  name: string;
  val: number;
  pct: number;
}

/* ─── constants ──────────────────────────────────────────────────────── */
const SHAP_DATA: ShapEntry[] = [
  { name: "upi_velocity_30d",    val:  0.182, pct: 82 },
  { name: "utility_consistency", val:  0.141, pct: 64 },
  { name: "ecom_spend_cat",      val:  0.097, pct: 44 },
  { name: "bureau_enquiries",    val: -0.063, pct: 29 },
  { name: "upi_merchant_div",    val:  0.058, pct: 26 },
  { name: "delinquency_flag",    val: -0.041, pct: 19 },
];

const PIPELINE_STEPS = [
  {
    num: "01",
    color: "cyan" as const,
    title: "Ingest",
    desc: "Aggregate UPI velocity, e-commerce patterns, and utility payment history via secure APIs.",
  },
  {
    num: "02",
    color: "purple" as const,
    title: "Score",
    desc: "Hybrid ML ensemble — XGBoost + LightGBM with Optuna-tuned hyperparameters and isotonic calibration.",
  },
  {
    num: "03",
    color: "green" as const,
    title: "Explain",
    desc: "SHAP value decomposition per feature, enriched by Gemini AI into plain-language risk narratives.",
  },
  {
    num: "04",
    color: "amber" as const,
    title: "Govern",
    desc: "Immutable audit log, 80% disparate impact enforcement, PSI drift alerts, FCA/PRA compliance trail.",
  },
];

const FEATURES = [
  {
    color: "cyan" as const,
    title: "Alternative Data Engine",
    desc: "Process UPI velocity, e-commerce spend categories, and utility payment consistency in real-time — no bank history required.",
    tag: "Real-time · <200ms",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4"  width="16" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="2" y="9"  width="16" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="2" y="14" width="10" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    color: "purple" as const,
    title: "SHAP Explainability",
    desc: "Every decision fully decomposed. Feature waterfall charts per applicant. No black-box outputs — ever.",
    tag: "Shapley values · Per-applicant",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 16l3-6 3 3 3-5 3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    color: "green" as const,
    title: "Fairness Agent",
    desc: "Automatic 80% disparate impact rule enforcement across protected classes. Flags potential bias before any decision is finalized.",
    tag: "4-class audit · Auto-flag",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3a7 7 0 100 14A7 7 0 0010 3z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 7v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    color: "amber" as const,
    title: "Drift Monitoring",
    desc: "Continuous PSI and KS statistics on all features. Automated alerts when distributions shift beyond acceptable thresholds.",
    tag: "PSI · KS-test · Alerts",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10h14M3 6h14M3 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="15" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    color: "red" as const,
    title: "Audit Trail",
    desc: "FCA and PRA-compliant immutable logging. Every model version, input, and decision output archived for regulatory review.",
    tag: "FCA · PRA · Immutable",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="4" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 7h6M7 10h6M7 13h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    color: "cyan" as const,
    title: "Policy Simulator",
    desc: "Adjust approval thresholds and instantly see projected impact on portfolio default rates, volume, and estimated revenue.",
    tag: "What-if · Instant recalc",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 4v3M10 13v3M4 10H7M13 10h3M6.5 6.5l2 2M11.5 11.5l2 2M6.5 13.5l2-2M11.5 8.5l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

/* ─── colour helpers ─────────────────────────────────────────────────── */
type AccentColor = "cyan" | "purple" | "green" | "amber" | "red";

const ICON_BG: Record<AccentColor, string> = {
  cyan:   "bg-[rgba(0,229,255,0.12)]   text-[#00E5FF]",
  purple: "bg-[rgba(139,92,246,0.1)]   text-[#8B5CF6]",
  green:  "bg-[rgba(16,185,129,0.12)]  text-[#10B981]",
  amber:  "bg-[rgba(245,158,11,0.1)]   text-[#F59E0B]",
  red:    "bg-[rgba(239,68,68,0.1)]    text-[#EF4444]",
};

/* ─── sub-components ─────────────────────────────────────────────────── */

/* Count-up number */
function CountUp({
  target,
  decimals = 0,
  format = "number",
  duration = 1400,
}: {
  target: number;
  decimals?: number;
  format?: "number" | "compact" | "percent";
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(reduceMotion ? target : 0);
  const [visible, setVisible] = useState(reduceMotion);
  const ref = useRef<HTMLSpanElement>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (reduceMotion) return;
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setVisible(true); },
      { threshold: 0.3 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    if (!visible) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setValue(target * ease);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [visible, target, duration]);

  const display = () => {
    if (format === "compact") {
      if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
      return Math.round(value).toLocaleString();
    }
    if (format === "percent") return `${Math.round(value)}%`;
    return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();
  };

  return <span ref={ref}>{display()}</span>;
}

/* Animated score gauge */
function ScoreGauge({ score, max = 850, min = 300 }: { score: number; max?: number; min?: number }) {
  const reduceMotion = useReducedMotion();
  const pct = ((score - min) / (max - min)) * 100;
  return (
    <div className="px-[18px] py-[14px] border-b border-white/[0.07]">
      <div className="h-[6px] bg-[#111720] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#10B981]"
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reduceMotion ? 0 : 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.5 }}
        />
      </div>
      <div className="flex justify-between mt-[6px] font-mono text-[10px] text-[#4A5568]">
        <span>300</span><span>Poor</span><span>Fair</span><span>Good</span><span>850</span>
      </div>
    </div>
  );
}

/* Single SHAP row */
function ShapRow({ entry, delay }: { entry: ShapEntry; delay: number }) {
  const reduceMotion = useReducedMotion();
  const isPos = entry.val >= 0;
  return (
    <div className="flex items-center gap-[10px]">
      <span className="font-mono text-[11px] text-[#8B9AB0] w-[130px] shrink-0 truncate">
        {entry.name}
      </span>
      <div className="flex-1 h-[6px] bg-[#111720] rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isPos ? "bg-[#10B981]" : "bg-[#EF4444] ml-auto"}`}
          initial={{ width: "0%" }}
          animate={{ width: `${entry.pct}%` }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.4, 0, 0.2, 1], delay }}
        />
      </div>
      <span className={`font-mono text-[10px] w-[36px] text-right shrink-0 ${isPos ? "text-[#10B981]" : "text-[#EF4444]"}`}>
        {isPos ? "+" : ""}{entry.val.toFixed(3)}
      </span>
    </div>
  );
}

/* Live Credit Decision Card — the hero's signature element */
function DecisionCard() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="rounded-2xl overflow-hidden border border-white/[0.07] bg-[#0D1117] shadow-[0_0_0_1px_rgba(0,229,255,0.05),0_32px_64px_rgba(0,0,0,0.5)]"
    >
      {/* header */}
      <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-white/[0.07] bg-[#111720]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#4A5568]">Credit Decision</span>
          <span className="font-mono text-[11px] text-[#00E5FF]">#APP-20847</span>
        </div>
        <div className="flex items-center gap-[5px] font-mono text-[11px] text-[#10B981] bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.25)] px-[10px] py-[3px] rounded-full">
          <span className="w-[5px] h-[5px] rounded-full bg-[#10B981] animate-pulse" />
          APPROVED
        </div>
      </div>

      {/* score row */}
      <div className="flex items-end justify-between px-[18px] pt-5 pb-[14px] border-b border-white/[0.07]">
        <div>
          <motion.div
            className="font-mono text-[52px] font-medium text-[#10B981] leading-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {reduceMotion ? "724" : <CountUp target={724} duration={1400} />}
          </motion.div>
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#4A5568] mt-1">
            Composite Score
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block font-mono text-[12px] font-medium text-[#10B981] px-[10px] py-[3px] bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.25)] rounded-[6px] mb-[6px]">
            Low Risk
          </span>
          <div className="font-mono text-[11px] text-[#4A5568]">Conf. interval: 711–737</div>
          <div className="font-mono text-[11px] text-[#4A5568] mt-[3px]">Model: XGB-v2.4 + LGBM</div>
        </div>
      </div>

      {/* gauge */}
      <ScoreGauge score={724} />

      {/* SHAP header */}
      <div className="flex items-center justify-between px-[18px] pt-[14px] pb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#4A5568]">
          SHAP Feature Contributions
        </span>
        <div className="flex gap-3 font-mono text-[10px] text-[#4A5568]">
          <span className="flex items-center gap-1">
            <span className="w-[6px] h-[6px] rounded-[2px] bg-[#10B981]" />Positive
          </span>
          <span className="flex items-center gap-1">
            <span className="w-[6px] h-[6px] rounded-[2px] bg-[#EF4444]" />Negative
          </span>
        </div>
      </div>

      {/* SHAP rows */}
      <div className="px-[18px] pb-4 flex flex-col gap-2">
        {SHAP_DATA.map((entry, i) => (
          <ShapRow key={entry.name} entry={entry} delay={0.7 + i * 0.07} />
        ))}
      </div>

      {/* card footer */}
      <div className="flex items-center justify-between px-[18px] py-3 bg-[#111720] border-t border-white/[0.07]">
        <span className="font-mono text-[10px] text-[#4A5568]">
          Processed: 142ms · Fairness: ✓ 82%
        </span>
        <span className="font-mono text-[10px] text-[#00E5FF]">Audit logged</span>
      </div>
    </motion.div>
  );
}

/* ─── main component ─────────────────────────────────────────────────── */
export default function Landing() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#080C12] text-[#E2E8F0] font-sans selection:bg-[rgba(0,229,255,0.2)] selection:text-[#00E5FF]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── GOOGLE FONTS ── inject once via a style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }
        @keyframes cn-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .cn-pulse { animation: cn-pulse 2s ease-in-out infinite; }
      `}</style>

      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-8 lg:px-12 bg-[rgba(8,12,18,0.85)] backdrop-blur-2xl border-b border-white/[0.07]">
        {/* logo */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="relative w-7 h-7 flex items-center justify-center">
            <svg className="absolute" width="28" height="28" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 25,8 25,20 14,26 3,20 3,8" stroke="#00E5FF" strokeWidth="1.5" fill="none" opacity="0.6" />
            </svg>
            <div className="w-2 h-2 bg-[#00E5FF] rounded-full relative z-10 cn-pulse" />
          </div>
          <span className="font-display font-bold text-[18px] tracking-[-0.01em] bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] bg-clip-text text-transparent" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            CrediNova
          </span>
        </motion.div>

        {/* right links */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1"
        >
          <a href="#pipeline" className="text-[13px] font-medium text-[#8B9AB0] hover:text-[#E2E8F0] px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">How it works</a>
          <a href="#features" className="text-[13px] font-medium text-[#8B9AB0] hover:text-[#E2E8F0] px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">Features</a>
          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[#8B9AB0] hover:text-[#E2E8F0] hover:bg-white/5 transition-all ml-2"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link to="/login" className="text-[13px] font-medium text-[#8B9AB0] hover:text-[#E2E8F0] px-3 py-1.5 transition-all ml-1">Sign in</Link>
          <Link
            to="/dashboard"
            className="ml-2 text-[13px] font-semibold text-[#080C12] bg-[#00E5FF] px-[18px] py-[7px] rounded-lg hover:opacity-85 transition-opacity"
          >
            Launch Platform
          </Link>
        </motion.div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="flex items-center gap-16 pt-24 pb-20 lg:pt-32 lg:pb-28 px-8 lg:px-12 min-h-screen">
        {/* left */}
        <div className="flex-1 max-w-[520px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* eyebrow */}
            <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[#00E5FF] tracking-[0.12em] uppercase mb-7 px-3 py-1.5 bg-[rgba(0,229,255,0.12)] border border-[rgba(0,229,255,0.2)] rounded-[6px]" style={{ fontFamily: "'DM Mono', monospace" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] cn-pulse" />
              AI Credit Intelligence · v2.4.1
            </div>

            {/* headline */}
            <h1
              className="text-[clamp(40px,5vw,58px)] font-bold leading-[1.07] tracking-[-0.03em] mb-5"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Credit access for<br />
              the{" "}
              <em className="not-italic bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] bg-clip-text text-transparent">
                financially<br />invisible
              </em>
            </h1>

            {/* subheading */}
            <p className="text-[16px] text-[#8B9AB0] leading-[1.7] max-w-[440px] mb-9">
              ML-powered scoring for 1.4B unbanked people using alternative signals — with full explainability, fairness auditing, and every decision traced.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-3 flex-wrap">
              <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#080C12] bg-[#00E5FF] px-6 py-3 rounded-[10px] hover:shadow-[0_8px_32px_rgba(0,229,255,0.25)] transition-shadow"
                >
                  Launch Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ borderColor: "rgba(0,229,255,0.3)" }}>
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="inline-flex items-center gap-2 text-[14px] font-medium text-[#8B9AB0] hover:text-[#E2E8F0] px-6 py-3 rounded-[10px] border border-white/[0.07] hover:border-[rgba(0,229,255,0.3)] transition-all"
                >
                  <PlayCircle className="w-4 h-4" /> Watch Demo
                </button>
              </motion.div>
            </div>

            {/* stats strip */}
            <div className="flex gap-8 mt-12 pt-9 border-t border-white/[0.07]">
              {[
                { target: 1_400_000_000, format: "compact" as const, decimals: 0, label: "Unbanked globally" },
                { target: 0.78,         format: "number"  as const, decimals: 2, label: "Production AUC" },
                { target: 80,           format: "percent" as const, decimals: 0, label: "Disparate impact floor" },
              ].map((s) => (
                <div key={s.label}>
                  <span className="font-mono text-[22px] font-medium text-[#00E5FF] block" style={{ fontFamily: "'DM Mono', monospace" }}>
                    <CountUp target={s.target} format={s.format} decimals={s.decimals} duration={1500} />
                  </span>
                  <span className="text-[11px] text-[#4A5568] uppercase tracking-[0.08em] mt-0.5 block">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* right — Decision Card */}
        <div className="hidden lg:block w-[420px] shrink-0">
          <DecisionCard />
        </div>
      </section>

      <div className="mx-8 lg:mx-12 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* ── PIPELINE ─────────────────────────────────────────────────── */}
      <section id="pipeline" className="py-24 px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.12em] mb-4" style={{ fontFamily: "'DM Mono', monospace" }}>
            How It Works
          </div>
          <h2 className="text-[clamp(28px,3vw,38px)] font-bold tracking-[-0.02em] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            A fully autonomous scoring pipeline
          </h2>
          <p className="text-[15px] text-[#8B9AB0] max-w-[480px] mb-14">
            From raw alternative data to a regulatory-compliant decision in under 200ms.
          </p>
        </motion.div>

        {/* steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[2px]">
          {PIPELINE_STEPS.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className={`relative bg-[#0D1117] p-7 border border-white/[0.07] hover:border-[rgba(0,229,255,0.3)] transition-colors group
                ${idx === 0 ? "lg:rounded-l-xl" : ""}
                ${idx === PIPELINE_STEPS.length - 1 ? "lg:rounded-r-xl" : ""}
                ${idx > 0 ? "lg:-ml-px" : ""}
              `}
            >
              <div className="font-mono text-[11px] text-[#4A5568] mb-4" style={{ fontFamily: "'DM Mono', monospace" }}>{step.num}</div>
              <div className={`w-10 h-10 flex items-center justify-center rounded-[10px] mb-4 ${ICON_BG[step.color]}`}>
                {/* placeholder icon shapes per step */}
                {idx === 0 && <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="9" width="16" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="14" width="16" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>}
                {idx === 1 && <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 16l3-6 3 3 3-5 3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {idx === 2 && <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {idx === 3 && <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
              </div>
              <div className="text-[16px] font-semibold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{step.title}</div>
              <p className="text-[13px] text-[#8B9AB0] leading-[1.6]">{step.desc}</p>
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className="hidden lg:flex absolute -right-[14px] top-1/2 -translate-y-1/2 w-7 h-7 bg-[#111720] border border-white/[0.07] rounded-full items-center justify-center z-10 text-[12px] text-[#4A5568]">›</div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <div className="mx-8 lg:mx-12 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.12em] mb-4" style={{ fontFamily: "'DM Mono', monospace" }}>
            Capabilities
          </div>
          <h2 className="text-[clamp(28px,3vw,38px)] font-bold tracking-[-0.02em] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Enterprise-grade by default
          </h2>
          <p className="text-[15px] text-[#8B9AB0] max-w-[480px]">
            Every layer built for risk officers, data scientists, and compliance teams.
          </p>
        </motion.div>

        {/* grid — joined surface */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/[0.07] border border-white/[0.07] rounded-2xl overflow-hidden">
          {FEATURES.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.07 }}
              className="bg-[#0D1117] hover:bg-[#111720] p-8 transition-colors"
            >
              <div className={`w-11 h-11 flex items-center justify-center rounded-[10px] mb-[18px] ${ICON_BG[feat.color]}`}>
                {feat.icon}
              </div>
              <div className="text-[15px] font-semibold mb-2.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{feat.title}</div>
              <p className="text-[13px] text-[#8B9AB0] leading-[1.65]">{feat.desc}</p>
              <span className="inline-block font-mono text-[10px] mt-3.5 px-2 py-[3px] bg-[#111720] border border-white/[0.07] rounded text-[#4A5568]" style={{ fontFamily: "'DM Mono', monospace" }}>
                {feat.tag}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA STRIP ────────────────────────────────────────────────── */}
      <section className="px-8 lg:px-12 pb-24">
        <div className="relative flex items-center justify-between gap-10 bg-[#0D1117] border border-white/[0.07] rounded-2xl px-16 py-14 overflow-hidden">
          {/* ambient glow */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-[radial-gradient(circle,rgba(0,229,255,0.07)_0%,transparent_70%)] pointer-events-none" />
          <div>
            <h2 className="text-[28px] font-bold tracking-[-0.02em] mb-2.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Ready to transform credit access?
            </h2>
            <p className="text-[14px] text-[#8B9AB0]">
              Join fintechs using AI to serve the financially invisible — with fairness and full transparency.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#080C12] bg-[#00E5FF] px-6 py-3 rounded-[10px] hover:shadow-[0_8px_32px_rgba(0,229,255,0.25)] transition-shadow"
              >
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <Link
              to="/documentation"
              className="inline-flex items-center gap-2 text-[14px] font-medium text-[#8B9AB0] hover:text-[#E2E8F0] px-6 py-3 rounded-[10px] border border-white/[0.07] hover:border-[rgba(0,229,255,0.3)] transition-all"
            >
              Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.07] px-8 lg:px-12 pt-12 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative w-6 h-6 flex items-center justify-center">
                <svg className="absolute" width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <polygon points="14,2 25,8 25,20 14,26 3,20 3,8" stroke="#00E5FF" strokeWidth="1.5" fill="none" opacity="0.6" />
                </svg>
                <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full relative z-10" />
              </div>
              <span className="text-[16px] font-bold bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] bg-clip-text text-transparent" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>CrediNova</span>
            </div>
            <p className="text-[13px] text-[#4A5568] leading-[1.6] max-w-[200px]">
              AI-powered credit scoring for the financially invisible.
            </p>
          </div>
          {[
            { title: "Product", links: [["Features", "/"], ["Pricing", "/"], ["Security", "/"]] },
            { title: "Company", links: [["About", "/"], ["Blog", "/"], ["Contact", "/"]] },
            { title: "Legal",   links: [["Privacy", "/privacy-policy"], ["Terms", "/terms-of-service"], ["Compliance", "/compliance"]] },
          ].map((col) => (
            <div key={col.title}>
              <div className="font-mono text-[11px] text-[#4A5568] uppercase tracking-[0.1em] mb-4" style={{ fontFamily: "'DM Mono', monospace" }}>
                {col.title}
              </div>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link to={href} className="text-[13px] text-[#8B9AB0] hover:text-[#E2E8F0] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-white/[0.07]">
          <div className="flex flex-wrap gap-1.5">
            {["React", "TypeScript", "Tailwind", "Framer Motion", "Gemini AI", "Recharts"].map((t) => (
              <span key={t} className="font-mono text-[10px] text-[#4A5568] px-2 py-[3px] border border-white/[0.07] rounded" style={{ fontFamily: "'DM Mono', monospace" }}>
                {t}
              </span>
            ))}
          </div>
          <span className="font-mono text-[11px] text-[#4A5568]" style={{ fontFamily: "'DM Mono', monospace" }}>
            © 2026 CrediNova. All rights reserved.
          </span>
        </div>
      </footer>

      {/* ── VIDEO MODAL ──────────────────────────────────────────────── */}
      {isVideoModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Demo video"
          className="fixed inset-0 bg-[rgba(8,12,18,0.95)] backdrop-blur-md z-[100] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsVideoModalOpen(false); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0D1117] border border-white/[0.07] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative"
          >
            <button
              autoFocus
              onClick={() => setIsVideoModalOpen(false)}
              aria-label="Close video dialog"
              className="absolute top-4 right-4 w-9 h-9 bg-[#111720] hover:bg-white/10 rounded-full flex items-center justify-center text-[#8B9AB0] hover:text-[#E2E8F0] z-10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/60"
            >
              ✕
            </button>
            <div className="aspect-video bg-gradient-to-br from-[rgba(0,229,255,0.08)] to-[rgba(139,92,246,0.08)] flex flex-col items-center justify-center border-b border-white/[0.07]">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <PlayCircle className="w-16 h-16 text-[#00E5FF] mb-4" />
              </motion.div>
              <p className="font-mono text-[13px] text-[#4A5568]" style={{ fontFamily: "'DM Mono', monospace" }}>Demo Video Placeholder</p>
            </div>
            <div className="p-6 flex justify-between items-center">
              <div>
                <h3 className="text-[18px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>CrediNova Platform Walkthrough</h3>
                <p className="font-mono text-[12px] text-[#4A5568]" style={{ fontFamily: "'DM Mono', monospace" }}>4:25 · Product Demo</p>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-[13px] font-semibold text-[#080C12] bg-[#00E5FF] px-5 py-2.5 rounded-lg hover:opacity-85 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/60"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}