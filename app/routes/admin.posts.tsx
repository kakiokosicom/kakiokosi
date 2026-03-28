import { Link } from "react-router";
import type { Route } from "./+types/admin.posts";
import { requireRole } from "~/lib/require-auth.server";
import { getAllPostsAdmin } from "~/lib/db-admin.server";

export function meta() {
  return [{ title: "全記事管理 | 書き起こし.com" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  await requireRole(request, db, ["admin", "editor"]);

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  const { posts, total } = await getAllPostsAdmin(db, status, page);
  return { posts, total, status: status || "all", page };
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: "下書き", className: "bg-gray-100 text-gray-600" },
  pending_review: { label: "レビュー待ち", className: "bg-yellow-100 text-yellow-700" },
  published: { label: "公開中", className: "bg-green-100 text-green-700" },
  archived: { label: "アーカイブ", className: "bg-red-100 text-red-600" },
};

export default function AdminPosts({ loaderData }: Route.ComponentProps) {
  const { posts, total, status } = loaderData;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="text-sm text-gray-500 no-underline hover:text-gray-700">
          ← 管理画面
        </Link>
        <h1 className="text-2xl font-bold">全記事管理</h1>
        <span className="text-sm text-gray-400">({total}件)</span>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { value: "all", label: "全て" },
          { value: "published", label: "公開中" },
          { value: "draft", label: "下書き" },
          { value: "pending_review", label: "レビュー待ち" },
        ].map((f) => (
          <Link
            key={f.value}
            to={f.value === "all" ? "/admin/posts" : `/admin/posts?status=${f.value}`}
            className={`text-sm px-3 py-1.5 rounded-full no-underline ${
              status === f.value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="border rounded-lg divide-y">
        {posts.map((post) => {
          const st = STATUS_LABELS[post.status] || STATUS_LABELS.draft;
          return (
            <div key={post.id} className="flex items-center gap-4 px-4 py-3">
              <div className="text-xs text-gray-300 w-10">#{post.id}</div>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/dashboard/posts/${post.id}/edit`}
                  className="font-medium text-sm text-gray-900 no-underline hover:text-blue-600 truncate block"
                >
                  {post.title || "(無題)"}
                </Link>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {post.primary_category}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${st.className}`}>
                {st.label}
              </span>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {new Date(post.updated_at).toLocaleDateString("ja-JP")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
