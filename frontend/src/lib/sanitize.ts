import DOMPurify from 'dompurify';

/**
 * Sanitise user-generated HTML content (posts, bios, messages).
 *
 * Strips all dangerous tags/attributes while preserving safe inline markup.
 * Used before rendering any user content via dangerouslySetInnerHTML.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Strip ALL HTML — returns plain text only.
 * Use for search, previews, notifications, etc.
 */
export function stripHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
