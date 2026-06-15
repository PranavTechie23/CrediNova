import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, FileText, Activity, BrainCircuit, Sparkles, ShieldCheck, 
  ScrollText, Network, BookOpen, User, Settings, LogOut, Search, Bell, Hexagon, ChevronRight, Sun, Moon
} from "lucide-react";

const NAV_SECTIONS = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }
    ]
  },
  {
    title: "CREDIT ENGINE",
    items: [
      { label: "Credit Application", path: "/apply", icon: FileText },
      { label: "Risk Assessment", path: "/risk-assessment", icon: Activity },
      { label: "Explainability", path: "/explainability", icon: BrainCircuit }
    ]
  },
  {
    title: "INTELLIGENCE",
    items: [
      { label: "Model Intelligence", path: "/model-intelligence", icon: Sparkles },
      { label: "Compliance", path: "/compliance", icon: ShieldCheck }
    ]
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Audit Log", path: "/audit-log", icon: ScrollText },
      { label: "Architecture", path: "/architecture", icon: Network },
      { label: "Documentation", path: "/documentation", icon: BookOpen }
    ]
  },
  {
    title: "USER",
    items: [
      { label: "Profile", path: "/profile", icon: User },
      { label: "Settings", path: "/settings", icon: Settings }
    ]
  }
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const username = user?.email?.split("@")[0] ?? "Risk Analyst";

  // Breadcrumb derivation
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentPage = pathParts.length > 0 
    ? pathParts[pathParts.length - 1].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Dashboard';

  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden font-body">
      
      {/* Sidebar - Fixed Left, 240px */}
      <aside className="w-[240px] flex-shrink-0 bg-surface-2 border-r border-border flex flex-col z-20">
        
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="relative flex items-center justify-center w-6 h-6 mr-3">
            <Hexagon className="w-6 h-6 text-primary absolute animate-[pulse-slow]" strokeWidth={2} />
            <div className="w-2 h-2 bg-primary rounded-full absolute" />
          </div>
          <span className="font-sora font-bold text-lg tracking-wide text-text-primary">CrediNova</span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx} className="mb-6 px-4">
              <h4 className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest mb-2 px-2">
                {section.title}
              </h4>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative overflow-hidden group
                        ${isActive 
                          ? 'text-primary bg-[rgba(0,212,255,0.06)]' 
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                        }
                      `}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeNavIndicator"
                          className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r"
                        />
                      )}
                      <Icon size={16} className={isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-primary transition-colors'} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-border bg-surface-2">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
              <span className="text-sm font-bold text-primary font-mono">{username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-bold font-sora truncate text-text-primary">{username}</div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-accent border border-accent/20 bg-accent/10 rounded px-1.5 py-0.5 inline-block mt-0.5">
                Risk Analyst
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-surface hover:bg-danger/10 text-text-muted hover:text-danger rounded-lg text-xs font-semibold transition-colors border border-transparent hover:border-danger/20"
          >
            <LogOut size={14} />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top bar - 64px Fixed */}
        <header className="h-16 flex-shrink-0 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 z-10 sticky top-0">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm font-mono text-text-muted">
            <span className="hover:text-text-primary cursor-pointer transition-colors">System</span>
            <ChevronRight size={14} />
            <span className="text-primary font-semibold">{currentPage}</span>
          </div>

          {/* Right Area */}
          <div className="flex items-center gap-6">
            
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search queries, apps (⌘K)" 
                className="w-64 bg-surface-2 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-lg pl-9 pr-4 py-1.5 text-sm outline-none transition-all placeholder:text-text-faint text-text-primary"
              />
            </div>

            {/* Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1 bg-success/10 border border-success/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-success animate-[pulse_2s_ease-in-out_infinite]"></div>
              <span className="text-xs font-mono text-success font-semibold tracking-wide">Model Health: Nominal</span>
            </div>

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="text-text-muted hover:text-text-primary transition-colors">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Bell */}
            <button className="relative text-text-muted hover:text-text-primary transition-colors">
              <Bell size={18} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full border border-surface"></div>
            </button>

          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-background custom-scrollbar">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
