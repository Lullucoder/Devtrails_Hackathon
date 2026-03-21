"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CloudRain,
  Thermometer,
  Wind,
  MapPin,
  Wifi,
  Sliders,
  Shield,
  AlertTriangle,
  Bell,
  Save,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import toast from "react-hot-toast";

/* ── Toggle Switch Component ── */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? "bg-primary" : "bg-muted border border-border"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

/* ── Threshold Input Component ── */
function ThresholdInput({
  icon: Icon,
  label,
  unit,
  value,
  onChange,
  color,
  description,
}: {
  icon: React.ElementType;
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 px-3 py-2 rounded-lg bg-muted border border-border text-sm text-center font-mono font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
        />
        <span className="text-xs text-muted-foreground font-medium w-12">{unit}</span>
      </div>
    </div>
  );
}

/* ── Page Component ── */

export default function SettingsPage() {
  // Trigger Thresholds
  const [rainfall, setRainfall] = useState(35);
  const [heatIndex, setHeatIndex] = useState(42);
  const [aqi, setAqi] = useState(300);
  const [zoneClosure, setZoneClosure] = useState(3);
  const [platformOutage, setPlatformOutage] = useState(30);

  // Claim Processing
  const [autoApproveThreshold, setAutoApproveThreshold] = useState(75);
  const [maxClaimsPerWeek, setMaxClaimsPerWeek] = useState(3);

  // Payout Limits
  const [liteCap, setLiteCap] = useState(800);
  const [coreCap, setCoreCap] = useState(1500);
  const [peakCap, setPeakCap] = useState(2500);

  // Fraud Detection
  const [gpsSpoofing, setGpsSpoofing] = useState(true);
  const [emulatorDetection, setEmulatorDetection] = useState(true);
  const [speedThreshold, setSpeedThreshold] = useState(80);
  const [densityRatio, setDensityRatio] = useState(10);

  // System Preferences
  const [pushNotifications, setPushNotifications] = useState(true);
  const [autoRenewalReminders, setAutoRenewalReminders] = useState(true);
  const [weeklyReportEmails, setWeeklyReportEmails] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      toast.success("Settings saved successfully! ✅");
      setTimeout(() => setSaved(false), 2000);
    }, 1200);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Sliders className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
              Settings & <span className="gradient-text">Limits</span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure trigger thresholds, claim rules, and payout limits
          </p>
        </div>
        <motion.button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          whileTap={{ scale: 0.97 }}
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : saved ? (
            <><CheckCircle className="w-4 h-4" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4" />Save Changes</>
          )}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Section 1: Trigger Thresholds ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                Trigger Thresholds
              </CardTitle>
              <CardDescription className="text-xs">
                Set activation thresholds for each parametric trigger
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ThresholdInput
                icon={CloudRain} label="Heavy Rainfall" unit="mm/hr"
                value={rainfall} onChange={setRainfall} color="#3b82f6"
                description="Rainfall intensity that activates the rain trigger"
              />
              <ThresholdInput
                icon={Thermometer} label="Heat Index" unit="°C"
                value={heatIndex} onChange={setHeatIndex} color="#f97316"
                description="Heat stress threshold for outdoor work safety"
              />
              <ThresholdInput
                icon={Wind} label="Hazardous AQI" unit="AQI"
                value={aqi} onChange={setAqi} color="#8b5cf6"
                description="Air quality index threshold for zone hazard"
              />
              <ThresholdInput
                icon={MapPin} label="Zone Closure" unit="reports"
                value={zoneClosure} onChange={setZoneClosure} color="#ef4444"
                description="Min closure reports to trigger zone restriction"
              />
              <ThresholdInput
                icon={Wifi} label="Platform Outage" unit="min"
                value={platformOutage} onChange={setPlatformOutage} color="#06b6d4"
                description="Minimum outage duration to activate trigger"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Section 2: Claim Processing Rules ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-card border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Claim Processing Rules
              </CardTitle>
              <CardDescription className="text-xs">
                Configure auto-approval thresholds and claim limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Auto-approve slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto-Approve Threshold</span>
                  <span className="text-sm font-bold text-primary font-mono">{autoApproveThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  value={autoApproveThreshold}
                  onChange={(e) => setAutoApproveThreshold(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>50% (lenient)</span>
                  <span>95% (strict)</span>
                </div>
              </div>

              {/* Confidence bands visual */}
              <div className="p-4 rounded-xl bg-background border border-border space-y-2.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confidence Bands</p>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10b981]" />
                  <span className="text-xs">Auto-Approve</span>
                  <span className="text-xs text-muted-foreground ml-auto">≥ {autoApproveThreshold}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                  <span className="text-xs">Soft Review</span>
                  <span className="text-xs text-muted-foreground ml-auto">40% – {autoApproveThreshold - 1}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <span className="text-xs">Hold for Investigation</span>
                  <span className="text-xs text-muted-foreground ml-auto">&lt; 40%</span>
                </div>
              </div>

              {/* Max claims per week */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                <div>
                  <p className="text-sm font-medium">Max Claims / Worker / Week</p>
                  <p className="text-[10px] text-muted-foreground">Prevent excessive claim frequency</p>
                </div>
                <input
                  type="number"
                  value={maxClaimsPerWeek}
                  onChange={(e) => setMaxClaimsPerWeek(Number(e.target.value))}
                  className="w-16 px-3 py-2 rounded-lg bg-muted border border-border text-sm text-center font-mono font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Section 3: Payout Limits ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                💰 Payout Limits
              </CardTitle>
              <CardDescription className="text-xs">
                Weekly payout caps per plan tier (₹)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Lite Plan", value: liteCap, onChange: setLiteCap, desc: "Part-time riders" },
                { label: "Core Plan", value: coreCap, onChange: setCoreCap, desc: "Regular riders" },
                { label: "Peak Plan", value: peakCap, onChange: setPeakCap, desc: "Full-time riders" },
              ].map((plan) => (
                <div key={plan.label} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                  <div>
                    <p className="text-sm font-medium">{plan.label}</p>
                    <p className="text-[10px] text-muted-foreground">{plan.desc}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">₹</span>
                    <input
                      type="number"
                      value={plan.value}
                      onChange={(e) => plan.onChange(Number(e.target.value))}
                      className="w-20 px-3 py-2 rounded-lg bg-muted border border-border text-sm text-center font-mono font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Section 4: Fraud Detection ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-destructive" />
                Fraud Detection
              </CardTitle>
              <CardDescription className="text-xs">
                Anti-spoofing and anomaly detection controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 p-4 rounded-xl bg-background border border-border">
                <Toggle checked={gpsSpoofing} onChange={setGpsSpoofing} label="GPS Spoofing Detection" />
                <Toggle checked={emulatorDetection} onChange={setEmulatorDetection} label="Emulator Detection" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                <div>
                  <p className="text-sm font-medium">Speed Threshold</p>
                  <p className="text-[10px] text-muted-foreground">Flag movement above this speed</p>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={speedThreshold}
                    onChange={(e) => setSpeedThreshold(Number(e.target.value))}
                    className="w-16 px-3 py-2 rounded-lg bg-muted border border-border text-sm text-center font-mono font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <span className="text-xs text-muted-foreground">km/h</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                <div>
                  <p className="text-sm font-medium">Max Density Ratio</p>
                  <p className="text-[10px] text-muted-foreground">Flag zone if claimants exceed normal × ratio</p>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={densityRatio}
                    onChange={(e) => setDensityRatio(Number(e.target.value))}
                    className="w-16 px-3 py-2 rounded-lg bg-muted border border-border text-sm text-center font-mono font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <span className="text-xs text-muted-foreground">×</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Section 5: System Preferences ── */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                System Preferences
              </CardTitle>
              <CardDescription className="text-xs">
                Notification and system-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-background border border-border space-y-4">
                  <Toggle checked={pushNotifications} onChange={setPushNotifications} label="Push Notifications" />
                  <Toggle checked={autoRenewalReminders} onChange={setAutoRenewalReminders} label="Auto-Renewal Reminders" />
                </div>
                <div className="p-4 rounded-xl bg-background border border-border space-y-4">
                  <Toggle checked={weeklyReportEmails} onChange={setWeeklyReportEmails} label="Weekly Report Emails" />
                  <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} label="Maintenance Mode" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
