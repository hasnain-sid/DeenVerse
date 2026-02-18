import { PutObjectCommand, HeadObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { s3, S3_BUCKETS, CDN_BASE_URL } from "../config/aws.js";
import { AppError } from "../utils/AppError.js";

/**
 * Allowed file types and size limits per bucket.
 */
const UPLOAD_RULES = {
  avatars: {
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSize: 5 * 1024 * 1024, // 5 MB
    path: "avatars",
  },
  media: {
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "audio/mpeg",
      "audio/mp4",
    ],
    maxSize: 10 * 1024 * 1024, // 10 MB
    path: "posts",
  },
  streams: {
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSize: 5 * 1024 * 1024,
    path: "thumbnails",
  },
};

/**
 * Generate a presigned PUT URL so the client can upload directly to S3.
 *
 * @param {string} userId   – ID of the authenticated user
 * @param {object} opts
 * @param {string} opts.bucket  – logical bucket key: "avatars" | "media" | "streams"
 * @param {string} opts.fileName – original file name (used for extension)
 * @param {string} opts.contentType – MIME type
 * @param {number} opts.fileSize – size in bytes (for validation)
 * @returns {{ uploadUrl: string, key: string, publicUrl: string }}
 */
export async function getPresignedUploadUrl(userId, { bucket, fileName, contentType, fileSize }) {
  const rules = UPLOAD_RULES[bucket];
  if (!rules) {
    throw new AppError(`Invalid upload bucket: ${bucket}`, 400);
  }

  // Validate content type
  if (!rules.allowedTypes.includes(contentType)) {
    throw new AppError(
      `File type "${contentType}" is not allowed. Accepted: ${rules.allowedTypes.join(", ")}`,
      400
    );
  }

  // Validate file size
  if (fileSize > rules.maxSize) {
    const mb = (rules.maxSize / 1024 / 1024).toFixed(0);
    throw new AppError(`File size exceeds the ${mb}MB limit`, 400);
  }

  // Build a unique key: path/userId/uuid.ext
  const ext = fileName.split(".").pop()?.toLowerCase() || "bin";
  const key = `${rules.path}/${userId}/${uuidv4()}.${ext}`;
  const s3Bucket = S3_BUCKETS[bucket];

  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: key,
    ContentType: contentType,
    // Add file size limit at S3 level too
    ContentLength: fileSize,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min

  // Build the public URL (CDN if configured, else S3 url)
  const publicUrl = CDN_BASE_URL
    ? `${CDN_BASE_URL}/${key}`
    : `https://${s3Bucket}.s3.amazonaws.com/${key}`;

  return { uploadUrl, key, publicUrl };
}

/**
 * Confirm an upload — verify the object actually exists in S3.
 *
 * @param {string} bucket – logical bucket key
 * @param {string} key    – S3 object key returned from presign
 * @returns {{ url: string }}
 */
export async function confirmUpload(bucket, key) {
  const s3Bucket = S3_BUCKETS[bucket];
  if (!s3Bucket) throw new AppError("Invalid bucket", 400);

  try {
    await s3.send(new HeadObjectCommand({ Bucket: s3Bucket, Key: key }));
  } catch {
    throw new AppError("Upload not found. File may not have been uploaded yet.", 404);
  }

  const url = CDN_BASE_URL
    ? `${CDN_BASE_URL}/${key}`
    : `https://${s3Bucket}.s3.amazonaws.com/${key}`;

  return { url };
}

/**
 * Delete an object from S3 (e.g. when user changes avatar).
 *
 * @param {string} bucket – logical bucket key
 * @param {string} key    – S3 object key
 */
export async function deleteUpload(bucket, key) {
  const s3Bucket = S3_BUCKETS[bucket];
  if (!s3Bucket) return;

  try {
    await s3.send(new DeleteObjectCommand({ Bucket: s3Bucket, Key: key }));
  } catch {
    // Swallow — deletion is best-effort
  }
}
