import { Link } from "react-router";
import type { Route } from "./+types/admin._index";
import { requireRole } from "~/lib/require-auth.server";
import { getPendingReviewPosts, getAllPostsAdmin, getAllUsers } from "~/lib/db-admin.server";

export function meta() {
  return [{ title: "管理画面 | 書き起こし.com" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  await requireRole(request, db, ["admin", "editor"]);

  const [pending, all, users] = await Promise.all([
    getPendingReviewPosts(db),
    getAllPostsAdmin(db),
    getAllUsers(db),
  ]);

  return { pending, allPosts: all, users };
}

export default function AdminIndex({ loaderData }: Route.ComponentProps) {
  const { pending, allPosts, users } = loaderData;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">管理画面</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="border rounded-lg p-6">
          <div className="text-3xl font-bold">{allPosts.total}</div>
          <div className="text-sm text-gray-500 mt-1">全記事数</div>
        </div>
        <div className="border rounded-lg p-6">
          <div className="text-3xl font-bold text-yellow-600">{pending.length}</div>
          <div className="text-sm text-gray-500 mt-1">レビュー待ち</div>
          {pending.length > 0 && (
            <Link to="/admin/review" className="text-sm text-blue-600 no-underline mt-2 block">
              確認する →
            </Link>
          )}
        </div>
        <div className="border rounded-lg p-6">
          <div className="text-3xl font-bold">{users.length}</div>
          <div className="text-sm text-gray-500 mt-1">ユーザー数</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/review"
          className="border rounded-lg p-6 no-underline text-gray-900 hover:border-gray-400 transition-colors"
        >
          <h2 className="text-lg font-medium">レビュー管理</h2>
          <p className="text-sm text-gray-500 mt-1">投稿の承認・差し戻し</p>
        </Link>
        <Link
          to="/admin/users"
          className="border rounded-lg p-6 no-underline text-gray-900 hover:border-gray-400 transition-colors"
        >
          <h2 className="text-lg font-medium">ユーザー管理</h2>
          <p className="text-sm text-gray-500 mt-1">ロール変更・一覧</p>
        </Link>
        <Link
          to="/admin/posts"
          className="border rounded-lg p-6 no-underline text-gray-900 hover:border-gray-400 transition-colors"
        >
          <h2 className="text-lg font-medium">全記事管理</h2>
          <p className="text-sm text-gray-500 mt-1">全記事の一覧・編集</p>
        </Link>
      </div>
    </div>
  );
}
