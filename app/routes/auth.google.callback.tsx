import { redirect } from "react-router";
import type { Route } from "./+types/auth.google.callback";
import {
  createGoogleProvider,
  getCookie,
  getOrCreateUser,
  createSession,
  sessionCookieHeader,
  isSecureRequest,
} from "~/lib/auth.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  const db = env.DB;
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = getCookie(request, "google_state");
  const codeVerifier = getCookie(request, "google_code_verifier");

  if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
    throw redirect("/auth/login");
  }

  const google = createGoogleProvider(env);
  const tokens = await google.validateAuthorizationCode(code, codeVerifier);
  const accessToken = tokens.accessToken();

  // Fetch Google user profile
  const profileRes = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const profile = (await profileRes.json()) as {
    sub: string;
    name: string;
    email: string;
    picture: string;
  };

  const user = await getOrCreateUser(db, "google", profile.sub, {
    name: profile.name,
    email: profile.email,
    avatar_url: profile.picture,
  });

  const sessionId = await createSession(db, user.id);

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": sessionCookieHeader(sessionId, isSecureRequest(request)),
    },
  });
}
