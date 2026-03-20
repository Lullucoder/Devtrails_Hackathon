"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Shield,
  Activity,
  Sliders
} from "lucide-react";

// Adjusted Nav Items to match the vibe while keeping functionality
const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Worker Management" },
  { href: "/admin/claims", icon: MessageSquare, label: "Claim Sessions" },
  { href: "/admin/fraud", icon: Shield, label: "Fraud Monitoring" },
  { href: "#", icon: Activity, label: "Trigger Analytics" },
  { href: "#", icon: Sliders, label: "Settings & Limits" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar - Matching reference UI exactly */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 flex flex-col py-6 px-4">
        
        {/* Logo Area */}
        <div className="flex flex-col items-center mb-8 pb-6 border-b border-sidebar-border/50">
          <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center mb-3 neon-glow border border-primary/30">
            <Shield className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
          </div>
          <span className="text-sm font-bold tracking-wider" style={{ fontFamily: "var(--font-outfit)" }}>
            RoziRakshak <span className="text-primary">AI</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "#" && pathname.startsWith(item.href) && item.href !== "/admin/dashboard");
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary-foreground" : ""}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full bg-background relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-64 w-[500px] h-[500px] bg-[#f72585]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
