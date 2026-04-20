import { Shield, Lock, Eye, Users, Database, Mail, ChevronRight, FileText } from "lucide-react";

const sections = [
    {
        n: "01",
        icon: FileText,
        title: "Introduction",
        content: (
            <p>
                At <strong>ACIE — Adaptive Credit Intelligence Engine</strong>, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully. If you do not agree with its terms, please do not access the application.
            </p>
        )
    },
    {
        n: "02",
        icon: Database,
        title: "Information We Collect",
        content: (
            <div className="pp-list">
                <div className="pp-list-item">
                    <div className="pp-list-bullet" />
                    <div>
                        <strong>Personal Data</strong> — Name, email address, phone number, and demographic information you voluntarily provide when registering or using the application.
                    </div>
                </div>
                <div className="pp-list-item">
                    <div className="pp-list-bullet" />
                    <div>
                        <strong>Financial Data</strong> — Credit application inputs such as income, debt ratios, and loan details used solely to compute AI-generated risk assessments.
                    </div>
                </div>
                <div className="pp-list-item">
                    <div className="pp-list-bullet" />
                    <div>
                        <strong>Usage Data</strong> — Information about how you interact with the platform, including pages visited, features used, and session duration.
                    </div>
                </div>
            </div>
        )
    },
    {
        n: "03",
        icon: Eye,
        title: "Use of Your Information",
        content: (
            <div className="pp-list">
                {[
                    "Create and manage your account on the ACIE platform.",
                    "Power AI credit risk assessments and generate SHAP explainability reports.",
                    "Monitor model performance, fairness metrics, and drift detection.",
                    "Communicate important updates or changes to the platform.",
                    "Improve the platform through usage analytics and trend analysis.",
                    "Ensure regulatory compliance and maintain complete audit trails.",
                ].map((item, i) => (
                    <div key={i} className="pp-list-item">
                        <div className="pp-list-bullet" />
                        <div>{item}</div>
                    </div>
                ))}
            </div>
        )
    },
    {
        n: "04",
        icon: Users,
        title: "Disclosure of Your Information",
        content: (
            <div className="pp-list">
                <div className="pp-list-item">
                    <div className="pp-list-bullet" />
                    <div>
                        <strong>By Law or to Protect Rights</strong> — We may disclose your information when required by law, legal process, or to protect the rights, property, or safety of our users and platform.
                    </div>
                </div>
                <div className="pp-list-item">
                    <div className="pp-list-bullet" />
                    <div>
                        <strong>Third-Party Service Providers</strong> — Trusted partners who assist with hosting, analytics, and infrastructure — all bound by strict data processing agreements.
                    </div>
                </div>
                <div className="pp-list-item">
                    <div className="pp-list-bullet" />
                    <div>
                        <strong>We never sell your data</strong> to advertisers or unrelated third parties under any circumstances.
                    </div>
                </div>
            </div>
        )
    },
    {
        n: "05",
        icon: Lock,
        title: "Security of Your Information",
        content: (
            <p>
                We employ administrative, technical, and physical security controls to protect your personal and financial data. All data in transit is encrypted via TLS. While we take every reasonable step to secure your information, no transmission method is 100% impenetrable — we encourage you to use strong, unique passwords and keep your credentials confidential.
            </p>
        )
    },
    {
        n: "06",
        icon: Mail,
        title: "Contact Us",
        content: (
            <p>
                If you have questions or concerns about this Privacy Policy, please reach out to our team at{" "}
                <a href="mailto:support@acie.ai" className="pp-link">support@acie.ai</a>.
                We aim to respond to all privacy-related enquiries within 48 hours.
            </p>
        )
    }
];

