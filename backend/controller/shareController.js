import { getShareConfig, shareToFeed, getSharePreview } from "../services/shareService.js";

export const getShareConfigHandler = async (req, res, next) => {
  try {
    const { kind } = req.query;
    const config = getShareConfig(kind);
    return res.status(200).json({ success: true, config });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/share/to-feed
 * Dedicated share-to-feed endpoint: enriches content, auto-hashtags, creates post.
 */
export const shareToFeedHandler = async (req, res, next) => {
  try {
    const { content, sharedContent } = req.body;
    const post = await shareToFeed(req.user, { content, sharedContent });
    return res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/share/preview
 * Preview how the shared content card will look before posting.
 */
export const getSharePreviewHandler = async (req, res, next) => {
  try {
    const preview = getSharePreview(req.body.sharedContent || req.body);
    return res.status(200).json({ success: true, preview });
  } catch (error) {
    next(error);
  }
};
