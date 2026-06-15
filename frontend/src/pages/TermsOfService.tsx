export default function TermsOfService() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        .tos-root {
          font-family: 'Sora', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 80px 2rem;
          color: #0c2340;
        }
        html.dark .tos-root { color: #e0f2fe; }
        .tos-root h1 {
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #0369a1, #0ea5e9, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .tos-root .tos-date {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 40px;
        }
        html.dark .tos-root .tos-date { color: rgb(var(--text-faint)); }
        .tos-root h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 36px;
          margin-bottom: 12px;
          color: #0c2340;
        }
        html.dark .tos-root h2 { color: #e0f2fe; }
        .tos-root p, .tos-root li {
          font-size: 0.9rem;
          line-height: 1.75;
          color: #475569;
          margin-bottom: 12px;
        }
        html.dark .tos-root p, html.dark .tos-root li { color: #cbd5e1; }
        .tos-root ul { padding-left: 24px; }
      `}</style>
      <div className="tos-root">
        <h1>Terms of Service</h1>
        <p className="tos-date">Last updated: April 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing CrediNova, you agree to these Terms of Service. If you do not agree, do not use the platform.</p>

        <h2>2. Use of Service</h2>
        <p>CrediNova provides AI-powered credit analysis tools for demonstration and educational purposes. The service is not intended to replace professional financial advice.</p>

        <h2>3. User Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials. All activity under your account is your responsibility.</p>

        <h2>4. Intellectual Property</h2>
        <p>All content, algorithms, and designs within CrediNova are proprietary. Unauthorized reproduction or distribution is prohibited.</p>

        <h2>5. Limitation of Liability</h2>
        <p>CrediNova is provided "as is" without warranties. We are not liable for decisions made based on outputs from the platform.</p>

        <h2>6. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance of modified terms.</p>
      </div>
    </>
  );
}
