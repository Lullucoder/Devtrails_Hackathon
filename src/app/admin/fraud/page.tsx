"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  MapPin,
  Smartphone,
  Zap,
  Users,
  Shield,
  ChevronRight,
} from "lucide-react";

const fraudAlerts = [
  {
    id: "fs_001",
    worker: "Suresh P.",
    type: "GPS-WiFi Mismatch",
    severity: "high",
    icon: MapPin,
    details:
      "GPS reports Koramangala zone but device connected to home WiFi (Jayanagar). Cell tower registration inconsistent.",
    date: "18 Mar, 20:32",
    status: "investigating",
  },
  {
    id: "fs_002",
    worker: "Vikram T.",
    type: "Impossible Speed",
    severity: "critical",
    icon: Zap,
    details:
      "GPS showed transit from HSR Layout to Whitefield (28km) in 4 minutes. Speed: 420 km/h. GPS teleportation detected.",
    date: "19 Mar, 14:20",
    status: "open",
  },
  {
    id: "fs_003",
    worker: "Amit G.",
    type: "Device Fingerprint Collision",
    severity: "medium",
    icon: Users,
    details:
      "Same device fingerprint found across 3 worker accounts (w_007, w_012, w_018). Possible syndicate activity.",
    date: "17 Mar, 09:15",
    status: "investigating",
  },
  {
    id: "fs_004",
    worker: "Ravi K.",
    type: "Emulator Detected",
    severity: "critical",
    icon: Smartphone,
    details:
      "Claim submitted from Android emulator. Device model: 'sdk_gphone64_x86_64'. No physical device.",
    date: "19 Mar, 22:00",
    status: "open",
  },
];

const severityConfig: Record<string, { class: string; bg: string }> = {
  low: { class: "severity-low", bg: "rgba(16,185,129,0.1)" },
  medium: { class: "severity-medium", bg: "rgba(245,158,11,0.1)" },
  high: { class: "severity-high", bg: "rgba(249,115,22,0.1)" },
  critical: { class: "severity-critical", bg: "rgba(239,68,68,0.1)" },
};

const statusBg: Record<string, string> = {
  open: "status-held",
  investigating: "status-reviewing",
  resolved: "status-approved",
  dismissed: "text-muted-foreground bg-muted",
};

export default function FraudPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-1">
        <AlertTriangle className="w-6 h-6 text-warning" />
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
          Fraud <span className="gradient-text">Alerts</span>
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        AI-detected anomalies across the anti-spoofing defense layers
      </p>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Open", count: 2, color: "#f97316" },
          { label: "Investigating", count: 2, color: "#6c5ce7" },
          { label: "Resolved", count: 0, color: "#10b981" },
          { label: "Dismissed", count: 0, color: "#888899" },
        ].map((item) => (
          <div key={item.label} className="glass rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
            <p className="text-2xl font-bold" style={{ color: item.color }}>
              {item.count}
            </p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        {fraudAlerts.map((alert, i) => {
          const sev = severityConfig[alert.severity];
          return (
            <motion.div
              key={alert.id}
              className="glass rounded-2xl p-5 hover:border-[rgba(108,92,231,0.3)] border border-transparent transition-all cursor-pointer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: sev.bg }}
                >
                  <alert.icon className={`w-5 h-5 ${sev.class}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <h3 className="font-semibold text-sm">{alert.type}</h3>
                      <p className="text-xs text-muted-foreground">
                        Worker: <strong className="text-foreground">{alert.worker}</strong> · {alert.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${sev.class}`}
                        style={{ backgroundColor: sev.bg }}
                      >
                        {alert.severity}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBg[alert.status]}`}>
                        {alert.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{alert.details}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                      <Shield className="w-3.5 h-3.5" />
                      Investigate
                    </button>
                    <button className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                      View Claim
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
