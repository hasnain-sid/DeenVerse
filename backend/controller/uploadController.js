import {
  getPresignedUploadUrl,
  confirmUpload,
} from "../services/uploadService.js";

/**
 * POST /api/v1/upload/presign
 * Body: { bucket, fileName, contentType, fileSize }
 * Returns: { uploadUrl, key, publicUrl }
 */
export const presignHandler = async (req, res, next) => {
  try {
    const userId = req.user;
    const { bucket, fileName, contentType, fileSize } = req.body;

    if (!bucket || !fileName || !contentType || !fileSize) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: bucket, fileName, contentType, fileSize",
      });
    }

    const result = await getPresignedUploadUrl(userId, {
      bucket,
      fileName,
      contentType,
      fileSize,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/upload/confirm
 * Body: { bucket, key }
 * Returns: { url }
 */
export const confirmHandler = async (req, res, next) => {
  try {
    const { bucket, key } = req.body;

    if (!bucket || !key) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: bucket, key",
      });
    }

    const result = await confirmUpload(bucket, key);

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
