import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import {
    User, Mail, Shield, Smartphone, Camera, Check,
    Loader2, Lock, ChevronRight, BadgeCheck, Activity,
    Zap, Compass, ClipboardCheck, Trash2, Clock, AlertTriangle
} from "lucide-react";

export default function Profile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "Demo",
        lastName: "User",
        email: user?.email || "user@example.com",
        phone: "+1 (555) 000-0000",
        role: "Risk Analyst",
        bio: "",
    });

    // Human review requests from localStorage
    const [humanReviews, setHumanReviews] = useState<any[]>([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("human_reviews") || "[]");
        setHumanReviews(stored);
    }, []);

    const clearAllReviews = () => {
        localStorage.removeItem("human_reviews");
        setHumanReviews([]);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        }, 1200);
    };

    const initials = formData.firstName[0]?.toUpperCase() + formData.lastName[0]?.toUpperCase() || "DU";

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .pf { font-family: 'Sora', sans-serif; color: hsl(var(--foreground)); display: flex; flex-direction: column; gap: 28px; padding-bottom: 40px; }

        /* ── HEADER ── */
        .pf-head-eyebrow { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: hsl(var(--primary)); margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
        .pf-head-dot { width: 6px; height: 6px; border-radius: 50%; background: hsl(var(--primary)); animation: blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.35} }
        .pf-head-title { font-size: 1.85rem; font-weight: 800; letter-spacing: -0.04em; color: hsl(var(--foreground)); line-height: 1.1; }
        .pf-head-sub { font-size: 0.85rem; color: hsl(var(--muted-foreground)); margin-top: 6px; }

        /* ── LAYOUT ── */
        .pf-grid { display: grid; grid-template-columns: 340px 1fr; gap: 24px; align-items: start; }
        @media(max-width: 1024px) { .pf-grid { grid-template-columns: 1fr; } }

        /* ── SIDEBAR CARD ── */
        .pf-sidebar {
          background: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 24px;
          overflow: hidden; box-shadow: 0 4px 30px rgba(0,0,0,0.03);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .dark .pf-sidebar { background: hsl(var(--card)/0.4); border-color: hsl(var(--border)); box-shadow: 0 8px 32px rgba(0,0,0,0.3); backdrop-filter: blur(8px); }
        .pf-sidebar:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(0,0,0,0.06); }

        /* avatar hero */
        .pf-avatar-hero {
          padding: 40px 24px 32px; text-align: center;
          background: linear-gradient(160deg, #0c2340 0%, #0a3158 50%, #0369a1 100%);
          position: relative; overflow: hidden;
        }
        .dark .pf-avatar-hero { background: linear-gradient(160deg, #020617 0%, #0f172a 60%, #1e293b 100%); }
        
        .pf-avatar-hero::before {
          content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0.3;
          background-image: linear-gradient(rgba(56,189,248,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.1) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        
        .pf-avatar-hero-glow {
          position: absolute; top: -50px; right: -50px; width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%);
          filter: blur(30px); pointer-events: none;
        }

        .pf-avatar-wrap { position: relative; display: inline-block; margin-bottom: 18px; z-index: 1; }
        .pf-avatar {
          width: 96px; height: 96px; border-radius: 50%;
          background: linear-gradient(135deg, hsl(var(--primary)), #38bdf8);
          border: 4px solid rgba(255,255,255,0.1);
          box-shadow: 0 0 0 6px rgba(56,189,248,0.15), 0 12px 28px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.6rem; font-weight: 800; color: #fff; letter-spacing: -0.04em;
          transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .pf-avatar-wrap:hover .pf-avatar { transform: scale(1.05) rotate(3deg); }

        .pf-avatar-online {
          position: absolute; bottom: 6px; right: 6px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #10b981; border: 3px solid #0a3158;
          box-shadow: 0 0 8px rgba(16,185,129,0.5);
        }
        .dark .pf-avatar-online { border-color: #0f172a; }

        .pf-avatar-camera {
          position: absolute; top: 0; right: 0;
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: all 0.2s; backdrop-filter: blur(4px);
        }
        .pf-avatar-camera:hover { background: rgba(255,255,255,0.2); transform: scale(1.1); }

        .pf-profile-name { font-size: 1.2rem; font-weight: 800; color: #fff; letter-spacing: -0.03em; margin-bottom: 6px; position: relative; z-index: 1; }
        .pf-profile-role {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.75rem; font-weight: 600; color: rgba(186,230,253,0.9);
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          padding: 4px 14px; border-radius: 100px; position: relative; z-index: 1;
        }

        /* sidebar info */
        .pf-sidebar-body { padding: 24px; display: flex; flex-direction: column; gap: 12px; }

        .pf-info-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px; border-radius: 16px;
          background: hsl(var(--muted)/0.3); border: 1px solid hsl(var(--border));
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pf-info-row:hover { border-color: hsl(var(--primary)); background: hsl(var(--muted)/0.5); transform: translateX(4px); }
        .pf-info-icon {
          width: 36px; height: 36px; border-radius: 12px; flex-shrink: 0;
          background: hsl(var(--primary)/0.1); color: hsl(var(--primary));
          display: flex; align-items: center; justify-content: center;
          box-shadow: inset 0 0 0 1px hsl(var(--primary)/0.05);
        }
        .pf-info-lbl { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: hsl(var(--muted-foreground)); margin-bottom: 2px; }
        .pf-info-val { font-size: 0.85rem; font-weight: 600; color: hsl(var(--foreground)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* stats row */
        .pf-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 0; border-top: 1px solid hsl(var(--border)); background: hsl(var(--muted)/0.1); }
        .pf-stat { padding: 18px 10px; text-align: center; border-right: 1px solid hsl(var(--border)); transition: background 0.2s; }
        .pf-stat:hover { background: hsl(var(--muted)/0.2); }
        .pf-stat:last-child { border-right: none; }
        .pf-stat-num { font-size: 1.25rem; font-weight: 800; color: hsl(var(--primary)); font-family: 'DM Mono', monospace; letter-spacing: -0.05em; line-height: 0.9; }
        .pf-stat-lbl { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: hsl(var(--muted-foreground)); margin-top: 6px; }

        /* ── MAIN FORM CARD ── */
        .pf-form-card {
          background: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 24px;
          overflow: hidden; box-shadow: 0 4px 30px rgba(0,0,0,0.03);
          animation: slideUp 0.5s ease-out;
        }
        .dark .pf-form-card { background: hsl(var(--card)/0.4); border-color: hsl(var(--border)); box-shadow: 0 8px 32px rgba(0,0,0,0.3); backdrop-filter: blur(8px); }

        .pf-form-header {
          padding: 24px 32px; border-bottom: 1px solid hsl(var(--border));
          background: hsl(var(--muted)/0.2);
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
        }
        .pf-form-header-left { display: flex; align-items: center; gap: 16px; }
        .pf-form-header-icon {
          width: 44px; height: 44px; border-radius: 14px;
          background: hsl(var(--primary)); color: #fff;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px hsl(var(--primary)/0.3);
        }
        .pf-form-title { font-size: 1.1rem; font-weight: 700; color: hsl(var(--foreground)); letter-spacing: -0.02em; }
        .pf-form-sub { font-size: 0.8rem; color: hsl(var(--muted-foreground)); margin-top: 3px; }

        /* section labels */
        .pf-form-section { padding: 32px; border-bottom: 1px solid hsl(var(--border)); }
        .pf-form-section:last-of-type { border-bottom: none; }
        .pf-section-lbl {
          font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: hsl(var(--primary)); margin-bottom: 24px; display: flex; align-items: center; gap: 10px;
        }
        .pf-section-lbl::after { content: ''; flex: 1; height: 1px; background: hsl(var(--border)); }

        .pf-field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media(max-width: 640px) { .pf-field-grid { grid-template-columns: 1fr; } }
        .pf-field { display: flex; flex-direction: column; gap: 8px; }
        .pf-label {
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: hsl(var(--muted-foreground));
          display: flex; align-items: center; gap: 8px;
        }
        .pf-label svg { color: hsl(var(--primary)/0.6); }

        /* input overrides */
        .pf input, .pf textarea {
          font-family: 'Sora', sans-serif !important;
          font-size: 0.9rem !important; font-weight: 500 !important;
          border: 1px solid hsl(var(--border)) !important; border-radius: 12px !important;
          background: hsl(var(--muted)/0.3) !important; color: hsl(var(--foreground)) !important;
          padding: 12px 16px !important; transition: all 0.2s !important;
        }
        .pf input:focus, .pf textarea:focus {
          border-color: hsl(var(--primary)) !important;
          box-shadow: 0 0 0 4px hsl(var(--primary)/0.1) !important;
          background: hsl(var(--background)) !important;
          transform: translateY(-1px);
        }
        .pf input:disabled {
          background: hsl(var(--muted)/0.15) !important; color: hsl(var(--muted-foreground)) !important; cursor: not-allowed !important;
          opacity: 0.7; border-style: dashed !important;
        }
        .pf textarea { min-height: 110px; resize: vertical; width: 100%; }
        
        .pf-input-wrap { position: relative; }
        .pf-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: hsl(var(--muted-foreground)); opacity:0.6; pointer-events: none; }
        .pf-input-padded { padding-left: 42px !important; }
        
        .pf-locked {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          display: flex; align-items: center; gap: 6px;
          font-size: 0.65rem; font-weight: 700; color: hsl(var(--muted-foreground));
          background: hsl(var(--muted)); border: 1px solid hsl(var(--border)); padding: 4px 10px; border-radius: 100px;
        }

        /* ── FOOTER BAR ── */
        .pf-form-footer {
          padding: 24px 32px; background: hsl(var(--muted)/0.15); border-top: 1px solid hsl(var(--border));
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
        }
        .pf-footer-note { font-size: 0.8rem; color: hsl(var(--muted-foreground)); display: flex; align-items: center; gap: 8px; }
        .pf-footer-note svg { color: #10b981; }

        .pf-save-btn {
          display: inline-flex; align-items: center; gap: 10px; min-width: 200px; justify-content: center;
          background: linear-gradient(135deg, hsl(var(--primary)), #0ea5e9);
          color: white; font-family: 'Sora', sans-serif; font-size: 0.9rem; font-weight: 700;
          padding: 13px 32px; border-radius: 14px; border: none; cursor: pointer;
          box-shadow: 0 8px 20px hsl(var(--primary)/0.3); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .pf-save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 28px hsl(var(--primary)/0.4); filter: brightness(1.05); }
        .pf-save-btn:active:not(:disabled) { transform: translateY(0); }
        .pf-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .pf-save-btn--saved {
          background: linear-gradient(135deg, #059669, #10b981) !important;
          box-shadow: 0 8px 20px rgba(5,150,105,0.3) !important;
        }

        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

            <div className="pf">

                {/* PAGE HEADER */}
                <div>
                    <div className="pf-head-eyebrow"><span className="pf-head-dot" />ACIE Management Cloud</div>
                    <div className="pf-head-title">Underwriter profile</div>
                    <div className="pf-head-sub">Security, personal details and platform permissions.</div>
                </div>

                <div className="pf-grid">

                    {/* ── SIDEBAR ── */}
                    <aside className="pf-sidebar">

                        {/* Avatar hero */}
                        <div className="pf-avatar-hero">
                            <div className="pf-avatar-hero-glow" />
                            <div className="pf-avatar-wrap">
                                <div className="pf-avatar">{initials}</div>
                                <div className="pf-avatar-online" title="System Active" />
                                <div className="pf-avatar-camera" title="Change Avatar">
                                    <Camera size={14} color="#fff" />
                                </div>
                            </div>
                            <div className="pf-profile-name">{formData.firstName} {formData.lastName}</div>
                            <div className="pf-profile-role">
                                <Shield size={12} /> {formData.role}
                            </div>
                        </div>

                        {/* Info rows */}
                        <div className="pf-sidebar-body">
                            {[
                                { icon: Mail, lbl: "Primary Email", val: formData.email },
                                { icon: Smartphone, lbl: "Mobile Trace", val: formData.phone },
                                { icon: Zap, lbl: "Access Level", val: `${formData.role} (L2)` },
                                { icon: Compass, lbl: "Region", val: "North America (US-EAST)" },
                            ].map(item => (
                                <div key={item.lbl} className="pf-info-row">
                                    <div className="pf-info-icon"><item.icon size={18} /></div>
                                    <div style={{ overflow: "hidden" }}>
                                        <div className="pf-info-lbl">{item.lbl}</div>
                                        <div className="pf-info-val" title={item.val}>{item.val}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="pf-stats">
                            <div className="pf-stat">
                                <div className="pf-stat-num">12</div>
                                <div className="pf-stat-lbl">Apps</div>
                            </div>
                            <div className="pf-stat">
                                <div className="pf-stat-num">8</div>
                                <div className="pf-stat-lbl">Approved</div>
                            </div>
                            <div className="pf-stat">
                                <div className="pf-stat-num">94%</div>
                                <div className="pf-stat-lbl">AUC</div>
                            </div>
                        </div>
                    </aside>

                    {/* ── FORM CARD + REVIEWS ── */}
                    <div className="flex flex-col gap-6">

                        {/* ── HUMAN REVIEW REQUESTS ── */}
                        {humanReviews.length > 0 && (
                            <div className="pf-form-card">
                                <div className="pf-form-header">
                                    <div className="pf-form-header-left">
                                        <div className="pf-form-header-icon" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                                            <ClipboardCheck size={22} />
                                        </div>
                                        <div>
                                            <div className="pf-form-title">Human Review Requests</div>
                                            <div className="pf-form-sub">{humanReviews.length} pending review{humanReviews.length !== 1 ? 's' : ''} queued for escalation.</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={clearAllReviews}
                                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md border text-red-500 border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer flex items-center gap-1.5"
                                    >
                                        <Trash2 size={11} /> Clear All
                                    </button>
                                </div>
                                <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {humanReviews.map((review: any, idx: number) => (
                                        <div key={review.id || idx} className="pf-info-row" style={{ justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <div className="pf-info-icon" style={{ background: review.decision === 'Rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: review.decision === 'Rejected' ? '#ef4444' : '#f59e0b' }}>
                                                    <AlertTriangle size={18} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                                                        {review.decision} — {review.riskBand} Risk
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>
                                                        PD: {(review.probability * 100).toFixed(1)}% · Confidence: {(review.confidence * 100).toFixed(0)}%
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '3px 10px', borderRadius: '100px' }}>
                                                    <Clock size={10} /> {review.status}
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>
                                                    {new Date(review.requestedAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pf-form-card">
                            <div className="pf-form-header">
                                <div className="pf-form-header-left">
                                    <div className="pf-form-header-icon"><User size={22} /></div>
                                    <div>
                                        <div className="pf-form-title">Identity & Security</div>
                                        <div className="pf-form-sub">Manage your public presence on the underwriter team.</div>
                                    </div>
                                </div>
                                <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md border ${saved ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10" : "text-amber-500 border-amber-500/20 bg-amber-500/10"}`}>
                                    {saved ? "Synchronized" : "Pending Sync"}
                                </div>
                            </div>

                            <form onSubmit={handleSave}>

                                {/* Basic Details */}
                                <div className="pf-form-section">
                                    <div className="pf-section-lbl">Employee Information</div>
                                    <div className="pf-field-grid">
                                        <div className="pf-field">
                                            <label className="pf-label" htmlFor="firstName"><User size={12} /> Legal First Name</label>
                                            <Input id="firstName" value={formData.firstName}
                                                onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                                        </div>
                                        <div className="pf-field">
                                            <label className="pf-label" htmlFor="lastName"><User size={12} /> Legal Last Name</label>
                                            <Input id="lastName" value={formData.lastName}
                                                onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                                        </div>
                                        <div className="pf-field">
                                            <label className="pf-label" htmlFor="role"><Shield size={12} /> Professional Designation</label>
                                            <Input id="role" value={formData.role}
                                                onChange={e => setFormData({ ...formData, role: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="pf-form-section">
                                    <div className="pf-section-lbl">Communication Channels</div>
                                    <div className="pf-field-grid">
                                        <div className="pf-field">
                                            <label className="pf-label" htmlFor="email"><Mail size={12} /> System Email</label>
                                            <div className="pf-input-wrap">
                                                <Mail size={16} className="pf-input-icon" />
                                                <Input id="email" type="email" disabled value={formData.email} className="pf-input-padded" />
                                                <span className="pf-locked"><Lock size={10} /> Read Only</span>
                                            </div>
                                        </div>
                                        <div className="pf-field">
                                            <label className="pf-label" htmlFor="phone"><Smartphone size={12} /> Security Phone</label>
                                            <Input id="phone" value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                {/* Bio / Professional Summary */}
                                <div className="pf-form-section">
                                    <div className="pf-section-lbl">Underwriter Portfolio</div>
                                    <div className="pf-field">
                                        <label className="pf-label" htmlFor="bio"><BadgeCheck size={12} /> Professional Summary</label>
                                        <textarea
                                            id="bio"
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                            placeholder="Describe your expertise in credit modeling or risk management..."
                                        />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="pf-form-footer">
                                    <div className="pf-footer-note">
                                        <Shield size={14} />
                                        Identity verified via ACIE Governance Protocol.
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`pf-save-btn${saved ? " pf-save-btn--saved" : ""}`}
                                    >
                                        {loading ? (
                                            <><Loader2 size={18} className="animate-spin" /> Committing Details…</>
                                        ) : saved ? (
                                            <><Check size={18} /> Profile Synchronized</>
                                        ) : (
                                            <>Commit Changes</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>{/* close flex-col wrapper */}
                </div>{/* close pf-grid */}
            </div>
        </>
    );
}