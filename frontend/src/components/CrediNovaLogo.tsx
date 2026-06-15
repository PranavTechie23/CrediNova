import { Shield } from "lucide-react";

interface CrediNovaLogoProps {
  className?: string;
  theme?: 'light' | 'dark';
  iconOnly?: boolean;
}

export default function CrediNovaLogo({ className = "", theme, iconOnly = false }: CrediNovaLogoProps) {
  const isDark = theme === 'dark';

  if (iconOnly) {
    return (
      <div
        className={className}
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: "linear-gradient(135deg, #0284c7, #38bdf8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(2,132,199,0.35)",
        }}
      >
        <Shield size={24} color="#fff" />
      </div>
    );
  }

  return (
    <div className={className} style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: "linear-gradient(135deg, #0284c7, #38bdf8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 3px 10px rgba(2,132,199,0.35)",
          flexShrink: 0,
        }}
      >
        <Shield size={18} color="#fff" />
      </div>
      <div style={{ lineHeight: 1.2 }}>
        <span
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: isDark ? "#e0f2fe" : "#0c2340",
            letterSpacing: "-0.02em",
            transition: "color 0.3s ease",
          }}
        >
          Credi
        </span>
        <span
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#0284c7",
            letterSpacing: "-0.02em",
          }}
        >
          Nova
        </span>
      </div>
    </div>
  );
}
