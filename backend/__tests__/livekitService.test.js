import crypto from "node:crypto";
import { AppError } from "../utils/AppError.js";

// ── Mock livekit-server-sdk ─────────────────────────────

const mockCreateRoom = jest.fn();
const mockDeleteRoom = jest.fn();
const mockListParticipants = jest.fn();
const mockGetParticipant = jest.fn();
const mockMutePublishedTrack = jest.fn();
const mockRemoveParticipant = jest.fn();

const mockToJwt = jest.fn();

jest.mock("livekit-server-sdk", () => ({
  AccessToken: jest.fn().mockImplementation(() => ({
    identity: "",
    name: "",
    ttl: "",
    grants: {},
    addGrant: jest.fn().mockImplementation(function (grant) {
      this.grants = grant;
    }),
    toJwt: mockToJwt,
  })),
  RoomServiceClient: jest.fn().mockImplementation(() => ({
    createRoom: mockCreateRoom,
    deleteRoom: mockDeleteRoom,
    listParticipants: mockListParticipants,
    getParticipant: mockGetParticipant,
    mutePublishedTrack: mockMutePublishedTrack,
    removeParticipant: mockRemoveParticipant,
  })),
  EgressClient: jest.fn(),
  EncodedFileType: { MP4: "MP4" },
  S3Upload: jest.fn(),
  RoomCompositeEgressRequest: jest.fn(),
  EncodingOptionsPreset: { H264_720P_30: "H264_720P_30" },
}));

// ── Import after mocks ──────────────────────────────────

import {
  isLivekitConfigured,
  createRoom,
  deleteRoom,
  generateToken,
  listParticipants,
  muteParticipant,
  removeParticipant,
} from "../services/livekitService.js";

// ── Environment setup helpers ───────────────────────────

function setLivekitEnv() {
  process.env.LIVEKIT_API_KEY = "test-api-key";
  process.env.LIVEKIT_API_SECRET = "test-api-secret";
  process.env.LIVEKIT_URL = "wss://test.livekit.cloud";
}

function clearLivekitEnv() {
  delete process.env.LIVEKIT_API_KEY;
  delete process.env.LIVEKIT_API_SECRET;
  delete process.env.LIVEKIT_URL;
}

const originalEnv = { ...process.env };

afterEach(() => {
  jest.clearAllMocks();
  // Restore env
  process.env = { ...originalEnv };
});

// ── isLivekitConfigured ─────────────────────────────────

describe("isLivekitConfigured", () => {
  it("returns true when all env vars are set", () => {
    setLivekitEnv();
    expect(isLivekitConfigured()).toBe(true);
  });

  it("returns false when LIVEKIT_API_KEY is missing", () => {
    clearLivekitEnv();
    process.env.LIVEKIT_API_SECRET = "secret";
    process.env.LIVEKIT_URL = "wss://test.livekit.cloud";
    expect(isLivekitConfigured()).toBe(false);
  });

  it("returns false when LIVEKIT_API_SECRET is missing", () => {
    clearLivekitEnv();
    process.env.LIVEKIT_API_KEY = "key";
    process.env.LIVEKIT_URL = "wss://test.livekit.cloud";
    expect(isLivekitConfigured()).toBe(false);
  });

  it("returns false when LIVEKIT_URL is missing", () => {
    clearLivekitEnv();
    process.env.LIVEKIT_API_KEY = "key";
    process.env.LIVEKIT_API_SECRET = "secret";
    expect(isLivekitConfigured()).toBe(false);
  });

  it("returns false when all env vars are missing", () => {
    clearLivekitEnv();
    expect(isLivekitConfigured()).toBe(false);
  });
});

// ── generateToken ───────────────────────────────────────

