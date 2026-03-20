"use client";

import React, { createContext, useContext, useState } from "react";
import { WorkerProfile } from "@/types";
import { MOCK_USERS, MOCK_PROFILES, MockUser } from "@/lib/mockDb";

interface AuthContextType {
  user: MockUser | null;
  userProfile: WorkerProfile | null;
  loading: boolean;
  login: (role: "worker" | "admin") => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: false,
  login: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [userProfile, setUserProfile] = useState<WorkerProfile | null>(null);

  const login = (role: "worker" | "admin") => {
    setUser(MOCK_USERS[role]);
    setUserProfile(MOCK_PROFILES[role]);
  };

  const signOut = () => {
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading: false, login, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
