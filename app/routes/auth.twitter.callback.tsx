import { redirect } from "react-router";
import type { Route } from "./+types/auth.twitter.callback";
import {
  createTwitterProvider,
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
  const storedState = getCookie(request, "twitter_state");
  const codeVerifier = getCookie(request, "twitter_code_verifier");

  if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
    throw redirect("/auth/login");
  }

  const twitter = createTwitterProvider(env);
  const tokens = await twitter.validateAuthorizationCode(code, codeVerifier);
  const accessToken = tokens.accessToken();

  // Fetch Twitter user profile
  const profileRes = await fetch(
    "https://api.twitter.com/2/users/me?user.fields=profile_image_url",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const { data: profile } = (await profileRes.json()) as {
    data: { id: string; name: string; username: string; profile_image_url?: string };
  };

  const user = await getOrCreateUser(db, "twitter", profile.id, {
    name: profile.name,
    email: null,
    avatar_url: profile.profile_image_url || null,
  });

  const sessionId = await createSession(db, user.id);

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": sessionCookieHeader(sessionId, isSecureRequest(request)),
    },
  });
}
