import { redirect } from "react-router";
import type { Route } from "./+types/auth.twitter";
import { createTwitterProvider, stateCookieHeader } from "~/lib/auth.server";
import { generateState, generateCodeVerifier } from "arctic";

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  const twitter = createTwitterProvider(env);
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = twitter.createAuthorizationURL(state, codeVerifier, [
    "tweet.read",
    "users.read",
  ]);

  return redirect(url.toString(), {
    headers: [
      ["Set-Cookie", stateCookieHeader("twitter_state", state)],
      ["Set-Cookie", stateCookieHeader("twitter_code_verifier", codeVerifier)],
    ],
  });
}
