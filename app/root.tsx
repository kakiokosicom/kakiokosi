import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  Form,
} from "react-router";

import type { Route } from "./+types/root";
import { getCurrentUser, type SessionUser } from "./lib/auth.server";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap",
  },
];

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const result = await getCurrentUser(db, request);
  return { user: result?.user ?? null };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-white text-gray-900 font-sans min-h-screen">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function Header({ user }: { user: SessionUser | null }) {
  return (
    <header className="border-b border-gray-200">
      <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/share" className="text-xl font-bold text-gray-900 no-underline">
          書き起こし.com
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <div className="hidden md:flex gap-4">
            <Link to="/share/category/business" className="text-gray-600 hover:text-gray-900 no-underline">ビジネス</Link>
            <Link to="/share/category/politics" className="text-gray-600 hover:text-gray-900 no-underline">政治</Link>
            <Link to="/share/category/society" className="text-gray-600 hover:text-gray-900 no-underline">社会</Link>
            <Link to="/share/category/world" className="text-gray-600 hover:text-gray-900 no-underline">海外</Link>
            <Link to="/share/category/it" className="text-gray-600 hover:text-gray-900 no-underline">IT</Link>
            <Link to="/share/category/entertainment" className="text-gray-600 hover:text-gray-900 no-underline">エンタメ</Link>
          </div>
          {user ? (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
              {user.avatar_url && (
                <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
              )}
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 no-underline">
                ダッシュボード
              </Link>
              <Form method="post" action="/auth/logout">
                <button type="submit" className="text-gray-400 hover:text-gray-600 text-xs">
                  ログアウト
                </button>
              </Form>
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="ml-4 pl-4 border-l border-gray-200 text-gray-600 hover:text-gray-900 no-underline"
            >
              ログイン
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Header user={loaderData.user} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
          <div className="flex justify-center gap-4 mb-4">
            <Link to="/share/about" className="text-gray-500 hover:text-gray-700 no-underline">サイトについて</Link>
            <Link to="/share/tos" className="text-gray-500 hover:text-gray-700 no-underline">利用規約</Link>
            <Link to="/share/privacy" className="text-gray-500 hover:text-gray-700 no-underline">プライバシーポリシー</Link>
            <Link to="/share/contact" className="text-gray-500 hover:text-gray-700 no-underline">お問い合わせ</Link>
          </div>
          <p>&copy; 書き起こし.com</p>
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
    <div className="pt-16 p-4">
      <h1 className="text-2xl font-bold">{message}</h1>
      <p className="mt-2">{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto mt-4 bg-gray-100 rounded">
          <code>{stack}</code>
        </pre>
      )}
    </div>
  );
}
