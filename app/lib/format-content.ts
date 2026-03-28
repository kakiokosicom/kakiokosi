/**
 * Processes WordPress-migrated article HTML that lacks <p> tags.
 *
 * WP content exported without paragraph tags uses \n\n for paragraph breaks
 * and \n for soft line breaks within a paragraph. This function:
 *  - Returns the HTML unchanged if <p> tags already exist
 *  - Splits text nodes on double newlines → each block becomes a <p>
 *  - Replaces single newlines within a block with <br>
 */
export function formatArticleContent(html: string): string {
  // Decode escaped unicode sequences (e.g. \u003c → <) from double-encoded JSON
  let content = html.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16))
  );

  // Normalize Windows \r\n and stray \r to \n
  content = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Already structured — leave it alone
  if (/<p[\s>]/i.test(content)) return content;

  // Split into alternating [text, tag, text, tag, ...] segments.
  // With a capturing group, captured delimiters are included in the array.
  // Even indices → text nodes; odd indices → HTML tags.
  const parts = content.split(/(<[^>]*>)/);

  const processed = parts.map((part, i) => {
    // HTML tag — pass through
    if (i % 2 === 1) return part;

    // Whitespace-only text node — pass through
    if (!part.trim()) return part;

    // Split on double (or more) newlines → paragraph boundaries
    const blocks = part
      .split(/\n{2,}/)
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    // Single short segment (e.g. link text or a short div label) — leave as-is
    if (blocks.length === 1 && blocks[0].length < 80) return part;

    // Wrap each block in <p>; replace remaining single \n with <br>
    return (
      "\n" +
      blocks
        .map((b) => `<p>${b.replace(/\n/g, "<br>")}</p>`)
        .join("\n") +
      "\n"
    );
  });

  return processed.join("");
}
