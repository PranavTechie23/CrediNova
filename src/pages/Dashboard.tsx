import { Link } from "react-router-dom";
import { getPastApplications } from "@/services/mockApi";
import { useAuth } from "@/hooks/useAuth";
import {
  Shield, TrendingUp, ArrowRight, CheckCircle2, XCircle,
  AlertTriangle, CreditCard, DollarSign, Brain, BarChart3,
  Zap, Activity, ChevronRight, Clock
} from "lucide-react";

const decisionMeta: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  Approved: { icon: CheckCircle2, color: "#059669", bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.2)" },
  Rejected: { icon: XCircle, color: "#dc2626", bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.2)" },
  "Manual Review": { icon: AlertTriangle, color: "#d97706", bg: "rgba(217,119,6,0.08)", border: "rgba(217,119,6,0.2)" },
};

const riskMeta: Record<string, { color: string; bg: string; border: string; bar: string }> = {
  Low: { color: "#059669", bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.2)", bar: "#10b981" },
  Medium: { color: "#d97706", bg: "rgba(217,119,6,0.08)", border: "rgba(217,119,6,0.2)", bar: "#f59e0b" },
  High: { color: "#dc2626", bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.2)", bar: "#ef4444" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const applications = getPastApplications();
  const username = user?.email?.split("@")[0] ?? "User";
  const latest = applications[0];
  const reviewCount = applications.filter(a => a.decision === "Manual Review" || a.decision === "Conditional Approval").length + JSON.parse(localStorage.getItem("human_reviews") || "[]").length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        .db { font-family: 'Sora', sans-serif; color: #0c2340; display: flex; flex-direction: column; gap: 28px; }

        /* ── PAGE HEADING ── */
        .db-heading { 
          display: flex; 
          align-items: flex-end; 
          justify-content: space-between; 
          flex-wrap: wrap; 
          gap: 20px;
          margin-bottom: 8px;
        }
        .db-heading-left {}
        .db-heading-eyebrow {
          font-size: 0.7rem; 
          font-weight: 700; 
          letter-spacing: 0.14em; 
          text-transform: uppercase;
          color: #0284c7; 
          margin-bottom: 10px; 
          display: flex; 
          align-items: center; 
          gap: 8px;
        }
        .db-heading-eyebrow-dot { 
          width: 7px; 
          height: 7px; 
          border-radius: 50%; 
          background: #0ea5e9; 
          animation: pulse 2s infinite;
          box-shadow: 0 0 10px rgba(14,165,233,0.5);
        }
        @keyframes pulse { 
          0%,100%{opacity:1;transform:scale(1)} 
          50%{opacity:0.6;transform:scale(0.85)} 
        }
        .db-heading-title { 
          font-size: clamp(1.8rem, 3.5vw, 2.5rem); 
          color: #0c2340; 
          margin-bottom: 6px; 
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
        }
        .db-heading-sub { 
          font-size: clamp(0.85rem, 1.5vw, 1rem); 
          font-weight: 500; 
          color: #64748b;
          line-height: 1.5;
        }
        .db-new-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #0369a1, #0ea5e9);
          color: white; font-family: 'Sora', sans-serif;
          font-size: 0.9rem; font-weight: 600; padding: 12px 28px;
          border-radius: 12px; border: none; cursor: pointer; text-decoration: none;
          box-shadow: 0 6px 20px rgba(3,105,161,0.4), 0 2px 8px rgba(3,105,161,0.2);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .db-new-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .db-new-btn:hover::before {
          opacity: 1;
        }
        .db-new-btn:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 10px 28px rgba(3,105,161,0.5), 0 4px 12px rgba(3,105,161,0.3);
        }

        /* ── TOP ROW ── */
        .db-top { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; }
        @media(max-width:900px){ .db-top { grid-template-columns: 1fr 1fr; } }
        @media(max-width:600px){ .db-top { grid-template-columns: 1fr; } }

        /* ── HERO CARD ── */
        .hero-card {
          grid-column: span 2;
          border-radius: 24px; overflow: hidden; position: relative;
          background: linear-gradient(135deg, #0c2340 0%, #0a3158 35%, #0369a1 70%, #0ea5e9 100%);
          padding: 0; min-height: 280px;
          box-shadow: 0 12px 48px rgba(3,105,161,0.3), 0 4px 16px rgba(0,0,0,0.1);
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0;
        }
        @media(max-width:900px){ 
          .hero-card { 
            grid-column: span 2; 
            grid-template-columns: 1fr;
          } 
        }
        @media(max-width:600px){ .hero-card { grid-column: span 1; } }
        
        .hero-card-left {
          padding: 36px 32px;
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .hero-card-right {
          position: relative;
          width: 280px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        @media(max-width:900px){ 
          .hero-card-right { 
            width: 100%;
            min-height: 180px;
          } 
        }
        
        .hero-visual {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .hero-avatar-ring {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border: 3px solid rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.1);
        }
        
        .hero-avatar-inner {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 800;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: -0.02em;
        }
        
        .hero-card-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(56,189,248,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.08) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.6;
        }
        
        .hero-card-glow {
          position: absolute; 
          top: -80px; 
          right: -80px;
          width: 320px; 
          height: 320px; 
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%);
          pointer-events: none;
          filter: blur(40px);
        }
        
        .hero-card-glow-2 {
          position: absolute; 
          bottom: -60px; 
          left: -40px;
          width: 240px; 
          height: 240px; 
          border-radius: 50%;
          background: radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 65%);
          pointer-events: none;
          filter: blur(30px);
        }
        
        .hero-card-inner { position: relative; z-index: 1; }
        .hero-hello { 
          font-size: 0.7rem; 
          font-weight: 700; 
          letter-spacing: 0.12em; 
          text-transform: uppercase; 
          color: rgba(186,230,253,0.9); 
          margin-bottom: 12px; 
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hero-hello-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #38bdf8;
          box-shadow: 0 0 8px rgba(56,189,248,0.6);
          animation: pulse 2s infinite;
        }
        .hero-name { 
          font-size: 2.2rem; 
          font-weight: 800; 
          color: #fff; 
          letter-spacing: -0.04em; 
          margin-bottom: 14px;
          line-height: 1.1;
        }
        .hero-desc { 
          font-size: 0.9rem; 
          color: rgba(186,230,253,0.85); 
          line-height: 1.7; 
          max-width: 480px; 
          margin-bottom: 28px; 
          font-weight: 400;
        }
        .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 32px; }
        .hero-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #0369a1;
          font-family: 'Sora', sans-serif; font-size: 0.875rem; font-weight: 700;
          padding: 12px 24px; border-radius: 10px; border: none;
          cursor: pointer; text-decoration: none;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.25s;
        }
        .hero-btn-primary:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 8px 24px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15);
        }
        .hero-btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.12); color: rgba(186,230,253,0.95);
          font-family: 'Sora', sans-serif; font-size: 0.875rem; font-weight: 600;
          padding: 12px 22px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2);
          cursor: pointer; text-decoration: none; transition: all 0.25s;
          backdrop-filter: blur(10px);
        }
        .hero-btn-ghost:hover { 
          background: rgba(255,255,255,0.18); 
          border-color: rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }

        /* hero footer strip */
        .hero-strip {
          display: grid; 
          grid-template-columns: repeat(4, 1fr);
          gap: 24px; 
          padding-top: 24px; 
          border-top: 1px solid rgba(255,255,255,0.15);
        }
        @media(max-width:600px){ 
          .hero-strip { 
            grid-template-columns: 1fr;
            gap: 16px;
          } 
        }
        .hero-strip-item { 
          display: flex; 
          flex-direction: column; 
          gap: 4px; 
          position: relative;
        }
        .hero-strip-item:not(:last-child)::after {
          content: '';
          position: absolute;
          right: -12px;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.1);
        }
        @media(max-width:600px){ 
          .hero-strip-item:not(:last-child)::after {
            display: none;
          }
        }
        .hero-strip-val { 
          font-size: 1.4rem; 
          font-weight: 800; 
          color: #fff; 
          font-family: 'DM Mono', monospace; 
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .hero-strip-lbl { 
          font-size: 0.68rem; 
          font-weight: 600; 
          text-transform: uppercase; 
          letter-spacing: 0.1em; 
          color: rgba(125,211,252,0.7);
          margin-top: 2px;
        }

        /* ── RIGHT STAT CARDS ── */
        .stat-card {
          border-radius: 22px; padding: 28px;
          background: linear-gradient(135deg, #ffffff 0%, #fafcff 100%);
          border: 2px solid #e0f2fe;
          box-shadow: 0 6px 24px rgba(2,132,199,0.1), 0 2px 8px rgba(0,0,0,0.04);
          display: flex; flex-direction: column; justify-content: space-between;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(14,165,233,0.04) 0%, rgba(56,189,248,0.02) 100%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .stat-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #0284c7, #0ea5e9, #38bdf8);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .stat-card:hover::before {
          opacity: 1;
        }
        .stat-card:hover::after {
          opacity: 1;
        }
        .stat-card:hover { 
          box-shadow: 0 12px 40px rgba(2,132,199,0.18), 0 6px 16px rgba(0,0,0,0.08); 
          transform: translateY(-4px);
          border-color: #bae6fd;
        }
        .stat-card-icon {
          width: 52px; height: 52px; border-radius: 14px; margin-bottom: 20px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          box-shadow: 0 4px 12px rgba(2,132,199,0.15);
          position: relative;
        }
        .stat-card-icon::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(14,165,233,0.2), rgba(56,189,248,0.1));
          opacity: 0;
          transition: opacity 0.3s;
          z-index: -1;
        }
        .stat-card:hover .stat-card-icon::after {
          opacity: 1;
        }
        .stat-card-icon svg { color: #0284c7; }
        .stat-card-lbl { 
          font-size: 0.72rem; 
          font-weight: 700; 
          text-transform: uppercase; 
          letter-spacing: 0.12em; 
          color: #64748b; 
          margin-bottom: 8px; 
        }
        .stat-card-val { 
          font-size: 1.75rem; 
          font-weight: 800; 
          letter-spacing: -0.04em; 
          color: #0c2340; 
          font-family: 'DM Mono', monospace;
          line-height: 1.2;
          margin-bottom: 6px;
        }
        .stat-card-sub { 
          font-size: 0.8rem; 
          color: #475569; 
          margin-top: 4px; 
          font-weight: 500;
          line-height: 1.5;
        }
        .stat-card-footer { 
          margin-top: 20px; 
          padding-top: 18px; 
          border-top: 1.5px solid #f0f9ff; 
        }
        .stat-chip {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.72rem; font-weight: 600; padding: 5px 12px; border-radius: 100px;
          transition: all 0.2s;
        }
        .stat-chip:hover {
          transform: scale(1.05);
        }
        .chip-green { 
          background: linear-gradient(135deg, rgba(5,150,105,0.12), rgba(5,150,105,0.08)); 
          color: #059669; 
          border: 1.5px solid rgba(5,150,105,0.25);
          box-shadow: 0 2px 8px rgba(5,150,105,0.1);
        }
        .chip-blue  { 
          background: linear-gradient(135deg, rgba(2,132,199,0.12), rgba(2,132,199,0.08)); 
          color: #0369a1; 
          border: 1.5px solid rgba(2,132,199,0.25);
          box-shadow: 0 2px 8px rgba(2,132,199,0.1);
        }

        /* ── QUICK ACTIONS ── */
        .qa-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
        @media(max-width:700px){ .qa-row { grid-template-columns: 1fr 1fr; } }
        .qa-card {
          border-radius: 16px; padding: 18px 20px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1.5px solid #e0f2fe;
          display: flex; align-items: center; gap: 14px;
          text-decoration: none; transition: all 0.25s;
          box-shadow: 0 2px 12px rgba(2,132,199,0.08), 0 1px 3px rgba(0,0,0,0.04);
          position: relative;
          overflow: hidden;
        }
        .qa-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(14,165,233,0.02) 0%, rgba(56,189,248,0.01) 100%);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .qa-card:hover::before {
          opacity: 1;
        }
        .qa-card:hover {
          border-color: #7dd3fc; 
          box-shadow: 0 8px 28px rgba(2,132,199,0.15), 0 4px 8px rgba(0,0,0,0.06);
          transform: translateY(-3px);
          background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
        }
        .qa-icon {
          width: 40px; height: 40px; flex-shrink: 0; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
        }
        .qa-icon svg { color: #0284c7; }
        .qa-text-main { font-size: 0.82rem; font-weight: 700; color: #0c2340; }
        .qa-text-sub { font-size: 0.7rem; color: #64748b; margin-top: 1px; font-weight: 500; }
        .qa-arrow { margin-left: auto; color: #cbd5e1; flex-shrink: 0; transition: transform 0.2s, color 0.2s; }
        .qa-card:hover .qa-arrow { transform: translateX(3px); color: #0284c7; }

        /* ── TABLE SECTION ── */
        .table-section { 
          background: linear-gradient(135deg, #ffffff 0%, #fafcff 100%); 
          border: 1.5px solid #e0f2fe; 
          border-radius: 20px; 
          overflow: hidden; 
          box-shadow: 0 4px 20px rgba(2,132,199,0.08), 0 1px 4px rgba(0,0,0,0.04);
        }
        .table-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px 0; margin-bottom: 0;
        }
        .table-header-left { display: flex; align-items: center; gap: 10px; }
        .table-header-icon { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg,#e0f2fe,#bae6fd); display:flex;align-items:center;justify-content:center; }
        .table-header-icon svg { color: #0284c7; }
        .table-title { font-size: 0.95rem; font-weight: 700; color: #0c2340; }
        .table-count {
          font-size: 0.7rem; font-weight: 700; padding: 2px 9px; border-radius: 100px;
          background: rgba(2,132,199,0.08); color: #0369a1; border: 1px solid rgba(2,132,199,0.18);
          font-family: 'DM Mono', monospace;
        }
        .table-link { font-size: 0.78rem; font-weight: 600; color: #0369a1; text-decoration: none; display: flex; align-items: center; gap: 3px; }
        .table-link:hover { color: #0ea5e9; }

        .db-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 0.83rem; }
        .db-table thead tr { border-bottom: 1px solid #f0f9ff; }
        .db-table thead th {
          padding: 10px 16px; text-align: left;
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #94a3b8; background: #fafcff;
        }
        .db-table thead th:first-child { padding-left: 24px; }
        .db-table thead th:last-child { padding-right: 24px; }
        .db-table tbody tr {
          border-bottom: 1px solid #f8fafc; transition: background 0.15s;
        }
        .db-table tbody tr:last-child { border-bottom: none; }
        .db-table tbody tr:hover { background: #f8fcff; }
        .db-table td { padding: 14px 16px; vertical-align: middle; }
        .db-table td:first-child { padding-left: 24px; }
        .db-table td:last-child { padding-right: 24px; }

        .td-date { font-weight: 600; color: #0c2340; }
        .td-date-sub { font-size: 0.7rem; color: #94a3b8; margin-top: 1px; display: flex; align-items: center; gap: 3px; }
        .td-amount { font-family: 'DM Mono', monospace; font-weight: 600; color: #0c2340; font-size: 0.88rem; }
        .td-amount-icon { display: flex; align-items: center; gap: 5px; }

        .risk-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.72rem; font-weight: 700; padding: 4px 11px; border-radius: 100px; border: 1px solid;
        }
        .risk-pill-dot { width: 5px; height: 5px; border-radius: 50%; }

        .decision-pill {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.75rem; font-weight: 700; padding: 5px 12px; border-radius: 9px; border: 1px solid;
        }

        .empty-state {
          padding: 56px 24px; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
        }
        .empty-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: linear-gradient(135deg,#e0f2fe,#bae6fd);
          display: flex; align-items: center; justify-content: center;
        }
        .empty-title { font-size: 0.95rem; font-weight: 700; color: #0c2340; }
        .empty-sub { font-size: 0.82rem; color: #64748b; max-width: 300px; line-height: 1.6; }
        .empty-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: linear-gradient(135deg,#0369a1,#0ea5e9);
          color: white; font-family: 'Sora', sans-serif;
          font-size: 0.82rem; font-weight: 600; padding: 9px 20px;
          border-radius: 9px; border: none; cursor: pointer; text-decoration: none;
          box-shadow: 0 3px 12px rgba(3,105,161,0.3); transition: all 0.2s;
        }
        .empty-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(3,105,161,0.4); }

        /* section label */
        .sec-lbl {
          font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #475569; margin-bottom: 12px;
          display: flex; align-items: center; gap: 7px;
        }
        .sec-lbl::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, #e0f2fe 0%, #cbd5e1 100%); }

        /* ── RISK CARD ENHANCEMENTS ── */
        .risk-card {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
          border: 2px solid #e2e8f0;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .risk-card-low { border-color: rgba(16, 185, 129, 0.2); background: linear-gradient(135deg, #ffffff 0%, rgba(16, 185, 129, 0.03) 100%); }
        .risk-card-medium { border-color: rgba(245, 158, 11, 0.2); background: linear-gradient(135deg, #ffffff 0%, rgba(245, 158, 11, 0.03) 100%); }
        .risk-card-high { border-color: rgba(239, 68, 68, 0.2); background: linear-gradient(135deg, #ffffff 0%, rgba(239, 68, 68, 0.03) 100%); }

        .risk-score-container {
          margin-top: 18px;
          padding: 16px;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0,0,0,0.05);
        }

        .risk-thresholds {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          font-size: 0.55rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .risk-progress-bg {
          height: 8px;
          width: 100%;
          background: rgba(0,0,0,0.05);
          border-radius: 4px;
          margin-top: 6px;
          overflow: hidden;
          position: relative;
        }
        .risk-progress-marker {
          position: absolute;
          top: 0;
          height: 100%;
          width: 2px;
          background: rgba(0,0,0,0.1);
          z-index: 1;
        }
        .risk-progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 1s ease-out;
        }

        /* ── SUMMARY CARD ── */
        .summary-card {
           background: linear-gradient(135deg, #0c2340 0%, #112240 100%);
           color: white;
           border: none;
           box-shadow: 0 12px 24px rgba(0,0,0,0.2);
        }
        .summary-title { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #38bdf8; margin-bottom: 12px; }
        .summary-stat-group { display: flex; flex-direction: column; gap: 14px; }
        .summary-stat-row { display: flex; align-items: center; justify-content: space-between; }
        .summary-stat-label { font-size: 0.75rem; color: #94a3b8; display: flex; align-items: center; gap: 8px; }
        .summary-stat-value { font-size: 0.85rem; font-weight: 700; font-family: 'DM Mono', monospace; }
        .summary-stat-count { font-size: 0.65rem; color: #cbd5f5; margin-top: 2px; font-weight: 600; font-family: 'DM Mono', monospace; opacity: 0.9; }
        .summary-bar-bg { height: 4px; width: 100%; background: rgba(255,255,255,0.05); border-radius: 2px; margin-top: 4px; overflow: hidden; }
        .summary-bar-fill { height: 100%; border-radius: 2px; }

        .risk-score-val {
          font-size: 1.4rem;
          font-weight: 800;
          color: #0c2340;
          font-family: 'DM Mono', monospace;
          line-height: 1;
        }

        .risk-icon-box {
          width: 52px; height: 52px; border-radius: 14px; margin-bottom: 18px;
          display: flex; align-items: center; justify-content: center;
          position: relative;
          z-index: 1;
        }
        .risk-icon-box::before {
          content: ''; position: absolute; inset: 0; 
          border-radius: 14px; opacity: 0.15; z-index: -1;
        }

        /* ── DARK MODE ── */
        html.dark .sec-lbl { color: #94a3b8; }
        html.dark .sec-lbl::after { background: rgba(56,189,248,0.2); }

        html.dark .db-heading-title { color: #e0f2fe; }
        html.dark .db-heading-sub { color: #94a3b8; }

        html.dark .stat-card {
           background: #112240;
           border-color: rgba(56,189,248,0.2);
        }
        html.dark .risk-card {
           background: linear-gradient(135deg, #112240 0%, #0d192e 100%);
        }
        html.dark .risk-card-low { border-color: rgba(16, 185, 129, 0.3); }
        html.dark .risk-card-medium { border-color: rgba(245, 158, 11, 0.3); }
        html.dark .risk-card-high { border-color: rgba(239, 68, 68, 0.3); }

        html.dark .risk-score-container {
          background: rgba(15, 23, 42, 0.4);
          border-color: rgba(255,255,255,0.05);
        }

        html.dark .risk-score-val {
          color: #e0f2fe;
        }
        
        html.dark .stat-card-val { color: #e0f2fe; }
        html.dark .stat-card-sub { color: #94a3b8; }
        html.dark .stat-card-footer { border-top-color: rgba(56,189,248,0.15); }
        html.dark .stat-chip.chip-green { background: rgba(5,150,105,0.2); color: #34d399; border-color: rgba(5,150,105,0.4); }

        html.dark .qa-card {
           background: #112240;
           border-color: rgba(56,189,248,0.15);
        }
        html.dark .qa-card:hover { background: #1e3a5f; border-color: #38bdf8; }
        html.dark .qa-text-main { color: #e0f2fe; }
        html.dark .qa-text-sub { color: #94a3b8; }
        html.dark .qa-arrow { color: #64748b; }
        html.dark .qa-card:hover .qa-arrow { color: #38bdf8; }

        html.dark .table-section {
           background: #112240;
           border-color: rgba(56,189,248,0.15);
        }
        html.dark .table-title { color: #e0f2fe; }
        html.dark .table-count { background: rgba(56,189,248,0.2); color: #7dd3fc; border-color: rgba(56,189,248,0.3); }
        html.dark .table-link { color: #38bdf8; }
        
        html.dark .db-table thead th { background: #0c2340; color: #94a3b8; border-bottom-color: rgba(56,189,248,0.15); }
        html.dark .db-table tbody tr { border-bottom-color: rgba(56,189,248,0.1); }
        html.dark .db-table tbody tr:hover { background: rgba(56,189,248,0.08); }
        html.dark .td-date { color: #e0f2fe; }
        html.dark .td-date-sub { color: #64748b; }
        html.dark .td-amount { color: #e0f2fe; }

        html.dark .stat-card-icon,
        html.dark .qa-icon,
        html.dark .table-header-icon {
           background: rgba(56,189,248,0.15);
        }
        html.dark .stat-card-icon svg,
        html.dark .qa-icon svg,
        html.dark .table-header-icon svg {
           color: #38bdf8;
        }

        html.dark .empty-title { color: #e0f2fe; }
        html.dark .empty-sub { color: #94a3b8; }
        html.dark .empty-icon { background: rgba(56,189,248,0.15); }
        html.dark .empty-icon svg { color: #38bdf8; }
      `}</style>

      <div className="db">

        {/* PAGE HEADING */}
        <div className="db-heading">
          <div className="db-heading-left">
            <div className="db-heading-title">{greeting}, Pranav Oswal 👋</div>
            <div className="db-heading-sub">Here's your credit activity overview for today.</div>
          </div>
          <Link to="/apply" className="db-new-btn">
            New Application <ArrowRight size={15} />
          </Link>
        </div>

        {/* TOP ROW */}
        <div className="db-top">

          {/* HERO CARD */}
          <div className="hero-card">
            <div className="hero-card-grid" />
            <div className="hero-card-glow" />
            <div className="hero-card-glow-2" />

            <div className="hero-card-left">
              <div className="hero-card-inner">
                <div className="hero-hello">
                  <span className="hero-hello-dot" />
                  Your Credit Profile
                </div>
                <div className="hero-name">Pranav Oswal</div>
                <div className="hero-desc">
                  Your applications are processed through our hybrid ML engine with full SHAP explainability and autonomous agent decisions.
                </div>
                <div className="hero-actions">
                  <Link to="/apply" className="hero-btn-primary">
                    Evaluate Application <ArrowRight size={16} />
                  </Link>
                  <Link to="/explainability" className="hero-btn-ghost">
                    How decisions work
                  </Link>
                </div>
              </div>
              <div className="hero-strip">
                <div className="hero-strip-item">
                  <span className="hero-strip-val">{applications.length}</span>
                  <span className="hero-strip-lbl">Total Applications</span>
                </div>
                <div className="hero-strip-item">
                  <span className="hero-strip-val">
                    {applications.filter(a => a.decision === "Approved").length}
                  </span>
                  <span className="hero-strip-lbl">Approved</span>
                </div>
                <div className="hero-strip-item">
                  <span className="hero-strip-val">0.94</span>
                  <span className="hero-strip-lbl">Engine AUC</span>
                </div>
                <div className="hero-strip-item">
                  <span className="hero-strip-val" style={{ color: reviewCount > 0 ? '#fbbf24' : undefined }}>{reviewCount}</span>
                  <span className="hero-strip-lbl">In Review</span>
                </div>
              </div>
            </div>

            <div className="hero-card-right">
              <div className="hero-visual">
                <div className="hero-avatar-ring">
                  <div className="hero-avatar-inner">
                    {username.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: "18px" }}>
            {/* LENDER SUMMARY CARD (Overall Predictions) */}
            <div className="stat-card summary-card" style={{ padding: "18px" }}>
              <div className="summary-title">Lender Decision Audit</div>
              <div className="summary-stat-group">
                {[
                  { label: "Approved", count: applications.filter(a => a.decision === "Approved").length, color: "#10b981" },
                  { label: "Sent for Review", count: applications.filter(a => a.decision === "Manual Review" || a.decision === "Conditional Approval").length, color: "#f59e0b" },
                  { label: "Rejected", count: applications.filter(a => a.decision === "Rejected").length, color: "#ef4444" },
                ].map(s => {
                  const percent = applications.length ? (s.count / applications.length) * 100 : 0;
                  return (
                    <div key={s.label}>
                      <div className="summary-stat-row">
                        <span className="summary-stat-label">{s.label}</span>
                        <span className="summary-stat-value">{percent.toFixed(0)}%</span>
                      </div>
                      <div className="summary-stat-count">
                        {s.count} case{s.count === 1 ? "" : "s"}
                      </div>
                      <div className="summary-bar-bg">
                        <div className="summary-bar-fill" style={{ width: `${percent}%`, background: s.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: "10px", fontSize: "0.58rem", color: "#64748b", fontStyle: "italic" }}>
                * Aggregated from {applications.length} past participants
              </div>
            </div>

            {/* RISK PROFILE CARD (Latest) */}
            <div className={`stat-card risk-card ${latest ? `risk-card-${latest.riskBand.toLowerCase()}` : ""}`} style={{ padding: "18px" }}>
              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <div className="risk-icon-box" style={{
                    width: "32px", height: "32px", marginBottom: 0,
                    background: riskMeta[latest?.riskBand ?? "Medium"]?.bg,
                    color: riskMeta[latest?.riskBand ?? "Medium"]?.color
                  }}>
                    <Shield size={16} />
                  </div>
                  <div>
                    <div className="stat-card-lbl" style={{ marginBottom: 0, fontSize: "0.6rem" }}>Latest Risk</div>
                    <div className="stat-card-val" style={{ fontSize: "1rem", color: riskMeta[latest?.riskBand ?? "Medium"]?.color }}>
                      {latest?.riskBand ?? "—"}
                    </div>
                  </div>
                </div>

                {latest && (
                  <div className="risk-score-container" style={{ marginTop: "8px", padding: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div>
                        <div style={{ fontSize: "0.55rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Prob Score</div>
                        <div className="risk-score-val" style={{ fontSize: "1.1rem" }}>
                          {(latest.probability_score ?? (latest.risk_score ? latest.risk_score / 900 : 0)).toFixed(3)}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.65rem", fontWeight: 700, minWidth: "40px", textAlign: "right", color: riskMeta[latest.riskBand]?.color }}>
                        {latest.riskBand}
                      </div>
                    </div>

                    <div className="risk-progress-bg" style={{ height: "4px" }}>
                      <div className="risk-progress-marker" style={{ left: "40%" }} />
                      <div className="risk-progress-marker" style={{ left: "70%" }} />
                      <div
                        className="risk-progress-fill"
                        style={{
                          width: `${(latest.probability_score ?? (latest.risk_score ? latest.risk_score / 900 : 0)) * 100}%`,
                          background: riskMeta[latest.riskBand]?.bar
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div >

        {/* QUICK ACTIONS */}
        < div >
          <div className="sec-lbl">
            <Zap size={12} />
            Quick Actions
          </div>
          <div className="qa-row">
            {[
              { to: "/apply", icon: CreditCard, title: "Evaluate Application", sub: "Review credit request" },
              { to: "/result", icon: Shield, title: "Risk Assessment", sub: "View scores & tiers" },
              { to: "/explainability", icon: Brain, title: "SHAP Explainability", sub: "Understand decisions" },
              { to: "/model-intelligence", icon: BarChart3, title: "Model Intelligence", sub: "AUC, drift & lifecycle" },
              { to: "/architecture", icon: Activity, title: "Architecture", sub: "Full pipeline view" },
            ].map(q => (
              <Link key={q.to} to={q.to} className="qa-card">
                <div className="qa-icon"><q.icon size={18} /></div>
                <div>
                  <div className="qa-text-main">{q.title}</div>
                  <div className="qa-text-sub">{q.sub}</div>
                </div>
                <ChevronRight size={15} className="qa-arrow" />
              </Link>
            ))}
          </div>
        </div >

        {/* TABLE */}
        < div >
          <div className="sec-lbl">
            <TrendingUp size={12} />
            Recent Activity
          </div>
          <div className="table-section">
            <div className="table-header">
              <div className="table-header-left">
                <div className="table-header-icon"><TrendingUp size={15} /></div>
                <span className="table-title">Application History</span>
                <span className="table-count">{applications.length}</span>
              </div>
              <Link to="/result" className="table-link">
                View all <ChevronRight size={13} />
              </Link>
            </div>

            <table className="db-table">
              <thead>
                <tr>
                  <th>Date / ID</th>
                  <th>Amount</th>
                  <th>Default Prob.</th>
                  <th>Risk Band</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">
                        <div className="empty-icon"><CreditCard size={24} color="#0284c7" /></div>
                        <div className="empty-title">No applications yet</div>
                        <div className="empty-sub">Submit your first application to see AI-powered risk analysis and SHAP explanations.</div>
                        <Link to="/apply" className="empty-btn">
                          Start Application <ArrowRight size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => {
                    const dm = decisionMeta[app.decision] ?? decisionMeta["Manual Review"];
                    const rm = riskMeta[app.riskBand] ?? riskMeta["Medium"];
                    const DecIcon = dm.icon;
                    return (
                      <tr key={app.id}>
                        <td>
                          <div className="td-date">{app.date}</div>
                          <div className="td-date-sub">
                            <Clock size={10} />
                            #{app.id.split('-').pop()}
                          </div>
                        </td>
                        <td>
                          <div className="td-amount td-amount-icon">
                            <DollarSign size={13} style={{ color: "#94a3b8" }} />
                            {app.amount.toLocaleString()}
                          </div>
                        </td>
                        <td>
                          {(() => {
                            const ps = app.probability_score ?? (app.risk_score ? app.risk_score / 900 : null);
                            if (ps === null) return <span style={{ color: "#64748b" }}>—</span>;
                            const pdPercent = ((1 - ps) * 100);
                            const pdColor = pdPercent > 40 ? "#dc2626" : pdPercent > 25 ? "#d97706" : "#059669";
                            return (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
                                <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: `${pdPercent}%`, background: pdColor, borderRadius: 3, transition: "width 0.3s" }} />
                                </div>
                                <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "0.78rem", color: pdColor, minWidth: 38, textAlign: "right" }}>
                                  {pdPercent.toFixed(1)}%
                                </span>
                              </div>
                            );
                          })()}
                        </td>
                        <td>
                          <span
                            className="risk-pill"
                            style={{ color: rm.color, background: rm.bg, borderColor: rm.border }}
                          >
                            <span className="risk-pill-dot" style={{ background: rm.color }} />
                            {app.riskBand} Risk
                          </span>
                        </td>
                        <td>
                          <span
                            className="decision-pill"
                            style={{ color: dm.color, background: dm.bg, borderColor: dm.border }}
                          >
                            <DecIcon size={13} />
                            {app.decision}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div >

      </div >
    </>
  );
}