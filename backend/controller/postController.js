import {
  createPost,
  getFeed,
  getPostById,
  toggleLike,
  toggleRepost,
  getUserPosts,
  deletePost,
  getPostsByHashtag,
  getTrendingHashtags,
} from "../services/postService.js";

export const createPostHandler = async (req, res, next) => {
  try {
    const post = await createPost(req.user, req.body);
    return res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

export const getFeedHandler = async (req, res, next) => {
  try {
    const { page, limit = 20, tab = "following", cursor } = req.query;
    const data = await getFeed(req.user, {
      cursor: cursor || undefined,
      page: page ? parseInt(page, 10) || 1 : undefined,
      limit: parseInt(limit, 10) || 20,
      tab,
    });
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const getPostHandler = async (req, res, next) => {
  try {
    const data = await getPostById(req.params.id, req.user);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const toggleLikeHandler = async (req, res, next) => {
  try {
    const data = await toggleLike(req.params.id, req.user);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const toggleRepostHandler = async (req, res, next) => {
  try {
    const data = await toggleRepost(req.params.id, req.user);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const getUserPostsHandler = async (req, res, next) => {
  try {
    const { page, limit = 20, cursor } = req.query;
    const data = await getUserPosts(req.params.username, {
      cursor: cursor || undefined,
      page: page ? parseInt(page, 10) || 1 : undefined,
      limit: parseInt(limit, 10) || 20,
    });
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const deletePostHandler = async (req, res, next) => {
  try {
    const data = await deletePost(req.params.id, req.user);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const getPostsByHashtagHandler = async (req, res, next) => {
  try {
    const { page, limit = 20, cursor } = req.query;
    const data = await getPostsByHashtag(req.params.hashtag, {
      cursor: cursor || undefined,
      page: page ? parseInt(page, 10) || 1 : undefined,
      limit: parseInt(limit, 10) || 20,
    });
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const getTrendingHashtagsHandler = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const trending = await getTrendingHashtags(parseInt(limit, 10) || 10);
    return res.status(200).json({ success: true, trending });
  } catch (error) {
    next(error);
  }
};
