import { AppError } from "../utils/AppError.js";
import { createPost } from "./postService.js";
import {
  SUPPORTED_KINDS,
  FEED_TEMPLATES,
  enrichSharedContent,
  buildShareHashtags,
  getSharePreview,
} from "./shareEnrichment.js";

// Re-export enrichment utils so existing imports still work
export { SUPPORTED_KINDS, FEED_TEMPLATES, enrichSharedContent, buildShareHashtags, getSharePreview };

// ──────────────────────────────────────────────────────
//  getShareConfig — public config for the share menu
// ──────────────────────────────────────────────────────
export function getShareConfig(kind) {
  const normalizedKind = kind?.toLowerCase();

  if (normalizedKind && !SUPPORTED_KINDS.includes(normalizedKind)) {
    throw new AppError("Unsupported share type", 400);
  }

  const template = normalizedKind ? FEED_TEMPLATES[normalizedKind] : null;

  return {
    supportsShareToFeed: true,
    modernOptions: [
      "native_share",
      "copy_link",
      "copy_text",
      "whatsapp",
      "telegram",
      "x",
      "email",
      "share_to_feed",
    ],
    supportedKinds: SUPPORTED_KINDS,
    feedTemplate: template,
  };
}

// ──────────────────────────────────────────────────────
//  shareToFeed — dedicated share-to-feed entry point
// ──────────────────────────────────────────────────────
/**
 * Share content to the user's feed. Enriches the shared content,
 * auto-generates hashtags, then delegates to createPost.
 *
 * @param {string} userId
 * @param {{ content: string, sharedContent: object }} payload
 * @returns {Promise<object>} the created Post document
 */
export async function shareToFeed(userId, { content, sharedContent }) {
  if (!sharedContent || !sharedContent.kind) {
    throw new AppError("sharedContent with a valid kind is required", 400);
  }

  const kind = sharedContent.kind.toLowerCase();
  if (!SUPPORTED_KINDS.includes(kind)) {
    throw new AppError(`Unsupported share kind: ${kind}`, 400);
  }

  // Build a feed-friendly caption if the user didn't provide one
  const template = FEED_TEMPLATES[kind];
  const caption =
    content && content.trim().length > 0
      ? content.trim()
      : `${template.titlePrefix}: ${sharedContent.title || template.fallbackExcerpt}`;

  // Delegate to createPost which handles enrichment internally
  const post = await createPost(userId, {
    content: caption,
    sharedContent,
  });

  return post;
}