describe("generateToken", () => {
  it("returns a JWT string for a host", async () => {
    setLivekitEnv();
    mockToJwt.mockResolvedValue("signed-jwt-for-host");

    const token = await generateToken("user1", "Scholar Ali", "room1", { isHost: true });

    expect(token).toBe("signed-jwt-for-host");
    expect(mockToJwt).toHaveBeenCalled();
  });

  it("grants roomAdmin=true for host", async () => {
    setLivekitEnv();
    mockToJwt.mockResolvedValue("host-jwt");

    const { AccessToken } = require("livekit-server-sdk");

    await generateToken("user1", "Scholar Ali", "room1", { isHost: true });

    // Get the instance created by AccessToken constructor
    const instance = AccessToken.mock.results[0].value;
    expect(instance.addGrant).toHaveBeenCalledWith(
      expect.objectContaining({
        roomAdmin: true,
        canPublish: true,
        canPublishData: true,
        roomJoin: true,
        room: "room1",
      })
    );
  });

  it("grants roomAdmin=false for participant", async () => {
    setLivekitEnv();
    mockToJwt.mockResolvedValue("participant-jwt");

    const { AccessToken } = require("livekit-server-sdk");

    await generateToken("user2", "Student Ahmed", "room1", { isHost: false });

    const instance = AccessToken.mock.results[0].value;
    expect(instance.addGrant).toHaveBeenCalledWith(
      expect.objectContaining({
        roomAdmin: false,
        canSubscribe: true,
        roomJoin: true,
        room: "room1",
      })
    );
  });

  it("respects canPublish=false for participant", async () => {
    setLivekitEnv();
    mockToJwt.mockResolvedValue("jwt");

    const { AccessToken } = require("livekit-server-sdk");

    await generateToken("user2", "Student", "room1", {
      isHost: false,
      canPublish: false,
    });

    const instance = AccessToken.mock.results[0].value;
    expect(instance.addGrant).toHaveBeenCalledWith(
      expect.objectContaining({
        canPublish: false,
      })
    );
  });

  it("host always gets canPublish=true regardless of options", async () => {
    setLivekitEnv();
    mockToJwt.mockResolvedValue("jwt");

    const { AccessToken } = require("livekit-server-sdk");

    await generateToken("user1", "Host", "room1", {
      isHost: true,
      canPublish: false, // should be overridden
    });

    const instance = AccessToken.mock.results[0].value;
    expect(instance.addGrant).toHaveBeenCalledWith(
      expect.objectContaining({
        canPublish: true,
      })
    );
  });

  it("returns placeholder token when not configured", async () => {
    clearLivekitEnv();
    const token = await generateToken("user1", "Name", "room1");
    expect(token).toMatch(/^placeholder-token-/);
  });

  it("throws AppError on SDK failure", async () => {
    setLivekitEnv();
    mockToJwt.mockRejectedValue(new Error("SDK error"));

    await expect(
      generateToken("user1", "Name", "room1")
    ).rejects.toThrow(AppError);
  });
});

// ── createRoom ──────────────────────────────────────────

describe("createRoom", () => {
  it("creates a room with correct params when configured", async () => {
    setLivekitEnv();
    mockCreateRoom.mockResolvedValue({ name: "room1", sid: "sid-abc" });

    const result = await createRoom("room1", 100, 300);

    expect(result).toEqual({ name: "room1", sid: "sid-abc" });
    expect(mockCreateRoom).toHaveBeenCalledWith({
      name: "room1",
      maxParticipants: 100,
      emptyTimeout: 300,
    });
  });

  it("uses default maxParticipants=50 and emptyTimeout=600", async () => {
    setLivekitEnv();
    mockCreateRoom.mockResolvedValue({ name: "room1", sid: "sid-abc" });

    await createRoom("room1");

    expect(mockCreateRoom).toHaveBeenCalledWith({
      name: "room1",
      maxParticipants: 50,
      emptyTimeout: 600,
    });
  });

  it("returns placeholder when not configured", async () => {
    clearLivekitEnv();
    const result = await createRoom("room1");

    expect(result.name).toBe("room1");
    expect(result.sid).toMatch(/^placeholder-sid-/);
    expect(mockCreateRoom).not.toHaveBeenCalled();
  });

  it("throws AppError on SDK failure", async () => {
    setLivekitEnv();
    mockCreateRoom.mockRejectedValue(new Error("Network error"));

    await expect(createRoom("room1")).rejects.toThrow(AppError);
    await expect(createRoom("room1")).rejects.toThrow(/Failed to create LiveKit room/);
  });
});

// ── deleteRoom ──────────────────────────────────────────

