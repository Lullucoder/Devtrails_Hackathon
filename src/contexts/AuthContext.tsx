"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  // Use a ref to hold the verifier — avoids stale closure issues and
  // prevents the object from triggering re-renders when it changes.
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

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

  // useCallback gives a stable function reference so it won't cause
  // infinite loops when used in a useEffect dependency array.
  const setupRecaptcha = useCallback((elementId: string) => {
    try {
      // Clear any existing verifier before creating a new one
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
        setRecaptchaReady(false);
      }

      const container = document.getElementById(elementId);
      if (!container) return;

      // Guard: if reCAPTCHA widget is already rendered inside this element, skip
      if (container.childElementCount > 0) {
        setRecaptchaReady(true);
        return;
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

      recaptchaVerifierRef.current = verifier;

      verifier.render().then(() => {
        setRecaptchaReady(true);
      }).catch((err) => {
        console.error("reCAPTCHA render error:", err);
      });
    } catch (error) {
      console.error("reCAPTCHA setup error:", error);
    }
  }, []); // stable — no dependencies needed since we use a ref

  const sendOTP = async (phoneNumber: string) => {
    if (!recaptchaVerifierRef.current) {
      throw new Error("reCAPTCHA not initialized");
    }
    const formattedPhone = phoneNumber.startsWith("+91")
      ? phoneNumber
      : `+91${phoneNumber}`;
    const result = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      recaptchaVerifierRef.current
    );
    setConfirmationResult(result);
  };

  const verifyOTP = async (code: string) => {
    if (!confirmationResult) {
      throw new Error("No confirmation result available");
    }
    const userCredential = await confirmationResult.confirm(code);
    setUser(userCredential.user);

    const docRef = doc(db, "workers", userCredential.user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserProfile(docSnap.data() as WorkerProfile);
    }
  };

  const signOut = async () => {
    // Clean up reCAPTCHA on sign out
    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
    setConfirmationResult(null);
    setRecaptchaReady(false);
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
