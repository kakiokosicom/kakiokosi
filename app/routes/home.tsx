import { Link } from "react-router";
import type { Route } from "./+types/home";
import { getPublishedPosts, POSTS_PER_PAGE } from "~/lib/db.server";
import { PostCard } from "~/components/post-card";
import { Pagination } from "~/components/pagination";
import { JsonLd } from "~/components/json-ld";
import { collectionPageSchema } from "~/lib/schema";

export function meta() {
  const description =
    "講演・インタビュー・スピーチの書き起こし記事を共有するサイト。ビジネス、政治、社会、IT、エンターテイメントなど幅広いジャンルの書き起こしを掲載しています。";
  return [
    { title: "書き起こし.com — 講演・スピーチの書き起こし記事アーカイブ" },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: "https://kakiokosi.com/" },
    { property: "og:title", content: "書き起こし.com" },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://kakiokosi.com/" },
    { property: "og:site_name", content: "書き起こし.com" },
    { property: "og:locale", content: "ja_JP" },
    { property: "og:image", content: "https://kakiokosi.com/images/default-og.png" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "書き起こし.com" },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: "https://kakiokosi.com/images/default-og.png" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const { posts, total } = await getPublishedPosts(db, 1);
  return { posts, total, totalPages: Math.ceil(total / POSTS_PER_PAGE) };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { posts, totalPages, total } = loaderData;
  const featuredIdx = posts.slice(0, 5).findIndex((p) => p.thumbnail_url);
  const featured = featuredIdx >= 0 ? posts[featuredIdx] : posts[0];
  const rest = posts.filter((_, i) => i !== (featuredIdx >= 0 ? featuredIdx : 0));

  return (
    <section className="max-w-5xl mx-auto">
      <JsonLd data={collectionPageSchema({
        name: "書き起こし記事一覧",
        description: "講演・インタビュー・スピーチの書き起こし記事を共有するサイト",
        url: "https://kakiokosi.com/",
        numberOfItems: total,
      })} />
      <header className="mb-16">
        <div className="inline-block bg-secondary-container px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-on-secondary-container mb-4 uppercase">
          書き起こしアーカイブ
        </div>
        <h1 className="font-serif text-4xl md:text-6xl font-black text-primary tracking-tight">
          書き起こし記事一覧
        </h1>
        <p className="mt-6 text-on-surface-variant text-base md:text-lg leading-relaxed max-w-2xl">
          書き起こし.comは、2011年から運営している講演・インタビュー・スピーチの
          書き起こし専門メディアです。ビジネス、政治、社会、IT、エンターテイメントなど
          幅広いジャンルのトークを正確に文字に起こし、{total}本以上の記事として
          アーカイブしています。話し手の言葉をそのまま伝えることで、
          動画や音声では見つけにくい情報を検索・引用しやすい形で提供しています。
        </p>
        <div className="h-1 w-24 academic-gradient mt-6" />
      </header>

      {featured && <PostCard post={featured} featured />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        {rest.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-on-surface-variant py-16 text-center text-lg">
          記事がまだありません。
        </p>
      )}

      <Pagination currentPage={1} totalPages={totalPages} baseUrl="/share" />
    </section>
  );
}
