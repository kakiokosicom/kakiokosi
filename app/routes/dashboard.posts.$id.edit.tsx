import { Form, Link, useFetcher } from "react-router";
import { useRef, useCallback, useEffect, useState } from "react";
import type { Route } from "./+types/dashboard.posts.$id.edit";
import { requireAuth } from "~/lib/require-auth.server";
import {
  getPostForEdit,
  getPostForEditAdmin,
  updatePost,
  publishPost,
  deletePost,
  submitForReview,
  managePostCategories,
} from "~/lib/db-dashboard.server";
import { getAllCategories } from "~/lib/db.server";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: `${data?.post?.title || "編集"} | 書き起こし.com` }];
}

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const { user } = await requireAuth(request, db);
  const postId = parseInt(params.id, 10);

  let post;
  if (user.role === "admin" || user.role === "editor") {
    post = await getPostForEditAdmin(db, postId);
  } else {
    post = await getPostForEdit(db, postId, user.id);
  }

  if (!post) {
    throw new Response("投稿が見つかりません", { status: 404 });
  }

  const categories = await getAllCategories(db);
  return { post, categories, user };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const db = context.cloudflare.env.DB;
  const { user } = await requireAuth(request, db);
  const postId = parseInt(params.id, 10);
  const form = await request.formData();
  const intent = form.get("_intent") as string;

  if (intent === "save") {
    const title = form.get("title") as string;
    const content = form.get("content") as string;
    const excerpt = form.get("excerpt") as string;
    const primaryCategory = form.get("primary_category") as string;

    await updatePost(db, postId, user.id, {
      title,
      content,
      excerpt,
      primary_category: primaryCategory,
    });

    if (primaryCategory) {
      await managePostCategories(db, postId, [primaryCategory]);
    }

    return { saved: true, timestamp: new Date().toISOString() };
  }

  if (intent === "submit") {
    await submitForReview(db, postId, user.id);
    return { submitted: true };
  }

  if (intent === "publish") {
    if (user.role !== "admin" && user.role !== "editor") {
      return { error: "公開権限がありません" };
    }
    await publishPost(db, postId);
    const post = await getPostForEditAdmin(db, postId);
    if (post) {
      return Response.redirect(
        `${new URL(request.url).origin}/share/${post.primary_category}/${post.id}`,
        302
      );
    }
    return { published: true };
  }

  if (intent === "delete") {
    await deletePost(db, postId, user.id);
    return Response.redirect(
      `${new URL(request.url).origin}/dashboard`,
      302
    );
  }

  return null;
}

export default function EditPost({ loaderData }: Route.ComponentProps) {
  const { post, categories, user } = loaderData;
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const isAdmin = user.role === "admin" || user.role === "editor";

  // Auto-save indicator
  useEffect(() => {
    if (fetcher.data && "saved" in fetcher.data && fetcher.data.saved) {
      setLastSaved(
        new Date().toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  }, [fetcher.data]);

  const handleAutoSave = useCallback(() => {
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      formData.set("_intent", "save");
      fetcher.submit(formData, { method: "post" });
    }
  }, [fetcher]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(handleAutoSave, 30000);
    return () => clearInterval(interval);
  }, [handleAutoSave]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-sm text-gray-500 no-underline hover:text-gray-700">
            ← ダッシュボード
          </Link>
          {lastSaved && (
            <span className="text-xs text-gray-400">
              保存済み {lastSaved}
            </span>
          )}
          {fetcher.state === "submitting" && (
            <span className="text-xs text-gray-400">保存中...</span>
          )}
        </div>
        <Link
          to={`/dashboard/posts/${post.id}/preview`}
          className="text-sm text-gray-500 no-underline hover:text-gray-700"
        >
          プレビュー
        </Link>
      </div>

      <fetcher.Form ref={formRef} method="post" className="space-y-6">
        <div>
          <input
            type="text"
            name="title"
            defaultValue={post.title}
            className="w-full text-2xl font-bold border-0 border-b border-gray-200 pb-2 focus:outline-none focus:border-gray-900"
            placeholder="タイトル"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ
            </label>
            <select
              name="primary_category"
              defaultValue={post.primary_category}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              抜粋
            </label>
            <input
              type="text"
              name="excerpt"
              defaultValue={post.excerpt}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="記事の概要（省略可）"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            本文
          </label>
          <textarea
            name="content"
            defaultValue={post.content}
            rows={20}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
            placeholder="記事の本文（HTML対応）"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            name="_intent"
            value="save"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800"
          >
            保存
          </button>

          {post.status === "draft" && !isAdmin && (
            <button
              type="submit"
              name="_intent"
              value="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              レビューに提出
            </button>
          )}

          {isAdmin && (post.status === "draft" || post.status === "pending_review") && (
            <button
              type="submit"
              name="_intent"
              value="publish"
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              公開
            </button>
          )}

          {post.status === "draft" && (
            <button
              type="submit"
              name="_intent"
              value="delete"
              className="px-4 py-2 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-50 ml-auto"
              onClick={(e) => {
                if (!confirm("この下書きを削除しますか？")) e.preventDefault();
              }}
            >
              削除
            </button>
          )}
        </div>
      </fetcher.Form>
    </div>
  );
}
