import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Top page redirects to /share
  index("routes/home.tsx"),

  // Article listing
  route("share", "routes/share._index.tsx", { id: "share-index" }),

  // Static pages
  route("share/about", "routes/share.static.tsx", { id: "share-about" }),
  route("share/tos", "routes/share.static.tsx", { id: "share-tos" }),
  route("share/privacy", "routes/share.static.tsx", { id: "share-privacy" }),
  route("share/regal", "routes/share.static.tsx", { id: "share-regal" }),
  route("share/company", "routes/share.static.tsx", { id: "share-company" }),
  route("share/contact", "routes/share.static.tsx", { id: "share-contact" }),
  route("share/regist", "routes/share.static.tsx", { id: "share-regist" }),
  route("share/technique", "routes/share.static.tsx", { id: "share-technique" }),
  route("share/webmeeting", "routes/share.static.tsx", { id: "share-webmeeting" }),
  route("share/tapeokoshi", "routes/share.static.tsx", { id: "share-tapeokoshi" }),
  route("share/jirei", "routes/share.static.tsx", { id: "share-jirei" }),
  route("share/nagare", "routes/share.static.tsx", { id: "share-nagare" }),
  route("share/omitsumori", "routes/share.static.tsx", { id: "share-omitsumori" }),
  route("share/point", "routes/share.static.tsx", { id: "share-point" }),

  // Category listing
  route("share/category/:slug", "routes/share.category.$slug.tsx"),
  route("share/category/:slug/page/:page", "routes/share.category.$slug.page.$page.tsx"),

  // Tag listing
  route("share/tag/:slug", "routes/share.tag.$slug.tsx"),

  // Article page (must be after static pages to avoid conflicts)
  route("share/:category/:id", "routes/share.$category.$id.tsx"),

  // Sitemap
  route("sitemap.xml", "routes/sitemap[.]xml.tsx"),

  // Auth
  route("auth/login", "routes/auth.login.tsx"),
  route("auth/google", "routes/auth.google.tsx"),
  route("auth/google/callback", "routes/auth.google.callback.tsx"),
  route("auth/twitter", "routes/auth.twitter.tsx"),
  route("auth/twitter/callback", "routes/auth.twitter.callback.tsx"),
  route("auth/logout", "routes/auth.logout.tsx"),

  // Dashboard
  route("dashboard", "routes/dashboard._index.tsx"),
  route("dashboard/posts/new", "routes/dashboard.posts.new.tsx"),
  route("dashboard/posts/:id/edit", "routes/dashboard.posts.$id.edit.tsx"),
  route("dashboard/posts/:id/preview", "routes/dashboard.posts.$id.preview.tsx"),
] satisfies RouteConfig;
