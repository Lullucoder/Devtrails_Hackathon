"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Shield, Zap, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const plans = [
  {
    id: "lite",
    name: "Lite",
    priceRange: "₹19–₹29",
    price: 24,
    protection: 800,
    ideal: "Part-time riders",
    features: ["All 5 triggers", "Up to ₹800/week", "Standard payout speed", "Basic trust rewards"],
  },
  {
    id: "core",
    name: "Core",
    priceRange: "₹29–₹49",
    price: 39,
    protection: 1500,
    ideal: "Regular riders",
    popular: true,
    features: ["All 5 triggers", "Up to ₹1,500/week", "Instant payout", "Trust discount eligible", "Priority support"],
  },
  {
    id: "peak",
    name: "Peak",
    priceRange: "₹49–₹79",
    price: 64,
    protection: 2500,
    ideal: "Full-time riders",
    features: ["All 5 triggers", "Up to ₹2,500/week", "Instant payout", "Maximum trust rewards", "Priority support", "Multi-zone cover"],
  },
];

export default function PolicyPage() {
  const [activePlan] = useState("core");
  const [buying, setBuying] = useState<string | null>(null);

  const handleBuy = (planId: string) => {
    setBuying(planId);
    setTimeout(() => {
      setBuying(null);
      toast.success(`${planId.charAt(0).toUpperCase() + planId.slice(1)} plan activated for this week! 🎉`);
    }, 1500);
  };

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
        Weekly Plans
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Choose your income protection level</p>

      {/* Current Plan */}
      <div className="glass rounded-2xl p-4 mb-6 flex items-center gap-3 border border-[rgba(108,92,231,0.3)]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6c5ce7] to-[#a855f7] flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold">
            Current: <span className="gradient-text">Core Plan</span>
          </p>
          <p className="text-xs text-muted-foreground">Active until 23 Mar 2026</p>
        </div>
      </div>

      {/* Plans */}
      <div className="space-y-4">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            className={`glass rounded-2xl p-5 relative ${
              plan.popular ? "gradient-border" : ""
            } ${activePlan === plan.id ? "ring-1 ring-primary" : ""}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {plan.popular && (
              <div className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-[10px] font-bold text-white">
                POPULAR
              </div>
            )}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                  {plan.name}
                </h3>
                <p className="text-xs text-muted-foreground">{plan.ideal}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold gradient-text">{plan.priceRange}</p>
                <p className="text-[10px] text-muted-foreground">/week</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-secondary-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleBuy(plan.id)}
              disabled={buying !== null}
              className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                activePlan === plan.id
                  ? "bg-muted border border-border text-muted-foreground cursor-default"
                  : "bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white hover:opacity-90"
              }`}
            >
              {buying === plan.id ? (
                <>
                  <Zap className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : activePlan === plan.id ? (
                "Current Plan"
              ) : (
                <>
                  Get {plan.name}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
