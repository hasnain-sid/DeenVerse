---
description: "Use when creating a new API endpoint, backend route, controller, service, or adding a new REST resource. Covers the backend route → controller → service → model pattern."
---

# Backend API Endpoint

When adding a new backend endpoint, follow the existing route → controller → service → model chain.

## File Chain

```
backend/
├── routes/<resource>Route.js        # Define routes, attach middleware
├── controller/<resource>Controller.js  # Parse request, call service, send response
├── services/<resource>Service.js    # Business logic, DB queries
└── models/<resource>Schema.js       # Mongoose schema (if new collection)
```

## Route Pattern

```js
import express from "express";
import isAuthenticated from "../config/auth.js";
import { handler1, handler2 } from "../controller/resourceController.js";

const router = express.Router();

router.get("/", handler1);
router.post("/", isAuthenticated, handler2);

export default router;
```

Register in `backend/index.js`:
```js
import resourceRoute from "./routes/resourceRoute.js";
app.use("/api/v1/resource", resourceRoute);
```

## Controller Pattern

```js
import { doSomething } from "../services/resourceService.js";

export const doSomethingHandler = async (req, res, next) => {
  try {
    const result = await doSomething(req.user, req.body);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);  // Always forward to centralised error handler
  }
};
```

## Service Pattern

```js
import Resource from "../models/resourceSchema.js";
import AppError from "../utils/AppError.js";

export const doSomething = async (user, payload) => {
  // Business logic here
  // On error: throw new AppError("message", statusCode);
};
```

## Rules

- **ESM only**: `import`/`export`, never `require`/`module.exports`
- **All routes prefixed** `/api/v1/`
- **Error handling**: `throw new AppError(message, statusCode)`, never raw `Error` or `res.status().json()` in catch blocks
- **Auth**: Use `isAuthenticated` middleware, access user via `req.user`
- **Validation**: Use express-validator rules in `middlewares/validators.js` for input validation
- **Never return raw MongoDB errors** to the client — the error handler sanitises them
- **Add JSDoc** for complex service functions (the backend is JS, not TS)
