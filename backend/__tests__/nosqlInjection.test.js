/**
 * NoSQL operator injection: request keys must not reach Mongo as query operators.
 *
 * deepSanitize used to copy every key verbatim, cleaning only the values. A body of
 * {"email": {"$ne": null}} or a query string of ?email[$ne]= therefore arrived at the
 * route as a live MongoDB operator, turning an equality lookup into "match anything".
 * Dotted keys ("user.role") reach into subdocuments the route never meant to expose.
 */

import express from "express";
import request from "supertest";
import { readFileSync } from "fs";
import { join } from "path";

import { sanitizeInput } from "../middlewares/security.js";
import errorHandler from "../middlewares/errorHandler.js";

jest.mock("../config/logger.js", () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

// ── Helpers ─────────────────────────────────────────────

function runMiddleware(req) {
  const next = jest.fn();
  sanitizeInput(req, {}, next);
  return next;
}

const makeReq = (over = {}) => ({ body: {}, query: {}, params: {}, ...over });

// ─────────────────────────────────────────────────────────
// Key rejection
// ─────────────────────────────────────────────────────────

describe("sanitizeInput — operator key rejection", () => {
  it("rejects a $-prefixed key in the body", () => {
    const next = runMiddleware(makeReq({ body: { email: { $ne: null } } }));

    const err = next.mock.calls[0][0];
    expect(err).toBeDefined();
    expect(err.statusCode).toBe(400);
  });

  it("rejects a $-prefixed key in the query string", () => {
    const next = runMiddleware(makeReq({ query: { role: { $ne: "user" } } }));

    expect(next.mock.calls[0][0]?.statusCode).toBe(400);
  });

  it("rejects a top-level $-prefixed key", () => {
    const next = runMiddleware(makeReq({ body: { $where: "1 == 1" } }));

    expect(next.mock.calls[0][0]?.statusCode).toBe(400);
  });

  it("rejects a key containing a dot", () => {
    const next = runMiddleware(makeReq({ body: { "user.role": "admin" } }));

    expect(next.mock.calls[0][0]?.statusCode).toBe(400);
  });

  it("rejects an operator key nested deep in the body", () => {
    const next = runMiddleware(
      makeReq({ body: { filter: { nested: { deeper: { $gt: 0 } } } } })
    );

    expect(next.mock.calls[0][0]?.statusCode).toBe(400);
  });

  it("rejects an operator key inside an array element", () => {
    const next = runMiddleware(makeReq({ body: { items: [{ $ne: 1 }] } }));

    expect(next.mock.calls[0][0]?.statusCode).toBe(400);
  });

  it("rejects operator keys in req.params", () => {
    const next = runMiddleware(makeReq({ params: { $ne: "x" } }));

    expect(next.mock.calls[0][0]?.statusCode).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────
// Legitimate input still passes
// ─────────────────────────────────────────────────────────

describe("sanitizeInput — legitimate input", () => {
  it("passes clean nested input through untouched", () => {
    const req = makeReq({
      body: { email: "user@example.com", pricing: { type: "paid", amount: 9900 } },
      query: { page: "1", sort: "newest" },
    });

    const next = runMiddleware(req);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({
      email: "user@example.com",
      pricing: { type: "paid", amount: 9900 },
    });
    expect(req.query).toEqual({ page: "1", sort: "newest" });
  });

  it("still strips XSS from values", () => {
    const req = makeReq({ body: { bio: '<script>alert(1)</script>hello' } });

    runMiddleware(req);

    expect(req.body.bio).not.toContain("<script>");
    expect(req.body.bio).toContain("hello");
  });

  it("allows a dot inside a value, only keys are restricted", () => {
    const req = makeReq({ body: { email: "first.last@example.com" } });

    const next = runMiddleware(req);

    expect(next).toHaveBeenCalledWith();
    expect(req.body.email).toBe("first.last@example.com");
  });
});

// ─────────────────────────────────────────────────────────
// It must run BEFORE the route handler, not merely be declared
// ─────────────────────────────────────────────────────────

describe("sanitizeInput — runs ahead of route handlers", () => {
  let handler;
  let app;

  beforeEach(() => {
    handler = jest.fn((_req, res) => res.status(200).json({ reached: true }));

    app = express();
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(sanitizeInput);
    app.post("/probe", handler);
    app.get("/probe", handler);
    app.use(errorHandler);
  });

  it("blocks an injected body before the handler runs", async () => {
    const res = await request(app)
      .post("/probe")
      .send({ email: { $ne: null }, password: "irrelevant" });

    expect(res.status).toBe(400);
    expect(handler).not.toHaveBeenCalled();
  });

  it("blocks the bracket form in a query string before the handler runs", async () => {
    // qs expands email[$ne] into { email: { $ne: '' } } — the query-string route to
    // the same operator injection.
    const res = await request(app).get("/probe?email[$ne]=");

    expect(res.status).toBe(400);
    expect(handler).not.toHaveBeenCalled();
  });

  it("lets a clean request through to the handler", async () => {
    const res = await request(app).post("/probe").send({ email: "a@b.com" });

    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────
// It must be wired into the real app, ahead of every route mount
// ─────────────────────────────────────────────────────────

describe("sanitizeInput — wired into index.js before the routes", () => {
  // __dirname is available because babel-jest transpiles these ESM sources to CJS.
  const indexSource = readFileSync(join(__dirname, "..", "index.js"), "utf8");

  it("is registered with app.use", () => {
    expect(indexSource).toMatch(/app\.use\(sanitizeInput\)/);
  });

  it("is registered before the first API route mount", () => {
    const mountedAt = indexSource.indexOf("app.use(sanitizeInput)");
    const firstApiRoute = indexSource.indexOf('app.use("/api/v1/user"');

    expect(mountedAt).toBeGreaterThan(-1);
    expect(firstApiRoute).toBeGreaterThan(-1);
    expect(mountedAt).toBeLessThan(firstApiRoute);
  });
});
