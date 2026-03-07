import mongoose from "mongoose";
import slugify from "slugify";

const courseSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      maxlength: 200,
    },
    thumbnail: String,
    category: {
      type: String,
      enum: [
        "quran",
        "hadith",
        "fiqh",
        "aqeedah",
        "seerah",
        "arabic",
        "tajweed",
        "tafseer",
        "dawah",
        "other",
      ],
      required: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    language: {
      type: String,
      default: "en",
    },
    type: {
      type: String,
      enum: ["self-paced", "instructor-led", "hybrid"],
      required: true,
    },

    pricing: {
      type: {
        type: String,
        enum: ["free", "paid", "subscription"],
        default: "free",
      },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "usd" },
      stripePriceId: String,
    },

    modules: [
      {
        title: { type: String, required: true },
        description: String,
        order: { type: Number, required: true },
        lessons: [
          {
            title: { type: String, required: true },
            type: {
              type: String,
              enum: ["video", "text", "quiz", "live-session", "assignment"],
              required: true,
            },
            content: mongoose.Schema.Types.Mixed,
            duration: Number,
            order: { type: Number, required: true },
            isFree: { type: Boolean, default: false },
            resources: [{ name: String, url: String, type: String }],
          },
        ],
      },
    ],

    schedule: {
      startDate: Date,
      endDate: Date,
      recurrence: {
        type: String,
        enum: ["daily", "weekly", "biweekly", "custom"],
      },
      sessions: [{ date: Date, duration: Number, topic: String }],
      timezone: String,
    },

    requirements: [String],
    learningOutcomes: [String],
    tags: [String],

    status: {
      type: String,
      enum: ["draft", "pending-review", "published", "archived"],
      default: "draft",
    },
    enrollmentCount: { type: Number, default: 0 },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    maxStudents: { type: Number, default: 0 },
    certificateOnCompletion: { type: Boolean, default: false },
    autoEnroll: { type: Boolean, default: false },

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

// Auto-generate slug from title before saving
courseSchema.pre("save", async function (next) {
  if (!this.isModified("title")) return next();

  let baseSlug = slugify(this.title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  // Ensure uniqueness
  while (await mongoose.models.Course.exists({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = slug;
  next();
});

// Indexes
courseSchema.index({ slug: 1 }, { unique: true });
courseSchema.index({ instructor: 1 });
courseSchema.index({ status: 1, category: 1 });
courseSchema.index({ tags: 1 });

export const Course = mongoose.model("Course", courseSchema);
