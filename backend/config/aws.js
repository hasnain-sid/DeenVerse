import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";
import { IvsClient } from "@aws-sdk/client-ivs";

const region = process.env.AWS_REGION || "us-east-1";

/**
 * Shared AWS S3 client.
 * Requires: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION in env.
 */
export const s3 = new S3Client({
  region,
  ...(process.env.AWS_ACCESS_KEY_ID && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
});

/**
 * Shared AWS SES client for emails.
 */
export const ses = new SESClient({
  region: process.env.AWS_SES_REGION || region,
  ...(process.env.AWS_ACCESS_KEY_ID && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
});

/**
 * Shared AWS IVS client for live streaming.
 */
export const ivs = new IvsClient({
  region: process.env.AWS_IVS_REGION || region,
  ...(process.env.AWS_ACCESS_KEY_ID && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
});

/**
 * S3 bucket names — centralised so every service uses the same names.
 */
export const S3_BUCKETS = {
  avatars: process.env.S3_BUCKET_AVATARS || "deenverse-avatars",
  media: process.env.S3_BUCKET_MEDIA || "deenverse-media",
  streams: process.env.S3_BUCKET_STREAMS || "deenverse-streams",
};

/**
 * CloudFront CDN base URL.
 * If not configured, falls back to direct S3 URLs.
 */
export const CDN_BASE_URL =
  process.env.CDN_BASE_URL || null;
