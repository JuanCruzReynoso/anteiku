# Production Loose Ends — Anteiku Ecommerce

## 1. Discounts — BROKEN (User-Reported)

### What exists
- `db/schema.ts` → `discounts` table with `productId`, `categoryId`, `type`, `value`, date ranges
- `features/admin/lib/discount-actions.ts` → full CRUD (create/update/delete)
- Admin UI at `/admin/discounts` for managing discounts

### What's broken
- **No discount is ever queried or displayed on the frontend**
  - `getProductBySlug()` — joins `category` and `variants`, does NOT join `discounts`
  - `getFeaturedProducts()` — same, no discount join
  - `getAllProducts()` — same
  - `getProductDisplayData()` — only computes `minPrice` from variant prices, ignores discounts entirely
  - `ProductCard` — shows `minPrice` from variants, no discounted price, no strikethrough, no badge
  - `product/[slug]/page.tsx` — shows `minPrice` from variants, no discount display
  - `product-actions.tsx` — uses `selectedVariant.price` directly, no discount applied

### Missing
- A `getDiscountedPrice(product)` utility that checks active discounts for a product/category
- Discount display on `ProductCard` (strikethrough original + sale price)
- Discount display on product detail page
- Discount application in checkout/order total

---

## 2. Home Page Featured Products — EMPTY DATA (User-Reported)

### What exists
- `app/page.tsx` → calls `getFeaturedProducts()`, passes to `HomeContent`
- `features/product/lib/queries.ts` → `getFeaturedProducts()` queries `WHERE featured = 'true' AND status = 'active' LIMIT 4`
- `features/home/ui/home-content.tsx` → renders `featured` array as `ProductCard` grid

### What's broken
- **The query returns empty if no products have `featured = 'true'` in the DB**
- The component code is correct — it renders whatever array it receives
- Likely a seed data issue: products may not have `featured` set to `"true"`

### Fix
- Ensure seed data sets `featured: "true"` on at least 4 products
- OR: the home page needs a fallback/empty state when no featured products exist

---

## 3. Customer Subscriptions — MISSING ENTIRELY

### What exists
- `db/schema.ts` → `subscriptionPlans` and `userSubscriptions` tables
- `features/admin/lib/subscription-actions.ts` → admin CRUD for plans + view user subscriptions
- `app/admin/subscriptions/page.tsx` → admin management UI

### What's missing (zero customer-facing code)
- No `/account/subscriptions` page
- No "Subscribe" button on any product or plan page
- No subscription plan listing page for customers
- No cancel/pause subscription UI
- No subscription billing history
- No payment integration for recurring payments

---

## 4. Coupons — HALF-BUILT

### What exists
- `db/schema.ts` → `coupons` table with code, type, value, limits, date ranges
- `features/admin/lib/coupon-actions.ts` → full CRUD + `validateCoupon()` function
- Admin UI at `/admin/coupons`

### What's missing
- **No coupon input field in checkout** — `checkout-form.tsx` has no coupon UI
- **No coupon applied in order summary** — `order-summary.tsx` has no coupon logic
- **`createOrder()` doesn't accept or apply coupons** — schema has no coupon field
- **Cart store has no coupon state** — `cart-store.ts` has no coupon support
- `validateCoupon()` exists but is never called from any customer-facing flow

---

## 5. Shipping Methods — HALF-BUILT

### What exists
- `db/schema.ts` → `shipmentMethods` table with name, cost, estimatedDays
- `features/admin/lib/shipment-actions.ts` → full CRUD
- `orders.shipmentMethodId` FK exists in schema
- Admin UI at `/admin/shipping`

### What's missing
- **Checkout form doesn't let customer select a shipping method**
- **`order-summary.tsx` has hardcoded shipping**: `total >= 5000 ? 0 : 1500`
- **`createOrder()` doesn't accept `shipmentMethodId`**
- Shipping methods exist in DB but are completely unused at checkout

---

## 6. Order History — MISSING

- No `/account/orders` or `/orders` page
- No customer-facing way to view past orders
- No order detail page for customers
- Confirmation page shows only the order ID, no link to view order details

---

## 7. Customer Account — MISSING

- No `/account` page or account dashboard
- No profile editing (name, email, phone)
- No address book management (table exists, no UI)
- Navbar shows "Cerrar sesión" but no "Mi cuenta" link

---

## 8. Payment Integration — PLACEHOLDER

- MercadoPago is a TODO comment in `checkout-form.tsx`
- Button says "Completar pedido (Demo)"
- Payment record is created with `method: "demo"` and `status: "pending"`
- No real payment processing

---

## 9. Email — STUB

- `sendOrderConfirmation()` is called after order creation
- Likely a stub/placeholder (no Resend integration per user preference)

---

## 10. Reviews/Ratings — DOES NOT EXIST

- No reviews table in schema
- No review/rating UI anywhere
- No product rating display

---

## 11. Wishlist/Favorites — DOES NOT EXIST

- No wishlist feature anywhere in the codebase

---

## 12. Newsletter — DOES NOT EXIST

- No email signup form anywhere
- No newsletter subscription feature

---

## 13. Contact Page — DOES NOT EXIST

- Footer has `mailto:antieku.store@gmail.com` and Instagram link
- No `/contact` page or contact form

---

## 14. About Page — DOES NOT EXIST

- No `/about` page

---

## 15. Legal Pages — PLACEHOLDER

- Footer shows "Política de privacidad" and "Términos y condiciones"
- Both are `<span>` elements with `text-muted-foreground/50` — NOT links
- No actual privacy policy or terms pages exist

---

## Summary by Severity

### CRITICAL (blocks revenue)
| # | Issue | Status |
|---|-------|--------|
| 1 | Discounts not displayed | Schema+Admin exist, frontend missing |
| 2 | Featured products empty | Likely seed data issue |
| 3 | No payment integration | Placeholder only |
| 4 | Coupons not usable at checkout | Backend exists, no frontend |

### HIGH (blocks customer experience)
| # | Issue | Status |
|---|-------|--------|
| 5 | No customer subscription management | Schema+Admin exist, no customer UI |
| 6 | No order history | Nothing exists |
| 7 | No customer account page | Nothing exists |
| 8 | Shipping methods unused at checkout | Schema+Admin exist, hardcoded in UI |

### MEDIUM (expected ecommerce features)
| # | Issue | Status |
|---|-------|--------|
| 9 | No reviews/ratings | Nothing exists |
| 10 | No wishlist | Nothing exists |
| 11 | No newsletter | Nothing exists |
| 12 | No contact page | Nothing exists |
| 13 | No about page | Nothing exists |

### LOW (nice-to-have)
| # | Issue | Status |
|---|-------|--------|
| 14 | Legal pages placeholder | Footer links grayed out |
| 15 | Email stubs | Stub only, non-blocking |
