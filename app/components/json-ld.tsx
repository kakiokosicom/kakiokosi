/**
 * JsonLd component -- renders a <script type="application/ld+json"> tag.
 *
 * Usage:
 *   <JsonLd data={articleSchema(post, { url })} />
 *
 * Multiple schema blocks can be placed on the same page by rendering
 * multiple <JsonLd> components.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
