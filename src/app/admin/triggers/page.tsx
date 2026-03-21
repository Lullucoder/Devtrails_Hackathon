"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CloudRain,
  Thermometer,
  Wind,
  MapPin,
  Wifi,
  Activity,
  Zap,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ── Mock Data ── */

const summaryStats = [
  { label: "Triggers This Week", value: "238", trend: "+12% vs last week", icon: Activity, color: "#8b5cf6" },
  { label: "Auto-Approved", value: "189", trend: "79.4% approval rate", icon: CheckCircle, color: "#10b981" },
  { label: "Avg Confidence", value: "0.82", trend: "+0.03 improvement", icon: TrendingUp, color: "#3b82f6" },
  { label: "Active Zones", value: "14", trend: "Across 3 cities", icon: MapPin, color: "#f97316" },
];

const weeklyTrend = [
  { day: "Mon", rain: 12, heat: 5, aqi: 8, zone: 3, platform: 2 },
  { day: "Tue", rain: 8, heat: 9, aqi: 6, zone: 2, platform: 1 },
  { day: "Wed", rain: 22, heat: 7, aqi: 11, zone: 5, platform: 3 },
  { day: "Thu", rain: 15, heat: 12, aqi: 9, zone: 4, platform: 2 },
  { day: "Fri", rain: 35, heat: 6, aqi: 14, zone: 7, platform: 4 },
  { day: "Sat", rain: 18, heat: 8, aqi: 7, zone: 3, platform: 1 },
  { day: "Sun", rain: 28, heat: 4, aqi: 10, zone: 6, platform: 5 },
];

const triggerDistPie = [
  { name: "Rain", value: 138, color: "#3b82f6" },
  { name: "Heat", value: 51, color: "#f97316" },
  { name: "AQI", value: 65, color: "#8b5cf6" },
  { name: "Zone", value: 30, color: "#ef4444" },
  { name: "Platform", value: 18, color: "#06b6d4" },
];

const triggerIconMap: Record<string, React.ElementType> = {
  Rain: CloudRain,
  Heat: Thermometer,
  AQI: Wind,
  Zone: MapPin,
  Platform: Wifi,
};

const triggerColorMap: Record<string, string> = {
  Rain: "#3b82f6",
  Heat: "#f97316",
  AQI: "#8b5cf6",
  Zone: "#ef4444",
  Platform: "#06b6d4",
};

const recentTriggers = [
  { id: "te_101", time: "11:45 AM", type: "Rain", zone: "Koramangala, BLR", severity: "high", confidence: 0.94, result: "auto_approved" },
  { id: "te_102", time: "11:30 AM", type: "AQI", zone: "Anand Vihar, DEL", severity: "critical", confidence: 0.88, result: "auto_approved" },
  { id: "te_103", time: "11:12 AM", type: "Heat", zone: "CP, DEL", severity: "moderate", confidence: 0.71, result: "under_review" },
  { id: "te_104", time: "10:50 AM", type: "Platform", zone: "Indiranagar, BLR", severity: "high", confidence: 0.95, result: "auto_approved" },
  { id: "te_105", time: "10:30 AM", type: "Zone", zone: "Bandra, MUM", severity: "critical", confidence: 0.62, result: "under_review" },
  { id: "te_106", time: "10:15 AM", type: "Rain", zone: "HSR Layout, BLR", severity: "moderate", confidence: 0.85, result: "auto_approved" },
  { id: "te_107", time: "09:45 AM", type: "AQI", zone: "Dwarka, DEL", severity: "high", confidence: 0.79, result: "auto_approved" },
];

const zoneRiskData = [
  { zone: "Koramangala, BLR", triggers: 48, density: 92, topTrigger: "Rain" },
  { zone: "Anand Vihar, DEL", triggers: 38, density: 78, topTrigger: "AQI" },
  { zone: "CP, DEL", triggers: 31, density: 65, topTrigger: "Heat" },
  { zone: "Bandra, MUM", triggers: 27, density: 58, topTrigger: "Zone" },
  { zone: "Indiranagar, BLR", triggers: 22, density: 45, topTrigger: "Platform" },
];

const severityColors: Record<string, string> = {
  moderate: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

/* ── Custom Tooltips ── */

const AreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl p-3 text-xs space-y-1" style={{ border: "1px solid #2d2e3f" }}>
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
            <span className="font-bold text-foreground">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs" style={{ border: "1px solid #2d2e3f" }}>
        <span className="font-semibold">{payload[0].name}:</span> {payload[0].value} events
      </div>
    );
  }
  return null;
};

