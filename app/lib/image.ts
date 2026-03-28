/**
 * Generate Cloudflare Image Resizing URL.
 * Falls back to the original URL if the path is external or already transformed.
 */
function cfImage(src: string, width: number, format = "auto"): string {
  // External URLs or data URIs — return as-is
  if (src.startsWith("http") || src.startsWith("data:")) return src;
  return `/cdn-cgi/image/width=${width},quality=80,format=${format}${src}`;
}

/**
 * Generate srcSet string for responsive images.
 * Uses Cloudflare Image Resizing for local images, original URL for external.
 */
export function imageSrcSet(
  src: string,
  widths: number[] = [320, 640, 960, 1280]
): string | undefined {
  if (src.startsWith("http") || src.startsWith("data:")) return undefined;
  return widths.map((w) => `${cfImage(src, w)} ${w}w`).join(", ");
}

/**
 * Get the image src — use CF transform for local images on supported widths.
 */
export function imageSrc(src: string, width?: number): string {
  if (!width || src.startsWith("http") || src.startsWith("data:")) return src;
  return cfImage(src, width);
}
