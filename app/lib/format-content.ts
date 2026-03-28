/**
 * Processes WordPress-migrated article HTML:
 *  - Wraps unstructured text in <p> tags
 *  - Injects H2 headings into long articles that lack them
 */
export function formatArticleContent(html: string): string {
  // Decode escaped unicode sequences (e.g. \u003c → <) from double-encoded JSON
  let content = html.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16))
  );

  // Normalize Windows \r\n and stray \r to \n
  content = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Wrap paragraphs if content lacks <p> tags
  if (!/<p[\s>]/i.test(content)) {
    content = wrapParagraphs(content);
  }

  // Inject H2 headings if content is long and lacks them
  if (!/<h2[\s>]/i.test(content) && content.length > 5000) {
    content = injectHeadings(content);
  }

  return content;
}

function wrapParagraphs(content: string): string {
  const parts = content.split(/(<[^>]*>)/);

  const processed = parts.map((part, i) => {
    if (i % 2 === 1) return part;
    if (!part.trim()) return part;

    const blocks = part
      .split(/\n{2,}/)
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    if (blocks.length === 1 && blocks[0].length < 80) return part;

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

/**
 * Injects H2 section breaks into long articles that have no headings.
 * Splits content roughly every 3000 characters at paragraph boundaries,
 * generating a heading from the first sentence of the next section.
 */
function injectHeadings(content: string): string {
  // Split by paragraphs (</p> boundaries)
  const paragraphs = content.split(/(?<=<\/p>)/i);
  if (paragraphs.length < 6) return content;

  const TARGET_INTERVAL = 3000;
  let charCount = 0;
  let headingCount = 0;
  const result: string[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    charCount += p.length;

    // Insert heading before this paragraph if we've accumulated enough text
    // Skip the first section (it's the intro)
    if (charCount >= TARGET_INTERVAL && headingCount < 8 && i > 2) {
      const headingText = extractHeadingText(p);
      if (headingText) {
        result.push(`<h2>${headingText}</h2>\n`);
        headingCount++;
        charCount = 0;
      }
    }

    result.push(p);
  }

  return result.join("");
}

/**
 * Extracts a short heading from a paragraph's text content.
 * Takes the first sentence or first 40 chars.
 */
function extractHeadingText(paragraph: string): string | null {
  // Strip HTML tags to get plain text
  const text = paragraph
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length < 20) return null;

  // Try to find a sentence boundary (Japanese period)
  const sentenceEnd = text.indexOf("。");
  if (sentenceEnd > 0 && sentenceEnd <= 40) {
    return text.substring(0, sentenceEnd + 1);
  }

  // Try comma boundary
  const commaEnd = text.indexOf("、");
  if (commaEnd > 10 && commaEnd <= 35) {
    return text.substring(0, commaEnd);
  }

  // Fallback: first 30 chars
  if (text.length > 30) {
    return text.substring(0, 30) + "...";
  }

  return text;
}
