/**
 * Next.js 16 Proxy (replaces deprecated middleware.ts)
 *
 * Protects /worker/* and /admin/* routes using Firebase session cookies.
 * For /admin/* routes, additionally verifies the user has role === "admin".
 *
 * Public routes (never protected):
 *   /, /login, /onboarding, /api/auth/session, /api/auth/logout, /api/webhooks/*
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// ── Helper: verify session cookie ──────────────────────────────────────────────
async function getSessionClaims(sessionCookie: string) {
  try {
    return await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}

// ── Proxy function ─────────────────────────────────────────────────────────────
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Skip protection for public routes ──────────────────────────────────
  const publicPaths = [
    "/",
    "/login",
    "/onboarding",
    "/api/auth/session",
    "/api/auth/logout",
  ];

  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith("/api/webhooks/")
  ) {
    return NextResponse.next();
  }

  // ── 2. Only protect /worker/* and /admin/* ────────────────────────────────
  const isWorkerRoute = pathname.startsWith("/worker/") || pathname === "/worker";
  const isAdminRoute = pathname.startsWith("/admin/") || pathname === "/admin";

  if (!isWorkerRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // ── 3. Read and verify the session cookie ─────────────────────────────────
  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const claims = await getSessionClaims(sessionCookie);

  if (!claims) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── 4. For /admin/* routes: verify role === "admin" ───────────────────────
  if (isAdminRoute) {
    try {
      // Query the workers collection for this uid
      const workersSnapshot = await adminDb
        .collection("workers")
        .where("uid", "==", claims.uid)
        .limit(1)
        .get();

      if (workersSnapshot.empty) {
        // No worker document found → not an admin
        return NextResponse.redirect(
          new URL("/worker/dashboard", request.url)
        );
      }

      const workerData = workersSnapshot.docs[0].data();

      if (workerData.role !== "admin") {
        return NextResponse.redirect(
          new URL("/worker/dashboard", request.url)
        );
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
      return NextResponse.redirect(
        new URL("/worker/dashboard", request.url)
      );
    }
  }

  // ── 5. Authenticated (and authorised for admin) → allow through ───────────
  return NextResponse.next();
}

// ── Matcher: only run on protected route patterns ──────────────────────────────
export const config = {
  matcher: ["/worker/:path*", "/admin/:path*"],
};
