/**
 * XSS Protection Utilities
 *
 * Provides utilities to sanitize and escape user-generated content
 * to prevent XSS (Cross-Site Scripting) attacks.
 */

/**
 * HTML entity map for escaping
 */
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

/**
 * Escape HTML special characters to prevent XSS
 *
 * @param str - String to escape
 * @returns Escaped string safe for HTML content
 *
 * @example
 * escapeHtml('<script>alert("XSS")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;'
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Escape HTML attributes (for use in HTML attribute values)
 *
 * @param str - String to escape
 * @returns Escaped string safe for HTML attributes
 */
export function escapeHtmlAttribute(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Escape JavaScript string (for use in JavaScript code)
 *
 * @param str - String to escape
 * @returns Escaped string safe for JavaScript strings
 */
export function escapeJavaScript(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\u2028/g, "\\u2028") // Line separator
    .replace(/\u2029/g, "\\u2029"); // Paragraph separator
}

/**
 * Sanitize URL to prevent javascript: and data: protocol attacks
 *
 * @param url - URL to sanitize
 * @returns Sanitized URL or empty string if unsafe
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = [
    "javascript:",
    "data:",
    "vbscript:",
    "file:",
    "about:",
  ];

  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      return "";
    }
  }

  // Allow http, https, mailto, tel, and relative URLs
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("?")
  ) {
    return url.trim();
  }

  // If no protocol, assume relative URL
  if (!trimmed.includes(":")) {
    return url.trim();
  }

  // Block unknown protocols
  return "";
}

/**
 * Sanitize object recursively, escaping all string values
 * Useful for sanitizing user input before storing or displaying
 *
 * @param obj - Object to sanitize
 * @param options - Sanitization options
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: {
    escapeHtml?: boolean;
    escapeAttributes?: boolean;
    sanitizeUrls?: boolean;
    maxDepth?: number;
  } = {},
): T {
  const {
    escapeHtml: shouldEscapeHtml = true,
    escapeAttributes = false,
    sanitizeUrls = false,
    maxDepth = 10,
  } = options;

  if (maxDepth <= 0) {
    return obj;
  }

  const sanitized = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      sanitized[key as keyof T] = value as T[keyof T];
    } else if (typeof value === "string") {
      let sanitizedValue = value;

      if (
        sanitizeUrls &&
        (key.toLowerCase().includes("url") ||
          key.toLowerCase().includes("link"))
      ) {
        sanitizedValue = sanitizeUrl(value) || value;
      }

      if (
        escapeAttributes &&
        (key.toLowerCase().includes("attr") ||
          key.toLowerCase().includes("attribute"))
      ) {
        sanitizedValue = escapeHtmlAttribute(sanitizedValue);
      } else if (shouldEscapeHtml) {
        sanitizedValue = escapeHtml(sanitizedValue);
      }

      sanitized[key as keyof T] = sanitizedValue as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map((item) =>
        typeof item === "object" && item !== null
          ? sanitizeObject(item as Record<string, unknown>, {
              escapeHtml: shouldEscapeHtml,
              escapeAttributes,
              sanitizeUrls,
              maxDepth: maxDepth - 1,
            })
          : typeof item === "string"
            ? shouldEscapeHtml
              ? escapeHtml(item)
              : item
            : item,
      ) as T[keyof T];
    } else if (typeof value === "object") {
      sanitized[key as keyof T] = sanitizeObject(
        value as Record<string, unknown>,
        {
          escapeHtml: shouldEscapeHtml,
          escapeAttributes,
          sanitizeUrls,
          maxDepth: maxDepth - 1,
        },
      ) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }

  return sanitized;
}

/**
 * Strip HTML tags from string (for plain text output)
 *
 * @param html - HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Validate and sanitize user input for display
 * This is a convenience function that combines multiple sanitization steps
 *
 * @param input - User input to sanitize
 * @param options - Sanitization options
 * @returns Sanitized string safe for HTML display
 */
export function sanitizeUserInput(
  input: string,
  options: {
    allowHtml?: boolean;
    maxLength?: number;
    stripTags?: boolean;
  } = {},
): string {
  const { allowHtml = false, maxLength, stripTags = false } = options;

  if (!input || typeof input !== "string") {
    return "";
  }

  let sanitized = input;

  // Truncate if maxLength is specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Strip HTML tags if requested
  if (stripTags || !allowHtml) {
    sanitized = stripHtmlTags(sanitized);
  }

  // Escape HTML if not allowing HTML
  if (!allowHtml) {
    sanitized = escapeHtml(sanitized);
  }

  return sanitized;
}
