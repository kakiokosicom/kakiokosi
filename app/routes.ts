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
] satisfies RouteConfig;
