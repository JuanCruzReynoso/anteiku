# Proposal: Close Business Logic Gaps

## Intent

A comprehensive audit identified 24 loose ends — broken data flows, missing validations, security gaps, and dead code — across checkout, catalog, account, and admin modules. This change resolves ALL of them (except external service integrations) to make the codebase production-ready before wiring Resend and MercadoPago.

## Scope

### In Scope (24 items)
**CRITICAL (6)**: coupon `maxUsesPerUser` enforcement, order status `confirmed→paid` label fix, dynamic shipping in order summary, `shipmentMethodId` persistence, discount application at checkout, `getFeaturedProducts` `featured` field filter.

**HIGH (7)**: edge middleware (auth guard, rate limiting), address CRUD actions, legal page links, subscription checkout flow, single coupon query in checkout, cart stock refresh, SQL wildcard sanitization in `searchProducts`.

**MEDIUM (9)**: deduplicate `db/queries.ts` vs `features/product/lib/queries.ts`, extract shared status label constants, remove 4 production `console.log/warn`, extract 8+ hardcoded values to config, inventory movement race condition fix (wrap in transaction), legacy cart stock fallback `999→null`, confirmation page double-clear fix, account profile edit (remove "contact support" stub), redirect `/auth/signin→/login`.

**LOW (3)**: cart expiration logic, inventory reservation system, low-stock threshold warnings.

### Out of Scope
- Resend email integration (external service, deferred)
- MercadoPago real payment processing (external service, deferred)
- Reviews/ratings, wishlist, newsletter, contact page, about page (future features, not loose ends)

## Capabilities

### New Capabilities
- `edge-middleware`: Route protection, rate limiting, auth guard at edge layer
- `address-management`: Address CRUD actions + saved address feature
- `subscription-checkout`: Customer-facing subscription enrollment flow
- `cart-expiration`: Cart TTL and automatic cleanup
- `inventory-hold`: Temporary stock reservation during checkout
- `low-stock-alerts`: Threshold-based low-stock warnings

### Modified Capabilities
- `checkout-flow`: Add `shipmentMethodId` persistence, dynamic shipping, single coupon query, discount application
- `coupon-validation`: Enforce `maxUsesPerUser`, fix double-query, add per-user usage tracking
- `product-catalog`: Add discount display, fix `getFeaturedProducts` filter, fix search SQL injection
- `customer-account`: Add profile edit, fix redirect path, shared status labels
- `inventory-management`: Wrap movements in transactions, remove legacy stock fallback

## Approach

**Phase 1 — Security & Data Integrity (CRITICAL)**: Fix coupon enforcement, order labels, discount application, search injection. These are broken NOW.

**Phase 2 — Edge Protection & Auth**: Create `middleware.ts` with auth redirects, rate limiting. Fix `/auth/signin→/login` redirect.

**Phase 3 — Checkout Completion**: Dynamic shipping from DB, `shipmentMethodId` persistence, single coupon query, cart stock refresh, confirmation double-clear fix.

**Phase 4 — Account & Addresses**: Profile edit actions, address CRUD, legal page links, subscription checkout flow.

**Phase 5 — Code Quality**: Deduplicate queries, extract shared constants, remove console statements, extract hardcoded config, fix inventory race condition.

**Phase 6 — Polish**: Cart expiration, inventory hold, low-stock warnings.

Each phase is a separate PR. Phases 1–3 are merge-blocking for external service integration.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `features/checkout/lib/actions.ts` | Modified | Single coupon query, discount application, `shipmentMethodId` save |
| `features/admin/lib/coupon-actions.ts` | Modified | Add `maxUsesPerUser` check, per-user usage query |
| `features/checkout/ui/order-summary.tsx` | Modified | Dynamic shipping from props, remove hardcoded `$2500` |
| `features/checkout/ui/checkout-form.tsx` | Modified | Shipping method selector, stock refresh |
| `db/queries.ts` | Removed | Delete duplicate module; all consumers use `features/product/lib/queries.ts` |
| `features/product/lib/queries.ts` | Modified | Add discount JOIN filtering (active + date range) |
| `features/cart/lib/cart-store.ts` | Modified | Remove legacy `999` fallback, add cart expiration |
| `app/account/page.tsx` | Modified | Add profile edit form |
| `app/account/layout.tsx` | Modified | Fix redirect to `/login` |
| `app/account/orders/page.tsx` | Modified | Use shared status labels |
| `features/layout/ui/footer.tsx` | Modified | Convert `<span>` placeholders to `<Link>` |
| `middleware.ts` | Created | Edge middleware: auth guard, rate limiting |
| `lib/config.ts` | Created | Extract hardcoded values (free shipping threshold, default shipping, etc.) |
| `lib/status-labels.ts` | Created | Shared order status label map |
| `features/admin/lib/inventory-actions.ts` | Modified | Wrap in transaction |
| `features/account/lib/actions.ts` | Created | Profile update, address CRUD, subscription actions |
| `features/account/lib/queries.ts` | Created | User orders, subscriptions, addresses queries |
| `features/account/ui/address-form.tsx` | Created | Address CRUD UI |
| `features/account/ui/profile-form.tsx` | Created | Profile edit form |
| `features/product/lib/queries.ts` | Modified | Sanitize `searchProducts` wildcard input |
| `features/cart/lib/cart-store.ts` | Modified | Add expiration timestamp |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Breaking existing checkout flow | Medium | Phase 1–3 changes are additive; old fields optional. Test full flow after each phase |
| `maxUsesPerUser` query adds DB load | Low | Add composite index on `(coupon_id, user_id)` if needed |
| Middleware rate limiting blocks legitimate traffic | Low | Use sliding window with generous limits (100 req/min per IP) |
| Cart expiration loses user items | Low | Show warning banner 24h before expiry; let user extend |
| Subscription without payment provider | Medium | Mark as "pending payment" until MercadoPago integration |

## Rollback Plan

Each phase is a separate git revert. Key rollback points:
- **Phase 1**: Revert coupon/discount changes; data integrity issues return but no data loss
- **Phase 2**: Delete `middleware.ts`; app reverts to unprotected state
- **Phase 3**: Revert checkout action changes; shipping reverts to hardcoded
- **Phases 4–6**: Purely additive features; revert removes new functionality

No DB migration required — all tables exist. Schema is additive only.

## Dependencies

- Existing `auth.ts` (NextAuth.js) — required for middleware and account pages
- Existing `db/schema.ts` — all tables (addresses, subscriptions, coupons) already defined
- No new npm packages needed for phases 1–5

## Success Criteria

- [ ] Coupon abuse prevented: `maxUsesPerUser` enforced, per-user usage tracked
- [ ] Order status labels consistent: `paid` displayed everywhere (not `confirmed`)
- [ ] Checkout total = `subtotal - productDiscount - couponDiscount + shipping` (all dynamic)
- [ ] `shipmentMethodId` saved to order record
- [ ] Search queries sanitized against wildcard injection
- [ ] `middleware.ts` exists, protects `/admin/*` routes, rate-limits API endpoints
- [ ] Account profile editable without "contact support" message
- [ ] Legal footer items are clickable links
- [ ] Zero `console.log`/`console.warn` in production code (except seed script)
- [ ] All hardcoded values extracted to `lib/config.ts`
- [ ] Inventory movements wrapped in DB transactions
- [ ] Cart stock refreshed on checkout page load
- [ ] Confirmation page does not double-clear cart
- [ ] Redirect path `/auth/signin` → `/login`
- [ ] Duplicate `db/queries.ts` removed
- [ ] Shared status label constant used across all order views
