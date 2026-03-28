#!/usr/bin/env node
/**
 * Seeds a remote D1 database via the Cloudflare D1 Query API.
 * Uses batched queries to stay within API limits.
 *
 * Usage: node scripts/seed-api.mjs --account-id <id> --db-id <id> --api-token <token>
 */

import { readFileSync } from "fs";
import { argv } from "process";

const args = {};
for (let i = 2; i < argv.length; i += 2) {
  args[argv[i].replace(/^--/, "")] = argv[i + 1];
}

const ACCOUNT_ID = args["account-id"];
const DB_ID = args["db-id"];
const API_TOKEN = args["api-token"];
const SEED_FILE = args["file"] || "migrations/0002_seed.sql";

if (!ACCOUNT_ID || !DB_ID || !API_TOKEN) {
  console.error("Usage: node scripts/seed-api.mjs --account-id <id> --db-id <id> --api-token <token> [--file <sql>]");
  process.exit(1);
}

const BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DB_ID}/query`;

console.log("Parsing seed SQL...");
const seedSql = readFileSync(SEED_FILE, "utf-8");

// Split into individual SQL statements
const statements = [];
let current = "";
let inStr = false;

for (let i = 0; i < seedSql.length; i++) {
  const ch = seedSql[i];
  if (ch === "'" && !inStr) { inStr = true; current += ch; continue; }
  if (ch === "'" && inStr) {
    if (seedSql[i + 1] === "'") { current += "''"; i++; continue; }
    inStr = false; current += ch; continue;
  }
  if (ch === ";" && !inStr) {
    const stmt = current.trim();
    if (stmt && stmt.startsWith("INSERT")) statements.push(stmt);
    current = ""; continue;
  }
  current += ch;
}

console.log(`Found ${statements.length} INSERT statements`);

// Skip categories (already inserted)
const nonCatStatements = statements.filter(s => !s.startsWith("INSERT INTO categories"));
console.log(`Statements to execute: ${nonCatStatements.length}`);

// Batch by size - D1 query API accepts multiple statements
const BATCH_SIZE = 80000; // bytes
const batches = [];
let batch = [];
let batchBytes = 0;

for (const stmt of nonCatStatements) {
  const bytes = Buffer.byteLength(stmt, "utf-8");

  // Handle oversized statements by splitting content
  if (bytes > BATCH_SIZE) {
    if (batch.length > 0) {
      batches.push(batch);
      batch = [];
      batchBytes = 0;
    }
    // Split into INSERT with empty content + UPDATE
    const match = stmt.match(/^INSERT INTO posts \(id,.*?\) VALUES \((\d+),/);
    if (match) {
      const postId = match[1];
      // Find content boundaries
      const valuesIdx = stmt.indexOf("VALUES (");
      let pos = valuesIdx + 8;
      // Skip ID
      while (stmt[pos] !== ',') pos++;
      pos += 2; // skip ", "
      // Skip title
      if (stmt[pos] === "'") {
        pos++;
        while (pos < stmt.length) {
          if (stmt[pos] === "'" && stmt[pos+1] === "'") { pos += 2; continue; }
          if (stmt[pos] === "'") { pos++; break; }
          pos++;
        }
      }
      pos += 2; // skip ", "
      const contentStart = pos;
      // Skip content
      if (stmt[pos] === "'") {
        pos++;
        while (pos < stmt.length) {
          if (stmt[pos] === "'" && stmt[pos+1] === "'") { pos += 2; continue; }
          if (stmt[pos] === "'") { pos++; break; }
          pos++;
        }
      }
      const contentEnd = pos;
      const contentValue = stmt.substring(contentStart, contentEnd);

      // INSERT with empty content
      const insertStmt = stmt.substring(0, contentStart) + "''" + stmt.substring(contentEnd);
      batches.push([insertStmt]);

      // UPDATE with content in chunks
      const rawContent = contentValue.slice(1, -1);
      const chunkSize = 25000;
      for (let c = 0; c < rawContent.length; c += chunkSize) {
        const chunk = rawContent.substring(c, c + chunkSize);
        const updateStmt = c === 0
          ? `UPDATE posts SET content = '${chunk}' WHERE id = ${postId}`
          : `UPDATE posts SET content = content || '${chunk}' WHERE id = ${postId}`;
        batches.push([updateStmt]);
      }
      continue;
    }
    // Non-post oversized statement, just try it
    batches.push([stmt]);
    continue;
  }

  if (batchBytes + bytes > BATCH_SIZE) {
    batches.push(batch);
    batch = [];
    batchBytes = 0;
  }
  batch.push(stmt);
  batchBytes += bytes;
}
if (batch.length > 0) batches.push(batch);

console.log(`Created ${batches.length} batches`);

// Execute batches
let errors = 0;
for (let i = 0; i < batches.length; i++) {
  const b = batches[i];
  process.stdout.write(`  Batch ${i + 1}/${batches.length} (${b.length} stmts)...`);

  try {
    const resp = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sql: b.join(";\n") + ";" })
    });

    const data = await resp.json();
    if (data.success) {
      process.stdout.write(" OK\n");
    } else {
      process.stdout.write(` ERROR: ${data.errors?.[0]?.message || "unknown"}\n`);
      errors++;
    }
  } catch (e) {
    process.stdout.write(` ERROR: ${e.message}\n`);
    errors++;
  }

  // Small delay to avoid rate limiting
  if (i % 5 === 4) await new Promise(r => setTimeout(r, 500));
}

if (errors > 0) {
  console.log(`\n⚠️  ${errors} batches had errors`);
} else {
  console.log("\n✅ Seed completed!");
}

// Verify
console.log("\nVerifying...");
const verifyResp = await fetch(BASE_URL, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${API_TOKEN}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    sql: "SELECT 'posts' as t, COUNT(*) as c FROM posts UNION ALL SELECT 'pages', COUNT(*) FROM pages UNION ALL SELECT 'categories', COUNT(*) FROM categories UNION ALL SELECT 'tags', COUNT(*) FROM tags;"
  })
});
const verifyData = await verifyResp.json();
console.log(JSON.stringify(verifyData.result?.[0]?.results, null, 2));
