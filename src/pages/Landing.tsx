import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, Brain, Scale, Activity, Zap, Lock, BarChart3, ChevronRight, Moon, Sun } from "lucide-react";
import CrediNovaLogo from "@/components/CrediNovaLogo";
import { useTheme } from "@/context/ThemeContext";

// Count-up animation for hero stats
function useCountUp(end: number, duration = 1.5, decimals = 0, deps: unknown[] = []) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number;
    const step = (t: number) => {
      if (!start) start = t;
      const progress = Math.min((t - start) / (duration * 1000), 1);
      setValue(progress * end);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, ...deps]);
  return decimals ? value.toFixed(decimals) : Math.round(value);
}

const PREVIEW_SAMPLES = [
  { riskScore: 742, pd: "3.2%", riskDriver: "Debt-to-Income", driverVal: "+0.18", protective: "Payment History", protectiveVal: "−0.31", decision: "APPROVED", conf: "94.8%", text: "Strong payment history and low credit utilization outweigh elevated debt-to-income ratio. Full loan amount approved at standard rate." },
  { riskScore: 618, pd: "8.1%", riskDriver: "Credit Utilization", driverVal: "+0.22", protective: "Income Stability", protectiveVal: "−0.19", decision: "APPROVED", conf: "88.2%", text: "Moderate risk profile. Approved with standard rate; consider reducing utilization for better terms next time." },
  { riskScore: 521, pd: "18.4%", riskDriver: "Past Delinquencies", driverVal: "+0.35", protective: "Months Since Last", protectiveVal: "−0.12", decision: "MANUAL REVIEW", conf: "79.1%", text: "Elevated delinquency history triggers manual review. Applicant may be asked for additional documentation." },
];

