# Feature Contract: Payment System (Stripe Connect)

> **Created by**: copilot (Opus 4.6)
> **Date**: 2026-03-05
> **Status**: ✅ Complete

---

## 1. Overview

**What**: Stripe Connect (Express) integration for course payments, scholar payouts, subscription plans, and webhook-driven enrollment.
**Why**: Monetization foundation — scholars earn from courses, platform takes commission, students pay for premium content.
**Scope**: Backend (Stripe service, checkout API, webhooks) + Frontend (checkout flow, subscription management, earnings dashboard).

| Layer | Required? | Owner Agent | Status |
|-------|-----------|-------------|--------|
| Shared (types/schemas) | Yes | copilot (Opus) | ✅ Complete |
| Backend (API) | Yes | copilot (Opus) | ✅ Complete |
| Frontend (UI) | Yes | antigravity (prototypes) → copilot-2 (integration) | ✅ Complete |
| Mobile | No | — | — |

---

## 2. API Contract

### Endpoints

```
# Scholar Stripe Connect Onboarding
POST   /api/v1/scholars/stripe/connect
  Request:  —
  Response: { url (Stripe hosted onboarding URL) }
  Auth:     Required (scholar role)
  Status:   ⬜ Not Implemented

GET    /api/v1/scholars/stripe/dashboard
  Request:  —
  Response: { url (Stripe Express Dashboard login link) }
  Auth:     Required (scholar role)
  Status:   ⬜ Not Implemented

GET    /api/v1/scholars/stripe/status
  Request:  —
  Response: { connected: boolean, chargesEnabled: boolean, payoutsEnabled: boolean }
  Auth:     Required (scholar role)
  Status:   ⬜ Not Implemented

GET    /api/v1/scholars/earnings
  Request:  ?period=month|quarter|year
  Response: { totalRevenue, platformFee, netEarnings, breakdown: [...] }
  Auth:     Required (scholar role)
  Status:   ⬜ Not Implemented

GET    /api/v1/scholars/earnings/details
  Request:  ?page=1&limit=20
  Response: { transactions: [...], pagination }
  Auth:     Required (scholar role)
  Status:   ⬜ Not Implemented

# Student Payment
POST   /api/v1/payments/checkout
  Request:  { courseSlug, successUrl?, cancelUrl? }
  Response: { sessionId, url (Stripe Checkout URL) }
  Auth:     Required
  Status:   ⬜ Not Implemented

POST   /api/v1/payments/subscription
  Request:  { planId: 'student'|'premium' }
  Response: { sessionId, url }
  Auth:     Required
  Status:   ⬜ Not Implemented

DELETE /api/v1/payments/subscription
  Request:  —
  Response: { message, cancelAt }
  Auth:     Required
  Status:   ⬜ Not Implemented

GET    /api/v1/payments/history
  Request:  ?page=1&limit=20
  Response: { payments: [...], pagination }
  Auth:     Required
  Status:   ⬜ Not Implemented

# Stripe Webhook (NO AUTH — signature verified)
POST   /api/v1/webhooks/stripe
  Request:  Raw body (Stripe event)
  Response: { received: true }
  Auth:     None (Stripe webhook signature verification)
  Status:   ⬜ Not Implemented

# Admin
GET    /api/v1/admin/payments/overview
  Request:  ?period=month|quarter|year
  Response: { totalRevenue, totalCommission, totalPayouts, courseBreakdown }
  Auth:     Required (admin role)
  Status:   ⬜ Not Implemented

POST   /api/v1/admin/scholars/:id/stipend
  Request:  { amount, period: 'monthly', reason }
  Response: { message, stipend }
  Auth:     Required (admin role)
  Status:   ⬜ Not Implemented
```

---

## 3. Data Models

### paymentSchema.js (new)

```javascript
{
  user: ObjectId (ref: User),
  type: enum ['course-purchase', 'subscription', 'refund'],
  stripeSessionId: String,
  stripePaymentIntentId: String,
  amount: Number (cents),
  currency: String (default: 'usd'),
  status: enum ['pending', 'completed', 'refunded', 'failed'],
  course: ObjectId (ref: Course, optional),
  subscription: {
    stripePriceId: String,
    plan: enum ['student', 'premium'],
    currentPeriodEnd: Date
  },
  platformFee: Number (cents),
  scholarPayout: Number (cents),
  createdAt, updatedAt
}
```

### scholarPaymentSchema.js (new)

```javascript
{
  scholar: ObjectId (ref: User),
  type: enum ['course-revenue', 'monthly-stipend', 'session-fee', 'bonus'],
  courseRevenue: {
    course: ObjectId (ref: Course),
    totalAmount: Number,
    platformFee: Number,
    scholarAmount: Number,
    studentCount: Number
  },
  stipend: {
    amount: Number,
    period: String,
    reason: String
  },
  status: enum ['pending', 'processing', 'paid', 'failed'],
  stripeTransferId: String,
  paidAt: Date,
  period: { start: Date, end: Date },
  createdAt
}
```

### userSchema.js additions (for Stripe Connect)

```javascript
scholarProfile.stripeConnectId: String
scholarProfile.payoutSchedule: enum ['weekly', 'biweekly', 'monthly']
```

---

## 4. Frontend Requirements

### Pages
- **CheckoutPage**: Redirect to Stripe Checkout (course purchase or subscription)
- **SubscriptionPage**: View/manage subscription, upgrade/cancel
- **PaymentHistoryPage**: Student's transaction history
- **ScholarEarningsPage**: Scholar revenue dashboard (graphs, breakdown, pending payouts)
- **ScholarStripeOnboardingPage**: Connect Stripe account flow

### Hooks
- `useCheckout(courseSlug)` — create checkout session
- `useSubscription()` — manage subscription
- `usePaymentHistory()` — list transactions
- `useScholarEarnings()` — fetch earnings data
- `useStripeConnect()` — onboarding + status

---

## 5. Dependency Order

1. Shared Zod schemas (payment, earnings)
2. Backend: payment + scholarPayment models
3. Backend: stripeService (Connect, checkout, webhooks)
4. Backend: payment routes/controller
5. Frontend: prototypes (parallel with step 2-4)
6. Frontend: integration (after step 4 + prototype selection)
7. Testing (after step 4)

---

## 6. Security Notes

- **PCI Compliance**: Stripe Checkout handles all card data — NEVER touches our server
- **Webhook signature**: MUST verify with `stripe.webhooks.constructEvent()` using raw body
- **Stripe webhook route**: Needs `express.raw()` body parser, NOT `express.json()`
- **Connect onboarding**: Use Stripe-hosted (Express accounts), never handle KYC ourselves
- **Idempotency**: Webhook handlers must be idempotent (check for existing enrollment before creating)

---

## 7. Environment Variables (New)

```
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_connect_...
COURSE_COMMISSION_RATE=0.30
```

---

## 8. Handover Log

| Date | Agent | Action | Notes |
|------|-------|--------|-------|
| 2026-03-05 | copilot | Contract created | Ready for implementation |
| 2026-03-05 | copilot | Backend + Shared complete | Stripe Connect service, checkout/subscription/webhook/earnings APIs, payment + scholarPayment models |
| 2026-03-05 | antigravity | Prototypes complete | 5 variants per set delivered; winner selected |
| 2026-03-05 | copilot-2 | Frontend integration complete | SubscriptionPage, PaymentHistoryPage, ScholarEarningsPage, CheckoutSuccessPage, usePayments hook |
| 2026-03-06 | copilot-2 | Phase 1 implementation complete | Lint clean, feature board updated, all commits made. TASK-043 closed. |
