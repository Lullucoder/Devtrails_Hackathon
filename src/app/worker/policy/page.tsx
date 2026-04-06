"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createPolicy, getActivePolicyByWorker } from "@/lib/firestore";
import { doc, serverTimestamp } from "firebase/firestore";
import { Loader2, Sparkles, CheckCircle, Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function PolicyPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [activePolicy, setActivePolicy] = useState(null);
  const [checkingPolicy, setCheckingPolicy] = useState(true);
  const [premiumData, setPremiumData] = useState(null);
  const [premiumLoading, setPremiumLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getActivePolicyByWorker(user.uid)
      .then(setActivePolicy)
      .catch(console.error)
      .finally(() => setCheckingPolicy(false));
  }, [user]);

  useEffect(() => {
    if (!userProfile) {
      setPremiumLoading(false);
      return;
    }
    fetch("/api/claims/premium-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: userProfile.city ?? "Bengaluru",
        zone: userProfile.zone ?? "Koramangala",
        shiftStartTime: userProfile.workingHours ?? "9 AM",
        shiftDuration: "8",
        weeklyEarningRange: userProfile.weeklyEarningRange ?? "₹5,000–₹7,000",
        trustScore: userProfile.trustScore ?? 0.8,
      })
    })
    .then(r => r.json())
    .then(setPremiumData)
    .catch(console.error)
    .finally(() => setPremiumLoading(false));
  }, [userProfile]);

  const handleBuy = async (plan: "Lite" | "Standard" | "Premium") => {
    if (!user || !userProfile) {
      toast.error("Please log in first");
      return;
    }
    if (!userProfile.upiId) {
      toast.error("Please add your UPI ID in your profile first");
      return;
    }
    if (activePolicy) {
      toast.error("You already have an active policy this week");
      return;
    }
 
    setBuying(plan);
    try {
      const planValues = {
        Lite:     { premiumInr: premiumData?.premium_inr ? premiumData.premium_inr - 20 : 19, maxWeeklyProtectionInr: 800 },
        Standard: { premiumInr: premiumData?.premium_inr ?? 39, maxWeeklyProtectionInr: 1500 },
        Premium:  { premiumInr: premiumData?.premium_inr ? premiumData.premium_inr + 30 : 79, maxWeeklyProtectionInr: 2500 },
      };
         
      const values = planValues[plan];
      const coverageEnd = new Date();
      coverageEnd.setDate(coverageEnd.getDate() + 7);
 
      await createPolicy({
        workerId: user.uid,
        workerName: userProfile.name ?? "Worker",
        plan,
        premiumInr: values.premiumInr,
        maxWeeklyProtectionInr: values.maxWeeklyProtectionInr,
        coverageStart: new Date().toISOString(),
        coverageEnd: coverageEnd.toISOString(),
        status: "active",
        zone: userProfile.zone ?? "",
        city: userProfile.city ?? "",
        triggersWatched: [
          "heavy_rain","extreme_heat","hazardous_aqi",
          "zone_closure","platform_outage"
        ],
        premiumBreakdown: premiumData?.breakdown ?? null,
        aiPriced: premiumData?.model_used === "xgboost",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
 
      toast.success(`${plan} plan activated! You are protected this week.`);
      router.push("/worker/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to activate policy. Please try again.");
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
        Weekly Plans
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Choose your income protection level</p>

      {checkingPolicy ? (
        <div className="glass rounded-2xl p-5 mb-6 animate-pulse h-20" />
      ) : activePolicy ? (
        <div className="glass rounded-2xl p-5 mb-6 border border-green-500/30">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-bold text-sm">Active Policy</p>
              <p className="text-xs text-muted-foreground">
                {activePolicy.plan} Plan — valid until{" "}
                {new Date(activePolicy.coverageEnd).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Max protection</span>
            <span className="font-bold text-accent">
              ₹{activePolicy.maxWeeklyProtectionInr?.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Premium paid</span>
            <span className="font-semibold">₹{activePolicy.premiumInr}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            You can renew your policy after it expires
          </p>
        </div>
      ) : (
        <>
          {premiumLoading ? (
            <div className="glass rounded-2xl p-4 mb-5 animate-pulse h-20" />
          ) : premiumData ? (
            <div className="glass rounded-2xl p-4 mb-5"
              style={{ border: "1px solid rgba(139,92,246,0.3)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  AI-Powered Pricing for You
                </span>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {premiumData.model_used === "xgboost"
                     ? "XGBoost model" : "Standard pricing"}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  premiumData.risk_tier === "Low"
                     ? "bg-green-500/10 text-green-600"
                    : premiumData.risk_tier === "High"
                    ? "bg-red-500/10 text-red-600"
                      : "bg-amber-500/10 text-amber-600"
                }`}>
                  {premiumData.risk_tier} Risk Zone
                </span>
              </div>
              <div className="space-y-1">
                {premiumData.top_reasons?.map((reason: string, i: number) => (
                  <p key={i} className="text-[11px] text-muted-foreground">
                    • {reason}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          {[
            {
             plan: "Lite" as const,
             price: premiumData?.premium_inr
               ? premiumData.premium_inr - 20 : 19,
            protection: 800,
            ideal: "Part-time riders",
            features: ["Rain & heat coverage","Basic fraud protection","Email support"]
          },
          {
             plan: "Standard" as const,
            price: premiumData?.premium_inr ?? 39,
            protection: 1500,
            ideal: "Regular riders",
            recommended: true,
            features: ["All 5 trigger types","AI fraud detection","Priority support","Instant payout"]
          },
          {
             plan: "Premium" as const,
            price: premiumData?.premium_inr
               ? premiumData.premium_inr + 30 : 79,
            protection: 2500,
            ideal: "Full-time riders",
            features: ["All 5 trigger types","Advanced fraud AI","24/7 support","Instant payout","Trust score boost"]
          },
        ].map((item) => (
          <div
            key={item.plan}
            className="glass rounded-2xl p-5 mb-4"
            style={item.recommended ? {
               border: "2px solid rgba(139,92,246,0.6)"
             } : {}}
          >
            {item.recommended && (
              <div className="flex items-center gap-1 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-primary">
                  Recommended by AI
                </span>
              </div>
            )}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-base">{item.plan} Plan</p>
                <p className="text-xs text-muted-foreground">{item.ideal}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">₹{item.price}</p>
                <p className="text-[10px] text-muted-foreground">per week</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4 py-2 px-3 rounded-xl bg-muted/40">
              <span className="text-xs text-muted-foreground">Max protection</span>
              <span className="text-sm font-bold text-accent">
                ₹{item.protection.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="space-y-1.5 mb-4">
              {item.features.map(f => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleBuy(item.plan)}
              disabled={buying !== null}
              style={{
                 minHeight: "48px",
                background: item.recommended
                   ? "linear-gradient(135deg, #6c5ce7, #a855f7)"
                  : undefined
              }}
              className={`w-full rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 ${
                item.recommended
                  ? "text-white hover:opacity-90"
                  : "border border-border text-foreground hover:bg-muted"
              }`}
            >
              {buying === item.plan ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Activating...
                </>
              ) : (
                `Activate ${item.plan} — ₹${item.price}/week`
              )}
            </button>
          </div>
        ))}
        </>
      )}
    </div>
  );
}
