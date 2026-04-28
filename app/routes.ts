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
  route("share/kakiokoshi-toha", "routes/share.static.tsx", { id: "share-kakiokoshi-toha" }),
  route("share/mojikoshi-tool", "routes/share.static.tsx", { id: "share-mojikoshi-tool" }),
  route("share/gijiroku", "routes/share.static.tsx", { id: "share-gijiroku" }),
  route("share/meispeech", "routes/share.static.tsx", { id: "share-meispeech" }),
  route("share/interview-kakiokoshi", "routes/share.static.tsx", { id: "share-interview-kakiokoshi" }),
  route("share/ted-talks", "routes/share.static.tsx", { id: "share-ted-talks" }),
  route("share/mojikoshi-fukugyo", "routes/share.static.tsx", { id: "share-mojikoshi-fukugyo" }),
  route("share/presentation", "routes/share.static.tsx", { id: "share-presentation" }),
  route("share/kigyoka-meigen", "routes/share.static.tsx", { id: "share-kigyoka-meigen" }),
  route("share/ai-hatarakikata", "routes/share.static.tsx", { id: "share-ai-hatarakikata" }),
  route("share/seijika-enzetsu", "routes/share.static.tsx", { id: "share-seijika-enzetsu" }),
  route("share/captio-alternative-email-memo", "routes/share.static.tsx", { id: "share-captio-alternative-email-memo" }),
  route("share/tapeokoshi", "routes/share.static.tsx", { id: "share-tapeokoshi" }),
  route("share/jirei", "routes/share.static.tsx", { id: "share-jirei" }),
  route("share/nagare", "routes/share.static.tsx", { id: "share-nagare" }),
  route("share/omitsumori", "routes/share.static.tsx", { id: "share-omitsumori" }),
  route("share/point", "routes/share.static.tsx", { id: "share-point" }),

  // Pagination
  route("share/page/:page", "routes/share.page.$page.tsx"),

  // Category listing
  route("share/category/:slug", "routes/share.category.$slug.tsx"),
  route("share/category/:slug/page/:page", "routes/share.category.$slug.page.$page.tsx"),

  // Tag listing
  route("share/tag/:slug", "routes/share.tag.$slug.tsx"),

  // Article page (must be after static pages to avoid conflicts)
  route("share/:category/:id", "routes/share.$category.$id.tsx"),

  // RSS Feeds
  route("share/feed.xml", "routes/share.feed[.]xml.tsx"),
  route("share/category/:slug/feed.xml", "routes/share.category.$slug.feed[.]xml.tsx"),

  // Sitemap
  route("sitemap.xml", "routes/sitemap[.]xml.tsx"),

  // Auth
  route("auth/login", "routes/auth.login.tsx"),
  route("auth/google", "routes/auth.google.tsx"),
  route("auth/google/callback", "routes/auth.google.callback.tsx"),
route("auth/logout", "routes/auth.logout.tsx"),

  // Dashboard
  route("dashboard", "routes/dashboard._index.tsx"),
  route("dashboard/posts/new", "routes/dashboard.posts.new.tsx"),
  route("dashboard/posts/:id/edit", "routes/dashboard.posts.$id.edit.tsx"),
  route("dashboard/posts/:id/preview", "routes/dashboard.posts.$id.preview.tsx"),
  // AI API
  route("api/ai", "routes/api.ai.tsx"),

  // Admin
  route("admin", "routes/admin._index.tsx"),
  route("admin/review", "routes/admin.review.tsx"),
  route("admin/users", "routes/admin.users.tsx"),
  route("admin/posts", "routes/admin.posts.tsx"),
] satisfies RouteConfig;
