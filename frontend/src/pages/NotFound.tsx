import { Link } from "react-router-dom";
import { ArrowLeft, Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        
        .notfound-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          font-family: 'Sora', sans-serif;
          background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f8fafc 100%);
          position: relative;
          overflow: hidden;
        }
        html.dark .notfound-root {
          background: linear-gradient(135deg, #070d1a 0%, #0c1a2e 50%, #081020 100%);
        }

        .notfound-root::before {
          content: '';
          position: absolute;
          top: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .notfound-root::after {
          content: '';
          position: absolute;
          bottom: -150px;
          left: -150px;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .notfound-content {
          text-align: center;
          position: relative;
          z-index: 1;
          max-width: 480px;
        }

        .notfound-icon {
          width: 88px;
          height: 88px;
          border-radius: 24px;
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 32px;
          box-shadow: 0 8px 24px rgba(2,132,199,0.15);
        }
        html.dark .notfound-icon {
          background: linear-gradient(135deg, rgba(14,165,233,0.15), rgba(56,189,248,0.1));
          box-shadow: 0 8px 24px rgba(56,189,248,0.15);
        }
        .notfound-icon svg {
          color: #0284c7;
        }
        html.dark .notfound-icon svg {
          color: #38bdf8;
        }

        .notfound-code {
          font-size: clamp(4rem, 10vw, 7rem);
          font-weight: 800;
          letter-spacing: -0.06em;
          background: linear-gradient(135deg, #0369a1, #0ea5e9, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 12px;
        }

        .notfound-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0c2340;
          margin-bottom: 12px;
        }
        html.dark .notfound-title {
          color: #e0f2fe;
        }

        .notfound-desc {
          font-size: 0.95rem;
          color: #64748b;
          line-height: 1.65;
          margin-bottom: 36px;
        }
        html.dark .notfound-desc {
          color: rgb(var(--text-faint));
        }

        .notfound-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .notfound-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 10px;
          font-family: 'Sora', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
          text-decoration: none;
          border: none;
        }

        .notfound-btn-primary {
          background: linear-gradient(135deg, #0369a1, #0ea5e9);
          color: white;
          box-shadow: 0 4px 16px rgba(3,105,161,0.35);
        }
        .notfound-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(3,105,161,0.45);
        }

        .notfound-btn-ghost {
          background: transparent;
          color: #0369a1;
          border: 1.5px solid #bae6fd;
        }
        html.dark .notfound-btn-ghost {
          color: #7dd3fc;
          border-color: rgba(56,189,248,0.3);
        }
        .notfound-btn-ghost:hover {
          background: #f0f9ff;
          border-color: #38bdf8;
        }
        html.dark .notfound-btn-ghost:hover {
          background: rgba(56,189,248,0.1);
        }
      `}</style>
      <div className="notfound-root">
        <div className="notfound-content">
          <div className="notfound-icon">
            <Search size={36} />
          </div>
          <div className="notfound-code">404</div>
          <h1 className="notfound-title">Page Not Found</h1>
          <p className="notfound-desc">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div className="notfound-actions">
            <Link to="/" className="notfound-btn notfound-btn-primary">
              <Home size={16} />
              Back to Home
            </Link>
            <Link to="/dashboard" className="notfound-btn notfound-btn-ghost">
              <ArrowLeft size={16} />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
