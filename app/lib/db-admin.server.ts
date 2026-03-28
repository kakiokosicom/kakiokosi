import type { Post } from "./db.server";

export type UserRow = {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
};

export async function getPendingReviewPosts(db: D1Database): Promise<Post[]> {
  const result = await db
    .prepare(
      `SELECT * FROM posts WHERE status = 'pending_review' ORDER BY updated_at DESC`
    )
    .all<Post>();
  return result.results;
}

export async function getAllPostsAdmin(
  db: D1Database,
  status?: string,
  page = 1,
  perPage = 50
): Promise<{ posts: Post[]; total: number }> {
  const offset = (page - 1) * perPage;
  const where = status ? `WHERE status = ?` : "";
  const bind = status ? [status, perPage, offset] : [perPage, offset];

  const [postsResult, countResult] = await Promise.all([
    db
      .prepare(`SELECT * FROM posts ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`)
      .bind(...bind)
      .all<Post>(),
    db
      .prepare(`SELECT COUNT(*) as count FROM posts ${where}`)
      .bind(...(status ? [status] : []))
      .first<{ count: number }>(),
  ]);

  return { posts: postsResult.results, total: countResult?.count ?? 0 };
}

export async function getAllUsers(db: D1Database): Promise<UserRow[]> {
  const result = await db
    .prepare(`SELECT * FROM users ORDER BY created_at DESC`)
    .all<UserRow>();
  return result.results;
}

export async function updateUserRole(
  db: D1Database,
  userId: string,
  role: string
): Promise<void> {
  await db
    .prepare(`UPDATE users SET role = ? WHERE id = ?`)
    .bind(role, userId)
    .run();
}

export async function approvePost(db: D1Database, postId: number): Promise<void> {
  await db
    .prepare(
      `UPDATE posts SET status = 'published', published_at = COALESCE(published_at, datetime('now')), updated_at = datetime('now') WHERE id = ?`
    )
    .bind(postId)
    .run();
}

export async function rejectPost(db: D1Database, postId: number): Promise<void> {
  await db
    .prepare(
      `UPDATE posts SET status = 'draft', updated_at = datetime('now') WHERE id = ?`
    )
    .bind(postId)
    .run();
}
