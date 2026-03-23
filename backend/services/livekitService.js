import crypto from "node:crypto";
import {
  AccessToken,
  RoomServiceClient,
  EgressClient,
  EncodedFileType,
  S3Upload,
  RoomCompositeEgressRequest,
  EncodingOptionsPreset,
} from "livekit-server-sdk";
import { AppError } from "../utils/AppError.js";

// ---------------------------------------------------------------------------
// Config helpers
// ---------------------------------------------------------------------------

const LIVEKIT_API_KEY = () => process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = () => process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = () => process.env.LIVEKIT_URL; // e.g. wss://my.livekit.cloud

/**
 * Check whether LiveKit environment variables are configured.
 */
export function isLivekitConfigured() {
  return !!(LIVEKIT_API_KEY() && LIVEKIT_API_SECRET() && LIVEKIT_URL());
}

/**
 * Build a RoomServiceClient (internal helper).
 */
function getRoomService() {
  return new RoomServiceClient(LIVEKIT_URL(), LIVEKIT_API_KEY(), LIVEKIT_API_SECRET());
}

/**
 * Build an EgressClient (internal helper).
 */
function getEgressClient() {
  return new EgressClient(LIVEKIT_URL(), LIVEKIT_API_KEY(), LIVEKIT_API_SECRET());
}

// ---------------------------------------------------------------------------
// Room management
// ---------------------------------------------------------------------------

/**
 * Create a LiveKit room.
 *
 * @param {string}  roomName         — unique room identifier
 * @param {number}  maxParticipants  — max participants allowed (default 50)
 * @param {number}  emptyTimeout     — seconds before auto-deleting an empty room (default 600)
 * @returns {Promise<{ name: string, sid: string }>}
 */
export async function createRoom(roomName, maxParticipants = 50, emptyTimeout = 600) {
  if (!isLivekitConfigured()) {
    console.warn("[LiveKit] Not configured — returning placeholder room");
    return {
      name: roomName,
      sid: `placeholder-sid-${crypto.randomUUID()}`,
    };
  }

  try {
    const svc = getRoomService();
    const room = await svc.createRoom({
      name: roomName,
      maxParticipants,
      emptyTimeout,
    });
    return { name: room.name, sid: room.sid };
  } catch (err) {
    throw new AppError(`Failed to create LiveKit room: ${err.message}`, 502);
  }
}

/**
 * Delete a LiveKit room.
 *
 * @param {string} roomName
 */
export async function deleteRoom(roomName) {
  if (!isLivekitConfigured() || roomName.startsWith("placeholder")) {
    return;
  }

  try {
    const svc = getRoomService();
    await svc.deleteRoom(roomName);
  } catch (err) {
    console.error("[LiveKit] Failed to delete room:", roomName, err.message);
  }
}

// ---------------------------------------------------------------------------
// Token generation
// ---------------------------------------------------------------------------

/**
 * Generate a LiveKit access token for a participant.
 *
 * @param {string} userId    — used as the identity claim
 * @param {string} userName  — display name
 * @param {string} roomName  — room to grant access to
 * @param {object} options
 * @param {boolean}  [options.isHost=false]
 * @param {boolean}  [options.canPublish=true]
 * @param {boolean}  [options.canSubscribe=true]
 * @param {boolean}  [options.canPublishData=true]
 * @param {number}   [options.ttlSeconds=5400]  — token TTL (default 90 min)
 * @returns {Promise<string>}  signed JWT
 */
export async function generateToken(userId, userName, roomName, options = {}) {
  if (!isLivekitConfigured()) {
    console.warn("[LiveKit] Not configured — returning placeholder token");
    return `placeholder-token-${crypto.randomUUID()}`;
  }

  const {
    isHost = false,
    canPublish = true,
    canSubscribe = true,
    canPublishData = true,
    ttlSeconds = 5400, // 90 min default
  } = options;

  try {
    const token = new AccessToken(LIVEKIT_API_KEY(), LIVEKIT_API_SECRET());
    token.identity = String(userId);
    token.name = userName;
    token.ttl = `${ttlSeconds}s`;

    token.addGrant({
      roomJoin: true,
      room: roomName,
      roomAdmin: isHost,
      canPublish: isHost ? true : canPublish,
      canSubscribe,
      canPublishData,
      canUpdateOwnMetadata: isHost,
    });

    return await token.toJwt();
  } catch (err) {
    throw new AppError(`Failed to generate LiveKit token: ${err.message}`, 502);
  }
}

// ---------------------------------------------------------------------------
// Participant management
// ---------------------------------------------------------------------------

