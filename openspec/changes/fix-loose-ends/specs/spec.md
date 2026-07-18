# Fix Loose Ends — Delta Specs

## 1. discount-display (New)

### Requirement: Product Discount Display

The system MUST join active discounts to product queries and compute sale prices for display.

#### Scenario: Product with active percentage discount

- GIVEN a product has an active percentage discount (type: "percentage", value: 20)
- WHEN the product is queried via `getAllProducts()` or `getProductBySlug()`
- THEN the result includes `discount: { type, value, discountedPrice }` where `discountedPrice = basePrice * (1 - value/100)`
- AND `hasDiscount` is `true`

#### Scenario: Product with active fixed discount

- GIVEN a product has an active fixed discount (type: "fixed", value: 500)
- WHEN the product is queried
- THEN `discountedPrice = basePrice - value`
- AND `discountedPrice` is never less than 0

#### Scenario: Product with no active discount

- GIVEN a product has no discount or its discount is inactive/expired
- WHEN the product is queried
- THEN `discount` is `null` and `hasDiscount` is `false`

#### Scenario: Discount date range enforcement

- GIVEN a product has a discount with `startsAt` in the future or `endsAt` in the past
- WHEN the product is queried
- THEN the discount is NOT applied (treated as no discount)

### Requirement: ProductCard Discount Rendering

The ProductCard component MUST display strikethrough original price and sale price when a discount is active.

#### Scenario: Card shows discount pricing

- GIVEN a product has an active discount
- WHEN `ProductCard` renders
- THEN the original price is shown with a strikethrough style
- AND the discounted price is shown prominently
- AND a badge or label indicates the discount (e.g., "-20%")

#### Scenario: Card shows normal pricing without discount

- GIVEN a product has no active discount
- WHEN `ProductCard` renders
- THEN only the current price is shown (no strikethrough, no badge)

### Requirement: Product Detail Discount Rendering

The product detail page MUST display discount information including type and savings amount.

#### Scenario: Detail page shows discount info

- GIVEN a product has an active discount
- WHEN the product detail page renders (`/product/[slug]`)
- THEN original price is shown with strikethrough
- AND discounted price is shown
- AND the savings amount or percentage is displayed

---

## 2. coupon-checkout (New)

### Requirement: Coupon Input in Checkout

The checkout form MUST include a coupon code input field that validates and applies discounts.

#### Scenario: User enters valid coupon code

- GIVEN the checkout form is displayed
- WHEN the user enters a valid coupon code and clicks "Apply"
- THEN `validateCoupon()` is called with the code and current subtotal
- AND the coupon discount is applied to the order total
- AND the applied coupon is shown in the order summary with discount amount

#### Scenario: User enters invalid coupon code

- GIVEN the checkout form is displayed
- WHEN the user enters an invalid or expired coupon code
- THEN an error message is displayed (e.g., "Cupón no válido")
- AND the order total remains unchanged

#### Scenario: Coupon minimum purchase not met

- GIVEN a coupon requires a minimum purchase of $5000
- WHEN the user applies the coupon with a subtotal of $3000
- THEN an error message indicates the minimum purchase requirement

#### Scenario: User removes applied coupon

- GIVEN a coupon is applied to the order
- WHEN the user clicks remove on the applied coupon
- THEN the coupon discount is removed from the total
- AND the coupon input field is cleared

### Requirement: Coupon Discount Calculation

The system MUST calculate coupon discounts correctly based on coupon type.

#### Scenario: Percentage coupon discount

- GIVEN a coupon of type "percentage" with value 15
- WHEN applied to an order with subtotal $10000
- THEN the discount is $1500 (15% of $10000)
- AND the order total becomes $8500 + shipping

#### Scenario: Fixed amount coupon discount

- GIVEN a coupon of type "fixed" with value 2000
- WHEN applied to an order with subtotal $10000
- THEN the discount is $2000
- AND the order total becomes $8000 + shipping

#### Scenario: Free shipping coupon

- GIVEN a coupon of type "free_shipping"
- WHEN applied to any order
- THEN shipping cost becomes $0 regardless of subtotal

---

## 3. shipping-selection (New)

### Requirement: Shipping Method Picker

The checkout MUST display available shipping methods from the database and allow user selection.

#### Scenario: Shipping methods loaded from DB

- GIVEN active shipment methods exist in the database
- WHEN the checkout shipping step renders
- THEN all active methods are displayed with name, description, cost, and estimated days

#### Scenario: User selects shipping method

- GIVEN multiple shipping methods are available
- WHEN the user selects a method
- THEN the selected method's cost is added to the order total
- AND the selected method ID is stored for order creation

#### Scenario: Free shipping threshold preserved

- GIVEN the order subtotal >= $5000 (free shipping threshold)
- WHEN shipping methods are displayed
- THEN "Retiro en local" (cost: $0) is shown as free
- AND other methods show their actual cost

#### Scenario: Default shipping method selection

- GIVEN shipping methods are loaded
- WHEN the checkout renders
- THEN the first method (or "Retiro en local") is selected by default

### Requirement: Shipping Cost in Order Total

The order total MUST include the selected shipping method's cost.

#### Scenario: Order total includes shipping

- GIVEN a user selects "Envío estándar" (cost: $2500)
- WHEN the order summary is displayed
- THEN the total = subtotal - coupon discount + $2500

