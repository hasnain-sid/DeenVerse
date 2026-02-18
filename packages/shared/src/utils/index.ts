// ===== Shared Utility Functions =====

/**
 * Format a date string into a relative time (e.g. "5m ago", "2h ago", "3d ago")
 */
export function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  if (weeks < 5) return `${weeks}w`;
  return `${months}mo`;
}

/**
 * Format a large number with K/M suffix (e.g. 1200 -> "1.2K")
 */
export function formatCount(count: number): string {
  if (count < 1000) return String(count);
  if (count < 1_000_000) {
    const k = count / 1000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  const m = count / 1_000_000;
  return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
}

/**
 * Truncate a string to a max length, adding ellipsis if needed
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

/**
 * Generate initials from a name (e.g. "Abu Bakr" -> "AB")
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/**
 * Parse hashtags from post content
 */
export function extractHashtags(content: string): string[] {
  const matches = content.match(/#[a-zA-Z0-9_\u0600-\u06FF]+/g);
  return matches ? matches.map((t) => t.slice(1)) : [];
}

/**
 * Check if a string contains Arabic characters
 */
export function isArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Platform-agnostic classname combiner (simple version for shared use)
 */
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
