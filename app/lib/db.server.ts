export type Post = {
  id: number;
  author_id: string | null;
  title: string;
  content: string;
  excerpt: string;
  status: string;
  primary_category: string;
  thumbnail_url: string | null;
  voicy_url: string | null;
  spotify_url: string | null;
  source_url: string | null;
  /** 1 = 派生・断片の逐語転載。robots noindex + sitemap 除外（migration 0024）。 */
  noindex: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Post without content — for listing pages */
export type PostSummary = Omit<Post, "content">;

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Tag = {
  id: number;
  name: string;
  slug: string;
};

export type Page = {
  id: number;
  slug: string;
  title: string;
  content: string;
};

const POSTS_PER_PAGE = 20;

const LISTING_COLUMNS = `id, author_id, title, excerpt, status, primary_category, thumbnail_url, published_at, created_at, updated_at`;

export async function getPublishedPosts(
  db: D1Database,
  page = 1
): Promise<{ posts: PostSummary[]; total: number }> {
  const offset = (page - 1) * POSTS_PER_PAGE;
  const [postsResult, countResult] = await Promise.all([
    db
      .prepare(
        `SELECT ${LISTING_COLUMNS} FROM posts WHERE status = 'published' ORDER BY published_at DESC LIMIT ? OFFSET ?`
      )
      .bind(POSTS_PER_PAGE, offset)
      .all<PostSummary>(),
    db
      .prepare(`SELECT COUNT(*) as count FROM posts WHERE status = 'published'`)
      .first<{ count: number }>(),
  ]);
  return {
    posts: postsResult.results,
    total: countResult?.count ?? 0,
  };
}

export async function getPostsByCategory(
  db: D1Database,
  categorySlug: string,
  page = 1
): Promise<{ posts: PostSummary[]; total: number; category: Category | null }> {
  const offset = (page - 1) * POSTS_PER_PAGE;
  const cols = LISTING_COLUMNS.split(", ").map((c) => `p.${c}`).join(", ");
  const [postsResult, countResult, category] = await Promise.all([
    db
      .prepare(
        `SELECT ${cols} FROM posts p
         JOIN post_categories pc ON p.id = pc.post_id
         WHERE pc.category_slug = ? AND p.status = 'published'
         ORDER BY p.published_at DESC LIMIT ? OFFSET ?`
      )
      .bind(categorySlug, POSTS_PER_PAGE, offset)
      .all<PostSummary>(),
    db
      .prepare(
        `SELECT COUNT(*) as count FROM posts p
         JOIN post_categories pc ON p.id = pc.post_id
         WHERE pc.category_slug = ? AND p.status = 'published'`
      )
      .bind(categorySlug)
      .first<{ count: number }>(),
    db
      .prepare(`SELECT * FROM categories WHERE slug = ?`)
      .bind(categorySlug)
      .first<Category>(),
  ]);
  return {
    posts: postsResult.results,
    total: countResult?.count ?? 0,
    category,
  };
}

export async function getPostsByTag(
  db: D1Database,
  tagSlug: string,
  page = 1
): Promise<{ posts: PostSummary[]; total: number; tag: Tag | null }> {
  const offset = (page - 1) * POSTS_PER_PAGE;
  const cols = LISTING_COLUMNS.split(", ").map((c) => `p.${c}`).join(", ");
  const [postsResult, countResult, tag] = await Promise.all([
    db
      .prepare(
        `SELECT ${cols} FROM posts p
         JOIN post_tags pt ON p.id = pt.post_id
         WHERE pt.tag_slug = ? AND p.status = 'published'
         ORDER BY p.published_at DESC LIMIT ? OFFSET ?`
      )
      .bind(tagSlug, POSTS_PER_PAGE, offset)
      .all<PostSummary>(),
    db
      .prepare(
        `SELECT COUNT(*) as count FROM posts p
         JOIN post_tags pt ON p.id = pt.post_id
         WHERE pt.tag_slug = ? AND p.status = 'published'`
      )
      .bind(tagSlug)
      .first<{ count: number }>(),
    db
      .prepare(`SELECT * FROM tags WHERE slug = ?`)
      .bind(tagSlug)
      .first<Tag>(),
  ]);
  return {
    posts: postsResult.results,
    total: countResult?.count ?? 0,
    tag,
  };
}

export async function getPost(
  db: D1Database,
  id: number
): Promise<{
  post: Post | null;
  categories: Category[];
  tags: Tag[];
}> {
  const [post, categories, tags] = await Promise.all([
    db
      .prepare(`SELECT * FROM posts WHERE id = ? AND status = 'published'`)
      .bind(id)
      .first<Post>(),
    db
      .prepare(
        `SELECT c.* FROM categories c
         JOIN post_categories pc ON c.slug = pc.category_slug
         WHERE pc.post_id = ?`
      )
      .bind(id)
      .all<Category>(),
    db
      .prepare(
        `SELECT t.* FROM tags t
         JOIN post_tags pt ON t.slug = pt.tag_slug
         WHERE pt.post_id = ?`
      )
      .bind(id)
      .all<Tag>(),
  ]);
  return {
    post,
    categories: categories.results,
    tags: tags.results,
  };
}

export async function getPage(
  db: D1Database,
  slug: string
): Promise<Page | null> {
  return db
    .prepare(`SELECT * FROM pages WHERE slug = ?`)
    .bind(slug)
    .first<Page>();
}

export async function getAllCategories(
  db: D1Database
): Promise<Category[]> {
  const result = await db
    .prepare(`SELECT * FROM categories ORDER BY name`)
    .all<Category>();
  return result.results;
}

export async function getRelatedPosts(
  db: D1Database,
  postId: number,
  categorySlug: string,
  limit = 4
): Promise<PostSummary[]> {
  const cols = LISTING_COLUMNS.split(", ").map((c) => `p.${c}`).join(", ");
  const result = await db
    .prepare(
      `SELECT ${cols} FROM posts p
       JOIN post_categories pc ON p.id = pc.post_id
       WHERE pc.category_slug = ? AND p.id != ? AND p.status = 'published'
       ORDER BY p.published_at DESC LIMIT ?`
    )
    .bind(categorySlug, postId, limit)
    .all<PostSummary>();
  return result.results;
}

export { POSTS_PER_PAGE };
