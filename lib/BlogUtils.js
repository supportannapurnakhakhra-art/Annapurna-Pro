/**
 * Strips HTML and CSS styling blocks from a string to produce clean plain text.
 * Handles <style>, <script>, raw CSS blocks (e.g. .class { ... }), and HTML entities.
 */
export function stripHtmlAndCss(htmlOrText) {
  if (!htmlOrText || typeof htmlOrText !== "string") return "";
  let cleaned = htmlOrText;

  // 1. Remove <style>...</style> and <script>...</script> blocks completely including contents
  cleaned = cleaned.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, "");
  cleaned = cleaned.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, "");

  // 2. Remove CSS rule blocks that might have already had style tags stripped
  // e.g., ".content-section b, .content-section strong { color: #d2691e; }"
  cleaned = cleaned.replace(/([.#a-zA-Z0-9_\-\s,>:+*]+)\s*\{[^}]*\}/g, "");

  // 3. Remove all remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, "");

  // 4. Decode common HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  // 5. Clean up leading symbols / whitespace and collapse consecutive spaces
  cleaned = cleaned.replace(/^[\s,.;:{}]+/, "");
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

/**
 * Extracts a clean excerpt string for blog cards/previews from a post object or string.
 * Falls back to cleaning the full post content if excerpt is empty or was mostly CSS.
 */
export function getCleanExcerpt(postOrText, maxLength = 160) {
  if (!postOrText) return "";

  if (typeof postOrText === "string") {
    const cleaned = stripHtmlAndCss(postOrText);
    if (maxLength && cleaned.length > maxLength) {
      return cleaned.slice(0, maxLength).trim() + "...";
    }
    return cleaned;
  }

  const rawExcerpt =
    postOrText.excerpt ||
    postOrText.summary ||
    postOrText.seo_description ||
    postOrText.description ||
    "";
  let cleaned = stripHtmlAndCss(rawExcerpt);

  // If excerpt is too short / truncated after CSS removal, extract from content
  const content = postOrText.content || postOrText.contentHtml || "";
  if ((!cleaned || cleaned.length < 40) && content) {
    const contentCleaned = stripHtmlAndCss(content);
    if (contentCleaned.length > cleaned.length) {
      cleaned = contentCleaned;
    }
  }

  if (maxLength && cleaned.length > maxLength) {
    return cleaned.slice(0, maxLength).trim() + "...";
  }

  return cleaned;
}
