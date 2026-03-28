import { Link } from "react-router";
import type { Route } from "./+types/dashboard.posts.$id.preview";
import { requireAuth } from "~/lib/require-auth.server";
import { getPostForEdit, getPostForEditAdmin } from "~/lib/db-dashboard.server";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `プレビュー: ${data?.post?.title || ""} | 書き起こし.com` },
    { name: "robots", content: "noindex, nofollow" },
  ];
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

  return { post };
}

export default function PreviewPost({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
        <span className="text-sm text-yellow-700">プレビュー表示</span>
        <Link
          to={`/dashboard/posts/${post.id}/edit`}
          className="text-sm text-yellow-700 no-underline hover:text-yellow-900"
        >
          編集に戻る
        </Link>
      </div>

      <article>
        <h1 className="text-3xl font-bold leading-tight mb-4">{post.title}</h1>
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
