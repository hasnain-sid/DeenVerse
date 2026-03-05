import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["course-purchase", "subscription", "refund"],
      required: true,
    },
    stripeSessionId: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
    },
    stripePaymentIntentId: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "refunded", "failed"],
      default: "pending",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    subscription: {
      stripePriceId: { type: String },
      plan: { type: String, enum: ["student", "premium"] },
      currentPeriodEnd: { type: Date },
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    scholarPayout: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export { Payment };
