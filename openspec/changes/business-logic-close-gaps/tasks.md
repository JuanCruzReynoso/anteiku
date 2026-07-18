# Tasks: Close Business Logic Gaps

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1800–2400 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 → PR 5 |
| Delivery strategy | auto-forecast |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation libs + security | PR 1 | Base: main. Config, logger, status labels, middleware, rate limit, search sanitization. ~250 lines |
| 2 | Checkout integrity | PR 2 | Base: main. Coupon enforcement, single query, shipmentMethodId, dynamic shipping, discounts. ~400 lines |
| 3 | Catalog + cart + code quality | PR 3 | Base: main. Query consolidation, configurable limits, cart fixes, redirect fix, inventory transaction, redundant clearCart. ~350 lines |
| 4 | Account + address + subscriptions | PR 4 | Base: main. Profile edit, address CRUD, subscription enrollment, saved address selector. ~500 lines |
| 5 | Legal + footer + polish | PR 5 | Base: main. Privacy, terms pages, footer links, public subscriptions page. ~200 lines |

## Phase 1: Foundation & Infrastructure

- [ ] 1.1 Create `lib/config.ts` — export `FREE_SHIPPING_THRESHOLD`, `DEFAULT_SHIPPING_COST`, `FEATURED_LIMIT`, `SEARCH_RESULTS_LIMIT`, `PRODUCTS_PAGE_SIZE`, `CART_EXPIRATION_DAYS` with JSDoc comments. **simple** | **Files**: `lib/config.ts` | **Verify**: `import { FREE_SHIPPING_THRESHOLD } from "@/lib/config"` compiles
- [ ] 1.2 Create `lib/logger.ts` — structured JSON logger with `info()`, `warn()`, `error()` methods outputting `{ level, message, timestamp, context }`. **simple** | **Files**: `lib/logger.ts` | **Verify**: `logger.info({ message: "test" })` outputs JSON
- [ ] 1.3 Create `lib/status-labels.ts` — export `ORDER_STATUS_LABELS` constant: `{ pending: "Pendiente", paid: "Pagado", shipped: "Enviado", delivered: "Entregado", cancelled: "Cancelado" }`. **simple** | **Files**: `lib/status-labels.ts` | **Verify**: import compiles, values match spec
- [ ] 1.4 Create `lib/rate-limit.ts` — implement `rateLimit(key, limit, windowMs)` using in-memory sliding window. Return `{ allowed, remaining }`. **medium** | **Files**: `lib/rate-limit.ts` | **Verify**: 101 requests in 1 min returns `{ allowed: false }`
- [ ] 1.5 Create `middleware.ts` at project root — protect `/admin/*` (require admin/owner role), `/account/*` and `/checkout/*` (require auth). Unauthenticated → redirect to `/login`. **complex** | **Files**: `middleware.ts` | **Verify**: unauthenticated `/account` redirects to `/login`; non-admin `/admin` redirects to `/`
- [ ] 1.6 Add wildcard sanitization to `searchProducts` in `features/product/lib/queries.ts` — escape `%`, `_`, `\` before ILIKE interpolation. **simple** | **Files**: `features/product/lib/queries.ts` | **Verify**: search for `test%` matches literal `%`, not all products
- [ ] 1.7 Add rate limiting integration to `middleware.ts` — apply 100 req/min general, 10 req/min for `/login` and `/checkout`. **medium** | **Files**: `middleware.ts`, `lib/rate-limit.ts` | **Verify**: 101st request to same endpoint group returns 429

## Phase 2: Checkout Integrity

- [ ] 2.1 Add `maxUsesPerUser` enforcement in `features/checkout/lib/actions.ts` — query `couponUsage` or use coupon's `maxUsesPerUser` field; reject if user exceeded. **complex** | **Files**: `features/checkout/lib/actions.ts` | **Verify**: user at per-user limit gets rejected with "Ya usaste este cupón"
- [ ] 2.2 Eliminate duplicate coupon query in `features/checkout/lib/actions.ts` — reuse the single coupon fetch from lines 86-91 for both discount and free_shipping check (lines 123-131). **medium** | **Files**: `features/checkout/lib/actions.ts` | **Verify**: only one `SELECT` on `coupons` per checkout; free_shipping coupon still sets `shippingCost = 0`
- [ ] 2.3 Add `SELECT FOR UPDATE` on coupon row in checkout — lock the coupon row when reading to prevent concurrent double-redemption. **medium** | **Files**: `features/checkout/lib/actions.ts` | **Verify**: two concurrent checkouts for same `maxUses=1` coupon → only one succeeds
- [ ] 2.4 Persist `shipmentMethodId` in order insert — add `shipmentMethodId` to the `orders.insert()` values in `features/checkout/lib/actions.ts` line 140-157. **simple** | **Files**: `features/checkout/lib/actions.ts` | **Verify**: created order row has `shipment_method_id` set
- [ ] 2.5 Add product/category discount application at checkout — JOIN `discounts` table for each item, filter by `active=true` and date range, apply percentage/fixed discounts. **complex** | **Files**: `features/checkout/lib/actions.ts` | **Verify**: active product discount is applied; expired discount is ignored; category + product discounts stack
- [ ] 2.6 Replace hardcoded `$2500` shipping with dynamic cost — fetch cheapest active shipping method from `shipment_methods` table in `features/checkout/lib/shipping-actions.ts`. **medium** | **Files**: `features/checkout/ui/order-summary.tsx`, `features/checkout/lib/shipping-actions.ts` | **Verify**: checkout shows DB shipping cost, not `$2500`
- [ ] 2.7 Use `FREE_SHIPPING_THRESHOLD` from `lib/config.ts` — replace hardcoded `50000` in `features/checkout/lib/actions.ts` line 133 and `features/checkout/ui/order-summary.tsx` line 42. **simple** | **Files**: `features/checkout/lib/actions.ts`, `features/checkout/ui/order-summary.tsx`, `lib/config.ts` | **Verify**: changing config constant changes threshold behavior

## Phase 3: Catalog, Cart & Code Quality

- [ ] 3.1 Consolidate `db/queries.ts` into `features/product/lib/queries.ts` — move `searchProducts` (with sanitization from 1.6) to canonical module, update `app/shop/page.tsx` import. **medium** | **Files**: `features/product/lib/queries.ts`, `app/shop/page.tsx` | **Verify**: `db/queries.ts` deleted; shop page works; no remaining imports from `@/db/queries`
- [ ] 3.2 Make `getFeaturedProducts` limit configurable — use `FEATURED_LIMIT` from `lib/config.ts` instead of hardcoded `4`. **simple** | **Files**: `features/product/lib/queries.ts` | **Verify**: changing `FEATURED_LIMIT` changes result count
- [ ] 3.3 Replace `searchResults` hardcoded limit with `SEARCH_RESULTS_LIMIT` — update `features/product/lib/queries.ts` (or canonical after 3.1). **simple** | **Files**: `features/product/lib/queries.ts` | **Verify**: search returns up to `SEARCH_RESULTS_LIMIT` items
- [ ] 3.4 Remove legacy `999` stock fallback in `features/cart/lib/cart-store.ts` — lines 53 and 111: replace `999` with `null` for unknown stock; flag for refresh. **medium** | **Files**: `features/cart/lib/cart-store.ts` | **Verify**: legacy cart items have `stock: null`, not `999`
- [ ] 3.5 Add optional cart expiration in `features/cart/lib/cart-store.ts` — on rehydrate, remove items older than `CART_EXPIRATION_DAYS` from `lib/config.ts`. **medium** | **Files**: `features/cart/lib/cart-store.ts`, `lib/config.ts` | **Verify**: cart items > 7 days old are removed on page load
- [ ] 3.6 Replace `console.warn` in `cart-store.ts` with `logger.warn` — line 115. **simple** | **Files**: `features/cart/lib/cart-store.ts`, `lib/logger.ts` | **Verify**: no `console.log`/`console.warn` in production code (except seed)
- [ ] 3.7 Fix redirect `/auth/signin` → `/login` in `app/account/layout.tsx` — line 12. **simple** | **Files**: `app/account/layout.tsx` | **Verify**: unauthenticated user visiting `/account` redirects to `/login`
- [ ] 3.8 Wrap `createInventoryMovement` in transaction — `features/admin/lib/inventory-actions.ts` lines 23-51: wrap SELECT + UPDATE in `db.transaction`. **medium** | **Files**: `features/admin/lib/inventory-actions.ts` | **Verify**: concurrent inventory adjustments don't corrupt stock
- [ ] 3.9 Remove redundant `clearCart()` in `app/checkout/confirmation/page.tsx` — delete the `useEffect` at lines 15-17. **simple** | **Files**: `app/checkout/confirmation/page.tsx` | **Verify**: confirmation page does not call `clearCart`; cart is still cleared by `checkout-form.tsx`

## Phase 4: Account, Addresses & Subscriptions

- [ ] 4.1 Create `features/account/lib/actions.ts` with `updateProfile` server action — accept `{ name: string }`, update `users` table, verify auth. **medium** | **Files**: `features/account/lib/actions.ts` | **Verify**: call with valid name → user record updated; empty name → validation error
- [ ] 4.2 Create `features/account/lib/actions.ts` with address CRUD — `createAddress`, `updateAddress`, `deleteAddress`, `setDefaultAddress`. All verify user ownership. **complex** | **Files**: `features/account/lib/actions.ts` | **Verify**: create/delete/update address; wrong user gets error; setDefault clears others
- [ ] 4.3 Create `features/account/ui/profile-form.tsx` — inline edit form for name, calls `updateProfile` action. **medium** | **Files**: `features/account/ui/profile-form.tsx` | **Verify**: edit name → shows new name; empty name → error
- [ ] 4.4 Create `features/account/ui/address-form.tsx` — form for creating/editing addresses with all fields from `addresses` table. **medium** | **Files**: `features/account/ui/address-form.tsx` | **Verify**: create address → appears in list; edit → saves changes
- [ ] 4.5 Replace "contact support" stub in `app/account/page.tsx` with profile edit form — lines 33-35. Import `ProfileForm` component. **simple** | **Files**: `app/account/page.tsx` | **Verify**: account page shows editable name/email form
- [ ] 4.6 Display saved addresses on account page — add address list section to `app/account/page.tsx` with edit/delete actions. **medium** | **Files**: `app/account/page.tsx` | **Verify**: user sees saved addresses; "No saved addresses" shows "Add address" button
- [ ] 4.7 Add saved address selector to `features/checkout/ui/shipping-form.tsx` — for authenticated users, show saved addresses as radio options; selecting one auto-fills form. **complex** | **Files**: `features/checkout/ui/shipping-form.tsx`, `features/account/lib/actions.ts` | **Verify**: user with addresses sees selector; selecting fills form; no addresses → empty form
- [ ] 4.8 Add `enrollInSubscription` to `features/account/lib/subscription-actions.ts` — create `userSubscriptions` row with `status: "pending_payment"`, `currentPeriodStart = now()`, `currentPeriodEnd = now() + interval`. **medium** | **Files**: `features/account/lib/subscription-actions.ts` | **Verify**: authenticated user enrolls → row created with correct dates; unauthenticated → error
- [ ] 4.9 Create `app/subscriptions/page.tsx` — public page listing active plans from `subscriptionPlans` table with name, price, interval, features, and enroll button. **medium** | **Files**: `app/subscriptions/page.tsx` | **Verify**: shows active plans; no plans → "No hay planes disponibles"

## Phase 5: Legal, Footer & Polish

- [ ] 5.1 Create `app/privacy/page.tsx` — static privacy policy page with placeholder content. **simple** | **Files**: `app/privacy/page.tsx` | **Verify**: `/privacy` renders content
- [ ] 5.2 Create `app/terms/page.tsx` — static terms and conditions page with placeholder content. **simple** | **Files**: `app/terms/page.tsx` | **Verify**: `/terms` renders content
- [ ] 5.3 Fix footer links in `features/layout/ui/footer.tsx` — replace `<span>` placeholders (lines 81-88) with `<Link href="/privacy">` and `<Link href="/terms">`. **simple** | **Files**: `features/layout/ui/footer.tsx` | **Verify**: clicking footer links navigates to `/privacy` and `/terms`
- [ ] 5.4 Fix order status labels — replace inline `statusLabels` in `app/account/orders/page.tsx` (lines 39-45) with `ORDER_STATUS_LABELS` from `lib/status-labels.ts`. **simple** | **Files**: `app/account/orders/page.tsx` | **Verify**: paid orders show "Pagado" not "Confirmado"
- [ ] 5.5 Replace remaining `console.log`/`console.warn` calls with logger — search codebase for any remaining instances (except seed scripts). **simple** | **Files**: various | **Verify**: `grep -r "console\." --include="*.ts" --include="*.tsx"` returns zero matches (except seed)

## Parallelization Map

```
PR 1 (Foundation)          ──→ PR 2 (Checkout)        ──→ PR 3 (Catalog/Quality)
                            │                             │
                            └──→ PR 4 (Account/Subs) ───┘
                                                         └──→ PR 5 (Legal/Footer)
