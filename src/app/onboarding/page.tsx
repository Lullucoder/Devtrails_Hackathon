"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { updateWorker } from "@/lib/firestore";
import {
  Shield,
  User,
  MapPin,
  Briefcase,
  Clock,
  Wallet,
  Loader2,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userProfile, role, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    platform: "",
    zone: "",
    workingHours: "",
    weeklyEarningRange: "",
    upiId: "",
  });

  // Guard checks
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (role === "admin") {
      router.replace("/admin/dashboard");
      return;
    }

    if (userProfile?.isOnboarded) {
      router.replace("/worker/dashboard");
      return;
    }
  }, [user, userProfile, role, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfile?.id) {
      toast.error("Profile not found");
      return;
    }

    // Validate all fields
    if (
      !formData.name ||
      !formData.city ||
      !formData.platform ||
      !formData.zone ||
      !formData.workingHours ||
      !formData.weeklyEarningRange ||
      !formData.upiId
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);

    try {
      await updateWorker(userProfile.id, {
        ...formData,
        isOnboarded: true,
      });

      toast.success("Profile completed!");
      router.push("/worker/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Failed to complete onboarding");
      setSubmitting(false);
    }
  };

  // Show spinner while loading or redirecting
  if (loading || !user || role === "admin" || userProfile?.isOnboarded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c5ce7] to-[#ec4899] flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Complete Your Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Help us personalize your insurance coverage
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="glass rounded-xl p-4">
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter your full name"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* City */}
          <div className="glass rounded-xl p-4">
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              placeholder="e.g., Bengaluru, Delhi"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Platform */}
          <div className="glass rounded-xl p-4">
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              Platform
            </label>
            <select
              value={formData.platform}
              onChange={(e) =>
                setFormData({ ...formData, platform: e.target.value })
              }
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select platform</option>
              <option value="Zepto">Zepto</option>
              <option value="Blinkit">Blinkit</option>
              <option value="Swiggy Instamart">Swiggy Instamart</option>
              <option value="Dunzo">Dunzo</option>
              <option value="BigBasket">BigBasket</option>
            </select>
          </div>

          {/* Zone */}
          <div className="glass rounded-xl p-4">
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Working Zone
            </label>
            <input
              type="text"
              value={formData.zone}
              onChange={(e) =>
                setFormData({ ...formData, zone: e.target.value })
              }
              placeholder="e.g., Koramangala, Indiranagar"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Working Hours */}
          <div className="glass rounded-xl p-4">
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Working Hours
            </label>
            <select
              value={formData.workingHours}
              onChange={(e) =>
                setFormData({ ...formData, workingHours: e.target.value })
              }
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select shift</option>
              <option value="morning">Morning (6 AM - 12 PM)</option>
              <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
              <option value="evening">Evening (6 PM - 12 AM)</option>
              <option value="full_day">Full Day (6 AM - 12 AM)</option>
            </select>
          </div>

          {/* Weekly Earning Range */}
          <div className="glass rounded-xl p-4">
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              Weekly Income Slab
            </label>
            <select
              value={formData.weeklyEarningRange}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  weeklyEarningRange: e.target.value,
                })
              }
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select income range</option>
              <option value="₹3,000–₹5,000">₹3,000–₹5,000</option>
              <option value="₹5,000–₹7,000">₹5,000–₹7,000</option>
              <option value="₹7,000–₹10,000">₹7,000–₹10,000</option>
              <option value="₹10,000+">₹10,000+</option>
            </select>
          </div>

          {/* UPI ID */}
          <div className="glass rounded-xl p-4">
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              UPI ID
            </label>
            <input
              type="text"
              value={formData.upiId}
              onChange={(e) =>
                setFormData({ ...formData, upiId: e.target.value })
              }
              placeholder="yourname@upi"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                Complete Profile
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
