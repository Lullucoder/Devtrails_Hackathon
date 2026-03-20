"use client";

import React from "react";
import { motion } from "framer-motion";
import { CloudRain, Thermometer, Wind, MapPin, Wifi, IndianRupee, FileText } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  heavy_rain: CloudRain,
  extreme_heat: Thermometer,
  hazardous_aqi: Wind,
  zone_closure: MapPin,
  platform_outage: Wifi,
};

const colorMap: Record<string, string> = {
  heavy_rain: "#3b82f6",
  extreme_heat: "#f97316",
  hazardous_aqi: "#8b5cf6",
  zone_closure: "#ef4444",
  platform_outage: "#06b6d4",
};

const typeLabel: Record<string, string> = {
  heavy_rain: "Heavy Rain",
  extreme_heat: "Extreme Heat",
  hazardous_aqi: "Hazardous AQI",
  zone_closure: "Zone Closure",
  platform_outage: "Platform Outage",
};

const claims = [
  {
    id: "cl_001",
    triggerType: "heavy_rain",
    status: "auto_approved",
    confidenceScore: 0.92,
    payoutAmount: 750,
    createdAt: "2026-03-18T20:15:00",
    description: "Severe rainfall in Koramangala zone. 6-hour work window lost.",
  },
  {
    id: "cl_004",
    triggerType: "platform_outage",
    status: "auto_approved",
    confidenceScore: 0.95,
    payoutAmount: 500,
    createdAt: "2026-03-19T21:45:00",
    description: "Platform outage during peak evening hours. 3.5 hours lost.",
  },
  {
    id: "cl_003",
    triggerType: "hazardous_aqi",
    status: "under_review",
    confidenceScore: 0.55,
    payoutAmount: 900,
    createdAt: "2026-03-15T23:30:00",
    description: "Hazardous AQI in your zone. Full-day income disruption.",
  },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  auto_approved: { label: "Auto Approved", class: "status-approved" },
  approved: { label: "Approved", class: "status-approved" },
  under_review: { label: "Under Review", class: "status-reviewing" },
  held: { label: "Held", class: "status-held" },
  denied: { label: "Denied", class: "status-denied" },
};

export default function ClaimsPage() {
  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
        Claims History
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Your parametric claim records</p>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Claims</p>
          <p className="text-2xl font-bold">{claims.length}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Received</p>
          <div className="flex items-center gap-1">
            <IndianRupee className="w-4 h-4 text-accent" />
            <p className="text-2xl font-bold text-accent">1,250</p>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-3">
        {claims.map((claim, i) => {
          const Icon = iconMap[claim.triggerType] || FileText;
          const color = colorMap[claim.triggerType] || "#888";
          const st = statusConfig[claim.status] || statusConfig.under_review;
          return (
            <motion.div
              key={claim.id}
              className="glass rounded-2xl p-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{typeLabel[claim.triggerType]}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(claim.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${st.class}`}
                    >
                      {st.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{claim.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      Confidence: <strong className="text-foreground">{(claim.confidenceScore * 100).toFixed(0)}%</strong>
                    </div>
                    {claim.payoutAmount > 0 && claim.status !== "under_review" && (
                      <div className="flex items-center gap-1 text-sm font-semibold text-accent">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {claim.payoutAmount}
                      </div>
                    )}
                    {claim.status === "under_review" && (
                      <span className="text-xs text-warning font-medium">Pending...</span>
                    )}
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
