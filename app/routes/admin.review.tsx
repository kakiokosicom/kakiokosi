import { Form, Link } from "react-router";
import type { Route } from "./+types/admin.review";
import { requireRole } from "~/lib/require-auth.server";
import { getPendingReviewPosts, approvePost, rejectPost } from "~/lib/db-admin.server";

export function meta() {
  return [{ title: "レビュー管理 | 書き起こし.com" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  await requireRole(request, db, ["admin", "editor"]);
  const posts = await getPendingReviewPosts(db);
  return { posts };
}

export async function action({ request, context }: Route.ActionArgs) {
  const db = context.cloudflare.env.DB;
  await requireRole(request, db, ["admin", "editor"]);

  const form = await request.formData();
  const postId = parseInt(form.get("post_id") as string, 10);
  const intent = form.get("_intent") as string;

  if (intent === "approve") await approvePost(db, postId);
  if (intent === "reject") await rejectPost(db, postId);

  return { ok: true };
}

export default function AdminReview({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="text-sm text-gray-500 no-underline hover:text-gray-700">
          ← 管理画面
        </Link>
        <h1 className="text-2xl font-bold">レビュー待ち</h1>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-400 py-12 text-center">レビュー待ちの投稿はありません。</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/dashboard/posts/${post.id}/preview`}
                    className="font-medium text-gray-900 no-underline hover:text-blue-600"
                  >
                    {post.title || "(無題)"}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <span className="text-xs text-gray-400">
                    {new Date(post.updated_at).toLocaleDateString("ja-JP")}
                  </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Form method="post">
                    <input type="hidden" name="post_id" value={post.id} />
                    <button
                      type="submit"
                      name="_intent"
                      value="approve"
                      className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      承認
                    </button>
                  </Form>
                  <Form method="post">
                    <input type="hidden" name="post_id" value={post.id} />
                    <button
                      type="submit"
                      name="_intent"
                      value="reject"
                      className="px-3 py-1.5 border border-red-200 text-red-600 rounded text-sm hover:bg-red-50"
                    >
                      差し戻し
                    </button>
                  </Form>
                  <Link
                    to={`/dashboard/posts/${post.id}/edit`}
                    className="px-3 py-1.5 border rounded text-sm text-gray-600 no-underline hover:bg-gray-50"
                  >
                    編集
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
