import { redirect } from "react-router";
import type { Route } from "./+types/auth.logout";
import {
  getSessionCookie,
  invalidateSession,
  clearSessionCookieHeader,
} from "~/lib/auth.server";

export async function action({ request, context }: Route.ActionArgs) {
  const db = context.cloudflare.env.DB;
  const sessionId = getSessionCookie(request);
  if (sessionId) {
    await invalidateSession(db, sessionId);
  }
  return redirect("/share", {
    headers: { "Set-Cookie": clearSessionCookieHeader() },
  });
}
