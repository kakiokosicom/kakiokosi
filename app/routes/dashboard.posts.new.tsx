import { redirect, Form } from "react-router";
import type { Route } from "./+types/dashboard.posts.new";
import { requireAuth } from "~/lib/require-auth.server";
import { createPost, managePostCategories } from "~/lib/db-dashboard.server";
import { getAllCategories } from "~/lib/db.server";

export function meta() {
  return [{ title: "新規投稿 | 書き起こし.com" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  await requireAuth(request, db);
  const categories = await getAllCategories(db);
  return { categories };
}

export async function action({ request, context }: Route.ActionArgs) {
  const db = context.cloudflare.env.DB;
  const { user } = await requireAuth(request, db);
  const form = await request.formData();

  const title = form.get("title") as string;
  const primaryCategory = form.get("primary_category") as string;

  if (!title || !primaryCategory) {
    return { error: "タイトルとカテゴリは必須です" };
  }

  const postId = await createPost(db, user.id, {
    title,
    content: "",
    excerpt: "",
    primary_category: primaryCategory,
  });

  await managePostCategories(db, postId, [primaryCategory]);

  return redirect(`/dashboard/posts/${postId}/edit`);
}

export default function NewPost({ loaderData, actionData }: Route.ComponentProps) {
  const { categories } = loaderData;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">新規投稿</h1>

      {actionData?.error && (
        <p className="text-red-600 text-sm mb-4">{actionData.error}</p>
      )}

      <Form method="post" className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル
          </label>
          <input
            type="text"
            name="title"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="記事のタイトル"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリ
          </label>
          <select
            name="primary_category"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">選択してください</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800"
        >
          作成して編集
        </button>
      </Form>
    </div>
  );
}
