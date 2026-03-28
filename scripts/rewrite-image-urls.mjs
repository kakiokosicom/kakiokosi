#!/usr/bin/env node
/**
 * Rewrites image URLs in the seed SQL and local/remote DBs.
 * Changes: https?://(www.)?kakiokosi.com/share/contents/uploads/...
 *      To: /uploads/...
 *
 * Usage: node scripts/rewrite-image-urls.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

// Pattern to match old upload URLs
const pattern = /https?:\/\/(?:www\.)?kakiokosi\.com\/share\/contents\/uploads\//g;
const replacement = "/uploads/";

// 1. Rewrite seed SQL
console.log("Rewriting migrations/0002_seed.sql...");
let seedSql = readFileSync("migrations/0002_seed.sql", "utf-8");
const seedMatches = (seedSql.match(pattern) || []).length;
seedSql = seedSql.replace(pattern, replacement);
writeFileSync("migrations/0002_seed.sql", seedSql);
console.log(`  ${seedMatches} URLs rewritten in seed SQL`);

// 2. Rewrite local SQLite DB
console.log("\nRewriting local DB...");
const localDb = "/tmp/kakiokosi_d1.db";
try {
  // Update posts
  execSync(`sqlite3 ${localDb} "UPDATE posts SET content = REPLACE(content, 'https://kakiokosi.com/share/contents/uploads/', '/uploads/') WHERE content LIKE '%kakiokosi.com/share/contents/uploads/%';"`, { stdio: "pipe" });
  execSync(`sqlite3 ${localDb} "UPDATE posts SET content = REPLACE(content, 'http://kakiokosi.com/share/contents/uploads/', '/uploads/') WHERE content LIKE '%kakiokosi.com/share/contents/uploads/%';"`, { stdio: "pipe" });
  execSync(`sqlite3 ${localDb} "UPDATE posts SET content = REPLACE(content, 'https://www.kakiokosi.com/share/contents/uploads/', '/uploads/') WHERE content LIKE '%www.kakiokosi.com/share/contents/uploads/%';"`, { stdio: "pipe" });
  execSync(`sqlite3 ${localDb} "UPDATE posts SET content = REPLACE(content, 'http://www.kakiokosi.com/share/contents/uploads/', '/uploads/') WHERE content LIKE '%www.kakiokosi.com/share/contents/uploads/%';"`, { stdio: "pipe" });

  // Update pages
  execSync(`sqlite3 ${localDb} "UPDATE pages SET content = REPLACE(content, 'https://kakiokosi.com/share/contents/uploads/', '/uploads/') WHERE content LIKE '%kakiokosi.com/share/contents/uploads/%';"`, { stdio: "pipe" });
  execSync(`sqlite3 ${localDb} "UPDATE pages SET content = REPLACE(content, 'http://kakiokosi.com/share/contents/uploads/', '/uploads/') WHERE content LIKE '%kakiokosi.com/share/contents/uploads/%';"`, { stdio: "pipe" });
  execSync(`sqlite3 ${localDb} "UPDATE pages SET content = REPLACE(content, 'https://www.kakiokosi.com/share/contents/uploads/', '/uploads/') WHERE content LIKE '%www.kakiokosi.com/share/contents/uploads/%';"`, { stdio: "pipe" });
  execSync(`sqlite3 ${localDb} "UPDATE pages SET content = REPLACE(content, 'http://www.kakiokosi.com/share/contents/uploads/', '/uploads/') WHERE content LIKE '%www.kakiokosi.com/share/contents/uploads/%';"`, { stdio: "pipe" });

  console.log("  Local DB updated");
} catch (e) {
  console.log("  Local DB not available, skipping");
}

// Verify
try {
  const remaining = execSync(`sqlite3 ${localDb} "SELECT COUNT(*) FROM posts WHERE content LIKE '%kakiokosi.com/share/contents/uploads/%';"`, { encoding: "utf-8" }).trim();
  const remainingPages = execSync(`sqlite3 ${localDb} "SELECT COUNT(*) FROM pages WHERE content LIKE '%kakiokosi.com/share/contents/uploads/%';"`, { encoding: "utf-8" }).trim();
  console.log(`  Remaining posts with old URLs: ${remaining}`);
  console.log(`  Remaining pages with old URLs: ${remainingPages}`);
} catch {}

console.log("\n✅ URL rewrite complete. Run seed-local.mjs to update wrangler local DB.");
console.log("For remote DB, run: node scripts/seed-remote.mjs (will need to re-seed)");
