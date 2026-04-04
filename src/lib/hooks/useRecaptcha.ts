"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RecaptchaVerifier } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Hook that manages an invisible reCAPTCHA verifier tied to a DOM element.
 *
 * Usage:
 * ```tsx
 * const { recaptchaRef, verifier, isReady } = useRecaptcha();
 * return <div ref={recaptchaRef} />;
 * ```
 *
 * - `recaptchaRef` — attach to an empty `<div>` in your JSX
 * - `verifier`     — the `RecaptchaVerifier` instance (null until ready)
 * - `isReady`      — true once the verifier has been initialised
 */
export function useRecaptcha() {
  const recaptchaRef = useRef<HTMLDivElement | null>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const [isReady, setIsReady] = useState(false);

  // ── Initialise on mount ───────────────────────────────────────────────
  useEffect(() => {
    const el = recaptchaRef.current;
    if (!el) return;

    // Prevent double-init during React Strict Mode double-mount
    if (verifierRef.current) return;

    const rv = new RecaptchaVerifier(auth, el, {
      size: "invisible",
      callback: () => {
        // Solved — nothing to do; signInWithPhoneNumber drives the flow.
      },
      "expired-callback": () => {
        // Token expired before being used — reset so a fresh one is generated.
        rv.render().catch(() => {});
      },
    });

    verifierRef.current = rv;
    setIsReady(true);

    // ── Cleanup on unmount ────────────────────────────────────────────
    return () => {
      verifierRef.current?.clear();
      verifierRef.current = null;
      setIsReady(false);
    };
  }, []);

  /**
   * Force-reset the verifier (useful after a failed attempt so the
   * next call to signInWithPhoneNumber gets a fresh token).
   */
  const resetVerifier = useCallback(() => {
    verifierRef.current?.render().catch(() => {});
  }, []);

  return {
    /** Attach this ref to an empty `<div>` that acts as the reCAPTCHA container. */
    recaptchaRef,
    /** The RecaptchaVerifier instance, or `null` before initialisation. */
    verifier: verifierRef.current,
    /** `true` once the verifier has been created and is usable. */
    isReady,
    /** Force-reset the reCAPTCHA (call after a failed OTP send). */
    resetVerifier,
  } as const;
}
