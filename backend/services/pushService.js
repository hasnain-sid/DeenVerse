import webpush from "web-push";
import PushSubscription from "../models/pushSubscriptionSchema.js";

// ── Configure VAPID keys ─────────────────────────────────────────────────

const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY || "BPlaceholderPublicKeyThatWillBeReplacedWithRealOne123456789012345678901234567890";
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || "placeholder-private-key";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@deenverse.com";

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch {
  console.warn(
    "⚠️  Push notifications disabled — set VAPID_PUBLIC_KEY & VAPID_PRIVATE_KEY in .env.\n" +
      '   Generate with: npx web-push generate-vapid-keys'
  );
}

// ── Public key (sent to frontend) ────────────────────────────────────────

function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY;
}

// ── Subscribe ────────────────────────────────────────────────────────────

async function subscribe(userId, subscription, userAgent) {
  const doc = await PushSubscription.findOneAndUpdate(
    { user: userId, endpoint: subscription.endpoint },
    {
      user: userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent,
      active: true,
    },
    { upsert: true, new: true }
  );
  return doc;
}

// ── Unsubscribe ──────────────────────────────────────────────────────────

async function unsubscribe(userId, endpoint) {
  await PushSubscription.deleteOne({ user: userId, endpoint });
}

// ── Send push to a specific user ─────────────────────────────────────────

async function sendPushToUser(userId, payload) {
  const subs = await PushSubscription.find({ user: userId, active: true });

  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify(payload)
        );
      } catch (err) {
        // 404/410 → subscription expired, deactivate it
        if (err.statusCode === 404 || err.statusCode === 410) {
          sub.active = false;
          await sub.save();
        }
        throw err;
      }
    })
  );

  return results;
}

// ── Convenience: push for notification events ────────────────────────────

async function pushNotification(notification) {
  const typeLabels = {
    like: "liked your post",
    reply: "replied to your post",
    follow: "started following you",
    repost: "reposted your post",
    mention: "mentioned you",
    system: "System notification",
    stream_live: "is now live!",
  };

  const senderName = notification.sender?.name || "Someone";
  const body = `${senderName} ${typeLabels[notification.type] || "interacted with you"}`;

  try {
    await sendPushToUser(notification.recipient.toString(), {
      title: "DeenVerse",
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      data: {
        type: notification.type,
        url: notification.post
          ? `/post/${notification.post}`
          : notification.type === "follow"
            ? `/user/${notification.sender?.username || ""}`
            : "/notifications",
      },
    });
  } catch {
    // Push failure is non-critical — don't crash the caller
  }
}

export {
  getVapidPublicKey,
  subscribe,
  unsubscribe,
  sendPushToUser,
  pushNotification,
};
