import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index: one subscription per endpoint per user
pushSubscriptionSchema.index({ user: 1, endpoint: 1 }, { unique: true });

export default mongoose.model("PushSubscription", pushSubscriptionSchema);