/**
 * List active participants in a room.
 *
 * @param {string} roomName
 * @returns {Promise<Array<{ identity: string, name: string, state: number, tracks: object[] }>>}
 */
export async function listParticipants(roomName) {
  if (!isLivekitConfigured()) {
    return [];
  }

  try {
    const svc = getRoomService();
    const participants = await svc.listParticipants(roomName);
    return participants.map((p) => ({
      identity: p.identity,
      name: p.name,
      state: p.state,
      tracks: p.tracks,
    }));
  } catch (err) {
    throw new AppError(`Failed to list participants: ${err.message}`, 502);
  }
}

/**
 * Mute or unmute a participant's track.
 *
 * If no trackSid is provided the function resolves the first published track
 * matching the requested media kind (audio / video) from the participant's
 * current tracks.
 *
 * @param {string}  roomName
 * @param {string}  identity   — participant identity (userId)
 * @param {string|null} trackSid  — specific track SID, or null to auto-resolve
 * @param {boolean} muted
 * @param {"audio"|"video"} [kind="audio"] — used when trackSid is null
 */
export async function muteParticipant(roomName, identity, trackSid, muted, kind = "audio") {
  if (!isLivekitConfigured()) {
    console.warn("[LiveKit] Not configured — mute skipped");
    return;
  }

  try {
    const svc = getRoomService();

    let sid = trackSid;
    if (!sid) {
      // Resolve trackSid from participant's published tracks
      const participant = await svc.getParticipant(roomName, identity);
      const track = (participant.tracks || []).find((t) => {
        if (kind === "audio") return t.source === 1; // MICROPHONE
        if (kind === "video") return t.source === 2; // CAMERA
        return false;
      });
      if (!track) {
        throw new AppError(`No ${kind} track found for participant ${identity}`, 404);
      }
      sid = track.sid;
    }

    await svc.mutePublishedTrack(roomName, identity, sid, muted);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(`Failed to mute participant: ${err.message}`, 502);
  }
}

/**
 * Remove (kick) a participant from the room.
 *
 * @param {string} roomName
 * @param {string} identity — participant identity (userId)
 */
export async function removeParticipant(roomName, identity) {
  if (!isLivekitConfigured()) {
    console.warn("[LiveKit] Not configured — remove skipped");
    return;
  }

  try {
    const svc = getRoomService();
    await svc.removeParticipant(roomName, identity);
  } catch (err) {
    throw new AppError(`Failed to remove participant: ${err.message}`, 502);
  }
}

// ---------------------------------------------------------------------------
// Recording (Egress)
// ---------------------------------------------------------------------------

/**
 * Start a composite recording of a room and upload to S3.
 *
 * @param {string} roomName
 * @param {{ bucket: string, region: string, accessKey: string, secret: string, prefix?: string }} s3Config
 * @returns {Promise<{ egressId: string }>}
 */
export async function startRecording(roomName, s3Config) {
  if (!isLivekitConfigured()) {
    console.warn("[LiveKit] Not configured — returning placeholder egressId");
    return { egressId: `placeholder-egress-${crypto.randomUUID()}` };
  }

  if (!s3Config || !s3Config.bucket) {
    throw new AppError("S3 configuration required for recording", 400);
  }

  try {
    const egress = getEgressClient();

    const output = new EncodedFileOutput({
      fileType: EncodedFileType.MP4,
      filepath: `${s3Config.prefix || "recordings"}/${roomName}/{time}.mp4`,
      output: {
        case: "s3",
        value: new S3Upload({
          bucket: s3Config.bucket,
          region: s3Config.region,
          accessKey: s3Config.accessKey,
          secret: s3Config.secret,
        }),
      },
    });

    const info = await egress.startRoomCompositeEgress(roomName, { file: output }, {
      encodingOptions: EncodingOptionsPreset.H264_720P_30,
    });

    return { egressId: info.egressId };
  } catch (err) {
    throw new AppError(`Failed to start recording: ${err.message}`, 502);
  }
}

/**
 * Stop an active Egress recording.
 *
 * @param {string} egressId
 * @returns {Promise<{ egressId: string }>}
 */
export async function stopRecording(egressId) {
  if (!isLivekitConfigured() || egressId.startsWith("placeholder")) {
    return { egressId };
  }

  try {
    const egress = getEgressClient();
    const info = await egress.stopEgress(egressId);
    return { egressId: info.egressId };
  } catch (err) {
    throw new AppError(`Failed to stop recording: ${err.message}`, 502);
  }
}