/* ── Page Component ── */

export default function TriggerAnalyticsPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <Activity className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
          Trigger <span className="gradient-text">Analytics</span>
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Real-time parametric trigger monitoring across all zones
      </p>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight mb-1">{stat.value}</h3>
                  <p className="text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.trend}</p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Weekly Trend */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card border-none shadow-lg h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Weekly Trigger Trend</CardTitle>
              <CardDescription className="text-xs">Daily trigger breakdown by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d2e3f" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8b8d9b" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8b8d9b" }} />
                    <Tooltip content={<AreaTooltip />} />
                    <Area type="monotone" dataKey="rain" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#rainGrad)" />
                    <Area type="monotone" dataKey="aqi" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#aqiGrad)" />
                    <Area type="monotone" dataKey="heat" stroke="#f97316" strokeWidth={2} fillOpacity={0} fill="transparent" />
                    <Area type="monotone" dataKey="zone" stroke="#ef4444" strokeWidth={1.5} fillOpacity={0} fill="transparent" strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="platform" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={0} fill="transparent" strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-3 justify-center">
                {triggerDistPie.map((t) => (
                  <div key={t.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card border-none shadow-lg h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Distribution</CardTitle>
              <CardDescription className="text-xs">This week&apos;s trigger mix</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={triggerDistPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {triggerDistPie.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row: Recent Events + Zone Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Live Trigger Feed */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card border-none shadow-lg">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Live Trigger Feed</CardTitle>
                <CardDescription className="text-xs">Real-time parametric events</CardDescription>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <span className="text-[10px] font-medium text-muted-foreground">LIVE</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase">Time</th>
                      <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase">Type</th>
                      <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase">Zone</th>
                      <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase">Severity</th>
                      <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase">Confidence</th>
                      <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTriggers.map((t, i) => {
                      const Icon = triggerIconMap[t.type] || Zap;
                      const color = triggerColorMap[t.type] || "#888";
                      return (
                        <motion.tr
                          key={t.id}
                          className="border-b border-border hover:bg-muted/50 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + i * 0.05 }}
                        >
                          <td className="px-3 py-3 text-xs text-muted-foreground font-mono">{t.time}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-md flex items-center justify-center"
                                style={{ backgroundColor: `${color}20` }}
                              >
                                <Icon className="w-3.5 h-3.5" style={{ color }} />
                              </div>
                              <span className="text-xs font-medium">{t.type}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-xs">{t.zone}</td>
                          <td className="px-3 py-3">
                            <span
                              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                              style={{
                                color: severityColors[t.severity] || "#888",
                                backgroundColor: `${severityColors[t.severity] || "#888"}15`,
                              }}
                            >
                              {t.severity}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${t.confidence * 100}%`,
                                    background: t.confidence >= 0.75 ? "#10b981" : t.confidence >= 0.4 ? "#f59e0b" : "#ef4444",
                                  }}
                                />
                              </div>
                              <span className="text-xs font-medium">{(t.confidence * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                t.result === "auto_approved" ? "status-approved" : "status-reviewing"
                              }`}
                            >
                              {t.result === "auto_approved" ? (
                                <><CheckCircle className="w-3 h-3" /> Approved</>
                              ) : (
                                <><Clock className="w-3 h-3" /> Review</>
                              )}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Zone Risk Table */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-card border-none shadow-lg h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Zone Risk Index</CardTitle>
              <CardDescription className="text-xs">Top risk zones by trigger density</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {zoneRiskData.map((zone, i) => {
                  const Icon = triggerIconMap[zone.topTrigger] || Zap;
                  const color = triggerColorMap[zone.topTrigger] || "#888";
                  return (
                    <motion.div
                      key={zone.zone}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.08 }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${color}15` }}
                          >
                            <Icon className="w-3.5 h-3.5" style={{ color }} />
                          </div>
                          <div>
                            <p className="text-xs font-medium">{zone.zone}</p>
                            <p className="text-[10px] text-muted-foreground">{zone.triggers} events · {zone.topTrigger}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold" style={{ color: zone.density > 75 ? "#ef4444" : zone.density > 50 ? "#f59e0b" : "#10b981" }}>
                          {zone.density}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: zone.density > 75
                              ? "linear-gradient(90deg, #ef4444, #f97316)"
                              : zone.density > 50
                              ? "linear-gradient(90deg, #f59e0b, #f97316)"
                              : "linear-gradient(90deg, #10b981, #059669)",
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${zone.density}%` }}
                          transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
