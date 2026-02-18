import * as pushService from "../services/pushService.js";

// GET /api/v1/push/vapid-key — public key for subscription
const getVapidKey = (req, res) => {
  res.json({ publicKey: pushService.getVapidPublicKey() });
};

// POST /api/v1/push/subscribe — register push subscription
const subscribePush = async (req, res, next) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: "Invalid subscription object" });
    }

    const doc = await pushService.subscribe(
      req.user._id,
      subscription,
      req.headers["user-agent"]
    );
    res.status(201).json({ message: "Subscribed", id: doc._id });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/push/unsubscribe — remove push subscription
const unsubscribePush = async (req, res, next) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: "endpoint is required" });
    }
    await pushService.unsubscribe(req.user._id, endpoint);
    res.json({ message: "Unsubscribed" });
  } catch (err) {
    next(err);
  }
};

export { getVapidKey, subscribePush, unsubscribePush };
