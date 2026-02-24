/**
 * Seed script — populates the Sign collection from signsSeed.json.
 *
 * Usage (run from /backend):
 *   node scripts/seedSigns.js
 *
 * Options:
 *   --force   Drops all existing signs before seeding (full reset)
 *
 * Without --force, the script is idempotent:
 *   it inserts only entries whose title does not already exist.
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import dotenv from "dotenv";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(__dirname, "..", ".env") });

// Import model after env is loaded
const { default: Sign } = await import("../models/signSchema.js");

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌  MONGO_URI is not set in .env");
  process.exit(1);
}

const force = process.argv.includes("--force");

// ── Load seed data ────────────────────────────────────
const seedPath = join(__dirname, "..", "data", "signsSeed.json");
const seeds = JSON.parse(readFileSync(seedPath, "utf-8"));
console.log(`📦  Loaded ${seeds.length} signs from seed file.`);

// ── Connect to MongoDB ────────────────────────────────
await mongoose.connect(MONGO_URI);
console.log("🔌  Connected to MongoDB.");

if (force) {
  const deleted = await Sign.deleteMany({});
  console.log(`🗑️   Dropped ${deleted.deletedCount} existing signs (--force).`);
}

// ── Insert (upsert by title to stay idempotent) ───────
let inserted = 0;
let skipped = 0;

for (const seed of seeds) {
  const exists = await Sign.exists({ title: seed.title });
  if (exists) {
    skipped++;
    continue;
  }
  await Sign.create(seed);
  inserted++;
}

console.log(`✅  Seeding complete — ${inserted} inserted, ${skipped} skipped.`);

await mongoose.disconnect();
console.log("🔌  Disconnected from MongoDB.");
process.exit(0);
