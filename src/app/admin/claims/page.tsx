"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import toast from "react-hot-toast";

const claims = [
  {
    id: "cl_001", worker: "Arjun K.", trigger: "Heavy Rain", zone: "Koramangala, BLR",
    confidence: 0.92, payout: 750, status: "auto_approved", date: "18 Mar, 20:15",
  },
  {
    id: "cl_002", worker: "Priya S.", trigger: "Extreme Heat", zone: "CP, DEL",
    confidence: 0.68, payout: 450, status: "approved", date: "17 Mar, 16:30",
  },
  {
    id: "cl_003", worker: "Rahul M.", trigger: "Hazardous AQI", zone: "Anand Vihar, DEL",
    confidence: 0.55, payout: 900, status: "under_review", date: "15 Mar, 23:30",
  },
  {
    id: "cl_004", worker: "Deepak V.", trigger: "Platform Outage", zone: "Indiranagar, BLR",
    confidence: 0.95, payout: 500, status: "auto_approved", date: "19 Mar, 21:45",
  },
  {
    id: "cl_005", worker: "Suresh P.", trigger: "Heavy Rain", zone: "Koramangala, BLR",
    confidence: 0.32, payout: 0, status: "held", date: "18 Mar, 20:30",
  },
];

const statusConfig: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  auto_approved: { label: "Auto Approved", class: "status-approved", icon: CheckCircle },
  approved: { label: "Approved", class: "status-approved", icon: CheckCircle },
  under_review: { label: "Under Review", class: "status-reviewing", icon: Clock },
  held: { label: "Held", class: "status-held", icon: XCircle },
  denied: { label: "Denied", class: "status-denied", icon: XCircle },
};

export default function AdminClaimsPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = claims.filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (searchQuery && !c.worker.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleAction = (id: string, action: string) => {
    toast.success(`Claim ${id} ${action}`);
  };

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
        Claims <span className="gradient-text">Review</span>
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Review and manage parametric claims</p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by worker name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-sm text-foreground placeholder-muted-foreground flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {["all", "under_review", "held", "auto_approved"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === s
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : s === "under_review" ? "Review" : s === "held" ? "Held" : "Approved"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Claim</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Worker</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Trigger</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Zone</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Confidence</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Payout</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((claim, i) => {
                const st = statusConfig[claim.status];
                return (
                  <motion.tr
                    key={claim.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{claim.id}</td>
                    <td className="px-5 py-4 font-medium">{claim.worker}</td>
                    <td className="px-5 py-4">{claim.trigger}</td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{claim.zone}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${claim.confidence * 100}%`,
                              background:
                                claim.confidence >= 0.75
                                  ? "#10b981"
                                  : claim.confidence >= 0.4
                                  ? "#f59e0b"
                                  : "#ef4444",
                            }}
                          />
                        </div>
                        <span className="text-xs">{(claim.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {claim.payout > 0 ? `₹${claim.payout}` : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${st.class}`}>
                        <st.icon className="w-3 h-3" />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {(claim.status === "under_review" || claim.status === "held") && (
                          <>
                            <button
                              onClick={() => handleAction(claim.id, "approved")}
                              className="p-1.5 rounded-lg bg-[rgba(16,185,129,0.1)] text-accent hover:bg-[rgba(16,185,129,0.2)] transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(claim.id, "held for investigation")}
                              className="p-1.5 rounded-lg bg-[rgba(239,68,68,0.1)] text-destructive hover:bg-[rgba(239,68,68,0.2)] transition-colors"
                              title="Hold"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="View Details">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
