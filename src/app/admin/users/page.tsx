"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Star, Shield, ChevronRight } from "lucide-react";

const workers = [
  {
    uid: "w_001", name: "Arjun K.", city: "Bengaluru", zone: "Koramangala",
    platform: "Zepto", trustScore: 0.91, plan: "Core", claims: 3, joined: "15 Jan 2026",
  },
  {
    uid: "w_002", name: "Priya S.", city: "Delhi", zone: "Connaught Place",
    platform: "Blinkit", trustScore: 0.85, plan: "Peak", claims: 2, joined: "01 Feb 2026",
  },
  {
    uid: "w_003", name: "Rahul M.", city: "Delhi", zone: "Anand Vihar",
    platform: "Instamart", trustScore: 0.72, plan: "Core", claims: 5, joined: "20 Jan 2026",
  },
  {
    uid: "w_004", name: "Deepak V.", city: "Bengaluru", zone: "Indiranagar",
    platform: "BigBasket Now", trustScore: 0.88, plan: "Lite", claims: 1, joined: "10 Feb 2026",
  },
  {
    uid: "w_005", name: "Suresh P.", city: "Bengaluru", zone: "HSR Layout",
    platform: "Zepto", trustScore: 0.45, plan: "Core", claims: 7, joined: "25 Jan 2026",
  },
  {
    uid: "w_006", name: "Meena R.", city: "Mumbai", zone: "Bandra West",
    platform: "Blinkit", trustScore: 0.93, plan: "Peak", claims: 1, joined: "05 Feb 2026",
  },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");

  const filtered = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
        Worker <span className="gradient-text">Management</span>
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        View and manage registered delivery partners
      </p>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border mb-6 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm text-foreground placeholder-muted-foreground flex-1"
        />
      </div>

      {/* Workers Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((worker, i) => (
          <motion.div
            key={worker.uid}
            className="glass rounded-2xl p-5 hover:border-[rgba(108,92,231,0.3)] border border-transparent transition-all cursor-pointer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a855f7] flex items-center justify-center text-white font-bold text-sm">
                {worker.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{worker.name}</h3>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {worker.city} · {worker.zone}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-muted rounded-lg p-2.5">
                <p className="text-[10px] text-muted-foreground">Platform</p>
                <p className="text-xs font-medium">{worker.platform}</p>
              </div>
              <div className="bg-muted rounded-lg p-2.5">
                <p className="text-[10px] text-muted-foreground">Plan</p>
                <p className="text-xs font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3 text-primary" />
                  {worker.plan}
                </p>
              </div>
              <div className="bg-muted rounded-lg p-2.5">
                <p className="text-[10px] text-muted-foreground">Claims</p>
                <p className="text-xs font-medium">{worker.claims}</p>
              </div>
              <div className="bg-muted rounded-lg p-2.5">
                <p className="text-[10px] text-muted-foreground">Trust</p>
                <div className="flex items-center gap-1">
                  <Star
                    className="w-3 h-3"
                    style={{
                      color:
                        worker.trustScore >= 0.8
                          ? "#10b981"
                          : worker.trustScore >= 0.6
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color:
                        worker.trustScore >= 0.8
                          ? "#10b981"
                          : worker.trustScore >= 0.6
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  >
                    {(worker.trustScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground">Joined: {worker.joined}</p>
              <button className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                Details <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
