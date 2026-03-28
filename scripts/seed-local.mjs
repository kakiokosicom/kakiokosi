#!/usr/bin/env node
/**
 * Seeds the local D1 database by building a SQLite file directly
 * and placing it in wrangler's local state directory.
 *
 * Usage: node scripts/seed-local.mjs
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, cpSync, rmSync, readdirSync } from "fs";
import { join } from "path";

const TMP_DB = "/tmp/kakiokosi_d1.db";

// Build the SQLite DB from migration files
console.log("Building SQLite database...");
try { rmSync(TMP_DB); } catch {}

execSync(`sqlite3 ${TMP_DB} < migrations/0001_initial.sql`, { stdio: "inherit" });
console.log("Schema applied.");

execSync(`sqlite3 ${TMP_DB} < migrations/0002_seed.sql`, { stdio: "inherit" });
console.log("Seed data applied.");

// Verify
const result = execSync(
  `sqlite3 ${TMP_DB} "SELECT 'posts' as t, COUNT(*) as c FROM posts UNION ALL SELECT 'pages', COUNT(*) FROM pages UNION ALL SELECT 'categories', COUNT(*) FROM categories UNION ALL SELECT 'tags', COUNT(*) FROM tags;"`,
  { encoding: "utf-8" }
);
console.log("\nData counts:");
console.log(result);

// Initialize wrangler state so it creates the D1 directory
console.log("Initializing wrangler local state...");
try {
  execSync(
    `npx wrangler d1 execute kakiokosi-db --local --command="SELECT 1;"`,
    { stdio: "pipe" }
  );
} catch {}

// Find the SQLite file in wrangler's state
const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
if (!existsSync(d1Dir)) {
  console.error("Could not find wrangler D1 state directory");
  process.exit(1);
}

const files = readdirSync(d1Dir).filter(f => f.endsWith(".sqlite"));
if (files.length === 0) {
  console.error("No SQLite files found in wrangler D1 state");
  process.exit(1);
}

const targetDb = join(d1Dir, files[0]);
console.log(`Copying to ${targetDb}...`);

// Remove existing DB and WAL files
for (const f of readdirSync(d1Dir)) {
  if (f.endsWith(".sqlite") || f.endsWith(".sqlite-wal") || f.endsWith(".sqlite-shm")) {
    rmSync(join(d1Dir, f));
  }
}

cpSync(TMP_DB, targetDb);
console.log("\n✅ Local D1 database seeded successfully!");
console.log("Run `npm run dev` to start the dev server.");
