import { Google, Twitter } from "arctic";

// ─── Types ───

export type SessionUser = {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  role: string;
};

// ─── OAuth Providers ───

export function createGoogleProvider(env: Env) {
  return new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.APP_URL}/auth/google/callback`
  );
}

export function createTwitterProvider(env: Env) {
  return new Twitter(
    env.TWITTER_CLIENT_ID,
    env.TWITTER_CLIENT_SECRET,
    `${env.APP_URL}/auth/twitter/callback`
  );
}

// ─── Session Management ───

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SESSION_REFRESH_MS = 15 * 24 * 60 * 60 * 1000; // 15 days

export async function createSession(
  db: D1Database,
  userId: string
): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  await db
    .prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(sessionId, userId, expiresAt)
    .run();
  return sessionId;
}

export async function validateSession(
  db: D1Database,
  sessionId: string
): Promise<{ user: SessionUser; sessionId: string } | null> {
  const row = await db
    .prepare(
      `SELECT s.id as session_id, s.expires_at, u.id, u.name, u.email, u.avatar_url, u.role
       FROM sessions s JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`
    )
    .bind(sessionId)
    .first<{
      session_id: string;
      expires_at: string;
      id: string;
      name: string;
      email: string | null;
      avatar_url: string | null;
      role: string;
    }>();

  if (!row) return null;

  const expiresAt = new Date(row.expires_at);
  if (expiresAt < new Date()) {
    await db.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
    return null;
  }

  // Sliding window: extend session if within last 15 days
  if (expiresAt.getTime() - Date.now() < SESSION_REFRESH_MS) {
    const newExpiry = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
    await db
      .prepare("UPDATE sessions SET expires_at = ? WHERE id = ?")
      .bind(newExpiry, sessionId)
      .run();
  }

  return {
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      avatar_url: row.avatar_url,
      role: row.role,
    },
    sessionId: row.session_id,
  };
}

export async function invalidateSession(
  db: D1Database,
  sessionId: string
): Promise<void> {
  await db.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
}

// ─── Cookie Helpers ───

const SESSION_COOKIE = "session";

export function getSessionCookie(request: Request): string | null {
  const cookies = request.headers.get("Cookie") || "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]*)`));
  return match ? match[1] : null;
}

export function sessionCookieHeader(
  sessionId: string,
  isSecure: boolean
): string {
  const secure = isSecure ? "; Secure" : "";
  return `${SESSION_COOKIE}=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}${secure}`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

export function stateCookieHeader(name: string, value: string): string {
  return `${name}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=300`;
}

export function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get("Cookie") || "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

// ─── User Management ───

export async function getOrCreateUser(
  db: D1Database,
  provider: string,
  providerUserId: string,
  profile: { name: string; email: string | null; avatar_url: string | null }
): Promise<SessionUser> {
  // Check if OAuth account already exists
  const existing = await db
    .prepare(
      `SELECT u.id, u.name, u.email, u.avatar_url, u.role
       FROM oauth_accounts oa JOIN users u ON oa.user_id = u.id
       WHERE oa.provider = ? AND oa.provider_id = ?`
    )
    .bind(provider, providerUserId)
    .first<SessionUser>();

  if (existing) return existing;

  // Create new user
  const userId = crypto.randomUUID();
  await db.batch([
    db
      .prepare(
        "INSERT INTO users (id, name, email, avatar_url, role) VALUES (?, ?, ?, ?, 'member')"
      )
      .bind(userId, profile.name, profile.email, profile.avatar_url),
    db
      .prepare(
        "INSERT INTO oauth_accounts (provider, provider_id, user_id) VALUES (?, ?, ?)"
      )
      .bind(provider, providerUserId, userId),
  ]);

  return {
    id: userId,
    name: profile.name,
    email: profile.email,
    avatar_url: profile.avatar_url,
    role: "member",
  };
}

// ─── Auth Helper for Routes ───

export async function getCurrentUser(
  db: D1Database,
  request: Request
): Promise<{ user: SessionUser; sessionId: string } | null> {
  const sessionId = getSessionCookie(request);
  if (!sessionId) return null;
  return validateSession(db, sessionId);
}

export function isSecureRequest(request: Request): boolean {
  return new URL(request.url).protocol === "https:";
}
