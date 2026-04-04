"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Star, Shield, ChevronRight, ShieldCheck, ShieldX, ScanFace, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { WorkerProfile } from "@/types/worker";

const DL_GREEN = "#217346";

function formatDate(timestamp: string | { seconds: number } | undefined): string {
  if (!timestamp) return "—";
  
  try {
    let date: Date;
    if (typeof timestamp === "string") {
      date = new Date(timestamp);
    } else if (typeof timestamp === "object" && "seconds" in timestamp) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      return "—";
    }
    
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

function KycBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{
        background: "rgba(33,115,70,0.12)",
        border: `1px solid rgba(33,115,70,0.3)`,
        color: DL_GREEN,
      }}
      title="Aadhaar KYC verified via DigiLocker"
    >
      <ShieldCheck className="w-3 h-3" />
      KYC
    </div>
  ) : (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.25)",
        color: "#ef4444",
      }}
      title="Aadhaar KYC not completed"
    >
      <ShieldX className="w-3 h-3" />
      Unverified
    </div>
  );
}

function FacePhotoModal({ uid, onClose }: { uid: string; onClose: () => void }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    fetch(`/api/upload/face?uid=${encodeURIComponent(uid)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.presignedUrl) setPhotoUrl(data.presignedUrl);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [uid]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.65)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            maxWidth: 360,
            width: "100%",
          }}
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <ScanFace className="w-4 h-4" style={{ color: DL_GREEN }} />
              <span className="text-sm font-semibold">Face Photo</span>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            className="flex items-center justify-center"
            style={{ minHeight: 280, background: "var(--muted)" }}
          >
            {loading && (
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            )}
            {!loading && error && (
              <p className="text-sm text-muted-foreground text-center px-8">
                Photo not available or R2 credentials not configured.
              </p>
            )}
            {!loading && photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt="Worker face photo"
                className="w-full object-cover"
                style={{ maxHeight: 360 }}
                onError={() => setError(true)}
              />
            )}
          </div>

          <div className="px-5 py-3 text-[10px] text-muted-foreground">
            Liveness-verified face photo · Stored in Cloudflare R2
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function FaceBadge({ uid, verified }: { uid: string; verified: boolean }) {
  const [open, setOpen] = useState(false);

  if (!verified) {
    return (
      <div
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
        style={{
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)",
          color: "#ef4444",
        }}
        title="Face liveness not completed"
      >
        <ScanFace className="w-3 h-3" />
        No Face
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all hover:opacity-80 cursor-pointer"
        style={{
          background: "rgba(33,115,70,0.12)",
          border: `1px solid rgba(33,115,70,0.3)`,
          color: DL_GREEN,
        }}
        title="Click to view face photo"
      >
        <ScanFace className="w-3 h-3" />
        Face ✓
      </button>
      {open && <FacePhotoModal uid={uid} onClose={() => setOpen(false)} />}
    </>
  );
}

export default function UsersPage() {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState<"all" | "verified" | "unverified">("all");

  useEffect(() => {
    const q = query(collection(db, "workers"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const workersData: WorkerProfile[] = [];
        snapshot.forEach((doc) => {
          workersData.push({ id: doc.id, ...doc.data() } as WorkerProfile);
        });
        setWorkers(workersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching workers:", error);
        toast.error("Failed to load workers");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filtered = workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.city.toLowerCase().includes(search.toLowerCase()) ||
      w.phone.toLowerCase().includes(search.toLowerCase());
    const matchesKyc =
      kycFilter === "all"
        ? true
        : kycFilter === "verified"
        ? w.aadhaar_verified
        : !w.aadhaar_verified;
    return matchesSearch && matchesKyc;
  });

  const verifiedCount = workers.filter((w) => w.aadhaar_verified).length;
  const unverifiedCount = workers.length - verifiedCount;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading workers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
        Worker <span className="gradient-text">Management</span>
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        View and manage registered delivery partners
      </p>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all"
          style={{
            background: kycFilter === "all" ? "var(--primary)" : "var(--muted)",
            color: kycFilter === "all" ? "white" : "var(--muted-foreground)",
            border: kycFilter === "all" ? "none" : "1px solid var(--border)",
          }}
          onClick={() => setKycFilter("all")}
        >
          All workers ({workers.length})
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all"
          style={{
            background: kycFilter === "verified" ? "rgba(33,115,70,0.15)" : "var(--muted)",
            color: kycFilter === "verified" ? DL_GREEN : "var(--muted-foreground)",
            border: kycFilter === "verified"
              ? `1px solid rgba(33,115,70,0.4)`
              : "1px solid var(--border)",
          }}
          onClick={() => setKycFilter("verified")}
        >
          <ShieldCheck className="w-4 h-4" />
          KYC Verified ({verifiedCount})
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all"
          style={{
            background: kycFilter === "unverified" ? "rgba(239,68,68,0.1)" : "var(--muted)",
            color: kycFilter === "unverified" ? "#ef4444" : "var(--muted-foreground)",
            border: kycFilter === "unverified"
              ? "1px solid rgba(239,68,68,0.35)"
              : "1px solid var(--border)",
          }}
          onClick={() => setKycFilter("unverified")}
        >
          <ShieldX className="w-4 h-4" />
          Unverified ({unverifiedCount})
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border mb-6 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, city, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm text-foreground placeholder-muted-foreground flex-1"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((worker, i) => (
          <motion.div
            key={worker.uid}
            className="glass rounded-2xl p-5 hover:border-[rgba(108,92,231,0.3)] border border-transparent transition-all cursor-pointer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a855f7] flex items-center justify-center text-white font-bold text-sm shrink-0">
                {worker.name ? worker.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-semibold text-sm">{worker.name || "Unnamed Worker"}</h3>
                  <KycBadge verified={worker.aadhaar_verified ?? false} />
                  <FaceBadge uid={worker.uid} verified={worker.face_verified ?? false} />
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {worker.city || "—"} · {worker.zone || "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-muted rounded-lg p-2.5">
                <p className="text-[10px] text-muted-foreground">Platform</p>
                <p className="text-xs font-medium">{worker.platform || "—"}</p>
              </div>
              <div className="bg-muted rounded-lg p-2.5">
                <p className="text-[10px] text-muted-foreground">Plan</p>
                <p className="text-xs font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3 text-primary" />
                  {worker.activePlan || "None"}
                </p>
              </div>
              <div className="bg-muted rounded-lg p-2.5">
                <p className="text-[10px] text-muted-foreground">Claims</p>
                <p className="text-xs font-medium">{worker.claimsCount ?? 0}</p>
              </div>
              <div className="bg-muted rounded-lg p-2.5">
                <p className="text-[10px] text-muted-foreground">Phone</p>
                <p className="text-xs font-medium">{worker.phone || "—"}</p>
              </div>
              <div className="bg-muted rounded-lg p-2.5">
                <p className="text-[10px] text-muted-foreground">Trust</p>
                <div className="flex items-center gap-1">
                  <Star
                    className="w-3 h-3"
                    style={{
                      color:
                        worker.trustScore >= 0.8
                          ? "#10b981"
                          : worker.trustScore >= 0.6
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color:
                        worker.trustScore >= 0.8
                          ? "#10b981"
                          : worker.trustScore >= 0.6
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  >
                    {((worker.trustScore ?? 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div
                className="col-span-2 rounded-lg p-2.5 flex items-center justify-between"
                style={{
                  background: worker.aadhaar_verified
                    ? "rgba(33,115,70,0.08)"
                    : "rgba(239,68,68,0.06)",
                  border: worker.aadhaar_verified
                    ? "1px solid rgba(33,115,70,0.2)"
                    : "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <p className="text-[10px] text-muted-foreground font-medium">KYC Status</p>
                <div className="flex items-center gap-1.5">
                  {worker.aadhaar_verified ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" style={{ color: DL_GREEN }} />
                      <span className="text-[10px] font-semibold" style={{ color: DL_GREEN }}>
                        Aadhaar Verified
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldX className="w-3.5 h-3.5 text-destructive" />
                      <span className="text-[10px] font-semibold text-destructive">
                        Not Verified
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground">
                Joined: {formatDate(worker.joinedDate)}
              </p>
              <button
                onClick={() => toast(`Viewing ${worker.name}'s profile`, { icon: "👤" })}
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
              >
                Details <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          {workers.length === 0 
            ? "No workers registered yet. They will appear here after completing onboarding."
            : "No workers match the current filters."}
        </div>
      )}
    </div>
  );
}
