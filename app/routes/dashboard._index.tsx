import { Link } from "react-router";
import type { Route } from "./+types/dashboard._index";
import { requireAuth } from "~/lib/require-auth.server";
import { getUserPosts } from "~/lib/db-dashboard.server";

export function meta() {
  return [
    { title: "ダッシュボード | 書き起こし.com" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const { user } = await requireAuth(request, db);
  const posts = await getUserPosts(db, user.id);
  return { user, posts };
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: "下書き", className: "bg-surface-container-high text-on-surface-variant" },
  pending_review: { label: "レビュー待ち", className: "bg-secondary-container text-on-secondary-container" },
  published: { label: "公開中", className: "bg-primary text-on-primary" },
  archived: { label: "アーカイブ", className: "bg-surface-container text-outline" },
};

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user, posts } = loaderData;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-black text-primary">Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {user.name} さんの投稿 ({posts.length}件)
          </p>
        </div>
        <Link
          to="/dashboard/posts/new"
          className="px-6 py-2.5 academic-gradient text-on-primary rounded-md text-sm font-label tracking-wider uppercase no-underline hover:opacity-90 transition-opacity"
        >
          新規作成
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-on-surface-variant py-16 text-center text-lg">
          まだ投稿がありません。
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => {
            const status = STATUS_LABELS[post.status] || STATUS_LABELS.draft;
            const date = new Date(post.updated_at).toLocaleDateString("ja-JP");
            return (
              <div
                key={post.id}
                className="flex items-center gap-4 px-6 py-4 bg-surface-container-lowest rounded-xl shadow-[0_2px_8px_rgb(26_28_27/0.04)]"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/dashboard/posts/${post.id}/edit`}
                    className="font-medium text-primary no-underline hover:text-secondary truncate block transition-colors"
                  >
                    {post.title || "(無題)"}
                  </Link>
                  <span className="text-xs text-on-surface-variant/60">{date}</span>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full whitespace-nowrap font-label ${status.className}`}
                >
                  {status.label}
                </span>
                <div className="flex gap-3 text-xs font-label">
                  <Link
                    to={`/dashboard/posts/${post.id}/edit`}
                    className="text-on-surface-variant hover:text-secondary no-underline transition-colors"
                  >
                    編集
                  </Link>
                  {post.status === "published" && (
                    <Link
                      to={`/share/${post.primary_category}/${post.id}`}
                      className="text-on-surface-variant hover:text-secondary no-underline transition-colors"
                    >
                      表示
                    </Link>
                  )}
                  {post.status === "draft" && (
                    <Link
                      to={`/dashboard/posts/${post.id}/preview`}
                      className="text-on-surface-variant hover:text-secondary no-underline transition-colors"
                    >
                      プレビュー
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
