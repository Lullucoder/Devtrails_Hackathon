"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type ConfirmationResult } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { sendOTP } from "@/lib/auth";
import { useRecaptcha } from "@/lib/hooks/useRecaptcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { user, role, loading, verifyOtp } = useAuth();
  const { recaptchaRef, verifier, resetVerifier } = useRecaptcha();

  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState<"worker" | "admin">("worker");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpRequestedFor, setOtpRequestedFor] = useState<string | null>(null);

  const phoneDisplay = useMemo(() => {
    if (!otpRequestedFor) {
      return "";
    }

    const cleaned = otpRequestedFor.trim();
    if (cleaned.length <= 4) {
      return cleaned;
    }

    return `${"*".repeat(Math.max(0, cleaned.length - 4))}${cleaned.slice(-4)}`;
  }, [otpRequestedFor]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (role === "admin") {
      router.replace("/admin/dashboard");
      return;
    }

    if (role === "worker") {
      router.replace("/worker/dashboard");
      return;
    }

    // Authenticated but role/profile not resolved yet → continue onboarding.
    router.replace("/onboarding");
  }, [router, user, role]);

  const handleSendOtp = async (event: FormEvent) => {
    event.preventDefault();

    if (!phone.trim()) {
      toast.error("Enter phone number first");
      return;
    }

    if (!verifier) {
      toast.error("reCAPTCHA not ready. Please wait a moment.");
      return;
    }

    try {
      const result = await sendOTP(phone, verifier);
      setConfirmationResult(result);
      setOtp("");
      setOtpRequestedFor(phone);
      toast.success("OTP sent!");
    } catch (error) {
      resetVerifier();
      toast.error(error instanceof Error ? error.message : "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (event: FormEvent) => {
    event.preventDefault();

    if (!otp.trim()) {
      toast.error("Enter OTP");
      return;
    }

    if (!confirmationResult) {
      toast.error("Please request an OTP first.");
      return;
    }

    try {
      await verifyOtp(confirmationResult, otp, selectedRole);
      toast.success("Login successful");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to verify OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(108,92,231,0.25),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.18),_transparent_45%),#14141e] px-4">
      <Card className="w-full max-w-md border-border/70 bg-card/90 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Phone Login</CardTitle>
          <CardDescription>
            Enter your phone number to receive a one-time password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="space-y-4" onSubmit={handleSendOtp}>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                inputMode="numeric"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={selectedRole === "worker" ? "default" : "outline"}
                  onClick={() => setSelectedRole("worker")}
                  disabled={loading}
                >
                  Worker
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === "admin" ? "default" : "outline"}
                  onClick={() => setSelectedRole("admin")}
                  disabled={loading}
                >
                  Admin
                </Button>
              </div>
            </div>

            {/* Invisible reCAPTCHA container */}
            <div ref={recaptchaRef} />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>

          <form className="space-y-3" onSubmit={handleVerifyOtp}>
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                maxLength={6}
                inputMode="numeric"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                disabled={loading || !confirmationResult}
              />
            </div>

            {otpRequestedFor ? (
              <p className="text-xs text-muted-foreground">OTP sent to {phoneDisplay}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Request OTP first</p>
            )}

            <Button type="submit" className="w-full" disabled={loading || !confirmationResult}>
              {loading ? "Verifying..." : "Verify OTP & Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
