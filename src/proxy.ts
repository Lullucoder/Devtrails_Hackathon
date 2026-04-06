/**
 * Next.js 16 Proxy (replaces deprecated middleware.ts)
 *
 * Protects /worker/* and /admin/* routes using Firebase session cookies.
 * Protects /onboarding so only authenticated users can access onboarding.
 * For /admin/* routes, additionally verifies the user has role === "admin".
 *
 * Public routes (never protected):
 *   /, /login (legacy alias), /api/auth/session, /api/auth/logout, /api/webhooks/*
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

function buildLoginRedirectUrl(request: NextRequest): URL {
  const loginUrl = new URL("/", request.url);
  loginUrl.searchParams.set("login", "1");

  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (nextPath && nextPath !== "/") {
    loginUrl.searchParams.set("next", nextPath);
  }

  return loginUrl;
}

// ── Proxy function ─────────────────────────────────────────────────────────────
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Skip protection for public routes ──────────────────────────────────
  const publicPaths = [
    "/",
    "/login",
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
  const isOnboardingRoute = pathname === "/onboarding" || pathname.startsWith("/onboarding/");

  if (!isWorkerRoute && !isAdminRoute && !isOnboardingRoute) {
    return NextResponse.next();
  }

  // ── 3. Read and verify the session cookie ─────────────────────────────────
  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(buildLoginRedirectUrl(request));
  }

  const claims = await getSessionClaims(sessionCookie);

  if (!claims) {
    return NextResponse.redirect(buildLoginRedirectUrl(request));
  }

  // ── 4. For /onboarding: only allow worker users not yet onboarded ─────────
  if (isOnboardingRoute) {
    try {
      const workersSnapshot = await adminDb
        .collection("workers")
        .where("uid", "==", claims.uid)
        .limit(1)
        .get();

      if (workersSnapshot.empty) {
        return NextResponse.redirect(buildLoginRedirectUrl(request));
      }

      const workerData = workersSnapshot.docs[0].data() as {
        role?: string;
        isOnboarded?: boolean;
      };

      if (workerData.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }

      if (workerData.isOnboarded) {
        return NextResponse.redirect(new URL("/worker/dashboard", request.url));
      }
    } catch (error) {
      console.error("Error checking onboarding access:", error);
      return NextResponse.redirect(buildLoginRedirectUrl(request));
    }
  }

  // ── 5. For /admin/* routes: verify role === "admin" ───────────────────────
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

  // ── 6. Authenticated and authorised route → allow through ──────────────────
  return NextResponse.next();
}

// ── Matcher: only run on protected route patterns ──────────────────────────────
export const config = {
  matcher: ["/worker/:path*", "/admin/:path*", "/onboarding", "/onboarding/:path*"],
};
