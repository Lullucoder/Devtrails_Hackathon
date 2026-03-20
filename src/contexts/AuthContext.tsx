"use client";

import React, { createContext, useContext } from "react";
import { WorkerProfile } from "@/types";

// Mock user object (no Firebase)
const mockUser = {
  uid: "demo-user-001",
  phoneNumber: "+919876543210",
  email: "arjun@gmail.com",
  displayName: "Arjun K.",
};

const mockProfile: WorkerProfile = {
  uid: "demo-user-001",
  phone: "+919876543210",
  name: "Arjun K.",
  city: "Bengaluru",
  platform: "Zepto",
  zone: "Koramangala",
  workingHours: "morning",
  weeklyEarningRange: "₹6,000–₹8,000",
  upiId: "arjun@upi",
  role: "worker",
  isOnboarded: true,
  trustScore: 0.91,
  createdAt: "2026-03-01T10:00:00.000Z",
};

interface MockUser {
  uid: string;
  phoneNumber: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: MockUser | null;
  userProfile: WorkerProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: mockUser,
  userProfile: mockProfile,
  loading: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const signOut = async () => {
    // No-op for demo
  };

  return (
    <AuthContext.Provider
      value={{
        user: mockUser,
        userProfile: mockProfile,
        loading: false,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
