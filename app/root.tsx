import { useState } from "react";
import { Icon } from "./components/icon";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  Form,
  useLocation,
} from "react-router";

import type { Route } from "./+types/root";
import { getCurrentUser, type SessionUser } from "./lib/auth.server";
import "./app.css";

const CATEGORIES = [
  { slug: "business", label: "ビジネス" },
  { slug: "politics", label: "政治" },
  { slug: "society", label: "社会" },
  { slug: "world", label: "海外" },
  { slug: "it", label: "IT" },
  { slug: "entertainment", label: "エンタメ" },
];

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@700;900&family=Work+Sans:wght@400;600;700&family=Noto+Sans+JP:wght@400;700&display=swap",
  },
  {
    rel: "alternate",
    type: "application/rss+xml",
    title: "書き起こし.com RSS",
    href: "https://kakiokosi.com/share/feed.xml",
  },
];

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const result = await getCurrentUser(db, request);
  return { user: result?.user ?? null };
}

const GLOBAL_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "書き起こし.com",
      url: "https://kakiokosi.com",
      description:
        "講演・インタビュー・スピーチの書き起こし記事を共有するサイト",
      inLanguage: "ja",
    },
    {
      "@type": "Organization",
      "@id": "https://kakiokosi.com/#organization",
      name: "書き起こし.com",
      url: "https://kakiokosi.com",
      description:
        "講演・インタビュー・スピーチの書き起こし記事を共有するサイト",
      foundingDate: "2011",
      logo: {
        "@type": "ImageObject",
        url: "https://kakiokosi.com/images/default-og.png",
        width: 1200,
        height: 630,
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "道玄坂1丁目10番8号 渋谷道玄坂東急ビル2F-C",
        addressLocality: "渋谷区",
        addressRegion: "東京都",
        postalCode: "150-0043",
        addressCountry: "JP",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "info@kakiokosi.com",
        availableLanguage: "Japanese",
      },
      sameAs: [
        "https://x.com/kakiokosi",
        "https://x.com/paji_a",
        "https://note.com/hajimeataka",
      ],
    },
  ],
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            ...GLOBAL_JSON_LD,
            "@graph": GLOBAL_JSON_LD["@graph"].map((item) =>
              item["@type"] === "WebSite"
                ? { ...item, dateModified: new Date().toISOString().split("T")[0] }
                : item
            ),
          }) }}
        />
        <script src="https://analytics.ahrefs.com/analytics.js" data-key="aaFaPDyRTwlvToTCpke9pg" async />
        <script dangerouslySetInnerHTML={{ __html: `(function(){var u=navigator.userAgent||"";var bots=["ChatGPT-User","OAI-SearchBot","GPTBot","Google-Extended","PerplexityBot","ClaudeBot","Applebot-Extended","CCBot","cohere-ai","Bytespider","anthropic-ai","Google-Agent"];var m=bots.find(function(b){return u.indexOf(b)!==-1});if(m){document.documentElement.dataset.aiBot=m}})();` }} />
      </head>
      <body className="bg-surface text-on-surface font-sans">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function Header({ user }: { user: SessionUser | null }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeCategory = CATEGORIES.find(
    (c) =>
      location.pathname === `/share/category/${c.slug}` ||
      location.pathname.startsWith(`/share/category/${c.slug}/`) ||
      location.pathname.startsWith(`/share/${c.slug}/`)
  );

  return (
    <nav className="sticky top-0 z-50 glass-nav shadow-[0_1px_0_0_rgb(196_198_205/0.15)]">
      <div className="flex justify-between items-center px-6 md:px-8 py-4 w-full max-w-7xl mx-auto">
        <Link
          to="/share"
          className="font-serif text-2xl font-black text-primary no-underline"
        >
          書き起こし.com
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/share/category/${cat.slug}`}
              className={`font-serif font-bold text-lg no-underline transition-colors duration-300 ${
                activeCategory?.slug === cat.slug
                  ? "text-secondary border-b-2 border-secondary pb-1"
                  : "text-primary/80 hover:text-secondary"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="メニュー"
            aria-expanded={mobileMenuOpen}
          >
            <Icon name={mobileMenuOpen ? "close" : "menu"} className="w-6 h-6" />
          </button>
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              {user.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt=""
                  className="w-7 h-7 rounded-full"
                  referrerPolicy="no-referrer"
                />
              )}
              <Link
                to="/dashboard"
                className="text-sm text-on-surface-variant hover:text-secondary no-underline transition-colors"
              >
                Dashboard
              </Link>
              <Form method="post" action="/auth/logout">
                <button
                  type="submit"
                  className="text-xs text-outline hover:text-secondary transition-colors"
                >
                  Logout
                </button>
              </Form>
            </div>
          ) : null}
        </div>
      </div>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/20 bg-surface px-6 py-4">
          <div className="flex flex-col gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/share/category/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-serif font-bold text-lg no-underline py-2 ${
                  activeCategory?.slug === cat.slug
                    ? "text-secondary"
                    : "text-primary/80"
                }`}
              >
                {cat.label}
              </Link>
            ))}
            {user && (
              <>
                <hr className="border-outline-variant/20" />
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-on-surface-variant no-underline py-2"
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Header user={loaderData.user} />
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <Outlet />
      </main>
      <footer className="academic-gradient text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col items-center gap-12">
          <div className="font-serif text-3xl font-black">書き起こし.com</div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            <Link
              to="/share/about"
              className="font-label text-xs uppercase tracking-widest text-white/60 hover:text-secondary no-underline transition-all"
            >
              サイトについて
            </Link>
            <Link
              to="/share/tos"
              className="font-label text-xs uppercase tracking-widest text-white/60 hover:text-secondary no-underline transition-all"
            >
              利用規約
            </Link>
            <Link
              to="/share/privacy"
              className="font-label text-xs uppercase tracking-widest text-white/60 hover:text-secondary no-underline transition-all"
            >
              プライバシーポリシー
            </Link>
            <Link
              to="/share/contact"
              className="font-label text-xs uppercase tracking-widest text-white/60 hover:text-secondary no-underline transition-all"
            >
              お問い合わせ
            </Link>
            <Link
              to="/share/company"
              className="font-label text-xs uppercase tracking-widest text-white/60 hover:text-secondary no-underline transition-all"
            >
              運営情報
            </Link>
            <Link
              to="/share/regal"
              className="font-label text-xs uppercase tracking-widest text-white/60 hover:text-secondary no-underline transition-all"
            >
              特定商取引法
            </Link>
          </div>
          <form
            action="https://www.google.com/search"
            method="get"
            // @ts-expect-error WebMCP attributes
            toolname="search_articles"
            tooldescription="書き起こし.comの記事をキーワードで検索します"
            className="w-full max-w-md"
          >
            <input type="hidden" name="sitesearch" value="kakiokosi.com" />
            <div className="flex gap-2">
              <input
                type="search"
                name="q"
                placeholder="記事を検索..."
                className="flex-1 px-4 py-2 rounded-full bg-white/10 text-white placeholder-white/40 border border-white/20 text-sm focus:outline-none focus:border-secondary"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-secondary text-on-secondary text-sm font-bold hover:bg-secondary/90 transition-colors"
              >
                検索
              </button>
            </div>
          </form>
          <div className="h-[1px] w-1/4 bg-primary-container" />
          <div className="text-center text-white/30 text-[10px] leading-relaxed">
            <p>運営: 株式会社ユリカ（YURIKA, K.K.）</p>
            <p>〒150-0043 東京都渋谷区道玄坂1丁目10番8号 渋谷道玄坂東急ビル2F-C</p>
          </div>
          <p className="font-label text-[10px] uppercase tracking-widest text-white/40">
            &copy; 2011–{new Date().getFullYear()} 書き起こし.com. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "エラー";
  let details = "予期せぬエラーが発生しました。";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "エラー";
    details =
      error.status === 404
        ? "ページが見つかりませんでした。"
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="max-w-3xl mx-auto pt-16 p-4">
      <h1 className="font-serif text-5xl font-black text-primary">{message}</h1>
      <p className="mt-4 text-on-surface-variant text-lg">{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto mt-8 bg-surface-container-low rounded-xl">
          <code className="text-sm">{stack}</code>
        </pre>
      )}
      <Link
        to="/share"
        className="inline-block mt-8 px-6 py-3 academic-gradient text-white font-label text-sm tracking-widest uppercase no-underline"
      >
        トップに戻る
      </Link>
    </div>
  );
}
