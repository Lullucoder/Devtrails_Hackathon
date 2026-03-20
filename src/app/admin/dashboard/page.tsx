"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  IndianRupee,
  Shield,
  TrendingUp,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const stats = [
  { label: "Active Workers", value: "1,247", icon: Users, color: "#6c5ce7", change: "+12%" },
  { label: "Active Policies", value: "892", icon: Shield, color: "#a855f7", change: "+8%" },
  { label: "Claims This Week", value: "156", icon: FileText, color: "#3b82f6", change: "+23%" },
  { label: "Payout Volume", value: "₹89,400", icon: IndianRupee, color: "#10b981", change: "+15%" },
];

const claimsByTrigger = [
  { type: "Rain", count: 52, color: "#3b82f6" },
  { type: "Heat", count: 38, color: "#f97316" },
  { type: "AQI", count: 31, color: "#8b5cf6" },
  { type: "Zone", count: 19, color: "#ef4444" },
  { type: "Platform", count: 16, color: "#06b6d4" },
];

const weeklyTrends = [
  { week: "W1", claims: 89, payouts: 45200, lossRatio: 0.62 },
  { week: "W2", claims: 112, payouts: 58900, lossRatio: 0.68 },
  { week: "W3", claims: 98, payouts: 51300, lossRatio: 0.59 },
  { week: "W4", claims: 134, payouts: 72100, lossRatio: 0.71 },
  { week: "W5", claims: 156, payouts: 89400, lossRatio: 0.74 },
  { week: "W6", claims: 143, payouts: 78600, lossRatio: 0.67 },
];

const cityStats = [
  { city: "Bengaluru", workers: 412, risk: 72 },
  { city: "Delhi", workers: 356, risk: 85 },
  { city: "Mumbai", workers: 289, risk: 78 },
  { city: "Hyderabad", workers: 124, risk: 55 },
  { city: "Chennai", workers: 42, risk: 61 },
  { city: "Pune", workers: 24, risk: 48 },
];

const COLORS = ["#3b82f6", "#f97316", "#8b5cf6", "#ef4444", "#06b6d4"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 text-xs">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((item, index) => (
          <p key={index} className="text-muted-foreground">
            {item.name}: <span className="text-foreground font-medium">{item.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
          Admin <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-sm text-muted-foreground">Portfolio overview and risk intelligence</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="glass rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <span className="text-xs font-semibold text-accent flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Claims by Trigger */}
        <motion.div
          className="glass rounded-2xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold mb-4">Claims by Trigger Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={claimsByTrigger}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis dataKey="type" stroke="#888899" fontSize={12} />
              <YAxis stroke="#888899" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {claimsByTrigger.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly Trends */}
        <motion.div
          className="glass rounded-2xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="text-sm font-semibold mb-4">Weekly Claims & Loss Ratio</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis dataKey="week" stroke="#888899" fontSize={12} />
              <YAxis yAxisId="left" stroke="#888899" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#888899" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line yAxisId="left" type="monotone" dataKey="claims" stroke="#6c5ce7" strokeWidth={2} dot={{ fill: "#6c5ce7", r: 4 }} name="Claims" />
              <Line yAxisId="right" type="monotone" dataKey="lossRatio" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 4 }} name="Loss Ratio" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trigger Distribution */}
        <motion.div
          className="glass rounded-2xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold mb-4">Trigger Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={claimsByTrigger}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="count"
                nameKey="type"
              >
                {claimsByTrigger.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {claimsByTrigger.map((item) => (
              <div key={item.type} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.type}
              </div>
            ))}
          </div>
        </motion.div>

        {/* City Risk */}
        <motion.div
          className="glass rounded-2xl p-5 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            City Risk Overview
          </h3>
          <div className="space-y-3">
            {cityStats.map((city) => (
              <div key={city.city} className="flex items-center gap-3">
                <span className="text-sm font-medium w-24">{city.city}</span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${city.risk}%`,
                      background: city.risk > 75
                        ? "linear-gradient(90deg, #ef4444, #f97316)"
                        : city.risk > 55
                        ? "linear-gradient(90deg, #f59e0b, #f97316)"
                        : "linear-gradient(90deg, #10b981, #059669)",
                    }}
                  />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground w-32 justify-end">
                  <span>{city.workers} workers</span>
                  <span
                    className={`font-semibold ${
                      city.risk > 75
                        ? "text-destructive"
                        : city.risk > 55
                        ? "text-warning"
                        : "text-accent"
                    }`}
                  >
                    {city.risk}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* AI Forecast */}
          <div className="mt-6 p-4 rounded-xl bg-[rgba(108,92,231,0.1)] border border-[rgba(108,92,231,0.2)]">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm font-semibold">AI Forecast — Next Week</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Predicted claims surge in <strong className="text-foreground">Delhi</strong> (+32%) due to
              forecasted heat wave. Recommend increasing risk pool allocation for Delhi zones by 15%.
              Expected payout volume: <strong className="text-foreground">₹1,12,000</strong>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
