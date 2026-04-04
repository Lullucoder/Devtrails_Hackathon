/**
 * Server-side session management using Firebase Admin Session Cookies.
 *
 * This file must NEVER be imported from client components or browser code.
 * It relies on the Firebase Admin SDK which is server-only.
 */

import { adminAuth } from "./firebase-admin";

// ── Session cookie lifetime: 7 days (in milliseconds) ──────────────────────────
const SESSION_EXPIRY_MS = 60 * 60 * 24 * 7 * 1000; // 7 days

/**
 * Creates a Firebase session cookie from a client-side ID token.
 *
 * @param idToken - The Firebase ID token obtained from the client after sign-in.
 * @returns The session cookie string to be stored in an httpOnly cookie.
 */
export async function createSessionCookie(idToken: string): Promise<string> {
  return adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRY_MS,
  });
}

/**
 * Verifies a session cookie and returns the decoded token claims.
 *
 * @param cookie - The session cookie string from the request.
 * @returns Decoded claims including `uid`, `email`, etc.
 * @throws If the cookie is invalid, expired, or revoked.
 */
export async function verifySessionCookie(cookie: string) {
  // `true` = check if the token has been revoked
  return adminAuth.verifySessionCookie(cookie, true);
}
