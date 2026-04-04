import { cookies } from "next/headers";

/**
 * POST /api/auth/logout
 *
 * Clears the session cookie by setting maxAge to 0,
 * effectively logging the user out on the server side.
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return Response.json({ status: "success" }, { status: 200 });
}
