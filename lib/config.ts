/**
 * Centralized business constants.
 * Import from `@/lib/config` instead of hardcoding values.
 */

/** Minimum subtotal (ARS) for free shipping */
export const FREE_SHIPPING_THRESHOLD = 50000;

/** Default shipping cost when no method is selected (ARS) */
export const DEFAULT_SHIPPING_COST = 2500;

/** Maximum number of featured products to display */
export const FEATURED_LIMIT = 4;

/** Maximum number of search results returned */
export const SEARCH_RESULTS_LIMIT = 20;

/** Default page size for product listings */
export const PRODUCTS_PAGE_SIZE = 50;

/** Number of days before cart items expire */
export const CART_EXPIRATION_DAYS = 7;
