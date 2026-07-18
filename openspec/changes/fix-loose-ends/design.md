# Design: Fix Production Loose Ends

## Technical Approach

Seven isolated frontend integration gaps that share a common theme: connecting existing DB tables to the UI. Each feature is a self-contained module that can be implemented and tested independently. The design follows the project's existing patterns: server components for data fetching, client components for interactivity, Zustand for cart state, and server actions for mutations.

## Architecture Decisions

### Decision: Discount data in product queries

**Choice**: Extend existing `getAllProducts()` / `getProductBySlug()` to LEFT JOIN `discounts` table with date-range filtering.
**Alternatives**: Separate discount hook, client-side discount calculation, or ignoring product-level discounts entirely.
**Rationale**: JOIN in the query ensures discount data is always fresh and avoids N+1 queries. Filtering by date range at DB level prevents stale discounts from appearing. Follows existing pattern of returning enriched product objects.

### Decision: Coupon validation reuse

**Choice**: Reuse existing `validateCoupon()` from `features/admin/lib/coupon-actions.ts` directly in checkout flow.
**Alternatives**: Duplicate logic in checkout lib, create a shared lib, or create a new server action.
**Rationale**: The function already handles all validation (active, date range, min purchase, max uses). It's a server action callable from client. Moving to shared lib would be cleaner but adds refactor scope; reusing as-is is safer for this change.

### Decision: Shipping methods from DB

**Choice**: Query active `shipmentMethods` in checkout page (RSC) and pass to client component.
**Alternatives**: Hardcode shipping options, fetch via API route, or store in cart store.
**Rationale**: DB-driven shipping allows admin to add/modify methods without code changes. RSC fetch ensures fresh data. Passing as props avoids extra client fetch.

### Decision: Coupon state in cart store vs local

**Choice**: Extend Zustand cart store with `appliedCoupon` state.
**Alternatives**: Local component state, React context, or separate coupon store.
**Rationale**: Coupon affects order total calculation which is already in cart store. Adding to cart store keeps total calculation centralized and persists across page navigations (already using persist middleware).

### Decision: Account pages as RSC with server actions

**Choice**: RSC pages for data fetching, server actions for mutations (profile update, subscription cancel).
**Alternatives**: API routes, client-side fetching, or混合 approach.
**Rationale**: Follows existing Next.js 16 patterns in the codebase. RSC ensures auth check at page level, server actions provide type-safe mutations.

### Decision: Subscription cancel without payment provider

**Choice**: Mark subscription as `cancelled` in DB, set `cancelAt` to now, display note about billing.
**Alternatives**: Block cancel, require payment provider, or hide cancel button.
**Rationale**: Spec requires cancel flow. Without payment provider, we can still update DB status. User sees confirmation that billing will stop after current period.

## Data Flow

### Discount Display
```
getAllProducts() → LEFT JOIN discounts (active + date range) → Product with discount data → getProductDisplayData() → { originalPrice, discountedPrice, hasDiscount } → ProductCard / detail page
```

### Coupon Checkout
```
User enters code → validateCoupon(code, subtotal) → if valid: apply discount → OrderSummary recalculates total → createOrder() includes couponCode → coupon.usedCount++
```

### Shipping Selection
```
RSC fetches active shipmentMethods → CheckoutForm receives methods → User selects → shipping cost added to total → createOrder() includes shipmentMethodId
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `features/product/lib/queries.ts` | Modify | Add discount JOIN to all product queries |
| `features/product/lib/display.ts` | Modify | Accept discount data, compute originalPrice/discountedPrice/hasDiscount |
| `features/product/lib/display.test.ts` | Modify | Add discount test cases |
| `features/product/ui/product-card.tsx` | Modify | Show strikethrough + sale price when hasDiscount |
| `app/product/[slug]/page.tsx` | Modify | Show discount info on detail page |
| `features/cart/lib/cart-store.ts` | Modify | Add appliedCoupon state, update total calculation |
| `features/checkout/ui/checkout-form.tsx` | Modify | Add coupon input, shipping selector, pass coupon/shipping to createOrder |
| `features/checkout/ui/order-summary.tsx` | Modify | Dynamic shipping cost, coupon discount line |
| `features/checkout/lib/schema.ts` | Modify | Add shipmentMethodId and optional couponCode to orderSchema |
| `features/checkout/lib/actions.ts` | Modify | Accept shipmentMethodId + couponCode, fetch shipping cost, apply coupon discount, increment usedCount |
| `features/checkout/lib/coupon-actions.ts` | Create | Move validateCoupon to shared location (or keep in admin, import) |
| `features/checkout/lib/shipping-queries.ts` | Create | Query active shipmentMethods |
| `app/account/layout.tsx` | Create | Account layout with sidebar navigation |
| `app/account/page.tsx` | Create | Dashboard: profile, recent orders, subscription count |
| `app/account/orders/page.tsx` | Create | Order history list |
| `app/account/orders/[orderId]/page.tsx` | Create | Order detail page |
| `app/account/subscriptions/page.tsx` | Create | Plan listing + active subscriptions |
| `features/account/lib/actions.ts` | Create | Server actions: updateProfile, cancelSubscription, subscribeToPlan |
| `features/account/lib/queries.ts` | Create | Queries: getUserOrders, getUserSubscriptions, getSubscriptionPlans |
| `features/account/ui/profile-form.tsx` | Create | Profile edit form |
| `features/account/ui/order-list.tsx` | Create | Order list component |
| `features/account/ui/subscription-manager.tsx` | Create | Subscription plan cards + active subscriptions |
| `db/seed.ts` | Modify | Set featured: "true" on 4 products |

## Interfaces / Contracts

```typescript
// Extended product with discount
interface ProductWithDiscount {
  // ...existing product fields
  discount: {
    type: "percentage" | "fixed";
    value: number;
    discountedPrice: number;
  } | null;
  hasDiscount: boolean;
}

// Cart store with coupon
interface CartState {
  // ...existing fields
  appliedCoupon: {
    code: string;
    type: "percentage" | "fixed" | "free_shipping";
    value: number;
    discountAmount: number;
  } | null;
}

// Order schema extension
const orderSchema = z.object({
  // ...existing fields
  shipmentMethodId: z.string().optional(),
  couponCode: z.string().optional(),
});

// Shipping method
interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  cost: number;
  estimatedDays: number;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | getDiscountedPrice() calculations, coupon discount math | Vitest with mocked discount/coupon objects |
| Unit | Cart store coupon state management | Zustand store tests with persist mock |
| Integration | Product queries with discount JOIN | Mock DB, verify JOIN logic |
| Integration | createOrder with shipping + coupon | Mock DB transaction, verify total calculation |
| E2E | Full checkout with coupon + shipping | Playwright (if available) or manual test |
| E2E | Account pages auth + data display | Manual test with logged-in user |

## Migration / Rollout

No migration required. All DB tables exist. Seed data modification is additive. Each feature is independently revertable via git. Discount/coupon/shipping changes are additive — old behavior preserved if new fields are optional.

## Open Questions

- [ ] Should `validateCoupon` be moved to shared lib or remain in admin feature? (Decision: keep in admin, import in checkout)
- [ ] How to handle coupon stacking with product discounts? (Decision: product discount applied first, then coupon on top)
- [ ] Should subscription cancel require confirmation dialog? (Decision: yes, simple confirm)
