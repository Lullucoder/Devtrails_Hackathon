"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Shield, FileText, AlertTriangle, CloudRain, Thermometer, Wind, MapPin, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

// Mock Data adapted for RoziRakshak but visually matching reference
const stats = [
  { label: "Total Workers", value: "39,569", trend: "+5% than last week", icon: Users },
  { label: "Active Policies", value: "78,096", trend: "+5% than last week", icon: Shield },
  { label: "Claims Processed", value: "3,50,820", trend: "+5% than last week", icon: FileText },
  { label: "Fraud Alerts", value: "4,528", trend: "-50% than last month", icon: AlertTriangle },
];

const weeklyData = [
  { day: "M", volume: 150000 },
  { day: "T", volume: 380000 },
  { day: "W", volume: 220000 },
  { day: "T", volume: 290000 },
  { day: "F", volume: 450000, isPeak: true },
  { day: "S", volume: 280000 },
  { day: "S", volume: 550000 },
];

const triggerDistribution = [
  { type: "Rain", count: 85, emoji: "🌧️" },
  { type: "Heat", count: 42, emoji: "☀️" },
  { type: "AQI", count: 65, emoji: "😷" },
  { type: "Zone", count: 28, emoji: "🚧" },
  { type: "Platform", count: 18, emoji: "📱" },
  { type: "Other", count: 12, emoji: "⚠️" },
  { type: "Traffic", count: 35, emoji: "🚗" },
];

const recentActivity = [
  { id: 1, text: "Auto-approved claim for 'Arjun K.'", time: "11:12 AM", trigger: "Rain" },
  { id: 2, text: "Fraud alert triggered for 'Suresh P.'", time: "10:45 AM", trigger: "GPS Mismatch" },
  { id: 3, text: "New policy core plan purchased", time: "09:30 AM", trigger: "Purchase" },
];

const CustomAreaTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold neon-glow">
        {payload[0].value.toLocaleString()}
      </div>
    );
  }
  return null;
};

// Customized dot for the active Reference Line
const ActiveDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (payload.isPeak) {
    return (
      <circle cx={cx} cy={cy} r={6} fill="#ec4899" stroke="#fff" strokeWidth={2} className="animate-pulse" />
    );
  }
  return null;
};

const CustomXAxisTick = ({ x, y, payload }: any) => {
  const emoji = triggerDistribution.find((d) => d.type === payload.value)?.emoji;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#8b8d9b" className="text-lg">
        {emoji}
      </text>
    </g>
  );
};

export default function AdminDashboard() {
  return (
    <div className="p-6 lg:p-8 min-h-screen bg-background text-foreground">
      {/* Search Header - matching reference UI top bar */}
      <div className="flex justify-between items-center mb-8">
        <div className="relative w-96">
          <input
            type="text"
            placeholder="Search here..."
            className="w-full bg-card border border-border rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-muted-foreground placeholder:text-muted-foreground"
          />
          <svg className="w-4 h-4 absolute left-4 top-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-muted-foreground">Eng (US)</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-card rounded-full flex items-center justify-center border border-border">
              <span className="w-2 h-2 bg-destructive rounded-full"></span>
            </div>
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" className="w-9 h-9 rounded-full border border-border" />
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight mb-1">{stat.value}</h3>
                  <p className="text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.trend}</p>
                </div>
                {/* Glowing Icon Box based on reference */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center icon-glow-box">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Weekly Trend (Area Chart) */}
        <motion.div className="lg:col-span-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card border-none shadow-lg h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold">Weekly Payout Volume</CardTitle>
                <CardDescription className="text-xs">Visualize claim consumption trend</CardDescription>
              </div>
              <select className="bg-background border border-border text-xs rounded-md px-2 py-1 text-muted-foreground">
                <option>Last month</option>
                <option>This week</option>
              </select>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d2e3f" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8b8d9b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8b8d9b' }} tickFormatter={(val) => `${val / 1000}k`} />
                    <Tooltip content={<CustomAreaTooltip />} cursor={{ stroke: 'transparent' }} />
                    <ReferenceLine x="F" stroke="#8b5cf6" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="volume" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" activeDot={<ActiveDot />} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trigger Distribution (Bar Chart) */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card border-none shadow-lg h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Trigger Distribution</CardTitle>
              <CardDescription className="text-xs">Understand external failure causes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={triggerDistribution} margin={{ top: 0, right: 0, left: 0, bottom: 20 }} barSize={16}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c77dff" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d2e3f" />
                    <XAxis dataKey="type" axisLine={false} tickLine={false} tick={<CustomXAxisTick />} />
                    <Tooltip cursor={{ fill: '#2d2e3f', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1c1d29', borderColor: '#2d2e3f', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 8, 8]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Zones Data Map visual equivalent */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-card border-none shadow-lg h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Top Risk Zones Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { zone: "Koramangala, BLR", count: 3860, icon: CloudRain, color: "text-blue-400", bg: "bg-blue-400/10" },
                  { zone: "Connaught Place, DEL", count: 2150, icon: Thermometer, color: "text-orange-400", bg: "bg-orange-400/10" },
                  { zone: "Anand Vihar, DEL", count: 1180, icon: Wind, color: "text-purple-400", bg: "bg-purple-400/10" },
                  { zone: "Andheri, MUM", count: 980, icon: MapPin, color: "text-red-400", bg: "bg-red-400/10" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg}`}>
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <span className="text-sm font-medium">{item.zone}</span>
                    </div>
                    <span className="text-sm font-bold">{item.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Log */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="bg-card border-none shadow-lg h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Recent Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start justify-between relative pl-4 border-l-2 border-border">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-primary border-4 border-card"></div>
                    <div className="flex items-start gap-4">
                      <img src={`https://i.pravatar.cc/150?u=${activity.id}`} alt="User" className="w-8 h-8 rounded-full border border-border" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{activity.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">System Event · {activity.trigger}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
