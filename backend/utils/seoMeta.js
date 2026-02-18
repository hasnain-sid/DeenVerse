/**
 * SEO utility — generates Open Graph meta tags for server-rendered pages.
 * Can be used with an Express route to serve pre-rendered meta for crawlers,
 * or integrated into a Vercel Edge function.
 */

const BASE_URL = process.env.FRONTEND_URL || "https://deenverse.com";
const DEFAULT_IMAGE = `${BASE_URL}/icons/og-default.png`;

/**
 * Generate meta tag HTML string for a hadith page
 */
export function hadithMeta(hadith) {
  const title = `Hadith — ${hadith.source || "DeenVerse"}`;
  const description =
    hadith.translation?.slice(0, 200) ||
    hadith.arabic?.slice(0, 200) ||
    "Explore authentic hadiths on DeenVerse";
  const url = `${BASE_URL}/hadith/${hadith.id}`;
  const image = hadith.shareImage || DEFAULT_IMAGE;

  return buildMetaTags({ title, description, url, image, type: "article" });
}

/**
 * Generate meta tag HTML string for a user profile
 */
export function profileMeta(user) {
  const title = `${user.name} (@${user.username}) — DeenVerse`;
  const description =
    user.bio?.slice(0, 200) || `${user.name}'s profile on DeenVerse — Islamic Knowledge & Community`;
  const url = `${BASE_URL}/user/${user.username}`;
  const image = user.avatar || DEFAULT_IMAGE;

  return buildMetaTags({ title, description, url, image, type: "profile" });
}

/**
 * Generate meta tag HTML string for a post
 */
export function postMeta(post) {
  const authorName = post.author?.name || "DeenVerse User";
  const title = `${authorName} on DeenVerse`;
  const description = post.content?.slice(0, 200) || "A post on DeenVerse";
  const url = `${BASE_URL}/post/${post._id}`;
  const image = post.images?.[0] || DEFAULT_IMAGE;

  return buildMetaTags({ title, description, url, image, type: "article" });
}

/**
 * Generate meta tag HTML string for a stream
 */
export function streamMeta(stream) {
  const title = `${stream.title} — Live on DeenVerse`;
  const description =
    stream.description?.slice(0, 200) ||
    `${stream.host?.name || "Scholar"} is streaming ${stream.category?.replace("_", " ")} live`;
  const url = `${BASE_URL}/stream/${stream._id}`;
  const image = stream.thumbnailUrl || DEFAULT_IMAGE;

  return buildMetaTags({ title, description, url, image, type: "video.other" });
}

/**
 * Build the full meta tags HTML string
 */
function buildMetaTags({ title, description, url, image, type }) {
  return {
    title,
    description,
    url,
    image,
    type,
    html: `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:site_name" content="DeenVerse" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${url}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${image}" />
  `.trim(),
  };
}

/**
 * Generate sitemap XML for the most important pages
 */
export function generateSitemapXml(routes) {
  const urls = routes
    .map(
      (r) => `  <url>
    <loc>${BASE_URL}${r.path}</loc>
    <lastmod>${r.lastmod || new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${r.changefreq || "weekly"}</changefreq>
    <priority>${r.priority || "0.5"}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
