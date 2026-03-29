import { createRequestHandler } from "react-router";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // www → non-www 301 redirect
    if (url.hostname === "www.kakiokosi.com") {
      url.hostname = "kakiokosi.com";
      return new Response(null, {
        status: 301,
        headers: { Location: url.toString() },
      });
    }

    const response = await requestHandler(request, {
      cloudflare: { env, ctx },
    });

    // Immutable cache for hashed static assets and uploaded images
    if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/uploads/")) {
      response.headers.set(
        "Cache-Control",
        "public, max-age=31536000, immutable"
      );
    }

    // Ensure charset on HTML responses
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("text/html") && !contentType.includes("charset")) {
      response.headers.set("Content-Type", "text/html; charset=utf-8");
    }

    // Security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://analytics.ahrefs.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https: data:; connect-src 'self' https://analytics.ahrefs.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"
    );

    return response;
  },
} satisfies ExportedHandler<Env>;
