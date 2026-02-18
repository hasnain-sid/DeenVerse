import express from "express";
import { generateSitemapXml, hadithMeta, postMeta, profileMeta, streamMeta } from "../utils/seoMeta.js";
import { Post } from "../models/postSchema.js";
import { User } from "../models/userSchema.js";

const router = express.Router();

/**
 * GET /sitemap.xml — Dynamic sitemap for SEO
 */
router.get("/sitemap.xml", async (_req, res) => {
  try {
    const staticRoutes = [
      { path: "/", priority: "1.0", changefreq: "daily" },
      { path: "/explore", priority: "0.8", changefreq: "daily" },
      { path: "/streams", priority: "0.7", changefreq: "hourly" },
    ];

    // Add top user profiles
    const users = await User.find({ banned: { $ne: true } })
      .sort({ followers: -1 })
      .limit(100)
      .select("username updatedAt")
      .lean();

    const userRoutes = users.map((u) => ({
      path: `/user/${u.username}`,
      lastmod: u.updatedAt?.toISOString?.().split("T")[0],
      priority: "0.6",
      changefreq: "weekly",
    }));

    const xml = generateSitemapXml([...staticRoutes, ...userRoutes]);
    res.set("Content-Type", "application/xml");
    res.send(xml);
  } catch {
    res.status(500).send("Error generating sitemap");
  }
});

/**
 * GET /robots.txt
 */
router.get("/robots.txt", (_req, res) => {
  res.set("Content-Type", "text/plain");
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /settings/
Disallow: /messages/

Sitemap: ${process.env.FRONTEND_URL || "https://deenverse.com"}/sitemap.xml
`);
});

export default router;
