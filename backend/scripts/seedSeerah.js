/**
 * Seed script — populates the Seerah knowledge graph from backend/data/seerah/badr/.
 *
 * Usage (run from /backend):
 *   node scripts/seedSeerah.js
 *
 * Options:
 *   --force            Drops existing Seerah graph documents before seeding (full reset).
 *                      Touches SeerahEvent, HadithRef, TafsirPassage and KnowledgeLink only —
 *                      never ReviewDecision or KnowledgeAuditEvent, which are history.
 *   --offline          Skip the ayah text fetch and hash a deterministic marker instead.
 *   --author=<id>      ObjectId to record as the author. Defaults to ADMIN_IDS[0].
 *
 * Requires:
 *   MONGO_URI in .env.
 *   Network access to api.alquran.cloud, unless --offline is passed: snapshotHash is
 *   computed from the ayah text as it was at authoring time (quranService.getAyah) plus
 *   any stored excerpts, so that a later edition change is detectable (§1.5).
 *
 * Without --force the script is idempotent — it inserts only records whose natural key
 * does not already exist:
 *   events  → slug (derived from title)
 *   hadith  → collection + number
 *   tafsir  → work + verseKey
 *   links   → fromType/fromRef/toType/toRef/relation/version
 *
 * Seed order is events → hadith → tafsir → links, because links resolve the other three
 * by natural key. Every link is created as `draft`, validated, and only then submitted to
 * `unreviewed`. Records that fail validation are PRINTED, never silently dropped.
 *
 * NOTE: the data in backend/data/seerah/badr/ is placeholder fixture content and includes
 * records that fail validation on purpose. See the README in that directory.
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { createHash } from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import slugify from "slugify";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(__dirname, "..", ".env") });

// Import models and services after env is loaded
const { SeerahEvent } = await import("../models/seerahEventSchema.js");
const { HadithRef } = await import("../models/hadithRefSchema.js");
const { TafsirPassage } = await import("../models/tafsirPassageSchema.js");
const { KnowledgeLink } = await import("../models/knowledgeLinkSchema.js");
const { domainForRelation } = await import("../utils/knowledgeDomain.js");

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌  MONGO_URI is not set in .env");
  process.exit(1);
}

const force = process.argv.includes("--force");
const offline = process.argv.includes("--offline");

const authorArg = process.argv
  .find((a) => a.startsWith("--author="))
  ?.split("=")[1];
const adminIds = (process.env.ADMIN_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const authorId = authorArg || adminIds[0];

if (!authorId || !mongoose.Types.ObjectId.isValid(authorId)) {
  console.error(
    "❌  No valid author. Set ADMIN_IDS in .env or pass --author=<objectId>."
  );
  process.exit(1);
}

// ── Load seed data ────────────────────────────────────
const dataDir = join(__dirname, "..", "data", "seerah", "badr");
const load = (file) => JSON.parse(readFileSync(join(dataDir, file), "utf-8"));

const events = load("events.json");
const hadith = load("hadith.json");
const tafsir = load("tafsir.json");
const links = load("links.json");

console.log(
  `📦  Loaded ${events.length} events, ${hadith.length} hadith refs, ` +
    `${tafsir.length} tafsir passages, ${links.length} links.`
);
if (offline) console.log("📴  --offline: ayah text will not be fetched.");

// ── Connect to MongoDB ────────────────────────────────
await mongoose.connect(MONGO_URI);
console.log("🔌  Connected to MongoDB.");

if (force) {
  const [e, h, t, l] = await Promise.all([
    SeerahEvent.deleteMany({}),
    HadithRef.deleteMany({}),
    TafsirPassage.deleteMany({}),
    KnowledgeLink.deleteMany({}),
  ]);
  console.log(
    `🗑️   Dropped ${e.deletedCount} events, ${h.deletedCount} hadith refs, ` +
      `${t.deletedCount} tafsir passages, ${l.deletedCount} links (--force).`
  );
}

// ── Failure reporting ─────────────────────────────────
const failures = [];
const fail = (kind, key, reason) => failures.push({ kind, key, reason });

const counts = {
  events: { inserted: 0, skipped: 0 },
  hadith: { inserted: 0, skipped: 0 },
  tafsir: { inserted: 0, skipped: 0 },
  links: { inserted: 0, skipped: 0 },
};

/** Strip the `_expectedFailure` documentation key before it reaches Mongoose. */
const stripMeta = ({ _expectedFailure, ...rest }) => rest;

// ── 1. Events (natural key: slug, derived from title) ─
for (const raw of events) {
  const seed = stripMeta(raw);
  const slug = slugify(seed.title ?? "", { lower: true, strict: true });

  if (await SeerahEvent.exists({ slug })) {
    counts.events.skipped++;
    continue;
  }

  try {
    await SeerahEvent.create({ ...seed, author: authorId });
    counts.events.inserted++;
  } catch (err) {
    fail("event", seed.title ?? "(untitled)", err.message);
  }
}

// ── 2. Hadith refs (natural key: collection + number) ─
for (const raw of hadith) {
  const seed = stripMeta(raw);
  const key = `${seed.collection}:${seed.number}`;

  if (await HadithRef.exists({ collection: seed.collection, number: seed.number })) {
    counts.hadith.skipped++;
    continue;
  }

  try {
    await HadithRef.create(seed);
    counts.hadith.inserted++;
  } catch (err) {
    fail("hadith", key, err.message);
  }
}

// ── 3. Tafsir passages (natural key: work + verseKey) ─
for (const raw of tafsir) {
  const seed = stripMeta(raw);
  const key = `${seed.work}:${seed.verseKey}`;

  if (await TafsirPassage.exists({ work: seed.work, verseKey: seed.verseKey })) {
    counts.tafsir.skipped++;
    continue;
  }

  try {
    await TafsirPassage.create(seed);
    counts.tafsir.inserted++;
  } catch (err) {
    fail("tafsir", key, err.message);
  }
}

