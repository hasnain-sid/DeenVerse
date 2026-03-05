/**
 * Seed script — creates a fresh admin account.
 *
 * Usage (run from /backend):
 *   node scripts/seedAdmin.js
 *
 * If an account with admin@deenverse.com already exists, it is updated to role=admin.
 */

import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: `${__dirname}/../.env` });

const ADMIN_EMAIL    = "admin@deenverse.com";
const ADMIN_USERNAME = "admin_dv";
const ADMIN_NAME     = "DeenVerse Admin";
const ADMIN_PASSWORD = "DeenAdmin@2026!";

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["user", "scholar", "moderator", "admin"], default: "user" },
  saved:    [{ type: String }],
  bio:      { type: String, default: "" },
  avatar:   { type: String, default: "" },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✓ Connected to MongoDB");

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    existing.role = "admin";
    existing.password = hashedPassword;
    await existing.save();
    console.log(`✓ Updated existing account → role set to admin`);
    console.log(`  ID: ${existing._id}`);
  } else {
    const admin = await User.create({
      name:     ADMIN_NAME,
      username: ADMIN_USERNAME,
      email:    ADMIN_EMAIL,
      password: hashedPassword,
      role:     "admin",
    });
    console.log(`✓ Admin account created`);
    console.log(`  ID: ${admin._id}`);
  }

  console.log("\n── Admin credentials ─────────────────");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log("──────────────────────────────────────\n");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("✗ Seed failed:", err.message);
  process.exit(1);
});
