import { data } from "react-router";
import type { Route } from "./+types/share.static";
import { getPage } from "~/lib/db.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const url = new URL(request.url);
  const slug = url.pathname.replace(/^\/share\//, "").replace(/\/$/, "");
  const page = await getPage(db, slug);
  if (!page) {
    throw data("ページが見つかりません", { status: 404 });
  }
  return { page };
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  const title = loaderData?.page?.title ?? "ページ";
  return [{ title: `${title} | 書き起こし.com` }];
}

export default function StaticPage({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;

  return (
    <section className="max-w-3xl mx-auto">
      <header className="mb-12">
        <h1 className="font-serif text-4xl font-black text-primary mb-4">
          {page.title}
        </h1>
        <div className="h-1 w-16 academic-gradient" />
      </header>
      <div
        className="static-content"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </section>
  );
}