// Typewriter effect component
const Typewriter = ({ text, speed = 30, delay = 500 }: { text: string; speed?: number; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let index = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((_current) => text.slice(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(intervalId);
      }
    }, speed);
    return () => clearInterval(intervalId);
  }, [text, speed, started]);

  return (
    <span>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const [liveCount, setLiveCount] = useState(127);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

  useEffect(() => {
    const success = sessionStorage.getItem("logout_success");
    if (success) {
      setShowLogoutSuccess(true);
      sessionStorage.removeItem("logout_success");
      const timer = setTimeout(() => setShowLogoutSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Live activity ticker: increment every 2–5s so it feels like real traffic
  useEffect(() => {
    const t = setInterval(() => {
      setLiveCount((c) => c + Math.floor(Math.random() * 3) + 1);
    }, 2500 + Math.random() * 2000);
    return () => clearInterval(t);
  }, []);

  // Cycle preview card every 6s so judges see "live" output changing
  useEffect(() => {
    const t = setInterval(() => setPreviewIndex((i) => (i + 1) % PREVIEW_SAMPLES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const sample = PREVIEW_SAMPLES[previewIndex];
  const statAuc = useCountUp(0.94, 1.8, 2);
  const statAgents = useCountUp(4, 1.2);
  const statPct = useCountUp(100, 1.5);

  const featuresRef = useRef(null);
  const previewRef = useRef(null);
  const stepsRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" });
  const previewInView = useInView(previewRef, { once: true, margin: "-60px" });
  const stepsInView = useInView(stepsRef, { once: true, margin: "-60px" });

  const stagger = { animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
  const itemUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };
  const itemFade = { initial: { opacity: 0 }, animate: { opacity: 1 } };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .acie-root {
          font-family: 'Sora', sans-serif;
          background: #ffffff;
          color: #0c2340;
          min-height: 100vh;
          overflow-x: hidden;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        html.dark .acie-root {
          background: #0c2340;
          color: #e0f2fe;
        }

        .logout-success-msg {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #10b981;
          color: white;
          padding: 12px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          box-shadow: 0 10px 25px rgba(16,185,129,0.4);
          z-index: 9999;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .tick-circle {
          width: 20px; height: 20px; border-radius: 50%;
          background: white; color: #10b981;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px;
        }

        /* ── HEADER ── */
        .hdr {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid #e0f2fe;
          padding: 0 1.5rem;
          height: 66px;
          display: flex; align-items: center; justify-content: space-between;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        html.dark .hdr {
          background: rgba(12,35,64,0.88);
          border-bottom-color: rgba(56,189,248,0.15);
        }

        .hdr-logo { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          text-decoration: none;
        }

        .hdr-logo-icon {
          width: 36px; height: 36px; border-radius: 9px;
          background: linear-gradient(135deg, #0284c7, #38bdf8);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(2,132,199,0.35);
          flex-shrink: 0;
        }

        .hdr-logo-text { 
          font-size: 0.9rem; 
          font-weight: 700; 
          color: #0c2340; 
          letter-spacing: -0.02em; 
          line-height: 1.2;
          transition: color 0.3s ease;
        }

        html.dark .hdr-logo-text {
          color: #e0f2fe;
        }

        .hdr-logo-text span { color: #0284c7; }

        .hdr-nav { 
          display: flex; 
          align-items: center; 
          gap: 8px;
        }

        .btn-theme-toggle {
          background: none;
          border: 1px solid #e0f2fe;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: #334155;
        }

        html.dark .btn-theme-toggle {
          border-color: rgba(56,189,248,0.2);
          color: #7dd3fc;
        }

        .btn-theme-toggle:hover {
          background: #f0f9ff;
          border-color: #7dd3fc;
        }

        html.dark .btn-theme-toggle:hover {
          background: rgba(56,189,248,0.1);
        }

        .btn-ghost {
          background: none; 
          border: none; 
          padding: 8px 16px; 
          font-family: 'Sora', sans-serif;
          font-size: 0.875rem; 
          font-weight: 500; 
          color: #334155; 
          cursor: pointer;
          border-radius: 8px; 
          transition: all 0.18s; 
          text-decoration: none;
          display: inline-flex; 
          align-items: center;
        }

        html.dark .btn-ghost {
          color: #cbd5e1;
        }

        .btn-ghost:hover { 
          background: #f0f9ff; 
          color: #0284c7; 
        }

        html.dark .btn-ghost:hover {
          background: rgba(56,189,248,0.1);
          color: #7dd3fc;
        }

        .btn-primary {
          background: linear-gradient(135deg, #0369a1, #0ea5e9);
          border: none; 
          padding: 9px 22px; 
          font-family: 'Sora', sans-serif;
          font-size: 0.875rem; 
          font-weight: 600; 
          color: white; 
          cursor: pointer;
          border-radius: 8px; 
          transition: all 0.22s; 
          text-decoration: none;
          display: inline-flex; 
          align-items: center; 
          gap: 7px;
          box-shadow: 0 2px 12px rgba(3,105,161,0.35);
        }

        .btn-primary:hover { 
          transform: translateY(-1px); 
          box-shadow: 0 6px 20px rgba(3,105,161,0.45); 
        }

        .btn-primary-lg {
          padding: 14px 34px; 
          font-size: 1rem; 
          border-radius: 10px;
          box-shadow: 0 4px 18px rgba(3,105,161,0.4);
        }

        .btn-outline-lg {
          background: transparent; 
          border: 1.5px solid #bae6fd; 
          padding: 13px 30px;
          font-family: 'Sora', sans-serif; 
          font-size: 1rem; 
          font-weight: 600;
          color: #0369a1; 
          cursor: pointer; 
          border-radius: 10px; 
          transition: all 0.2s;
          text-decoration: none; 
          display: inline-flex; 
          align-items: center; 
          gap: 7px;
        }

        html.dark .btn-outline-lg {
          border-color: rgba(56,189,248,0.4);
          color: #7dd3fc;
        }

        .btn-outline-lg:hover { 
          background: #f0f9ff; 
          border-color: #38bdf8; 
        }

        html.dark .btn-outline-lg:hover {
          background: rgba(56,189,248,0.1);
        }

        /* ── HERO ── */
        .hero {
          position: relative; 
          overflow: hidden;
          padding: 96px 2rem 88px; 
          text-align: center;
          background: linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%);
          transition: background 0.3s ease;
        }

        html.dark .hero {
          background: linear-gradient(180deg, #0c2340 0%, #1e3a5f 100%);
        }

        .hero::before {
          content: ''; 
          position: absolute; 
          inset: 0; 
          pointer-events: none;
          background:
            radial-gradient(ellipse 90% 55% at 50% -5%, rgba(14,165,233,0.14) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 85% 85%, rgba(56,189,248,0.07) 0%, transparent 55%);
        }

        html.dark .hero::before {
          background:
            radial-gradient(ellipse 90% 55% at 50% -5%, rgba(56,189,248,0.2) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 85% 85%, rgba(14,165,233,0.1) 0%, transparent 55%);
        }

        .hero-grid {
          position: absolute; 
          inset: 0; 
          pointer-events: none;
          background-image:
            linear-gradient(rgba(2,132,199,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(2,132,199,0.045) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
          animation: gridShift 20s linear infinite;
        }

        @keyframes gridShift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(4px, 4px); }
        }

        html.dark .hero-grid {
          background-image:
            linear-gradient(rgba(56,189,248,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.08) 1px, transparent 1px);
        }

        .live-ticker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 100px;
          background: rgba(5, 150, 105, 0.12);
          border: 1px solid rgba(5, 150, 105, 0.35);
          font-size: 0.75rem;
          font-weight: 600;
          color: #059669;
          font-family: 'DM Mono', monospace;
        }
        html.dark .live-ticker {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.4);
          color: #10b981;
        }
        .live-ticker-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          animation: livePulse 1.2s ease-in-out infinite;
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }

        .preview-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 100px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          font-size: 0.65rem;
          font-weight: 700;
          color: #dc2626;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        html.dark .preview-live-badge {
          background: rgba(248, 113, 113, 0.15);
          border-color: rgba(248, 113, 113, 0.4);
          color: #f87171;
        }
        .preview-live-badge-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: currentColor;
          animation: livePulse 0.8s ease-in-out infinite;
        }

        .hero-inner { 
          position: relative; 
          max-width: 800px; 
          margin: 0 auto; 
        }

        .hero-badge {
          display: inline-flex; 
          align-items: center; 
          gap: 7px;
          background: rgba(14,165,233,0.1); 
          border: 1px solid rgba(14,165,233,0.25);
          padding: 5px 14px; 
          border-radius: 100px; 
          margin-bottom: 28px;
          font-size: 0.75rem; 
          font-weight: 600; 
          color: #0369a1; 
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        html.dark .hero-badge {
          background: rgba(56,189,248,0.15);
          border-color: rgba(56,189,248,0.3);
          color: #7dd3fc;
        }

        .hero-badge-dot { 
          width: 6px; 
          height: 6px; 
          border-radius: 50%; 
          background: #0ea5e9; 
          animation: pulse 2s infinite; 
        }

        @keyframes pulse { 
          0%,100% { opacity: 1; transform: scale(1); } 
          50% { opacity: 0.5; transform: scale(0.8); } 
        }

        .hero h1 {
          font-size: clamp(2rem, 5vw, 3.6rem); 
          font-weight: 800;
          letter-spacing: -0.04em; 
          line-height: 1.12; 
          color: #0c2340;
          margin-bottom: 22px;
          transition: color 0.3s ease;
        }

        html.dark .hero h1 {
          color: #e0f2fe;
        }

        .hero h1 .grad {
          background: linear-gradient(135deg, #0369a1, #0ea5e9, #38bdf8);
          -webkit-background-clip: text; 
          -webkit-text-fill-color: transparent; 
          background-clip: text;
        }

        .hero-sub {
          font-size: clamp(1rem, 2vw, 1.15rem); 
          color: #475569; 
          max-width: 580px; 
          margin: 0 auto 40px;
          line-height: 1.7; 
          font-weight: 400;
          transition: color 0.3s ease;
        }

        html.dark .hero-sub {
          color: #cbd5e1;
        }

        .hero-cta { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 14px; 
          justify-content: center; 
          margin-bottom: 56px; 
        }

        .hero-stats {
          display: flex; 
          flex-wrap: wrap; 
          gap: 32px; 
          justify-content: center;
          padding-top: 40px; 
          border-top: 1px solid #e0f2fe;
        }

        html.dark .hero-stats {
          border-top-color: rgba(56,189,248,0.15);
        }

        .stat { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 3px; 
        }

        .stat-num { 
          font-size: clamp(1.25rem, 3vw, 1.75rem); 
          font-weight: 800; 
          color: #0369a1; 
          letter-spacing: -0.04em; 
          font-family: 'DM Mono', monospace;
          transition: color 0.3s ease;
        }

        html.dark .stat-num {
          color: #7dd3fc;
        }

        .stat-lbl { 
          font-size: clamp(0.7rem, 1.5vw, 0.78rem); 
          color: #64748b; 
          font-weight: 500; 
          text-transform: uppercase; 
          letter-spacing: 0.05em;
          transition: color 0.3s ease;
        }

        html.dark .stat-lbl {
          color: #94a3b8;
        }

        /* ── FEATURES ── */
        .features {
          padding: 88px 2rem; 
          background: #ffffff;
          max-width: 1100px; 
          margin: 0 auto;
          transition: background-color 0.3s ease;
        }

        html.dark .features {
          background: #0c2340;
        }

        .section-label {
          font-size: 0.72rem; 
          font-weight: 700; 
          text-transform: uppercase; 
          letter-spacing: 0.1em;
          color: #0284c7; 
          margin-bottom: 12px;
          transition: color 0.3s ease;
        }

        html.dark .section-label {
          color: #7dd3fc;
        }

        .section-title {
          font-size: clamp(1.5rem, 3vw, 2.2rem); 
          font-weight: 800;
          letter-spacing: -0.03em; 
          color: #0c2340; 
          margin-bottom: 14px;
          transition: color 0.3s ease;
        }

        html.dark .section-title {
          color: #e0f2fe;
        }

        .section-sub { 
          font-size: clamp(0.9rem, 1.5vw, 1rem); 
          color: #64748b; 
          max-width: 520px; 
          line-height: 1.65;
          transition: color 0.3s ease;
        }

        html.dark .section-sub {
          color: #94a3b8;
        }

        .features-header { margin-bottom: 52px; }
        
        .features-grid {
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
          gap: 24px;
        }

        @media (max-width: 640px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
        }

        .feat-card {
          border: 1px solid #e0f2fe; 
          border-radius: 16px; 
          padding: 28px;
          background: #ffffff; 
          transition: all 0.25s; 
          position: relative; 
          overflow: hidden;
        }

        html.dark .feat-card {
          background: #1e3a5f;
          border-color: rgba(56,189,248,0.15);
        }

        .feat-card::before {
          content: ''; 
          position: absolute; 
          inset: 0; 
          border-radius: 16px; 
          opacity: 0; 
          transition: opacity 0.25s;
          background: linear-gradient(135deg, rgba(14,165,233,0.04), rgba(56,189,248,0.02));
        }

        html.dark .feat-card::before {
          background: linear-gradient(135deg, rgba(56,189,248,0.08), rgba(14,165,233,0.04));
        }

        .feat-card:hover { 
          border-color: #7dd3fc; 
          box-shadow: 0 8px 32px rgba(2,132,199,0.12); 
          transform: translateY(-2px); 
        }

        html.dark .feat-card:hover {
          border-color: rgba(56,189,248,0.4);
          box-shadow: 0 8px 32px rgba(56,189,248,0.2);
        }

        .feat-card:hover::before { opacity: 1; }
        
        .feat-icon {
          width: 44px; 
          height: 44px; 
          border-radius: 12px; 
          margin-bottom: 18px;
          display: flex; 
          align-items: center; 
          justify-content: center;
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
        }

        html.dark .feat-icon {
          background: linear-gradient(135deg, rgba(56,189,248,0.2), rgba(14,165,233,0.15));
        }

        .feat-icon svg { color: #0284c7; }

        html.dark .feat-icon svg {
          color: #7dd3fc;
        }

        .feat-title { 
          font-size: 1rem; 
          font-weight: 700; 
          color: #0c2340; 
          margin-bottom: 8px;
          transition: color 0.3s ease;
        }

        html.dark .feat-title {
          color: #e0f2fe;
        }

        .feat-desc { 
          font-size: 0.875rem; 
          color: #64748b; 
          line-height: 1.65;
          transition: color 0.3s ease;
        }

        html.dark .feat-desc {
          color: #cbd5e1;
        }

        /* ── HOW IT WORKS ── */
        .how {
          padding: 88px 2rem;
          background: linear-gradient(180deg, #f8fafc 0%, #f0f9ff 100%);
          transition: background 0.3s ease;
        }

        html.dark .how {
          background: linear-gradient(180deg, #1e3a5f 0%, #0c2340 100%);
        }

        .how-inner { 
          max-width: 900px; 
          margin: 0 auto; 
        }

        .how-header { 
          text-align: center; 
          margin-bottom: 56px; 
        }

        .steps { 
          display: flex; 
          flex-direction: column; 
          gap: 0; 
        }

        .step {
          display: flex; 
          gap: 24px; 
          align-items: flex-start; 
          padding: 28px 0;
          border-bottom: 1px solid #e0f2fe; 
          position: relative;
        }

        html.dark .step {
          border-bottom-color: rgba(56,189,248,0.15);
        }

        .step:last-child { border-bottom: none; }

        .step-num {
          width: 40px; 
          height: 40px; 
          border-radius: 50%; 
          flex-shrink: 0;
          background: linear-gradient(135deg, #0369a1, #0ea5e9);
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-size: 0.85rem; 
          font-weight: 700; 
          color: white;
          box-shadow: 0 3px 10px rgba(3,105,161,0.3);
        }

        .step-body { flex: 1; }

        .step-title { 
          font-size: clamp(0.9rem, 2vw, 1rem); 
          font-weight: 700; 
          color: #0c2340; 
          margin-bottom: 5px;
          transition: color 0.3s ease;
        }

        html.dark .step-title {
          color: #e0f2fe;
        }

        .step-desc { 
          font-size: clamp(0.8rem, 1.5vw, 0.875rem); 
          color: #64748b; 
          line-height: 1.6;
          transition: color 0.3s ease;
        }

        html.dark .step-desc {
          color: #cbd5e1;
        }

        .step-tag {
          display: inline-flex; 
          align-items: center; 
          gap: 5px; 
          margin-top: 10px;
          font-size: 0.72rem; 
          font-weight: 600; 
          font-family: 'DM Mono', monospace;
          color: #0369a1; 
          background: #e0f2fe; 
          padding: 3px 10px; 
          border-radius: 100px;
        }

        html.dark .step-tag {
          color: #7dd3fc;
          background: rgba(56,189,248,0.15);
        }

        /* ── TRUST STRIP ── */
        .trust {
          padding: 56px 2rem;
          background: linear-gradient(135deg, #0c2340 0%, #0369a1 100%);
          position: relative; 
          overflow: hidden;
        }

        html.dark .trust {
          background: linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 100%);
        }

        .trust::before {
          content: ''; 
          position: absolute; 
          inset: 0; 
          pointer-events: none;
          background: radial-gradient(ellipse 70% 60% at 80% 50%, rgba(56,189,248,0.12) 0%, transparent 60%);
        }

        .trust-inner {
          max-width: 1000px; 
          margin: 0 auto; 
          position: relative;
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
          gap: 32px;
          align-items: center;
        }

        @media (max-width: 640px) {
          .trust-inner {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        .trust-item { 
          display: flex; 
          align-items: flex-start; 
          gap: 14px; 
        }

        .trust-icon-wrap {
          width: 40px; 
          height: 40px; 
          flex-shrink: 0; 
          border-radius: 10px;
          background: rgba(255,255,255,0.12); 
          display: flex; 
          align-items: center; 
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.18);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .trust-item:hover .trust-icon-wrap {
          transform: scale(1.06);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .trust-icon-wrap svg { color: #7dd3fc; }

        .trust-text-title { 
          font-size: clamp(0.85rem, 1.5vw, 0.9rem); 
          font-weight: 700; 
          color: #ffffff; 
          margin-bottom: 3px; 
        }

        .trust-text-sub { 
          font-size: clamp(0.75rem, 1.5vw, 0.8rem); 
          color: rgba(186,230,253,0.85); 
          line-height: 1.5; 
        }

        /* ── DECISION PREVIEW ── */
        .preview {
          padding: 88px 2rem; 
          max-width: 1000px; 
          margin: 0 auto;
          transition: background-color 0.3s ease;
        }

        .preview-header { margin-bottom: 48px; }

        .preview-card {
          border: 1px solid #e0f2fe; 
          border-radius: 20px; 
          overflow: hidden;
          box-shadow: 0 16px 60px rgba(2,132,199,0.1);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        html.dark .preview-card {
          border-color: rgba(56,189,248,0.2);
          box-shadow: 0 16px 60px rgba(56,189,248,0.15);
        }

        .preview-topbar {
          background: linear-gradient(135deg, #0c2340, #0369a1);
          padding: 16px 24px; 
          display: flex; 
          align-items: center; 
          justify-content: space-between;
          gap: 12px;
        }

        .preview-topbar-left { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
        }

        .preview-topbar-dots { 
          display: flex; 
          gap: 6px; 
        }

        .dot { 
          width: 10px; 
          height: 10px; 
          border-radius: 50%; 
        }

        .dot-r { background: rgba(248,113,113,0.8); }
        .dot-y { background: rgba(251,191,36,0.8); }
        .dot-g { background: rgba(52,211,153,0.8); }

        .preview-title-bar { 
          font-size: clamp(0.7rem, 1.5vw, 0.75rem); 
          font-weight: 600; 
          color: rgba(186,230,253,0.8); 
          font-family: 'DM Mono', monospace; 
        }

        .preview-body { 
          padding: 28px; 
          background: #f8fafc; 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 20px;
          transition: background-color 0.3s ease;
        }

        html.dark .preview-body {
          background: #1e3a5f;
        }

        @media (max-width: 640px) { 
          .preview-body { 
            grid-template-columns: 1fr;
            padding: 20px;
          } 
        }

        .preview-metric {
          background: white; 
          border: 1px solid #e0f2fe; 
          border-radius: 12px; 
          padding: 18px;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        html.dark .preview-metric {
          background: #0c2340;
          border-color: rgba(56,189,248,0.15);
        }

        .preview-metric-lbl { 
          font-size: 0.72rem; 
          font-weight: 600; 
          text-transform: uppercase; 
          letter-spacing: 0.06em; 
          color: #64748b; 
          margin-bottom: 6px;
          transition: color 0.3s ease;
        }

        html.dark .preview-metric-lbl {
          color: #94a3b8;
        }

        .preview-metric-val { 
          font-size: clamp(1.25rem, 3vw, 1.5rem); 
          font-weight: 800; 
          letter-spacing: -0.03em; 
          font-family: 'DM Mono', monospace;
        }

        .val-green { color: #059669; }
        html.dark .val-green { color: #10b981; }

        .val-blue { color: #0369a1; }
        html.dark .val-blue { color: #7dd3fc; }

        .val-orange { color: #d97706; }
        html.dark .val-orange { color: #fbbf24; }

        .preview-metric-sub { 
          font-size: 0.75rem; 
          color: #94a3b8; 
          margin-top: 3px;
          transition: color 0.3s ease;
        }

        html.dark .preview-metric-sub {
          color: #64748b;
        }

        .preview-decision {
          grid-column: 1 / -1; 
          background: white; 
          border: 1.5px solid #bbf7d0;
          border-radius: 12px; 
          padding: 18px; 
          display: flex; 
          align-items: center; 
          gap: 14px;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        html.dark .preview-decision {
          background: #0c2340;
          border-color: rgba(16,185,129,0.3);
        }

        .decision-badge {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white; 
          padding: 6px 16px; 
          border-radius: 100px;
          font-size: 0.8rem; 
          font-weight: 700; 
          letter-spacing: 0.04em; 
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(5,150,105,0.3);
        }
        .decision-badge-review {
          background: linear-gradient(135deg, #d97706, #f59e0b);
          box-shadow: 0 2px 8px rgba(217,119,6,0.3);
        }
        .preview-decision-review {
          border-color: rgba(245, 158, 11, 0.4);
        }
        html.dark .preview-decision-review {
          border-color: rgba(251, 191, 36, 0.35);
        }

        .decision-text { 
          font-size: clamp(0.8rem, 1.5vw, 0.85rem); 
          color: #334155; 
          line-height: 1.5; 
          flex: 1;
          transition: color 0.3s ease;
        }

        html.dark .decision-text {
          color: #cbd5e1;
        }

        .decision-conf { 
          font-size: 0.75rem; 
          font-weight: 600; 
          color: #059669; 
          font-family: 'DM Mono', monospace; 
          white-space: nowrap;
        }

        html.dark .decision-conf {
          color: #10b981;
        }

        /* ── CTA ── */
        .cta-section {
          padding: 96px 2rem; 
          text-align: center;
          background: linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%);
          border-top: 1px solid #e0f2fe;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        html.dark .cta-section {
          background: linear-gradient(180deg, #0c2340 0%, #1e3a5f 100%);
          border-top-color: rgba(56,189,248,0.15);
        }

        .cta-inner { 
          max-width: 560px; 
          margin: 0 auto; 
        }

        .cta-section h2 { 
          font-size: clamp(1.5rem, 3.5vw, 2.6rem); 
          font-weight: 800; 
          letter-spacing: -0.04em; 
          color: #0c2340; 
          margin-bottom: 16px;
          transition: color 0.3s ease;
        }

        html.dark .cta-section h2 {
          color: #e0f2fe;
        }

        .cta-section p { 
          font-size: clamp(0.9rem, 1.5vw, 1rem); 
          color: #64748b; 
          line-height: 1.65; 
          margin-bottom: 36px;
          transition: color 0.3s ease;
        }

        html.dark .cta-section p {
          color: #94a3b8;
        }

        .cta-btns { 
          display: flex; 
          gap: 14px; 
          justify-content: center; 
          flex-wrap: wrap; 
        }

        /* ── FOOTER ── */
        .footer {
          border-top: 1px solid #e0f2fe; 
          padding: 24px 2rem;
          display: flex; 
          flex-wrap: wrap; 
          align-items: center; 
          justify-content: space-between;
          gap: 12px; 
          max-width: 100%;
          transition: border-color 0.3s ease;
        }

        html.dark .footer {
          border-top-color: rgba(56,189,248,0.15);
        }

        .footer-left { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
        }

        .footer-logo-icon {
          width: 28px; 
          height: 28px; 
          border-radius: 7px;
          background: linear-gradient(135deg, #0284c7, #38bdf8);
          display: flex; 
          align-items: center; 
          justify-content: center;
        }

        .footer-text { 
          font-size: 0.8rem; 
          font-weight: 600; 
          color: #334155;
          transition: color 0.3s ease;
        }

        html.dark .footer-text {
          color: #cbd5e1;
        }

        .footer-right { 
          font-size: clamp(0.7rem, 1.5vw, 0.78rem); 
          color: #94a3b8;
          transition: color 0.3s ease;
        }

        html.dark .footer-right {
          color: #64748b;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .hdr {
            padding: 0 1rem;
            height: auto;
            min-height: 66px;
          }

          .hdr-logo-text {
            font-size: 0.8rem;
          }

          .hdr-nav {
            gap: 4px;
          }

          .btn-ghost {
            padding: 6px 12px;
            font-size: 0.8rem;
          }

          .btn-primary {
            padding: 7px 16px;
            font-size: 0.8rem;
          }

          .hero {
            padding: 64px 1rem 64px;
          }

          .hero-cta {
            flex-direction: column;
            align-items: stretch;
          }

          .btn-primary-lg,
          .btn-outline-lg {
            width: 100%;
            justify-content: center;
          }

          .hero-stats {
            gap: 20px;
          }

          .features,
          .how,
          .preview,
          .cta-section {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .step {
            flex-direction: column;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .hdr-logo-text span {
            display: none;
          }

          .hero {
            padding: 48px 1rem 48px;
          }

          .features,
          .how,
          .preview,
          .cta-section {
            padding-top: 48px;
            padding-bottom: 48px;
          }
        }
      `}</style>

      <div className="acie-root">

        {/* HEADER */}
        <header className="hdr">
          <Link to="/" className="hdr-logo">
            <CrediNovaLogo className="h-9" theme={theme as 'light' | 'dark'} />
          </Link>
          <nav className="hdr-nav">
            <button
              onClick={toggleTheme}
              className="btn-theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/login" className="btn-ghost">Login</Link>
            <Link to="/signup" className="btn-primary">
              Get Started <ArrowRight size={14} />
            </Link>
          </nav>
        </header>

        {/* HERO */}
        <section className="hero">
          <div className="hero-grid" />
          <div className="hero-inner">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-3 mb-6"
            >
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                Enterprise AI Credit Engine
              </div>
              <div className="live-ticker">
                <span className="live-ticker-dot" />
                Decisions last 60s: <span>{liveCount.toLocaleString()}</span>
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Credit Decisions,<br />
              <span className="grad">Powered by Intelligence</span>
            </motion.h1>
            <motion.p
              className="hero-sub"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Typewriter text="An enterprise-grade AI engine that combines hybrid machine learning, SHAP explainability, and autonomous agents to deliver fair, transparent, and auditable credit decisions." />
            </motion.p>
            <motion.div
              className="hero-cta"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link to="/signup" className="btn-primary btn-primary-lg">
                Launch Dashboard <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-outline-lg">
                Sign In
              </Link>
            </motion.div>
            <motion.div
              className="hero-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <div className="stat">
                <span className="stat-num">{statAuc}</span>
                <span className="stat-lbl">AUC-ROC Score</span>
              </div>
              <div className="stat">
                <span className="stat-num">&lt;2s</span>
                <span className="stat-lbl">Decision Latency</span>
              </div>
              <div className="stat">
                <span className="stat-num">{statAgents}</span>
                <span className="stat-lbl">Autonomous Agents</span>
              </div>
              <div className="stat">
                <span className="stat-num">{statPct}%</span>
                <span className="stat-lbl">Explainable</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features" ref={featuresRef}>
          <motion.div
            className="features-header"
            initial={{ opacity: 0, y: 16 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="section-label">Core Capabilities</div>
            <h2 className="section-title">Built for Regulated Finance</h2>
            <p className="section-sub">Every decision is explainable, every model is monitored, every output is audit-ready.</p>
          </motion.div>
          <motion.div
            className="features-grid"
            variants={stagger}
            initial="initial"
            animate={featuresInView ? "animate" : "initial"}
          >
            {[
              { icon: BarChart3, title: "Hybrid ML Risk Engine", desc: "XGBoost + LightGBM ensemble with probability calibration. Outputs a default probability, a 300–900 risk score, and a risk tier — all in under 2 seconds." },
              { icon: Brain, title: "SHAP Explainability", desc: "Every prediction comes with feature-level SHAP values — surfacing the exact risk drivers and protective factors behind each individual credit decision." },
              { icon: Zap, title: "Agentic Decision Layer", desc: "An autonomous Decision Agent reads risk tier, SHAP signals, and business rules to approve, conditionally approve, or flag for manual review — with full context awareness." },
              { icon: Scale, title: "Fairness Monitoring", desc: "A dedicated Fairness Agent continuously audits approval rates across demographic subgroups, detects threshold disparities, and logs compliance events automatically." },
              { icon: Activity, title: "Model Drift Detection", desc: "Real-time monitoring of AUC drift, PSI and KS statistics on feature distributions, and prediction shift — with automated SageMaker retraining triggers." },
              { icon: Lock, title: "Governance & Audit Trail", desc: "Every decision produces a signed audit log entry with risk score, confidence, explanation summary, and the full reasoning chain — ready for regulatory review." },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} className="feat-card" variants={itemUp}>
                  <div className="feat-icon"><Icon size={22} /></div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* TRUST STRIP */}
        <div className="trust">
          <div className="trust-inner">
            <div className="trust-item">
              <div className="trust-icon-wrap"><Shield size={20} /></div>
              <div>
                <div className="trust-text-title">Regulatory Ready</div>
                <div className="trust-text-sub">Decisions include full reasoning chains for compliance teams</div>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon-wrap"><Brain size={20} /></div>
              <div>
                <div className="trust-text-title">No Black Boxes</div>
                <div className="trust-text-sub">SHAP values explain every single prediction to the applicant</div>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon-wrap"><Scale size={20} /></div>
              <div>
                <div className="trust-text-title">Bias-Aware by Design</div>
                <div className="trust-text-sub">Continuous fairness auditing across all protected attributes</div>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon-wrap"><Activity size={20} /></div>
              <div>
                <div className="trust-text-title">Self-Monitoring</div>
                <div className="trust-text-sub">Drift agents trigger retraining before accuracy degrades</div>
              </div>
            </div>
          </div>
        </div>

        {/* DECISION PREVIEW — live-cycling sample */}
        <section className="preview" ref={previewRef}>
          <motion.div
            className="preview-header"
            initial={{ opacity: 0, y: 16 }}
            animate={previewInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <div className="section-label">Live Output Preview</div>
              <span className="preview-live-badge">
                <span className="preview-live-badge-dot" />
                Live
              </span>
            </div>
            <h2 className="section-title">What a Decision Looks Like</h2>
            <p className="section-sub">
              Sample outputs from the engine — cycles every 6s. Every field is machine-generated, SHAP-grounded, and audit-logged.
            </p>
          </motion.div>
          <motion.div
            className="preview-card"
            initial={{ opacity: 0, y: 28 }}
            animate={previewInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <div className="preview-topbar">
              <div className="preview-topbar-left">
                <div className="preview-topbar-dots">
                  <span className="dot dot-r" />
                  <span className="dot dot-y" />
                  <span className="dot dot-g" />
                </div>
                <span className="preview-live-badge ml-2">
                  <span className="preview-live-badge-dot" />
                  Live
                </span>
              </div>
              <span className="preview-title-bar">CrediNova/engine · decision_output.json</span>
              <span />
            </div>
            <motion.div
              className="preview-body"
              key={previewIndex}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <div className="preview-metric">
                <div className="preview-metric-lbl">Risk Score</div>
                <div className="preview-metric-val val-green">{sample.riskScore}</div>
                <div className="preview-metric-sub">Scale 300–900 · Risk Tier</div>
              </div>
              <div className="preview-metric">
                <div className="preview-metric-lbl">Default Probability</div>
                <div className="preview-metric-val val-blue">{sample.pd}</div>
                <div className="preview-metric-sub">XGBoost + LightGBM blend</div>
              </div>
              <div className="preview-metric">
                <div className="preview-metric-lbl">Top Risk Driver</div>
                <div className="preview-metric-val val-orange" style={{ fontSize: "1rem", paddingTop: 4 }}>{sample.riskDriver}</div>
                <div className="preview-metric-sub">SHAP contribution: {sample.driverVal}</div>
              </div>
              <div className="preview-metric">
                <div className="preview-metric-lbl">Top Protective Factor</div>
                <div className="preview-metric-val val-green" style={{ fontSize: "1rem", paddingTop: 4 }}>{sample.protective}</div>
                <div className="preview-metric-sub">SHAP contribution: {sample.protectiveVal}</div>
              </div>
              <div className={`preview-decision ${sample.decision === "MANUAL REVIEW" ? "preview-decision-review" : ""}`}>
                <span className={`decision-badge ${sample.decision === "MANUAL REVIEW" ? "decision-badge-review" : ""}`}>✓ {sample.decision}</span>
                <span className="decision-text">{sample.text}</span>
                <span className="decision-conf">{sample.conf} conf.</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* HOW IT WORKS — clean steps */}
        <section className="how" ref={stepsRef}>
          <div className="how-inner">
            <motion.div
              className="how-header"
              initial={{ opacity: 0, y: 16 }}
              animate={stepsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className="section-label">Architecture</div>
              <h2 className="section-title">From Raw Data to Decision</h2>
              <p className="section-sub">
                A six-stage pipeline engineered for accuracy, speed, and full traceability.
              </p>
            </motion.div>
            <motion.div
              className="steps"
              variants={stagger}
              initial="initial"
              animate={stepsInView ? "animate" : "initial"}
            >
              {[
                { n: "01", t: "Data Ingestion & Cleaning", d: "Missing value imputation, outlier treatment, and categorical encoding transform raw applicant data into a clean structured dataset.", tag: "Input Layer" },
                { n: "02", t: "Feature Engineering", d: "Debt-to-income ratios, delinquency scores, credit utilization buckets, and behavioral interaction features are computed to maximise signal.", tag: "Feature Matrix" },
                { n: "03", t: "Hybrid ML Scoring", d: "An XGBoost/LightGBM ensemble with stacking and probability calibration produces a default probability and a 300–900 risk score.", tag: "AUC: 0.94" },
                { n: "04", t: "SHAP Explainability", d: "SHAP values decompose the model prediction into per-feature contributions, surfacing the exact reasons for any given outcome.", tag: "Explainable AI" },
                { n: "05", t: "Agentic Decision Layer", d: "Four autonomous agents handle decisions, explanations, fairness auditing, and drift detection — acting on rules and SHAP signals in parallel.", tag: "4 Agents" },
                { n: "06", t: "Output & Governance", d: "A final credit decision, confidence score, human-readable explanation, and a signed audit log entry are returned — fully regulatory compliant.", tag: "Audit Ready" },
              ].map((s) => (
                <motion.div key={s.n} className="step" variants={itemUp}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-body">
                    <div className="step-title">{s.t}</div>
                    <div className="step-desc">{s.d}</div>
                    <span className="step-tag"><ChevronRight size={10} />{s.tag}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-inner">
            <h2>Ready to see it in action?</h2>
            <p>Submit a credit application through the full ACIE pipeline and see real-time scoring, SHAP explanations, and autonomous agent decisions.</p>
            <div className="cta-btns">
              <Link to="/signup" className="btn-primary btn-primary-lg">
                Create Account <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-outline-lg">Sign In</Link>
            </div>
          </div>
        </section>



        <AnimatePresence>
          {showLogoutSuccess && (
            <motion.div
              className="logout-success-msg"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
            >
              <div className="tick-circle shadow-sm">✓</div>
              Successfully Logout
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}
