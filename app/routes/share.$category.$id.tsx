import { data, redirect, Link } from "react-router";
import type { Route } from "./+types/share.$category.$id";
import { getPost } from "~/lib/db.server";

export async function loader({ params, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    throw data("記事が見つかりません", { status: 404 });
  }

  const { post, categories, tags } = await getPost(db, id);
  if (!post) {
    throw data("記事が見つかりません", { status: 404 });
  }

  // Multi-category redirect: if accessed via non-primary category, 301 to canonical
  if (params.category !== post.primary_category) {
    return redirect(`/share/${post.primary_category}/${post.id}`, 301);
  }

  return { post, categories, tags };
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  if (!loaderData?.post) {
    return [{ title: "記事が見つかりません | 書き起こし.com" }];
  }
  const { post } = loaderData;
  return [
    { title: `${post.title} | 書き起こし.com` },
    { name: "description", content: post.excerpt || post.title },
    { property: "og:title", content: post.title },
    { property: "og:description", content: post.excerpt || post.title },
    { property: "og:type", content: "article" },
    ...(post.thumbnail_url
      ? [{ property: "og:image", content: post.thumbnail_url }]
      : []),
  ];
}

export default function ArticlePage({ loaderData }: Route.ComponentProps) {
  const { post, categories, tags } = loaderData;
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("ja-JP")
    : "";

  return (
    <article className="max-w-3xl mx-auto">
      <header className="mb-8">
        <div className="flex gap-2 mb-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/share/category/${cat.slug}`}
              className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 no-underline hover:bg-gray-200"
            >
              {cat.name}
            </Link>
          ))}
        </div>
        <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
        <time className="block mt-3 text-sm text-gray-400" dateTime={post.published_at ?? ""}>
          {date}
        </time>
      </header>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {tags.length > 0 && (
        <footer className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.slug}
                to={`/share/tag/${tag.slug}`}
                className="text-sm px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-gray-600 no-underline hover:bg-gray-100"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}
