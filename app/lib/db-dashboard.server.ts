import type { Post, Category } from "./db.server";

export async function getUserPosts(
  db: D1Database,
  userId: string
): Promise<Post[]> {
  const result = await db
    .prepare(
      `SELECT * FROM posts WHERE author_id = ? ORDER BY updated_at DESC`
    )
    .bind(userId)
    .all<Post>();
  return result.results;
}

export async function getPostForEdit(
  db: D1Database,
  postId: number,
  userId: string
): Promise<Post | null> {
  return db
    .prepare(`SELECT * FROM posts WHERE id = ? AND author_id = ?`)
    .bind(postId, userId)
    .first<Post>();
}

export async function getPostForEditAdmin(
  db: D1Database,
  postId: number
): Promise<Post | null> {
  return db
    .prepare(`SELECT * FROM posts WHERE id = ?`)
    .bind(postId)
    .first<Post>();
}

export async function createPost(
  db: D1Database,
  userId: string,
  data: {
    title: string;
    content: string;
    excerpt: string;
    primary_category: string;
  }
): Promise<number> {
  const result = await db
    .prepare(
      `INSERT INTO posts (author_id, title, content, excerpt, status, primary_category, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'draft', ?, datetime('now'), datetime('now'))`
    )
    .bind(userId, data.title, data.content, data.excerpt, data.primary_category)
    .run();
  return result.meta.last_row_id as number;
}

export async function updatePost(
  db: D1Database,
  postId: number,
  userId: string,
  data: {
    title?: string;
    content?: string;
    excerpt?: string;
    primary_category?: string;
  }
): Promise<void> {
  const sets: string[] = [];
  const values: (string | number)[] = [];

  if (data.title !== undefined) {
    sets.push("title = ?");
    values.push(data.title);
  }
  if (data.content !== undefined) {
    sets.push("content = ?");
    values.push(data.content);
  }
  if (data.excerpt !== undefined) {
    sets.push("excerpt = ?");
    values.push(data.excerpt);
  }
  if (data.primary_category !== undefined) {
    sets.push("primary_category = ?");
    values.push(data.primary_category);
  }

  sets.push("updated_at = datetime('now')");
  values.push(postId, userId);

  await db
    .prepare(
      `UPDATE posts SET ${sets.join(", ")} WHERE id = ? AND author_id = ?`
    )
    .bind(...values)
    .run();
}

export async function submitForReview(
  db: D1Database,
  postId: number,
  userId: string
): Promise<void> {
  await db
    .prepare(
      `UPDATE posts SET status = 'pending_review', updated_at = datetime('now')
       WHERE id = ? AND author_id = ? AND status = 'draft'`
    )
    .bind(postId, userId)
    .run();
}

export async function publishPost(
  db: D1Database,
  postId: number
): Promise<void> {
  await db
    .prepare(
      `UPDATE posts SET status = 'published', published_at = datetime('now'), updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(postId)
    .run();
}

export async function deletePost(
  db: D1Database,
  postId: number,
  userId: string
): Promise<void> {
  await db
    .prepare(`DELETE FROM posts WHERE id = ? AND author_id = ? AND status = 'draft'`)
    .bind(postId, userId)
    .run();
}

export async function managePostCategories(
  db: D1Database,
  postId: number,
  categorySlugs: string[]
): Promise<void> {
  const stmts = [
    db.prepare("DELETE FROM post_categories WHERE post_id = ?").bind(postId),
    ...categorySlugs.map((slug) =>
      db
        .prepare("INSERT INTO post_categories (post_id, category_slug) VALUES (?, ?)")
        .bind(postId, slug)
    ),
  ];
  await db.batch(stmts);
}

export async function managePostTags(
  db: D1Database,
  postId: number,
  tagSlugs: string[]
): Promise<void> {
  const stmts = [
    db.prepare("DELETE FROM post_tags WHERE post_id = ?").bind(postId),
    ...tagSlugs.map((slug) =>
      db
        .prepare(
          "INSERT OR IGNORE INTO post_tags (post_id, tag_slug) VALUES (?, ?)"
        )
        .bind(postId, slug)
    ),
  ];
  await db.batch(stmts);
}
