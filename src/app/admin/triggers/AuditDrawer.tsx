"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  ShieldCheck,
  Eye,
  Users,
  Copy,
  ChevronRight,
  Loader2,
  Zap,
  CloudRain,
  Thermometer,
  Wind,
  MapPin,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";

// ═══════════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** The trigger document shape, including optional audit fields from Firestore. */
export interface TriggerDocWithAudit {
  id: string;
  type: string;
  severity: string;
  zone: string;
  city: string;
  startTime: string | Timestamp | null;
  details: string;
  rawValue: number | null;
  thresholdApplied: number | null;
  confidenceScore: number | null;
  result: string | null;
  source: string;
  status?: string;
  affectedWorkers: number;
  createdAt: Timestamp | string | null;
  // Audit fields (may or may not exist on older docs)
  source_feed_snapshot?: Record<string, unknown> | null;
  evaluation_logic_version?: string | null;
  claims_created?: string[];
  reviewed_by_admin?: boolean;
}

/** Lightweight claim view fetched by triggerEventId. */
interface LinkedClaim {
  id: string;
  workerName: string;
  policyId: string;
  status: string;
  payoutAmount: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  META LOOKUP
// ═══════════════════════════════════════════════════════════════════════════════

const triggerMeta: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  heavy_rain: { icon: CloudRain, color: "#3b82f6", label: "Rain" },
  extreme_heat: { icon: Thermometer, color: "#f97316", label: "Heat" },
  hazardous_aqi: { icon: Wind, color: "#8b5cf6", label: "AQI" },
  zone_closure: { icon: MapPin, color: "#ef4444", label: "Zone" },
  platform_outage: { icon: Wifi, color: "#06b6d4", label: "Platform" },
};

const severityColors: Record<string, string> = {
  moderate: "#f59e0b",
  high: "#f97316",
  severe: "#ef4444",
};

// ═══════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function resolveDate(ts: Timestamp | string | null | undefined): Date | null {
  if (!ts) return null;
  if (typeof ts === "string") return new Date(ts);
  if (typeof ts === "object" && "toDate" in ts) return ts.toDate();
  return null;
}

