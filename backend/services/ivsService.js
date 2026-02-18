import crypto from "node:crypto";
import {
  CreateChannelCommand,
  DeleteChannelCommand,
  ListStreamKeysCommand,
  GetStreamKeyCommand,
} from "@aws-sdk/client-ivs";
import { ivs } from "../config/aws.js";

/**
 * Check whether AWS IVS is configured.
 */
function isIvsConfigured() {
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

/**
 * Create an IVS channel for a streamer.
 *
 * @param {string} userId  – user ID (used in channel name for traceability)
 * @param {string} title   – stream title
 * @returns {{ channelArn: string, streamKeyArn: string, streamKeyValue: string, ingestEndpoint: string, playbackUrl: string }}
 */
export async function createIvsChannel(userId, title) {
  if (!isIvsConfigured()) {
    console.warn("[IVS] Not configured — returning placeholder values");
    const id = crypto.randomUUID();
    return {
      channelArn: `placeholder:channel:${id}`,
      streamKeyArn: `placeholder:streamkey:${id}`,
      streamKeyValue: `sk_live_${id}`,
      ingestEndpoint: "rtmps://placeholder.contribute.live-video.net:443/app/",
      playbackUrl: `https://placeholder.playback.live-video.net/${id}.m3u8`,
    };
  }

  // 1. Create channel
  const createRes = await ivs.send(
    new CreateChannelCommand({
      name: `deenverse-${userId}-${Date.now()}`,
      latencyMode: "LOW",
      type: "STANDARD",
      tags: {
        userId,
        title: title.substring(0, 128),
        app: "DeenVerse",
      },
    })
  );

  const channel = createRes.channel;
  const streamKey = createRes.streamKey;

  return {
    channelArn: channel.arn,
    streamKeyArn: streamKey.arn,
    streamKeyValue: streamKey.value,
    ingestEndpoint: channel.ingestEndpoint,
    playbackUrl: channel.playbackUrl,
  };
}

/**
 * Delete an IVS channel when a stream is removed.
 *
 * @param {string} channelArn – ARN of the channel to delete
 */
export async function deleteIvsChannel(channelArn) {
  if (!isIvsConfigured() || channelArn.startsWith("placeholder:")) {
    return;
  }

  try {
    await ivs.send(new DeleteChannelCommand({ arn: channelArn }));
  } catch (error) {
    console.error("[IVS] Failed to delete channel:", channelArn, error.message);
  }
}

/**
 * Get the stream key value for an existing channel.
 *
 * @param {string} channelArn
 * @returns {string|null}
 */
export async function getIvsStreamKey(channelArn) {
  if (!isIvsConfigured() || channelArn.startsWith("placeholder:")) {
    return null;
  }

  try {
    // List stream keys for the channel
    const listRes = await ivs.send(
      new ListStreamKeysCommand({ channelArn, maxResults: 1 })
    );

    if (!listRes.streamKeys || listRes.streamKeys.length === 0) return null;

    // Get the actual stream key value
    const getRes = await ivs.send(
      new GetStreamKeyCommand({ arn: listRes.streamKeys[0].arn })
    );

    return getRes.streamKey?.value || null;
  } catch (error) {
    console.error("[IVS] Failed to get stream key:", error.message);
    return null;
  }
}
