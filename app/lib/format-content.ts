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

  // Clean up residual escaped backslashes from double-encoded JSON
  content = content.replace(/\\+$/g, "");
  content = content.replace(/\\"/g, '"');

  // Upgrade all http:// to https:// to prevent mixed content warnings
  content = content.replace(/http:\/\//g, "https://");

  // Normalize www.kakiokosi.com → kakiokosi.com
  content = content.replace(/https:\/\/www\.kakiokosi\.com\//g, "https://kakiokosi.com/");

  // Rewrite legacy wp-content/uploads paths to /uploads/
  content = content.replace(
    /https?:\/\/(?:www\.)?kakiokosi\.com\/wp-content\/uploads\//g,
    "/uploads/"
  );
  content = content.replace(/(?:\.\.\/)*wp-content\/uploads\//g, "/uploads/");

  // Wrap paragraphs if the main body content lacks <p> tags.
  // Strip editorial notes before checking — they may contain <p> internally
  // but the rest of the article may still be unstructured plain text.
  const bodyWithoutEditorialNotes = content.replace(
    /<div class="editorial-note[^"]*">[\s\S]*?<\/div>/gi,
    ""
  );
  if (!/<p[\s>]/i.test(bodyWithoutEditorialNotes)) {
    content = wrapParagraphs(content);
  }

  // Inject H2 headings if content is long and lacks them
  if (!/<h2[\s>]/i.test(content) && content.length > 5000) {
    content = injectHeadings(content);
  }

  return content;
}

/**
 * Wraps plain text in <p> tags while preserving existing HTML elements.
 * Strategy: split content on double-newlines (paragraph boundaries),
 * then wrap each segment that isn't purely HTML tags.
 */
function wrapParagraphs(content: string): string {
  // Split on double newlines, preserving them
  const segments = content.split(/(\n{2,})/);
  const result: string[] = [];

  for (const segment of segments) {
    // Pure whitespace/newlines — skip
    if (!segment.trim()) {
      result.push(segment);
      continue;
    }

    // Check if this segment is purely block-level HTML (div, img, blockquote, etc.)
    const stripped = segment.replace(/<[^>]+>/g, "").trim();
    if (!stripped) {
      // Only HTML tags, no text content — pass through
      result.push(segment);
      continue;
    }

    // Check if it's already wrapped in a block element
    const trimmed = segment.trim();
    if (/^<(p|div|h[1-6]|blockquote|ul|ol|table|section|article|figure|nav)[\s>]/i.test(trimmed)) {
      result.push(segment);
      continue;
    }

    // This is a text segment (may contain inline HTML like <span>, <a>, <strong>, <br>)
    // Wrap in <p>, converting single \n to <br>
    const lines = trimmed.replace(/\n/g, "<br>");
    result.push(`<p>${lines}</p>`);
  }

  return result.join("\n");
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
