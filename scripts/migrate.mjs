#!/usr/bin/env node
/**
 * WordPress MySQL dump → D1 SQLite migration script
 *
 * Usage:
 *   node scripts/migrate.mjs \
 *     --sql /tmp/var/backup_mysql/share_kakiokosi_20240709.sql \
 *     --sitemap /tmp/kakiokosi_files/kakiokosi_sitemap.csv \
 *     --out migrations/0002_seed.sql
 */

import { readFileSync, writeFileSync } from "fs";
import { argv } from "process";

// Parse CLI args
const args = {};
for (let i = 2; i < argv.length; i += 2) {
  args[argv[i].replace(/^--/, "")] = argv[i + 1];
}

const sqlPath = args.sql;
const sitemapPath = args.sitemap;
const outPath = args.out || "migrations/0002_seed.sql";

console.log("Reading MySQL dump...");
const sqlContent = readFileSync(sqlPath, "utf-8");

console.log("Reading sitemap CSV...");
const sitemapContent = readFileSync(sitemapPath, "utf-8");

// ─── Parse sitemap for primary_category mapping ───
const primaryCategoryMap = new Map(); // post_id -> primary_category_slug
const sitemapLines = sitemapContent.trim().split("\n").slice(1); // skip header
for (const line of sitemapLines) {
  const parts = line.split(",");
  const url = parts[0];
  const postId = parts[1];
  const category = parts[2];
  const isPrimary = parts[parts.length - 1].trim();
  if (postId && isPrimary === "True" && category !== "page") {
    primaryCategoryMap.set(parseInt(postId), category);
  }
}
console.log(`Sitemap: ${primaryCategoryMap.size} primary category mappings`);

// ─── Parse MySQL INSERT statements ───

function parseInsert(sql, tableName) {
  const marker = `INSERT INTO \`${tableName}\` VALUES `;
  const rows = [];
  let searchFrom = 0;
  while (true) {
    const idx = sql.indexOf(marker, searchFrom);
    if (idx === -1) break;
    // Find the end of this INSERT statement - must track string context
    let i = idx + marker.length;
    let inStr = false;
    let escape = false;
    while (i < sql.length) {
      const ch = sql[i];
      if (escape) {
        escape = false;
        i++;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        i++;
        continue;
      }
      if (ch === "'") {
        inStr = !inStr;
        i++;
        continue;
      }
      if (!inStr && ch === ";") {
        break;
      }
      i++;
    }
    const valuesStr = sql.substring(idx + marker.length, i);
    parseValuesInto(rows, valuesStr);
    searchFrom = i + 1;
  }
  return rows;
}

function parseValuesInto(rows, valuesStr) {
  let current = "";
  let depth = 0;
  let inStr = false;
  let escape = false;

  for (let i = 0; i < valuesStr.length; i++) {
    const ch = valuesStr[i];
    if (escape) {
      current += ch;
      escape = false;
      continue;
    }
    if (ch === "\\") {
      current += ch;
      escape = true;
      continue;
    }
    if (ch === "'" && !escape) {
      inStr = !inStr;
      current += ch;
      continue;
    }
    if (inStr) {
      current += ch;
      continue;
    }
    if (ch === "(") {
      if (depth === 0) {
        current = "";
      } else {
        current += ch;
      }
      depth++;
      continue;
    }
    if (ch === ")") {
      depth--;
      if (depth === 0) {
        rows.push(parseRow(current));
      } else {
        current += ch;
      }
      continue;
    }
    if (depth > 0) {
      current += ch;
    }
  }
}

