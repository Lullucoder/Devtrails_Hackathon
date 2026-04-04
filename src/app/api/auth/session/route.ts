import { cookies } from "next/headers";
import { createSessionCookie } from "@/lib/session";

/**
 * POST /api/auth/session
 *
 * Accepts a Firebase ID token from the client, creates a server-side
 * session cookie, and sets it as an httpOnly cookie on the response.
 */
export async function POST(request: Request) {
  try {
    const { idToken } = (await request.json()) as { idToken?: string };

    if (!idToken) {
      return Response.json(
        { error: "Missing idToken in request body" },
        { status: 400 }
      );
    }

    // Create a Firebase session cookie (7-day expiry)
    const sessionCookie = await createSessionCookie(idToken);

    // Set the cookie via Next.js cookies() API
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: "/",
    });

    return Response.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Failed to create session:", error);
    return Response.json(
      { error: "Unauthorized – invalid ID token" },
      { status: 401 }
    );
  }
}
