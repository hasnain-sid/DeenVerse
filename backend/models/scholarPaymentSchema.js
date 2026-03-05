import mongoose from "mongoose";

const scholarPaymentSchema = new mongoose.Schema(
  {
    scholar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["course-revenue", "monthly-stipend", "session-fee", "bonus"],
      required: true,
    },
    courseRevenue: {
      course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      totalAmount: { type: Number },
      platformFee: { type: Number },
      scholarAmount: { type: Number },
      studentCount: { type: Number },
    },
    stipend: {
      amount: { type: Number },
      period: { type: String },
      reason: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "failed"],
      default: "pending",
    },
    stripeTransferId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    period: {
      start: { type: Date },
      end: { type: Date },
    },
  },
  { timestamps: true }
);

const ScholarPayment = mongoose.model("ScholarPayment", scholarPaymentSchema);
export { ScholarPayment };