function formatFullDate(ts: Timestamp | string | null | undefined): string {
  const d = resolveDate(ts);
  if (!d) return "—";
  return (
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  AUDIT DRAWER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function AuditDrawer({
  trigger,
  onClose,
}: {
  trigger: TriggerDocWithAudit;
  onClose: () => void;
}) {
  const [marking, setMarking] = useState(false);
  const [reviewed, setReviewed] = useState(trigger.reviewed_by_admin ?? false);
  const [linkedClaims, setLinkedClaims] = useState<LinkedClaim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [snapshotExpanded, setSnapshotExpanded] = useState(false);

  const meta = triggerMeta[trigger.type] || { icon: Zap, color: "#888", label: trigger.type };
  const Icon = meta.icon;
  const sevColor = severityColors[trigger.severity] || "#888";

  // ── Fetch linked claims from Firestore ────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function fetchClaims() {
      setLoadingClaims(true);
      try {
        const q = query(
          collection(db, "claims"),
          where("triggerEventId", "==", trigger.id)
        );
        const snap = await getDocs(q);
        if (cancelled) return;
        const claims: LinkedClaim[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            workerName: data.workerName || "Unknown Worker",
            policyId: data.policyId || "—",
            status: data.status || "unknown",
            payoutAmount: data.payoutAmount || 0,
          };
        });
        setLinkedClaims(claims);
      } catch (err) {
        console.error("Failed to fetch linked claims:", err);
      } finally {
        if (!cancelled) setLoadingClaims(false);
      }
    }
    fetchClaims();
    return () => { cancelled = true; };
  }, [trigger.id]);

  // Sync reviewed state if trigger prop changes
  useEffect(() => {
    setReviewed(trigger.reviewed_by_admin ?? false);
  }, [trigger.reviewed_by_admin]);

  // ── Mark as reviewed ──────────────────────────────────────────────────
  const handleMarkReviewed = async () => {
    setMarking(true);
    try {
      const docRef = doc(db, "triggerEvents", trigger.id);
      await updateDoc(docRef, {
        reviewed_by_admin: true,
        updatedAt: serverTimestamp(),
      });
      setReviewed(true);
      toast.success("Marked as reviewed", { icon: "✅", duration: 2000 });
    } catch (err) {
      console.error("Mark as reviewed error:", err);
      toast.error("Failed to mark as reviewed");
    } finally {
      setMarking(false);
    }
  };

  const copySnapshot = () => {
    if (trigger.source_feed_snapshot) {
      navigator.clipboard.writeText(JSON.stringify(trigger.source_feed_snapshot, null, 2));
      toast.success("Snapshot copied to clipboard", { duration: 2000 });
    }
  };

  // ── Build the full audit object for display ───────────────────────────
  const auditObject = {
    source_feed_snapshot: trigger.source_feed_snapshot ?? null,
    evaluation_logic_version: trigger.evaluation_logic_version ?? null,
    claims_created: trigger.claims_created ?? [],
    reviewed_by_admin: reviewed,
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <motion.div
        className="fixed top-0 right-0 z-50 h-full w-full max-w-[540px] bg-background border-l border-border shadow-2xl overflow-y-auto"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
              >
                <Icon className="w-5 h-5" style={{ color: meta.color }} />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                  {meta.label} Trigger
                </h2>
                <p className="text-xs text-muted-foreground font-mono truncate max-w-[260px]">
                  {trigger.id}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* ── Reviewed Status Banner ────────────────────────────── */}
          {reviewed ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" />
              <span className="text-xs font-semibold text-[#10b981]">Reviewed by Admin</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Eye className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-500">Pending Review</span>
            </div>
          )}

          {/* ── Event Summary Grid ────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Event Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Zone", value: trigger.zone },
                { label: "City", value: trigger.city },
                { label: "Severity", value: trigger.severity?.toUpperCase(), color: sevColor },
                { label: "Source", value: trigger.source === "manual_test" ? "Manual Test" : trigger.source === "mock_feed" ? "Engine" : trigger.source },
                { label: "Raw Value", value: trigger.rawValue?.toString() ?? "—" },
                { label: "Threshold", value: trigger.thresholdApplied?.toString() ?? "—" },
                { label: "Workers Affected", value: trigger.affectedWorkers?.toString() ?? "0" },
                { label: "Fired At", value: formatFullDate(trigger.createdAt || trigger.startTime) },
              ].map((item) => (
                <div key={item.label} className="bg-muted/40 rounded-lg px-3 py-2.5 border border-border/50">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">{item.label}</p>
                  <p
                    className="text-sm font-semibold mt-0.5 truncate"
                    style={item.color ? { color: item.color } : undefined}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Details ────────────────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Details</h3>
            <p className="text-sm text-foreground/80 bg-muted/40 rounded-lg px-3 py-3 border border-border/50 leading-relaxed">
              {trigger.details}
            </p>
          </div>

          {/* ── Audit Object ──────────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Audit Trail
            </h3>
            <div className="space-y-3">
              {/* Evaluation Logic Version */}
              <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2.5 border border-border/50">
                <span className="text-xs text-muted-foreground">Evaluation Logic Version</span>
                <span className="text-xs font-mono font-bold text-primary">
                  {auditObject.evaluation_logic_version || "—"}
                </span>
              </div>

              {/* Reviewed by Admin */}
              <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2.5 border border-border/50">
                <span className="text-xs text-muted-foreground">Reviewed by Admin</span>
                <span className={`text-xs font-bold ${reviewed ? "text-[#10b981]" : "text-amber-500"}`}>
                  {reviewed ? "Yes" : "No"}
                </span>
              </div>

              {/* Claims Created */}
              <div className="bg-muted/40 rounded-lg px-3 py-2.5 border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Claims Created</span>
                  <span className="text-xs font-mono font-bold">
                    {auditObject.claims_created.length}
                  </span>
                </div>
                {auditObject.claims_created.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {auditObject.claims_created.map((cid) => (
                      <div key={cid} className="text-[10px] font-mono text-muted-foreground bg-background/60 px-2 py-1 rounded">
                        {cid}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Source Feed Snapshot — Expandable */}
              <div className="bg-muted/40 rounded-lg border border-border/50 overflow-hidden">
                <button
                  onClick={() => setSnapshotExpanded(!snapshotExpanded)}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/60 transition-colors"
                >
                  <span className="text-xs text-muted-foreground">Source Feed Snapshot</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${snapshotExpanded ? "rotate-90" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {snapshotExpanded && auditObject.source_feed_snapshot && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-3 pb-3">
                        <div className="flex justify-end mb-1">
                          <button
                            onClick={copySnapshot}
                            className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            Copy JSON
                          </button>
                        </div>
                        <pre className="text-[10px] font-mono text-foreground/70 bg-background/80 rounded-lg p-3 overflow-x-auto max-h-64 border border-border/30">
                          {JSON.stringify(auditObject.source_feed_snapshot, null, 2)}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {snapshotExpanded && !auditObject.source_feed_snapshot && (
                  <p className="px-3 pb-2.5 text-[10px] text-muted-foreground italic">
                    No snapshot available for this event
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Affected Workers / Linked Claims ──────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Affected Workers
            </h3>
            {loadingClaims ? (
              <div className="flex items-center gap-2 py-6 justify-center text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Loading claims…</span>
              </div>
            ) : linkedClaims.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-muted-foreground">
                <Users className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs">No linked claims found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {linkedClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2.5 border border-border/50"
                  >
                    <div>
                      <p className="text-xs font-semibold">{claim.workerName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Policy: {claim.policyId}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        claim.status === "approved"
                          ? "bg-[#10b981]/10 text-[#10b981]"
                          : claim.status === "rejected"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {claim.status.replace(/_/g, " ")}
                      </span>
                      {claim.payoutAmount > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          ₹{claim.payoutAmount}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Mark as Reviewed Button ────────────────────────────── */}
          {!reviewed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={handleMarkReviewed}
                disabled={marking}
                className="w-full gap-2 h-11 text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  border: "none",
                }}
              >
                {marking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                Mark as Reviewed
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}
