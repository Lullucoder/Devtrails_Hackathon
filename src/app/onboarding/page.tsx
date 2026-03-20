"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import {
  User,
  MapPin,
  Briefcase,
  Wallet,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from "lucide-react";

const cities = ["Bengaluru", "Delhi", "Mumbai", "Hyderabad", "Chennai", "Pune"];
const platforms = ["Zepto", "Blinkit", "Instamart", "BigBasket Now", "Dunzo", "Other"];
const zones: Record<string, string[]> = {
  Bengaluru: ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Marathahalli", "Electronic City"],
  Delhi: ["Connaught Place", "Anand Vihar", "Dwarka", "Saket", "Lajpat Nagar", "Rohini"],
  Mumbai: ["Bandra West", "Andheri", "Powai", "Lower Parel", "Dadar", "Goregaon"],
  Hyderabad: ["Madhapur", "Gachibowli", "Kondapur", "Jubilee Hills", "Banjara Hills", "HiTech City"],
  Chennai: ["T. Nagar", "Anna Nagar", "Adyar", "Velachery", "Nungambakkam", "OMR"],
  Pune: ["Koregaon Park", "Viman Nagar", "Hinjewadi", "Kothrud", "Baner", "Wakad"],
};
const workingHourOptions = [
  { value: "morning", label: "Morning (6 AM – 12 PM)" },
  { value: "afternoon", label: "Afternoon (12 PM – 6 PM)" },
  { value: "evening", label: "Evening (6 PM – 12 AM)" },
  { value: "full_day", label: "Full Day (6 AM – 12 AM)" },
];
const earningRanges = ["₹3,000–₹4,500", "₹4,500–₹6,000", "₹6,000–₹8,000", "₹8,000+"];

const stepIcons = [User, Briefcase, Wallet, CheckCircle];
const stepLabels = ["Personal", "Work", "Earnings", "Payout"];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    platform: "",
    zone: "",
    workingHours: "",
    weeklyEarningRange: "",
    upiId: "",
    consent: false,
  });

  const update = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.name.length >= 2 && formData.city !== "";
      case 1: return formData.platform !== "" && formData.zone !== "" && formData.workingHours !== "";
      case 2: return formData.weeklyEarningRange !== "";
      case 3: return formData.upiId.length >= 3 && formData.consent;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(doc(db, "workers", user.uid), {
        uid: user.uid,
        phone: user.phoneNumber || "",
        name: formData.name,
        city: formData.city,
        platform: formData.platform,
        zone: formData.zone,
        workingHours: formData.workingHours,
        weeklyEarningRange: formData.weeklyEarningRange,
        upiId: formData.upiId,
        role: "worker",
        isOnboarded: true,
        trustScore: 0.5,
        createdAt: new Date().toISOString(),
      });
      toast.success("Welcome to RoziRakshak! 🎉");
      router.push("/worker/dashboard");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {stepLabels.map((label, i) => {
            const Icon = stepIcons[i];
            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      i <= currentStep
                        ? "bg-gradient-to-br from-[#6c5ce7] to-[#a855f7] text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] ${i <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
                {i < 3 && (
                  <div
                    className={`w-12 h-0.5 mb-5 rounded ${
                      i < currentStep ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="glass rounded-3xl p-8">
          <AnimatePresence mode="wait">
            {/* Step 0: Personal */}
            {currentStep === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
                  Personal Details
                </h2>
                <p className="text-sm text-muted-foreground mb-6">Tell us about yourself</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name</label>
                    <input
                      id="name-input"
                      type="text"
                      value={formData.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">City</label>
                    <div className="grid grid-cols-3 gap-2">
                      {cities.map((c) => (
                        <button
                          key={c}
                          onClick={() => { update("city", c); update("zone", ""); }}
                          className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                            formData.city === c
                              ? "bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white"
                              : "bg-muted border border-border text-foreground hover:border-primary"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1: Work */}
            {currentStep === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
                  Work Details
                </h2>
                <p className="text-sm text-muted-foreground mb-6">Tell us about your delivery work</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Platform</label>
                    <div className="grid grid-cols-3 gap-2">
                      {platforms.map((p) => (
                        <button
                          key={p}
                          onClick={() => update("platform", p)}
                          className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                            formData.platform === p
                              ? "bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white"
                              : "bg-muted border border-border text-foreground hover:border-primary"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Primary Zone
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(zones[formData.city] || []).map((z) => (
                        <button
                          key={z}
                          onClick={() => update("zone", z)}
                          className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                            formData.zone === z
                              ? "bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white"
                              : "bg-muted border border-border text-foreground hover:border-primary"
                          }`}
                        >
                          {z}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Working Hours</label>
                    <div className="grid grid-cols-2 gap-2">
                      {workingHourOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => update("workingHours", opt.value)}
                          className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                            formData.workingHours === opt.value
                              ? "bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white"
                              : "bg-muted border border-border text-foreground hover:border-primary"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Earnings */}
            {currentStep === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
                  Weekly Earnings
                </h2>
                <p className="text-sm text-muted-foreground mb-6">This helps us price your plan fairly</p>

                <div className="space-y-3">
                  {earningRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => update("weeklyEarningRange", range)}
                      className={`w-full py-4 px-5 rounded-xl text-left font-medium transition-all flex items-center justify-between ${
                        formData.weeklyEarningRange === range
                          ? "bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white"
                          : "bg-muted border border-border text-foreground hover:border-primary"
                      }`}
                    >
                      <span>{range} / week</span>
                      {formData.weeklyEarningRange === range && <CheckCircle className="w-5 h-5" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Payout */}
            {currentStep === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
                  Payout Setup
                </h2>
                <p className="text-sm text-muted-foreground mb-6">Where should we send your payouts?</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                      <Wallet className="w-4 h-4 inline mr-1" />
                      UPI ID
                    </label>
                    <input
                      id="upi-input"
                      type="text"
                      value={formData.upiId}
                      onChange={(e) => update("upiId", e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl bg-muted border border-border">
                    <input
                      type="checkbox"
                      checked={formData.consent}
                      onChange={(e) => update("consent", e.target.checked)}
                      className="mt-1 w-4 h-4 accent-[#6c5ce7]"
                    />
                    <span className="text-sm text-muted-foreground">
                      I consent to location-based verification and agree that my data will be used to
                      personalise my coverage and detect fraud.
                    </span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              className={`flex items-center gap-1 px-5 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors ${
                currentStep === 0 ? "opacity-0 pointer-events-none" : ""
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-1 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="flex items-center gap-1 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Complete Setup
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
