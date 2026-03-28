import { redirect } from "react-router";
import {
  getCurrentUser,
  clearSessionCookieHeader,
  type SessionUser,
} from "./auth.server";

export async function requireAuth(
  request: Request,
  db: D1Database
): Promise<{ user: SessionUser; sessionId: string }> {
  const result = await getCurrentUser(db, request);
  if (!result) {
    throw redirect("/auth/login", {
      headers: { "Set-Cookie": clearSessionCookieHeader() },
    });
  }
  return result;
}

export async function requireRole(
  request: Request,
  db: D1Database,
  roles: string[]
): Promise<{ user: SessionUser; sessionId: string }> {
  const result = await requireAuth(request, db);
  if (!roles.includes(result.user.role)) {
    throw redirect("/dashboard");
  }
  return result;
}
