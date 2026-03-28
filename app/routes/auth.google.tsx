import { redirect } from "react-router";
import type { Route } from "./+types/auth.google";
import { createGoogleProvider, stateCookieHeader } from "~/lib/auth.server";
import { generateState, generateCodeVerifier } from "arctic";

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  const google = createGoogleProvider(env);
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);

  return redirect(url.toString(), {
    headers: [
      ["Set-Cookie", stateCookieHeader("google_state", state)],
      ["Set-Cookie", stateCookieHeader("google_code_verifier", codeVerifier)],
    ],
  });
}