describe("deleteRoom", () => {
  it("calls RoomServiceClient.deleteRoom when configured", async () => {
    setLivekitEnv();
    mockDeleteRoom.mockResolvedValue(undefined);

    await deleteRoom("room1");

    expect(mockDeleteRoom).toHaveBeenCalledWith("room1");
  });

  it("skips when not configured", async () => {
    clearLivekitEnv();
    await deleteRoom("room1");
    expect(mockDeleteRoom).not.toHaveBeenCalled();
  });

  it("skips placeholder rooms", async () => {
    setLivekitEnv();
    await deleteRoom("placeholder-room");
    expect(mockDeleteRoom).not.toHaveBeenCalled();
  });

  it("does not throw on SDK failure (logs instead)", async () => {
    setLivekitEnv();
    mockDeleteRoom.mockRejectedValue(new Error("fail"));

    // deleteRoom catches errors internally
    await expect(deleteRoom("room1")).resolves.toBeUndefined();
  });
});

// ── muteParticipant ─────────────────────────────────────

describe("muteParticipant", () => {
  it("delegates to RoomServiceClient.mutePublishedTrack with provided trackSid", async () => {
    setLivekitEnv();
    mockMutePublishedTrack.mockResolvedValue(undefined);

    await muteParticipant("room1", "user1", "track-sid-1", true, "audio");

    expect(mockMutePublishedTrack).toHaveBeenCalledWith(
      "room1", "user1", "track-sid-1", true
    );
  });

  it("auto-resolves trackSid when not provided (audio)", async () => {
    setLivekitEnv();
    mockGetParticipant.mockResolvedValue({
      tracks: [{ source: 1, sid: "audio-track-1" }],
    });
    mockMutePublishedTrack.mockResolvedValue(undefined);

    await muteParticipant("room1", "user1", null, true, "audio");

    expect(mockGetParticipant).toHaveBeenCalledWith("room1", "user1");
    expect(mockMutePublishedTrack).toHaveBeenCalledWith(
      "room1", "user1", "audio-track-1", true
    );
  });

  it("auto-resolves trackSid when not provided (video)", async () => {
    setLivekitEnv();
    mockGetParticipant.mockResolvedValue({
      tracks: [{ source: 2, sid: "video-track-1" }],
    });
    mockMutePublishedTrack.mockResolvedValue(undefined);

    await muteParticipant("room1", "user1", null, false, "video");

    expect(mockMutePublishedTrack).toHaveBeenCalledWith(
      "room1", "user1", "video-track-1", false
    );
  });

  it("throws AppError when no matching track found", async () => {
    setLivekitEnv();
    mockGetParticipant.mockResolvedValue({ tracks: [] });

    await expect(
      muteParticipant("room1", "user1", null, true, "audio")
    ).rejects.toThrow(/No audio track found/);
  });

  it("skips when not configured", async () => {
    clearLivekitEnv();
    await muteParticipant("room1", "user1", null, true);
    expect(mockMutePublishedTrack).not.toHaveBeenCalled();
  });
});

// ── removeParticipant ───────────────────────────────────

describe("removeParticipant", () => {
  it("delegates to RoomServiceClient.removeParticipant", async () => {
    setLivekitEnv();
    mockRemoveParticipant.mockResolvedValue(undefined);

    await removeParticipant("room1", "user1");

    expect(mockRemoveParticipant).toHaveBeenCalledWith("room1", "user1");
  });

  it("skips when not configured", async () => {
    clearLivekitEnv();
    await removeParticipant("room1", "user1");
    expect(mockRemoveParticipant).not.toHaveBeenCalled();
  });

  it("throws AppError on SDK failure", async () => {
    setLivekitEnv();
    mockRemoveParticipant.mockRejectedValue(new Error("fail"));

    await expect(
      removeParticipant("room1", "user1")
    ).rejects.toThrow(AppError);
  });
});

// ── listParticipants ────────────────────────────────────

describe("listParticipants", () => {
  it("returns mapped participant data", async () => {
    setLivekitEnv();
    mockListParticipants.mockResolvedValue([
      { identity: "u1", name: "Ali", state: 1, tracks: [], extra: "ignored" },
      { identity: "u2", name: "Fatima", state: 1, tracks: [{ sid: "t1" }], extra: "x" },
    ]);

    const result = await listParticipants("room1");

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ identity: "u1", name: "Ali", state: 1, tracks: [] });
    expect(result[1].extra).toBeUndefined();
  });

  it("returns empty array when not configured", async () => {
    clearLivekitEnv();
    const result = await listParticipants("room1");
    expect(result).toEqual([]);
  });
});
