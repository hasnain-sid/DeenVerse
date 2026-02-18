import helmet from "helmet";

/**
 * Security middleware bundle.
 *
 * Configures Helmet (CSP, HSTS, noSniff, etc.) and provides
 * an input sanitiser to strip XSS from user-generated content.
 */

/**
 * Pre-configured Helmet middleware.
 * Adjust CSP directives for your CDN / streaming domains.
 */
export function securityHeaders() {
  return helmet({
    // ── Content Security Policy ─────────────────
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],  // tighten in production
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://*.amazonaws.com",       // S3 images
          process.env.CDN_BASE_URL || "",  // CloudFront
        ].filter(Boolean),
        mediaSrc: [
          "'self'",
          "blob:",
          "https://*.amazonaws.com",
          "https://*.ivs.rocks",           // IVS streaming
          process.env.CDN_BASE_URL || "",
        ].filter(Boolean),
        connectSrc: [
          "'self'",
          "https://*.amazonaws.com",
          "wss:",                           // WebSocket (Socket.IO)
          "ws:",
          process.env.CDN_BASE_URL || "",
        ].filter(Boolean),
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
      },
    },

    // ── Other Helmet defaults ───────────────────
    crossOriginEmbedderPolicy: false, // needed for cross-origin images/media
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  });
}

// ── Input sanitisation ──────────────────────────────

import xss from "xss";

// Strict XSS cleaner — strips ALL HTML/script tags
const strictXss = new xss.FilterXSS({
  whiteList: {},          // Allow nothing
  stripIgnoreTag: true,   // Remove unknown tags
  stripIgnoreTagBody: ["script", "style"],
});

/**
 * Sanitise a single string value (strip all XSS).
 */
export function sanitize(input) {
  if (typeof input !== "string") return input;
  return strictXss.process(input).trim();
}

/**
 * Express middleware: recursively sanitise all string values in req.body, req.query, req.params.
 */
export function sanitizeInput(req, _res, next) {
  if (req.body) req.body = deepSanitize(req.body);
  if (req.query) req.query = deepSanitize(req.query);
  if (req.params) req.params = deepSanitize(req.params);
  next();
}

function deepSanitize(obj) {
  if (typeof obj === "string") return sanitize(obj);
  if (Array.isArray(obj)) return obj.map(deepSanitize);
  if (obj && typeof obj === "object") {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = deepSanitize(value);
    }
    return cleaned;
  }
  return obj;
}
