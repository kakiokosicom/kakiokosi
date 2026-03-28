import { Link } from "react-router";
import type { Route } from "./+types/dashboard._index";
import { requireAuth } from "~/lib/require-auth.server";
import { getUserPosts } from "~/lib/db-dashboard.server";

export function meta() {
  return [{ title: "ダッシュボード | 書き起こし.com" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const { user } = await requireAuth(request, db);
  const posts = await getUserPosts(db, user.id);
  return { user, posts };
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: "下書き", className: "bg-gray-100 text-gray-600" },
  pending_review: { label: "レビュー待ち", className: "bg-yellow-100 text-yellow-700" },
  published: { label: "公開中", className: "bg-green-100 text-green-700" },
  archived: { label: "アーカイブ", className: "bg-red-100 text-red-600" },
};

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user, posts } = loaderData;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <Link
          to="/dashboard/posts/new"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm no-underline hover:bg-gray-800"
        >
          新規作成
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        {user.name} さんの投稿 ({posts.length}件)
      </p>

      {posts.length === 0 ? (
        <p className="text-gray-400 py-12 text-center">
          まだ投稿がありません。
        </p>
      ) : (
        <div className="border rounded-lg divide-y">
          {posts.map((post) => {
            const status = STATUS_LABELS[post.status] || STATUS_LABELS.draft;
            const date = new Date(post.updated_at).toLocaleDateString("ja-JP");
            return (
              <div key={post.id} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/dashboard/posts/${post.id}/edit`}
                    className="font-medium text-gray-900 no-underline hover:text-blue-600 truncate block"
                  >
                    {post.title || "(無題)"}
                  </Link>
                  <span className="text-xs text-gray-400">{date}</span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${status.className}`}
                >
                  {status.label}
                </span>
                <div className="flex gap-2 text-xs">
                  <Link
                    to={`/dashboard/posts/${post.id}/edit`}
                    className="text-gray-500 hover:text-gray-700 no-underline"
                  >
                    編集
                  </Link>
                  {post.status === "published" && (
                    <Link
                      to={`/share/${post.primary_category}/${post.id}`}
                      className="text-gray-500 hover:text-gray-700 no-underline"
                    >
                      表示
                    </Link>
                  )}
                  {post.status === "draft" && (
                    <Link
                      to={`/dashboard/posts/${post.id}/preview`}
                      className="text-gray-500 hover:text-gray-700 no-underline"
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
