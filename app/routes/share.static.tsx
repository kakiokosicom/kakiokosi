import { data } from "react-router";
import type { Route } from "./+types/share.static";
import { getPage } from "~/lib/db.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const url = new URL(request.url);
  // Extract slug from path: /share/about -> about
  const slug = url.pathname.replace(/^\/share\//, "").replace(/\/$/, "");
  const page = await getPage(db, slug);
  if (!page) {
    throw data("ページが見つかりません", { status: 404 });
  }
  return { page };
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  const title = loaderData?.page?.title ?? "ページ";
  return [
    { title: `${title} | 書き起こし.com` },
  ];
}

export default function StaticPage({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{page.title}</h1>
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