// ── Natural-key resolution for link endpoints ─────────

/**
 * Resolve an endpoint reference to the value stored in fromRef/toRef.
 * Ayahs are not stored nodes — their ref is the verse key itself (§3.1).
 */
async function resolveEndpoint({ type, ref }) {
  if (type === "ayah") {
    if (!/^\d{1,3}:\d{1,3}$/.test(ref)) {
      throw new Error(`Not a verse key: "${ref}"`);
    }
    return ref;
  }

  if (type === "seerahEvent") {
    const doc = await SeerahEvent.findOne({ slug: ref }).select("_id").lean();
    if (!doc) throw new Error(`No SeerahEvent with slug "${ref}"`);
    return doc._id.toString();
  }

  if (type === "hadithRef") {
    const [collection, ...rest] = ref.split(":");
    const doc = await HadithRef.findOne({ collection, number: rest.join(":") })
      .select("_id")
      .lean();
    if (!doc) throw new Error(`No HadithRef "${ref}"`);
    return doc._id.toString();
  }

  if (type === "tafsirPassage") {
    // "work:surah:ayah" — the work is the first segment, the verse key is the rest
    const [work, ...rest] = ref.split(":");
    const doc = await TafsirPassage.findOne({ work, verseKey: rest.join(":") })
      .select("_id")
      .lean();
    if (!doc) throw new Error(`No TafsirPassage "${ref}"`);
    return doc._id.toString();
  }

  throw new Error(`Unknown endpoint type: "${type}"`);
}

// ── Snapshot hashing ──────────────────────────────────

let getAyah;
let findAyahIdBySurah;
if (!offline) {
  ({ getAyah } = await import("../services/quranService.js"));
  ({ findAyahIdBySurah } = await import("quran-meta/hafs"));
}

/**
 * Hash the quoted material an edge depends on, so a later upstream edition change
 * is detectable and a reviewer's decision stays bound to the text they saw (§1.5).
 */
async function snapshotFor(link) {
  const material = [];

  for (const endpoint of [link.from, link.to]) {
    if (endpoint.type !== "ayah") continue;

    if (offline) {
      material.push(`offline-placeholder:${endpoint.ref}`);
      continue;
    }

    const [surah, ayah] = endpoint.ref.split(":").map(Number);
    const globalAyahNumber = findAyahIdBySurah(surah, ayah);
    if (!globalAyahNumber || globalAyahNumber < 1 || globalAyahNumber > 6236) {
      throw new Error(`Surah ${surah} has no ayah ${ayah}`);
    }
    const { arabic, translation } = await getAyah(globalAyahNumber);
    material.push(`${endpoint.ref}\n${arabic}\n${translation}`);
  }

  material.push(link.source.work, link.source.locator, link.grading.label);

  return createHash("sha256").update(material.join("␞")).digest("hex");
}

// ── 4. Links ──────────────────────────────────────────
for (const raw of links) {
  const seed = stripMeta(raw);
  const label = `${seed.from?.ref} -[${seed.relation}]-> ${seed.to?.ref}`;

  try {
    const fromRef = await resolveEndpoint(seed.from);
    const toRef = await resolveEndpoint(seed.to);

    const naturalKey = {
      fromType: seed.from.type,
      fromRef,
      toType: seed.to.type,
      toRef,
      relation: seed.relation,
      version: 1,
    };

    if (await KnowledgeLink.exists(naturalKey)) {
      counts.links.skipped++;
      continue;
    }

    const doc = new KnowledgeLink({
      ...naturalKey,
      source: seed.source,
      grading: seed.grading,
      confidence: seed.confidence,
      disagreement: seed.disagreement,
      snapshotHash: await snapshotFor(seed),
      snapshotNote: seed.snapshotNote ?? "",
      review: {
        // Created as draft, then submitted below only if it validates.
        state: "draft",
        domain: domainForRelation(seed.relation),
      },
      author: authorId,
    });

    // validate() runs the pre("validate") hook; validateSync() would skip it, and that
    // hook is what enforces the revealed_concerning rule.
    await doc.validate();

    doc.review.state = "unreviewed";
    await doc.save();
    counts.links.inserted++;
  } catch (err) {
    fail("link", label, err.message);
  }
}

// ── Report ────────────────────────────────────────────
console.log("");
console.log(
  `✅  Events           — ${counts.events.inserted} inserted, ${counts.events.skipped} skipped.`
);
console.log(
  `✅  Hadith refs      — ${counts.hadith.inserted} inserted, ${counts.hadith.skipped} skipped.`
);
console.log(
  `✅  Tafsir passages  — ${counts.tafsir.inserted} inserted, ${counts.tafsir.skipped} skipped.`
);
console.log(
  `✅  Links            — ${counts.links.inserted} inserted, ${counts.links.skipped} skipped (all submitted to "unreviewed").`
);

if (failures.length) {
  console.log("");
  console.log(`⚠️   ${failures.length} record(s) failed validation and were NOT seeded:`);
  for (const f of failures) {
    console.log(`   • [${f.kind}] ${f.key}`);
    console.log(`     ${f.reason}`);
  }
  console.log("");
  console.log(
    "   Failures are reported, never silently dropped. The placeholder data ships with"
  );
  console.log(
    "   2 deliberate failures — see backend/data/seerah/badr/README.md."
  );
}

await mongoose.disconnect();
console.log("");
console.log("🔌  Disconnected from MongoDB.");
process.exit(0);
