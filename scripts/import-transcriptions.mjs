#!/usr/bin/env node
/**
 * Import podcast transcription JSON files into the posts table.
 *
 * Usage:
 *   node scripts/import-transcriptions.mjs --dir /tmp/transcriptions --category business
 *
 * Each JSON file should have: { title, date, transcription }
 * Files are imported as published posts.
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { argv } from "process";

const args = {};
for (let i = 2; i < argv.length; i += 2) {
  args[argv[i].replace(/^--/, "")] = argv[i + 1];
}

const dir = args.dir || "/tmp/transcriptions";
const category = args.category || "business";
const outFile = args.out || "migrations/0003_transcriptions.sql";

function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  return "'" + str.replace(/'/g, "''") + "'";
}

// Convert plain text transcription to HTML paragraphs
function textToHtml(text) {
  return text
    .split(/\n+/)
    .filter((p) => p.trim())
    .map((p) => `<p>${p.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
    .join("\n");
}

console.log(`Reading transcription files from ${dir}...`);
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
console.log(`Found ${files.length} files`);

const lines = [];
lines.push("-- Imported podcast transcriptions");
lines.push(`-- Generated: ${new Date().toISOString()}`);
lines.push("");

let imported = 0;
let errors = 0;

for (const file of files) {
  try {
    const raw = readFileSync(join(dir, file), "utf-8");
    const data = JSON.parse(raw);

    const title = data.title || file.replace(".json", "");
    const date = data.date || "2025-01-01";
    const content = textToHtml(data.transcription || "");
    const excerpt = (data.transcription || "").substring(0, 200).replace(/\n/g, " ");

    lines.push(
      `INSERT INTO posts (author_id, title, content, excerpt, status, primary_category, published_at, created_at, updated_at) VALUES (NULL, ${escapeSql(title)}, ${escapeSql(content)}, ${escapeSql(excerpt)}, 'published', ${escapeSql(category)}, ${escapeSql(date + " 00:00:00")}, ${escapeSql(date + " 00:00:00")}, ${escapeSql(date + " 00:00:00")});`
    );

    imported++;
  } catch (e) {
    console.error(`Error processing ${file}: ${e.message}`);
    errors++;
  }
}

lines.push("");
lines.push("-- Add post_categories for imported posts");
lines.push(`-- Run after import: INSERT INTO post_categories SELECT id, '${category}' FROM posts WHERE primary_category = '${category}' AND id NOT IN (SELECT post_id FROM post_categories);`);

const { writeFileSync } = await import("fs");
writeFileSync(outFile, lines.join("\n"), "utf-8");

console.log(`\nOutput: ${outFile}`);
console.log(`Imported: ${imported}`);
console.log(`Errors: ${errors}`);
console.log(`\nNext steps:`);
console.log(`  1. Review the SQL file`);
console.log(`  2. Apply locally:  sqlite3 /tmp/kakiokosi_d1.db < ${outFile}`);
console.log(`  3. Apply to remote: node scripts/seed-remote.mjs (or wrangler d1 execute)`);
