import { data } from "react-router";
import type { Route } from "./+types/share.page.$page";
import { getPublishedPosts, POSTS_PER_PAGE } from "~/lib/db.server";
import { PostCard } from "~/components/post-card";
import { Pagination } from "~/components/pagination";
import { JsonLd } from "~/components/json-ld";
import { collectionPageSchema } from "~/lib/schema";

export async function loader({ params, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const page = parseInt(params.page, 10);
  if (isNaN(page) || page < 1) {
    throw data("ページが見つかりません", { status: 404 });
  }
  const { posts, total } = await getPublishedPosts(db, page);
  return { posts, total, totalPages: Math.ceil(total / POSTS_PER_PAGE), currentPage: page };
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  const page = loaderData?.currentPage ?? 1;
  const description = `書き起こし記事アーカイブ（${page}ページ目）`;
  const url = `https://kakiokosi.com/share/page/${page}`;
  return [
    { title: `書き起こし記事一覧 - ${page}ページ目 | 書き起こし.com` },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:title", content: `書き起こし.com - ${page}ページ目` },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:site_name", content: "書き起こし.com" },
    { property: "og:locale", content: "ja_JP" },
    { property: "og:image", content: "https://kakiokosi.com/images/default-og.png" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: "https://kakiokosi.com/images/default-og.png" },
  ];
}

export default function SharePagePaginated({ loaderData }: Route.ComponentProps) {
  const { posts, totalPages, currentPage, total } = loaderData;

  return (
    <section className="max-w-5xl mx-auto">
      <JsonLd data={collectionPageSchema({
        name: `書き起こし記事一覧 - ${currentPage}ページ目`,
        description: `書き起こし記事アーカイブ（${currentPage}ページ目）`,
        url: `https://kakiokosi.com/share/page/${currentPage}`,
        numberOfItems: total,
      })} />
      <header className="mb-16">
        <div className="inline-block bg-secondary-container px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-on-secondary-container mb-4 uppercase">
          書き起こしアーカイブ
        </div>
        <h1 className="font-serif text-5xl md:text-7xl font-black text-primary tracking-tight">
          書き起こし記事一覧
        </h1>
        <span className="inline-block mt-2 font-label text-sm text-on-surface-variant">
          {currentPage}ページ目
        </span>
        <div className="h-1 w-24 academic-gradient mt-6" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-on-surface-variant py-16 text-center text-lg">
          記事がまだありません。
        </p>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/share" />
    </section>
  );
}
