---
description: "new endpoint, backend route, controller, service, API route, REST endpoint"
---

# API Endpoint Instructions

When the user asks to create a **new API endpoint**, follow the DeenVerse backend chain.

## Architecture Chain

```
Route  →  Controller  →  Service  →  Model
```

All files use **ESM** (`import`/`export`). Never use `require` or `module.exports`.

## File Locations & Patterns

### 1. Route — `backend/routes/<resource>Route.js`

```js
import express from 'express';
import isAuthenticated from '../config/auth.js';
import { handlerName } from '../controller/<resource>Controller.js';

const router = express.Router();

router.get('/', isAuthenticated, handlerName);

export default router;
```

- All routes are prefixed `/api/v1/<resource>` (registered in `backend/index.js`).
- Use `isAuthenticated` for protected routes, `optionalAuth` for mixed routes.
- Attach rate limiters from `backend/middlewares/rateLimiter.js` where needed.
- Attach validators from `backend/middlewares/validators.js` for input validation.

### 2. Controller — `backend/controller/<resource>Controller.js`

```js
import { serviceFn } from '../services/<resource>Service.js';

export const handlerName = async (req, res, next) => {
  try {
    const result = await serviceFn(req.params, req.body, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

- Controllers parse the request and call a service function.
- Always wrap in `try/catch` and pass errors to `next(error)`.
- Never put business logic in controllers.

### 3. Service — `backend/services/<resource>Service.js`

```js
import <Model> from '../models/<resource>Schema.js';
import AppError from '../utils/AppError.js';

export const serviceFn = async (params, body, user) => {
  const doc = await <Model>.findById(params.id);
  if (!doc) throw new AppError('Resource not found', 404);
  return doc;
};
```

- All business logic lives here.
- Use `AppError` (from `backend/utils/AppError.js`) for structured errors — never throw raw `Error`.
- Database queries happen here, not in controllers.

### 4. Model — `backend/models/<resource>Schema.js`

```js
import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  // fields
}, { timestamps: true });

export default mongoose.model('Resource', resourceSchema);
```

- Add `timestamps: true` unless there's a reason not to.
- Index fields used in queries.

## Registration

In `backend/index.js`, register the new router:

```js
import resourceRouter from './routes/<resource>Route.js';
app.use('/api/v1/<resource>', resourceRouter);
```

Place it in the correct position respecting the middleware order documented in `copilot-instructions.md`.

## Checklist

- [ ] Route file with proper auth middleware.
- [ ] Controller with try/catch and `next(error)`.
- [ ] Service with `AppError` for error cases.
- [ ] Model with schema and indexes (if new collection).
- [ ] Router registered in `index.js`.
- [ ] Input validation via validators middleware.
- [ ] Rate limiting on write/sensitive endpoints.
