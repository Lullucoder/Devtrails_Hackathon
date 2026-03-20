"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { WorkerProfile } from "@/types";

interface AuthContextType {
  user: User | null;
  userProfile: WorkerProfile | null;
  loading: boolean;
  sendOTP: (phoneNumber: string) => Promise<void>;
  verifyOTP: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
  confirmationResult: ConfirmationResult | null;
  recaptchaReady: boolean;
  setupRecaptcha: (elementId: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  sendOTP: async () => {},
  verifyOTP: async () => {},
  signOut: async () => {},
  confirmationResult: null,
  recaptchaReady: false,
  setupRecaptcha: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const docRef = doc(db, "workers", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as WorkerProfile);
          } else {
            setUserProfile(null);
          }
        } catch {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setupRecaptcha = (elementId: string) => {
    try {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
      const verifier = new RecaptchaVerifier(auth, elementId, {
        size: "invisible",
        callback: () => {
          setRecaptchaReady(true);
        },
        "expired-callback": () => {
          setRecaptchaReady(false);
        },
      });
      setRecaptchaVerifier(verifier);
      verifier.render().then(() => {
        setRecaptchaReady(true);
      });
    } catch (error) {
      console.error("reCAPTCHA setup error:", error);
    }
  };

  const sendOTP = async (phoneNumber: string) => {
    if (!recaptchaVerifier) {
      throw new Error("reCAPTCHA not initialized");
    }
    const formattedPhone = phoneNumber.startsWith("+91")
      ? phoneNumber
      : `+91${phoneNumber}`;
    const result = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      recaptchaVerifier
    );
    setConfirmationResult(result);
  };

  const verifyOTP = async (code: string) => {
    if (!confirmationResult) {
      throw new Error("No confirmation result available");
    }
    const userCredential = await confirmationResult.confirm(code);
    setUser(userCredential.user);

    // Check if profile exists
    const docRef = doc(db, "workers", userCredential.user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserProfile(docSnap.data() as WorkerProfile);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
    setConfirmationResult(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        sendOTP,
        verifyOTP,
        signOut,
        confirmationResult,
        recaptchaReady,
        setupRecaptcha,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
