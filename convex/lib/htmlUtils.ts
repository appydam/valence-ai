/**
 * HTML utilities for doc scraping
 */

/**
 * Strip HTML tags, scripts, styles from HTML content
 * Returns clean text for AI analysis
 */
export function stripHTML(html: string): string {
  if (!html) return "";

  let text = html;

  // Remove script tags and their content
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove style tags and their content
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = decodeHTMLEntities(text);

  // Normalize whitespace
  text = text.replace(/\s+/g, " ");
  text = text.replace(/\n+/g, "\n");

  // Trim
  text = text.trim();

  return text;
}

/**
 * Decode common HTML entities
 */
function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
    "&ndash;": "–",
    "&mdash;": "—",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
  };

  return text.replace(/&[a-z0-9#]+;/gi, (entity) => {
    return entities[entity.toLowerCase()] || entity;
  });
}

/**
 * Extract title from HTML
 */
export function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : null;
}

/**
 * Extract meta description from HTML
 */
export function extractDescription(html: string): string | null {
  const descMatch = html.match(
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
  );
  return descMatch ? descMatch[1].trim() : null;
}

/**
 * Detect if content is likely an OpenAPI/Swagger spec
 */
export function isOpenAPISpec(content: string): boolean {
  try {
    const trimmed = content.trim();

    // Check for JSON format
    if (trimmed.startsWith("{")) {
      const parsed = JSON.parse(content);
      return !!(parsed.openapi || parsed.swagger);
    }

    // Check for YAML format
    if (trimmed.includes("openapi:") || trimmed.includes("swagger:")) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
