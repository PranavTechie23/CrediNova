interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  subtitle?: string;
}

export default function PageHeader({ title, description, icon, actions, subtitle }: PageHeaderProps) {
  return (
    <>
      <style>{`
        .page-hdr {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .page-hdr-left {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          flex: 1;
          min-width: 300px;
        }
        .page-hdr-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(123, 97, 255, 0.1));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(0, 212, 255, 0.1);
          flex-shrink: 0;
          border: 1px solid rgba(0, 212, 255, 0.2);
        }
        html.dark .page-hdr-icon {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(123, 97, 255, 0.15));
          box-shadow: 0 8px 16px rgba(0, 212, 255, 0.15);
        }
        .page-hdr-icon svg {
          color: #0284c7;
          width: 28px;
          height: 28px;
        }
        html.dark .page-hdr-icon svg {
          color: #00d4ff;
        }
        .page-hdr-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 800;
          color: #0c2340;
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin-bottom: 8px;
        }
        html.dark .page-hdr-title { 
          color: #f0f4ff;
        }
        .page-hdr-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          color: #94a3b8;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        html.dark .page-hdr-subtitle {
          color: #7b61ff;
        }
        .page-hdr-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          color: #64748b;
          font-weight: 500;
          line-height: 1.4;
        }
        html.dark .page-hdr-desc { 
          color: #94a3b8;
        }
        .page-hdr-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
      `}</style>
      <div className="page-hdr">
        <div className="page-hdr-left">
          {icon && <div className="page-hdr-icon">{icon}</div>}
          <div className="flex-1">
            {subtitle && <p className="page-hdr-subtitle">{subtitle}</p>}
            <h1 className="page-hdr-title">{title}</h1>
            {description && <p className="page-hdr-desc">{description}</p>}
          </div>
        </div>
        {actions && <div className="page-hdr-actions">{actions}</div>}
      </div>
    </>
  );
}