```

- **PR 1** (Phase 1): Foundation libs + security. No dependencies. START HERE.
- **PR 2** (Phase 2): Depends on PR 1 (config, logger). Can start after PR 1 merges.
- **PR 3** (Phase 3): Depends on PR 1 (config, logger). CAN PARALLEL with PR 2.
- **PR 4** (Phase 4): Depends on PR 1 (config). CAN PARALLEL with PR 2 and PR 3.
- **PR 5** (Phase 5): No hard dependencies. CAN PARALLEL with anything, but benefits from being last for clean review.

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Checkout coupon changes (Phase 2) | **High** — touches critical payment path | Write tests first; manual checkout flow verification |
| Middleware auth guard (Phase 1) | **High** — wrong logic locks out users | Test all three route groups; ensure login/register unaffected |
| Query consolidation (Phase 3) | **Medium** — import breakage possible | Grep for all `@/db/queries` imports before deleting |
| Address CRUD (Phase 4) | **Medium** — ownership validation critical | Test cross-user access denial |
| Cart expiration (Phase 3) | **Low** — optional, additive | Feature flag via config constant |

## Verification Matrix

After all PRs merged:
1. `grep -r "console\." --include="*.ts" --include="*.tsx" | grep -v seed` → 0 matches
2. `grep -r "999" --include="*.ts" --include="*.tsx" | grep -v test | grep -v seed` → 0 matches
3. `grep -r "@/db/queries" --include="*.ts" --include="*.tsx"` → 0 matches
4. `grep -r "/auth/signin" --include="*.ts" --include="*.tsx"` → 0 matches
5. Checkout flow: apply coupon → single query, `maxUsesPerUser` enforced, `shipmentMethodId` saved
6. Account: unauthenticated → `/login`; profile editable; addresses CRUD works
7. Footer: privacy/terms links navigate correctly
8. `/privacy`, `/terms`, `/subscriptions` pages render