export default function PrivacyPolicy() {
    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .pp { font-family: 'Sora', sans-serif; color: hsl(var(--foreground)); max-width: 860px; margin: 0 auto; padding: 0 0 60px; }

        /* ── HERO ── */
        .pp-hero {
          border-radius: 24px; overflow: hidden; margin-bottom: 36px;
          background: linear-gradient(135deg, #0c2340 0%, #0a3158 50%, #0369a1 100%);
          padding: 48px 40px; position: relative;
          box-shadow: 0 12px 40px rgba(0,0,0,0.1);
          animation: slideDown 0.6s ease-out;
        }
        .dark .pp-hero { background: linear-gradient(135deg, #020617 0%, #0f172a 60%, #1e293b 100%); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
        
        .pp-hero::before {
          content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0.1;
          background-image:
            linear-gradient(rgba(56,189,248,0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.2) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .pp-hero-glow {
          position: absolute; top: -100px; right: -100px;
          width: 300px; height: 300px; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%);
          filter: blur(40px);
        }
        .pp-hero-inner { position: relative; z-index: 1; display: flex; align-items: flex-start; gap: 24px; }
        @media(max-width: 640px) { .pp-hero-inner { flex-direction: column; align-items: center; text-align: center; } }

        .pp-hero-icon {
          width: 56px; height: 56px; border-radius: 16px; flex-shrink: 0;
          background: linear-gradient(135deg, hsl(var(--primary)), #38bdf8);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 4px rgba(56,189,248,0.2), 0 8px 24px rgba(3,105,161,0.4);
          color: #fff;
        }
        .pp-hero-eyebrow {
          font-size: 0.68rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
          color: #7dd3fc; margin-bottom: 8px; opacity: 0.9;
        }
        .pp-hero-title { font-size: 2rem; font-weight: 800; color: #fff; letter-spacing: -0.04em; margin-bottom: 12px; line-height: 1.1; }
        .pp-hero-sub { font-size: 0.9rem; color: rgba(186,230,253,0.85); line-height: 1.65; max-width: 540px; }
        
        .pp-hero-chips { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 24px; }
        @media(max-width: 640px) { .pp-hero-chips { justify-content: center; } }
        
        .pp-hero-chip {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          padding: 6px 14px; border-radius: 100px;
          font-size: 0.72rem; font-weight: 600; color: rgba(186,230,253,0.9);
          backdrop-filter: blur(4px);
        }
        .pp-hero-chip-dot { width: 6px; height: 6px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 8px rgba(56,189,248,0.6); }

        /* ── TOC ── */
        .pp-toc {
          background: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 20px;
          padding: 24px; margin-bottom: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dark .pp-toc { background: hsl(var(--card)/0.4); backdrop-filter: blur(8px); box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
        .pp-toc:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.04); }

        .pp-toc-title {
          font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: hsl(var(--primary)); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
        }
        .pp-toc-title::after { content:''; flex:1; height:1px; background: hsl(var(--border)); }
        
        .pp-toc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; }
        .pp-toc-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 12px; border: 1px solid transparent;
          font-size: 0.82rem; font-weight: 600; color: hsl(var(--foreground));
          text-decoration: none; background: hsl(var(--muted)/0.3);
          transition: all 0.2s; cursor: pointer;
        }
        .pp-toc-item:hover { background: hsl(var(--muted)/0.6); border-color: hsl(var(--primary)/0.3); transform: translateX(4px); color: hsl(var(--primary)); }
        .pp-toc-num { font-family: 'DM Mono', monospace; font-size: 0.68rem; color: hsl(var(--muted-foreground)); font-weight: 500; }
        .pp-toc-arrow { margin-left: auto; color: hsl(var(--muted-foreground)); opacity: 0.4; transition: all 0.2s; }
        .pp-toc-item:hover .pp-toc-arrow { transform: translateX(2px); opacity: 1; color: hsl(var(--primary)); }

        /* ── SECTIONS ── */
        .pp-sections { display: flex; flex-direction: column; gap: 24px; }

        .pp-section {
          background: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 20px;
          overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          transition: all 0.3s;
          animation: slideUp 0.6s ease-out;
        }
        .dark .pp-section { background: hsl(var(--card)/0.4); backdrop-filter: blur(8px); }
        .pp-section:hover { box-shadow: 0 10px 40px rgba(0,0,0,0.05); transform: translateY(-2px); border-color: hsl(var(--primary)/0.2); }

        .pp-section-header {
          display: flex; align-items: center; gap: 16px;
          padding: 24px 28px; border-bottom: 1px solid hsl(var(--border));
          background: hsl(var(--muted)/0.2);
        }
        .pp-section-icon {
          width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
          background: hsl(var(--primary)/0.1); color: hsl(var(--primary));
          display: flex; align-items: center; justify-content: center;
          box-shadow: inset 0 0 0 1px hsl(var(--primary)/0.05);
        }
        .pp-section-num {
          font-family: 'DM Mono', monospace; font-size: 0.7rem; font-weight: 600;
          color: hsl(var(--primary)); margin-bottom: 2px;
        }
        .pp-section-title { font-size: 1.05rem; font-weight: 700; color: hsl(var(--foreground)); letter-spacing: -0.02em; }

        .pp-section-body {
          padding: 28px;
          font-size: 0.95rem; color: hsl(var(--muted-foreground)); line-height: 1.8;
        }
        .pp-section-body strong { color: hsl(var(--foreground)); font-weight: 700; }
        .pp-section-body p { margin: 0; }

        /* list items */
        .pp-list { display: flex; flex-direction: column; gap: 16px; }
        .pp-list-item { display: flex; align-items: flex-start; gap: 14px; font-size: 0.95rem; line-height: 1.75; }
        .pp-list-bullet {
          width: 8px; height: 8px; border-radius: 50%; background: hsl(var(--primary));
          flex-shrink: 0; margin-top: 10px;
          box-shadow: 0 0 0 4px hsl(var(--primary)/0.1), 0 0 12px hsl(var(--primary)/0.3);
        }

        /* link */
        .pp-link { color: hsl(var(--primary)); font-weight: 700; text-decoration: none; border-bottom: 1px dashed transparent; transition: all 0.2s; }
        .pp-link:hover { border-bottom-color: hsl(var(--primary)); opacity: 0.9; }

        /* ── FOOTER NOTE ── */
        .pp-footer-note {
          margin-top: 40px; padding: 24px 28px; border-radius: 20px;
          background: linear-gradient(135deg, hsl(var(--primary)/0.08), transparent);
          border: 1px solid hsl(var(--primary)/0.15);
          display: flex; align-items: flex-start; gap: 16px;
          font-size: 0.88rem; color: hsl(var(--muted-foreground)); line-height: 1.7;
          animation: fadeIn 1s ease-out;
        }
        .pp-footer-note-icon {
          flex-shrink: 0; width: 40px; height: 40px; border-radius: 12px;
          background: hsl(var(--primary)/0.1); color: hsl(var(--primary));
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        @keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
      `}</style>

            <div className="pp">

                {/* HERO */}
                <div className="pp-hero">
                    <div className="pp-hero-glow" />
                    <div className="pp-hero-inner">
                        <div className="pp-hero-icon"><Shield size={28} /></div>
                        <div className="pp-hero-text">
                            <div className="pp-hero-eyebrow">Data Governance · ACIE Platform</div>
                            <div className="pp-hero-title">Privacy Protocol</div>
                            <div className="pp-hero-sub">
                                Enterprise-grade transparency for AI-driven risk modeling. We safeguard your financial intelligence with end-to-end encryption and strict regulatory alignment.
                            </div>
                            <div className="pp-hero-chips">
                                <div className="pp-hero-chip"><span className="pp-hero-chip-dot" />GDPR & India's DPDP Act</div>
                                <div className="pp-hero-chip"><span className="pp-hero-chip-dot" />AES-256 Storage</div>
                                <div className="pp-hero-chip"><span className="pp-hero-chip-dot" />Zero Bias Policy</div>
                                <div className="pp-hero-chip"><span className="pp-hero-chip-dot" />Model Transparency</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLE OF CONTENTS */}
                <div className="pp-toc">
                    <div className="pp-toc-title">Legal Architecture</div>
                    <div className="pp-toc-grid">
                        {sections.map(s => (
                            <a key={s.n} href={`#section-${s.n}`} className="pp-toc-item">
                                <span className="pp-toc-num">{s.n}</span>
                                <span>{s.title}</span>
                                <ChevronRight size={14} className="pp-toc-arrow" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* SECTIONS */}
                <div className="pp-sections">
                    {sections.map(s => (
                        <div key={s.n} className="pp-section" id={`section-${s.n}`}>
                            <div className="pp-section-header">
                                <div className="pp-section-icon"><s.icon size={20} /></div>
                                <div>
                                    <div className="pp-section-num">Component {s.n}</div>
                                    <div className="pp-section-title">{s.title}</div>
                                </div>
                            </div>
                            <div className="pp-section-body">{s.content}</div>
                        </div>
                    ))}
                </div>

                {/* FOOTER NOTE */}
                <div className="pp-footer-note">
                    <div className="pp-footer-note-icon"><Lock size={18} /></div>
                    <div>
                        <strong>Model Governance & Compliance:</strong> This protocol adheres to <strong>GDPR</strong> and <strong>India's DPDP Act</strong>. We follow strict <em>Purpose Limitation</em> (data used only for credit scoring), <em>Data Minimisation</em> (collecting only essential features), and <em>Storage Limitation</em> (raw data is not persisted beyond the required processing window).
                        For data deletion requests, contact our privacy officer at{" "}
                        <a href="mailto:support@acie.ai" className="pp-link">support@acie.ai</a>.
                    </div>
                </div>

            </div>
        </>
    );
}