function parseRow(rowStr) {
  const fields = [];
  let current = "";
  let inStr = false;
  let escape = false;

  for (let i = 0; i < rowStr.length; i++) {
    const ch = rowStr[i];
    if (escape) {
      current += ch;
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      // Don't add backslash, handle escape sequences
      const next = rowStr[i + 1];
      if (next === "'") {
        current += "'";
        i++;
      } else if (next === "\\") {
        current += "\\";
        i++;
      } else if (next === "n") {
        current += "\n";
        i++;
      } else if (next === "r") {
        current += "\r";
        i++;
      } else if (next === "t") {
        current += "\t";
        i++;
      } else if (next === "0") {
        current += "\0";
        i++;
      } else if (next === '"') {
        current += '"';
        i++;
      } else {
        current += ch;
      }
      escape = false;
      continue;
    }
    if (ch === "'" && !inStr) {
      inStr = true;
      continue;
    }
    if (ch === "'" && inStr) {
      inStr = false;
      continue;
    }
    if (ch === "," && !inStr) {
      fields.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  fields.push(current);
  return fields;
}

// ─── Extract data ───

console.log("Parsing shr_terms...");
const terms = parseInsert(sqlContent, "shr_terms");
const termMap = new Map(); // term_id -> { name, slug }
for (const row of terms) {
  const id = parseInt(row[0]);
  const name = row[1];
  let slug = row[2];
  // Decode URL-encoded slugs
  try {
    slug = decodeURIComponent(slug);
  } catch {}
  termMap.set(id, { name, slug });
}
console.log(`  ${termMap.size} terms`);

console.log("Parsing shr_term_taxonomy...");
const termTaxonomy = parseInsert(sqlContent, "shr_term_taxonomy");
const taxonomyMap = new Map(); // term_taxonomy_id -> { termId, taxonomy }
const categoryTermIds = new Set(); // term_ids that are categories
const tagTermIds = new Set(); // term_ids that are tags

for (const row of termTaxonomy) {
  const ttId = parseInt(row[0]);
  const termId = parseInt(row[1]);
  const taxonomy = row[2];
  taxonomyMap.set(ttId, { termId, taxonomy });
  if (taxonomy === "category") categoryTermIds.add(termId);
  if (taxonomy === "post_tag") tagTermIds.add(termId);
}

console.log("Parsing shr_term_relationships...");
const termRelationships = parseInsert(sqlContent, "shr_term_relationships");
// Build post -> categories/tags mapping
const postCategories = new Map(); // post_id -> [category_slugs]
const postTags = new Map(); // post_id -> [tag_slugs]

for (const row of termRelationships) {
  const objectId = parseInt(row[0]);
  const ttId = parseInt(row[1]);
  const tt = taxonomyMap.get(ttId);
  if (!tt) continue;
  const term = termMap.get(tt.termId);
  if (!term) continue;

  if (tt.taxonomy === "category") {
    if (!postCategories.has(objectId)) postCategories.set(objectId, []);
    postCategories.get(objectId).push(term.slug);
  } else if (tt.taxonomy === "post_tag") {
    if (!postTags.has(objectId)) postTags.set(objectId, []);
    postTags.get(objectId).push(term.slug);
  }
}

console.log("Parsing shr_posts...");
const posts = parseInsert(sqlContent, "shr_posts");
console.log(`  ${posts.length} total rows in shr_posts`);

// WP shr_posts columns:
// 0:ID, 1:post_author, 2:post_date, 3:post_date_gmt, 4:post_content,
// 5:post_title, 6:post_excerpt, 7:post_status, 8:comment_status,
// 9:ping_status, 10:post_password, 11:post_name, 12:to_ping, 13:pinged,
// 14:post_modified, 15:post_modified_gmt, 16:post_content_filtered,
// 17:post_parent, 18:guid, 19:menu_order, 20:post_type,
// 21:post_mime_type, 22:comment_count

// Filter published posts and pages
const publishedPosts = [];
const publishedPages = [];

for (const row of posts) {
  const id = parseInt(row[0]);
  const postType = row[20];
  const postStatus = row[7];

  if (postStatus !== "publish") continue;

  if (postType === "post") {
    const cats = postCategories.get(id) || [];
    let primaryCat = primaryCategoryMap.get(id);
    if (!primaryCat && cats.length > 0) {
      primaryCat = cats[0];
    }
    if (!primaryCat) {
      console.warn(`  Warning: Post ${id} has no category, skipping`);
      continue;
    }

    publishedPosts.push({
      id,
      title: row[5],
      content: row[4],
      excerpt: row[6],
      primary_category: primaryCat,
      published_at: row[3], // GMT
      created_at: row[3],
      updated_at: row[15], // modified_gmt
      categories: cats,
      tags: postTags.get(id) || [],
    });
  } else if (postType === "page") {
    publishedPages.push({
      id,
      slug: row[11],
      title: row[5],
      content: row[4],
      created_at: row[3],
      updated_at: row[15],
    });
  }
}

console.log(`Published posts: ${publishedPosts.length}`);
console.log(`Published pages: ${publishedPages.length}`);

// ─── Collect unique categories and tags ───

// Known category slugs from the data
const knownCategories = new Map();
for (const termId of categoryTermIds) {
  const term = termMap.get(termId);
  if (term) {
    knownCategories.set(term.slug, term.name);
  }
}

const knownTags = new Map();
for (const termId of tagTermIds) {
  const term = termMap.get(termId);
  if (term) {
    knownTags.set(term.slug, term.name);
  }
}

// Only include categories/tags that are actually used
const usedCategorySlugs = new Set();
const usedTagSlugs = new Set();
for (const p of publishedPosts) {
  usedCategorySlugs.add(p.primary_category);
  for (const c of p.categories) usedCategorySlugs.add(c);
  for (const t of p.tags) usedTagSlugs.add(t);
}

// ─── Generate SQL output ───

function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  return "'" + str.replace(/'/g, "''") + "'";
}

const lines = [];
lines.push("-- Auto-generated seed data from WordPress migration");
lines.push("-- Generated: " + new Date().toISOString());
lines.push("");

// Categories
lines.push("-- Categories");
let catId = 1;
for (const slug of usedCategorySlugs) {
  const name = knownCategories.get(slug) || slug;
  lines.push(
    `INSERT INTO categories (id, name, slug) VALUES (${catId}, ${escapeSql(name)}, ${escapeSql(slug)});`
  );
  catId++;
}
lines.push("");

// Tags
lines.push("-- Tags");
let tagId = 1;
for (const slug of usedTagSlugs) {
  const name = knownTags.get(slug) || slug;
  lines.push(
    `INSERT INTO tags (id, name, slug) VALUES (${tagId}, ${escapeSql(name)}, ${escapeSql(slug)});`
  );
  tagId++;
}
lines.push("");

// Posts
lines.push("-- Posts");
for (const p of publishedPosts) {
  lines.push(
    `INSERT INTO posts (id, title, content, excerpt, status, primary_category, published_at, created_at, updated_at) VALUES (${p.id}, ${escapeSql(p.title)}, ${escapeSql(p.content)}, ${escapeSql(p.excerpt)}, 'published', ${escapeSql(p.primary_category)}, ${escapeSql(p.published_at)}, ${escapeSql(p.created_at)}, ${escapeSql(p.updated_at)});`
  );
}
lines.push("");

// Post-category relationships
lines.push("-- Post-Category relationships");
for (const p of publishedPosts) {
  for (const cat of p.categories) {
    lines.push(
      `INSERT INTO post_categories (post_id, category_slug) VALUES (${p.id}, ${escapeSql(cat)});`
    );
  }
}
lines.push("");

// Post-tag relationships
lines.push("-- Post-Tag relationships");
for (const p of publishedPosts) {
  for (const tag of p.tags) {
    lines.push(
      `INSERT INTO post_tags (post_id, tag_slug) VALUES (${p.id}, ${escapeSql(tag)});`
    );
  }
}
lines.push("");

// Pages
lines.push("-- Static Pages");
for (const p of publishedPages) {
  lines.push(
    `INSERT INTO pages (id, slug, title, content, created_at, updated_at) VALUES (${p.id}, ${escapeSql(p.slug)}, ${escapeSql(p.title)}, ${escapeSql(p.content)}, ${escapeSql(p.created_at)}, ${escapeSql(p.updated_at)});`
  );
}
lines.push("");

// Set auto-increment sequence to continue from WP's max
const maxPostId = Math.max(...publishedPosts.map((p) => p.id), 987);
lines.push("-- Set auto-increment to continue from WP sequence");
lines.push(
  `INSERT INTO sqlite_sequence (name, seq) VALUES ('posts', ${maxPostId});`
);

const output = lines.join("\n");
writeFileSync(outPath, output, "utf-8");
console.log(`\nMigration SQL written to: ${outPath}`);
console.log(`  ${usedCategorySlugs.size} categories`);
console.log(`  ${usedTagSlugs.size} tags`);
console.log(`  ${publishedPosts.length} posts`);
console.log(`  ${publishedPages.length} pages`);
