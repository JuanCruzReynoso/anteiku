# Tasks: Fix Production Loose Ends

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 800–1000 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Discount display + featured seed | PR 1 | Base: main. Product queries, ProductCard, detail page, seed data. ~200 lines |
| 2 | Checkout enhancements (coupon + shipping) | PR 2 | Base: PR 1 branch. Cart store, checkout form, order summary, schema, actions. ~350 lines |
| 3 | Customer account + subscriptions | PR 3 | Base: PR 2 branch. All account pages, queries, actions, subscription flow. ~450 lines |

## Phase 1: Data Layer

- [ ] 1.1 Add LEFT JOIN on `discounts` table in `features/product/lib/queries.ts` for `getAllProducts()` and `getProductBySlug()` — filter by `active = true`, `startsAt <= now`, `endsAt >= now`
- [ ] 1.2 Create `features/product/lib/display.ts` — add `getDiscountedPrice()` utility: accepts base price + discount object, returns `{ original, discounted, hasDiscount }`. Supports percentage and fixed types
- [ ] 1.3 Create `features/checkout/lib/shipping-queries.ts` — query active `shipmentMethods` ordered by cost ascending
- [ ] 1.4 Update `db/seed.ts` — set `featured: "true"` on 4 products (pick highest-priced)

## Phase 2: Discount Display

- [ ] 2.1 Modify `features/product/lib/display.ts` — `getProductDisplayData()` accepts discount data, computes `originalPrice`, `discountedPrice`, `hasDiscount`
- [ ] 2.2 Modify `features/product/ui/product-card.tsx` — when `hasDiscount`, show original price with strikethrough, discounted price prominent, "-N%" badge
- [ ] 2.3 Modify `app/product/[slug]/page.tsx` — show discount info (type, savings amount) on detail page

## Phase 3: Checkout Enhancements

- [ ] 3.1 Modify `features/cart/lib/cart-store.ts` — add `appliedCoupon` state (code, type, value, discountAmount), update `getTotal()` to subtract coupon discount
- [ ] 3.2 Modify `features/checkout/ui/checkout-form.tsx` — add coupon input with Apply/Remove buttons; add shipping method radio group populated from props
- [ ] 3.3 Modify `features/checkout/ui/order-summary.tsx` — show dynamic shipping cost line, coupon discount line, update total = subtotal - coupon + shipping
- [ ] 3.4 Modify `features/checkout/lib/schema.ts` — add `shipmentMethodId: z.string().optional()`, `couponCode: z.string().optional()` to orderSchema
- [ ] 3.5 Modify `features/checkout/lib/actions.ts` — accept `shipmentMethodId` + `couponCode`, fetch shipping cost from DB, validate coupon via `validateCoupon()`, increment `usedCount`, compute final total

## Phase 4: Customer Account

- [ ] 4.1 Create `app/account/layout.tsx` — sidebar layout with nav links (Dashboard, Orders, Subscriptions), auth check redirect
- [ ] 4.2 Create `features/account/lib/queries.ts` — `getUserOrders(userId)`, `getUserSubscriptions(userId)`, `getSubscriptionPlans()`
- [ ] 4.3 Create `app/account/page.tsx` — RSC dashboard: user profile (name, email, phone), 3 recent orders, active subscriptions count
- [ ] 4.4 Create `features/account/ui/profile-form.tsx` — edit form for name + phone, calls `updateProfile` server action
- [ ] 4.5 Create `app/account/orders/page.tsx` — order history list sorted by date desc
- [ ] 4.6 Create `app/account/orders/[orderId]/page.tsx` — order detail: items, shipping address, status, total
- [ ] 4.7 Create `features/account/lib/actions.ts` — `updateProfile` server action (validate + update user record)

## Phase 5: Subscription Management

- [ ] 5.1 Create `app/account/subscriptions/page.tsx` — plans listing + active subscriptions view
- [ ] 5.2 Create `features/account/ui/subscription-manager.tsx` — plan cards with Subscribe button, active subscription cards with Cancel button
- [ ] 5.3 Create subscription server actions in `features/account/lib/actions.ts` — `subscribeToPlan` (create `userSubscriptions` record), `cancelSubscription` (set status=cancelled, cancelAt=now)

## Phase 6: Testing

- [ ] 6.1 Add unit tests for `getDiscountedPrice()` — percentage, fixed, zero, boundary cases
- [ ] 6.2 Add unit tests for cart store coupon state — apply, remove, total recalculation
- [ ] 6.3 Add tests for checkout total calculation — subtotal - coupon + shipping
- [ ] 6.4 Verify all 115 existing tests still pass
