#!/usr/bin/env node
/**
 * Seeds the remote D1 database by splitting seed SQL into safe batches.
 * Handles oversized statements by splitting content into INSERT + UPDATE.
 *
 * Usage: node scripts/seed-remote.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "fs";
import { execSync } from "child_process";

const DB_NAME = "kakiokosi-db";
const MAX_STMT_BYTES = 95000; // D1 limit is ~100KB per statement
const MAX_BATCH_BYTES = 400000; // Keep batches reasonable

console.log("Parsing seed SQL...");
const seedSql = readFileSync("migrations/0002_seed.sql", "utf-8");

// Split into individual SQL statements, respecting quoted strings
const statements = [];
let current = "";
let inStr = false;

for (let i = 0; i < seedSql.length; i++) {
  const ch = seedSql[i];
  if (ch === "'" && !inStr) {
    inStr = true;
    current += ch;
    continue;
  }
  if (ch === "'" && inStr) {
    if (seedSql[i + 1] === "'") {
      current += "''";
      i++;
      continue;
    }
    inStr = false;
    current += ch;
    continue;
  }
  if (ch === ";" && !inStr) {
    const stmt = current.trim();
    if (stmt.length > 0) {
      statements.push(stmt + ";");
    }
    current = "";
    continue;
  }
  current += ch;
}

console.log(`Found ${statements.length} statements`);

// Check for oversized statements and split them
const processedStatements = [];
let oversized = 0;

for (const stmt of statements) {
  const bytes = Buffer.byteLength(stmt, "utf-8");
  if (bytes <= MAX_STMT_BYTES) {
    processedStatements.push(stmt);
    continue;
  }

  // Oversized INSERT INTO posts - split content
  const match = stmt.match(/^INSERT INTO posts \(id, title, content, excerpt, status, primary_category, published_at, created_at, updated_at\) VALUES \((\d+), /);
  if (!match) {
    console.warn(`WARNING: Oversized non-post statement (${bytes} bytes), including anyway`);
    processedStatements.push(stmt);
    continue;
  }

  const postId = match[1];
  oversized++;
  console.log(`  Splitting oversized post ${postId} (${bytes} bytes)`);

  // Find content field boundaries in the VALUES clause
  // Pattern: VALUES (id, 'title', 'content', 'excerpt', 'status', 'primary_category', 'published_at', 'created_at', 'updated_at');
  // We need to find the content field and split it

  // Strategy: insert with truncated content first, then UPDATE with full content in chunks
  // Find the content start/end
  const valuesStart = stmt.indexOf("VALUES (");
  const afterId = stmt.indexOf(", ", valuesStart + 8); // skip "VALUES (id"
  const titleStart = afterId + 2; // start of 'title'

  // Parse past title field
  let pos = titleStart;
  if (stmt[pos] === "'") {
    pos++; // skip opening quote
    while (pos < stmt.length) {
      if (stmt[pos] === "'" && stmt[pos + 1] === "'") { pos += 2; continue; }
      if (stmt[pos] === "'") { pos++; break; }
      pos++;
    }
  }
  pos += 2; // skip ", "
  const contentStart = pos; // start of 'content' value

  // Parse content field to find its end
  if (stmt[pos] === "'") {
    pos++; // skip opening quote
    while (pos < stmt.length) {
      if (stmt[pos] === "'" && stmt[pos + 1] === "'") { pos += 2; continue; }
      if (stmt[pos] === "'") { pos++; break; }
      pos++;
    }
  }
  const contentEnd = pos; // position after closing quote of content

  const contentValue = stmt.substring(contentStart, contentEnd); // includes quotes

  // Create INSERT with empty content
  const insertWithEmpty = stmt.substring(0, contentStart) + "''" + stmt.substring(contentEnd);
  processedStatements.push(insertWithEmpty);

  // Create UPDATE with full content - may still be large, split if needed
  const updateStmt = `UPDATE posts SET content = ${contentValue} WHERE id = ${postId};`;
  const updateBytes = Buffer.byteLength(updateStmt, "utf-8");

  if (updateBytes <= MAX_STMT_BYTES) {
    processedStatements.push(updateStmt);
  } else {
    // Split content into chunks via concatenation
    // Remove quotes from content value
    const rawContent = contentValue.slice(1, -1); // strip outer quotes
    const chunkSize = 30000; // characters per chunk
    const chunks = [];
    for (let c = 0; c < rawContent.length; c += chunkSize) {
      chunks.push(rawContent.substring(c, c + chunkSize));
    }

    // First chunk: SET content = '...'
    processedStatements.push(`UPDATE posts SET content = '${chunks[0]}' WHERE id = ${postId};`);

    // Subsequent chunks: SET content = content || '...'
    for (let c = 1; c < chunks.length; c++) {
      processedStatements.push(`UPDATE posts SET content = content || '${chunks[c]}' WHERE id = ${postId};`);
    }
  }
}

if (oversized > 0) {
  console.log(`Split ${oversized} oversized statements`);
}

console.log(`Total processed statements: ${processedStatements.length}`);

// Group into batches
const batchDir = "migrations/remote_batches";
try { rmSync(batchDir, { recursive: true }); } catch {}
mkdirSync(batchDir, { recursive: true });

let batchNum = 0;
let batchContent = "";
let batchBytes = 0;

function flushBatch() {
  if (batchContent) {
    writeFileSync(`${batchDir}/batch_${String(batchNum).padStart(4, "0")}.sql`, batchContent);
    batchNum++;
    batchContent = "";
    batchBytes = 0;
  }
}

for (const stmt of processedStatements) {
  const stmtBytes = Buffer.byteLength(stmt, "utf-8");

  if (batchBytes + stmtBytes > MAX_BATCH_BYTES) {
    flushBatch();
  }

  batchContent += stmt + "\n";
  batchBytes += stmtBytes;
}
flushBatch();

console.log(`Created ${batchNum} batches`);

// Execute each batch
const files = readdirSync(batchDir).sort();
let errors = 0;
for (const file of files) {
  process.stdout.write(`  ${file}...`);
  try {
    execSync(`npx wrangler d1 execute ${DB_NAME} --remote --file="${batchDir}/${file}"`, {
      stdio: "pipe",
      timeout: 60000,
    });
    process.stdout.write(" OK\n");
  } catch (e) {
    const stderr = e.stderr?.toString() || "";
    if (stderr.includes("UNIQUE constraint") || stderr.includes("already exists")) {
      process.stdout.write(" SKIP (already exists)\n");
    } else {
      process.stdout.write(" ERROR\n");
      console.error("  " + stderr.split("\n").find(l => l.includes("ERROR") || l.includes("SQLITE")) || stderr.slice(0, 200));
      errors++;
    }
  }
}

// Cleanup
rmSync(batchDir, { recursive: true });

if (errors > 0) {
  console.log(`\n⚠️  ${errors} batches had errors`);
} else {
  console.log("\n✅ Remote seed completed successfully!");
}

// Verify
console.log("\nVerifying remote data...");
try {
  const result = execSync(
    `npx wrangler d1 execute ${DB_NAME} --remote --command="SELECT 'posts' as t, COUNT(*) as c FROM posts UNION ALL SELECT 'pages', COUNT(*) FROM pages UNION ALL SELECT 'categories', COUNT(*) FROM categories UNION ALL SELECT 'tags', COUNT(*) FROM tags;"`,
    { encoding: "utf-8", timeout: 30000 }
  );
  console.log(result);
} catch (e) {
  console.error("Verification failed:", e.stderr?.toString().slice(0, 200));
}
