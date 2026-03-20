export interface WorkerProfile {
  uid: string;
  phone: string;
  name: string;
  city: string;
  platform: string;
  zone: string;
  workingHours: string;
  weeklyEarningRange: string;
  upiId: string;
  role: "worker" | "admin";
  isOnboarded: boolean;
  trustScore: number;
  createdAt: string;
}

export interface Policy {
  id: string;
  workerId: string;
  plan: "lite" | "core" | "peak";
  premium: number;
  maxProtection: number;
  weekStart: string;
  weekEnd: string;
  status: "active" | "expired" | "cancelled";
  triggers: string[];
}

export interface Claim {
  id: string;
  workerId: string;
  policyId: string;
  triggerType: TriggerType;
  triggerSeverity: "moderate" | "high" | "severe";
  status: "auto_approved" | "under_review" | "approved" | "held" | "denied";
  confidenceScore: number;
  payoutAmount: number;
  createdAt: string;
  resolvedAt?: string;
  description: string;
}

export interface TriggerEvent {
  id: string;
  type: TriggerType;
  severity: "moderate" | "high" | "severe";
  zone: string;
  city: string;
  startTime: string;
  endTime?: string;
  details: string;
  affectedWorkers: number;
}

export interface FraudSignal {
  id: string;
  workerId: string;
  workerName: string;
  claimId: string;
  signalType: string;
  severity: "low" | "medium" | "high" | "critical";
  details: string;
  createdAt: string;
  status: "open" | "investigating" | "resolved" | "dismissed";
}

export type TriggerType =
  | "heavy_rain"
  | "extreme_heat"
  | "hazardous_aqi"
  | "zone_closure"
  | "platform_outage";

export interface DashboardStats {
  activeUsers: number;
  activePolicies: number;
  claimsThisWeek: number;
  payoutVolume: number;
  claimsByTrigger: { type: string; count: number }[];
  weeklyTrends: { week: string; claims: number; payouts: number; lossRatio: number }[];
  cityStats: { city: string; workers: number; risk: number }[];
}
