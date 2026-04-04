"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, type User, type ConfirmationResult } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { getWorkerByUid } from "@/lib/firestore";
import { verifyOTP, firebaseSignOut } from "@/lib/auth";
import { WorkerProfile, UserRole } from "@/types";

// ─── Context Type ─────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  userProfile: WorkerProfile | null;
  role: UserRole | null;
  loading: boolean;
  verifyOtp: (
    confirmationResult: ConfirmationResult,
    otp: string,
    selectedRole: "worker" | "admin"
  ) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  role: null,
  loading: true,
  verifyOtp: async () => {
    throw new Error("Not implemented");
  },
  signOut: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<WorkerProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate session on auth state change (page reload / token refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profile = await getWorkerByUid(firebaseUser.uid);
          if (profile) {
            setUserProfile(profile);
            setRole(profile.role);
          }
        } catch (err) {
          console.error("Failed to fetch worker profile on auth change:", err);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ─── Verify OTP & provision user ───────────────────────────────────────────

  const verifyOtp = async (
    confirmationResult: ConfirmationResult,
    otp: string,
    selectedRole: "worker" | "admin"
  ) => {
    setLoading(true);

    try {
      // 1. Confirm the OTP with Firebase Auth
      const credential = await verifyOTP(confirmationResult, otp);
      const firebaseUser = credential.user;
      setUser(firebaseUser);

      // 2. Look up existing worker document by uid
      const existingProfile = await getWorkerByUid(firebaseUser.uid);

      if (existingProfile) {
        // ── Returning user: ignore selectedRole, use stored role ─────────
        setUserProfile(existingProfile);
        setRole(existingProfile.role);
      } else {
        // ── First-time user: create new workers document ─────────────────
        const isAdmin = selectedRole === "admin";

        const newProfileData = {
          uid: firebaseUser.uid,
          phone: firebaseUser.phoneNumber ?? "",
          name: "",
          city: "",
          platform: "",
          zone: "",
          workingHours: "",
          weeklyEarningRange: "",
          upiId: "",
          role: selectedRole as UserRole,
          isOnboarded: isAdmin, // admins skip onboarding
          trustScore: 0.8,
          activePlan: null,
          claimsCount: 0,
          joinedDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        // Use Firebase uid as the document ID
        const workerDocRef = doc(db, "workers", firebaseUser.uid);
        await setDoc(workerDocRef, newProfileData);

        // Build the profile object for local state
        const newProfile: WorkerProfile = {
          ...newProfileData,
          id: firebaseUser.uid,
          // Replace FieldValue sentinels with a usable local value
          joinedDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setUserProfile(newProfile);
        setRole(selectedRole);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Sign Out ──────────────────────────────────────────────────────────────

  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
    } catch (err) {
      console.error("Sign-out error:", err);
    }
    setUser(null);
    setUserProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, role, loading, verifyOtp, signOut: handleSignOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