#### Scenario: Order with free shipping coupon

- GIVEN a user applies a "free_shipping" coupon
- WHEN the order summary is displayed
- THEN shipping shows as $0
- AND the total = subtotal - any other coupon discount

---

## 4. customer-account (New)

### Requirement: Account Dashboard

The `/account` page MUST display user profile information, recent orders, and active subscriptions.

#### Scenario: Authenticated user views dashboard

- GIVEN the user is logged in
- WHEN they navigate to `/account`
- THEN their name, email, and phone are displayed
- AND the 3 most recent orders are shown with status
- AND active subscriptions count is shown

#### Scenario: Unauthenticated user redirected

- GIVEN the user is not logged in
- WHEN they navigate to `/account`
- THEN they are redirected to the sign-in page

### Requirement: Order History

The `/account/orders` page MUST display all orders for the authenticated user.

#### Scenario: User views order list

- GIVEN the user has 5 orders
- WHEN they navigate to `/account/orders`
- THEN all 5 orders are displayed with order ID, date, status, and total
- AND orders are sorted by most recent first

#### Scenario: User views order detail

- GIVEN the user is on the order list
- WHEN they click on an order
- THEN they see the full order details: items, shipping address, status, total

### Requirement: Profile Management

The `/account` page MUST allow users to update their profile information.

#### Scenario: User updates profile

- GIVEN the user is on the `/account` page
- WHEN they edit their name or phone and save
- THEN the profile is updated in the database
- AND a success message is displayed

---

## 5. subscription-management (New)

### Requirement: Subscription Plan Listing

The system MUST display available subscription plans for customers to browse and subscribe.

#### Scenario: Plans displayed on page

- GIVEN active subscription plans exist in the database
- WHEN the user navigates to `/account/subscriptions`
- THEN all active plans are displayed with name, price, interval, and features

#### Scenario: User subscribes to a plan

- GIVEN the user is logged in and viewing plans
- WHEN they click "Subscribe" on a plan
- THEN a `userSubscriptions` record is created with status "active"
- AND the current period dates are set (now to now + interval)

### Requirement: Active Subscription View

The system MUST show the user's active subscriptions with details.

#### Scenario: User views active subscriptions

- GIVEN the user has 2 active subscriptions
- WHEN they navigate to `/account/subscriptions`
- THEN both subscriptions are shown with plan name, status, and renewal date

#### Scenario: User with no subscriptions

- GIVEN the user has no subscriptions
- WHEN they navigate to `/account/subscriptions`
- THEN they see available plans and an empty state message

### Requirement: Subscription Cancellation

The system MUST allow users to cancel their active subscriptions.

#### Scenario: User cancels subscription

- GIVEN the user has an active subscription
- WHEN they click "Cancel" on the subscription
- THEN the subscription status is updated to "cancelled"
- AND `cancelAt` is set to the current date
- AND a confirmation message is displayed

#### Scenario: Cancelled subscription display

- GIVEN a subscription has been cancelled
- WHEN displayed in the subscription list
- THEN it shows status "cancelled" with the cancellation date
- AND the "Cancel" button is not shown

---

## 6. product-display (Modified)

### Requirement: Product Display Data with Discounts

`getProductDisplayData()` MUST accept and apply active discount data to compute final display prices.
(Previously: Only computed minPrice from variants, no discount awareness)

#### Scenario: Display data includes discount pricing

- GIVEN a product with variants and an active discount
- WHEN `getProductDisplayData()` is called
- THEN the result includes `originalPrice`, `discountedPrice`, and `hasDiscount`
- AND `discountedPrice` is the variant's minPrice after discount

#### Scenario: Display data without discount

- GIVEN a product with no active discount
- WHEN `getProductDisplayData()` is called
- THEN `hasDiscount` is `false` and `discountedPrice` equals `minPrice`

---

## 7. checkout-flow (Modified)

### Requirement: Extended Order Schema

The order schema MUST accept `shipmentMethodId` and optional `couponCode` fields.
(Previously: Only accepted items, shippingAddress, email)

#### Scenario: Order created with shipping method

- GIVEN the user selects a shipping method
- WHEN `createOrder()` is called
- THEN the order record includes `shipmentMethodId`
- AND the order total includes the shipping cost

#### Scenario: Order created with coupon

- GIVEN the user applies a coupon
- WHEN `createOrder()` is called
- THEN the order total reflects the coupon discount
- AND the coupon's `usedCount` is incremented

### Requirement: Total Calculation with Shipping and Coupons

The order total MUST be calculated as: `subtotal - coupon discount + shipping cost`.
(Previously: Total was subtotal + hardcoded $1500 or $0)

#### Scenario: Total calculation with all components

- GIVEN subtotal = $10000, coupon discount = $1500, shipping = $2500
- WHEN the order total is calculated
- THEN total = $10000 - $1500 + $2500 = $11000

---

## 8. seed-data (Modified)

### Requirement: Featured Products in Seed Data

The seed function MUST set `featured: "true"` on at least 4 products.
(Previously: All products had `featured: "false"` by default)

#### Scenario: Seed creates featured products

- GIVEN the seed function runs
- WHEN products are inserted
- THEN at least 4 products have `featured = "true"`
- AND the home page can display them via `getFeaturedProducts()`
