"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationBell() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "claims"),
      where("workerId", "==", user.uid),
      limit(10)
    );
    return onSnapshot(q, (snap) => {
      setClaims(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  const unseen = claims.filter(c => !seen.has(c.id));

  const getNotifText = (claim: any) => {
    const labels: Record<string, string> = {
      auto_approved: "Claim approved automatically",
      paid: `₹${claim.payoutAmount} credited to your UPI`,
      pending_fraud_check: "Claim filed — verifying now",
      soft_review: "Claim under soft review",
      held: "Claim needs additional verification",
      payout_initiated: "Payout has been initiated",
    };
    return labels[claim.status] ?? "Claim status updated";
  };

  const triggerLabel: Record<string, string> = {
    heavy_rain: "Heavy Rain",
    extreme_heat: "Extreme Heat",
    hazardous_aqi: "Hazardous AQI",
    zone_closure: "Zone Closure",
    platform_outage: "Platform Outage",
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          setSeen(new Set(claims.map(c => c.id)));
        }}
        className="relative w-10 h-10 rounded-xl glass flex items-center justify-center"
        style={{ minHeight: "44px", minWidth: "44px" }}
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unseen.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
            {unseen.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-72 glass rounded-2xl overflow-hidden z-50"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="p-3 border-b border-border">
              <p className="text-xs font-semibold">Claim Notifications</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {claims.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                claims.map(claim => (
                  <div
                    key={claim.id}
                    className="p-3 border-b border-border/50 last:border-0"
                  >
                    <p className="text-xs font-medium">
                      {triggerLabel[claim.triggerType] ?? claim.triggerType}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {getNotifText(claim)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}