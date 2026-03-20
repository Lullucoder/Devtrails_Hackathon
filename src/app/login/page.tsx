"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Phone, KeyRound, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, userProfile, sendOTP, verifyOTP, setupRecaptcha, loading: authLoading } = useAuth();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && user) {
      if (userProfile?.isOnboarded) {
        const route = userProfile.role === "admin" ? "/admin/dashboard" : "/worker/dashboard";
        router.push(route);
      } else {
        router.push("/onboarding");
      }
    }
  }, [user, userProfile, authLoading, router]);

  useEffect(() => {
    if (step === "phone" && recaptchaRef.current) {
      setupRecaptcha("recaptcha-container");
    }
  }, [step, setupRecaptcha]);

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      await sendOTP(phone);
      setStep("otp");
      toast.success("OTP sent successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send OTP";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await verifyOTP(code);
      toast.success("Verified successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Invalid OTP";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-[#6c5ce7] rounded-full opacity-10 blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#ec4899] rounded-full opacity-10 blur-[100px]" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass rounded-3xl p-8 sm:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c5ce7] to-[#ec4899] flex items-center justify-center animate-float">
              <Shield className="w-9 h-9 text-white" />
            </div>
          </div>

          <h1
            className="text-2xl font-bold text-center mb-2"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Welcome to <span className="gradient-text">RoziRakshak</span>
          </h1>
          <p className="text-center text-muted-foreground text-sm mb-8">
            {step === "phone"
              ? "Enter your phone number to get started"
              : "Enter the 6-digit OTP sent to your phone"}
          </p>

          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted border border-border focus-within:border-primary transition-colors">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground font-medium">+91</span>
                    <input
                      id="phone-input"
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="9876543210"
                      className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  id="send-otp-btn"
                  onClick={handleSendOTP}
                  disabled={loading || phone.length < 10}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div id="recaptcha-container" ref={recaptchaRef} className="mt-4" />
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <label className="block text-sm font-medium text-muted-foreground mb-4">
                    <KeyRound className="w-4 h-4 inline mr-1" />
                    Verification Code
                  </label>
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 rounded-xl bg-muted border border-border text-center text-xl font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Sent to +91 {phone}
                  </p>
                </div>

                <button
                  id="verify-otp-btn"
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify & Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setStep("phone");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Change Phone Number
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
