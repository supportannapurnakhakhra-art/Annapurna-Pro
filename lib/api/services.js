import { apiClient } from "./client";
import { mapProductToShopifyShape, mapCollectionToShopifyShape } from "./mappers";

/* =======================================================================
 * 1. APP BOOTSTRAP APIs
 * ======================================================================= */

/**
 * Fetches general storefront store info.
 * Endpoint: GET /api/shop/info
 */
export async function getShopInfo() {
  const res = await apiClient("/api/shop/info", { method: "GET", next: { revalidate: 300 } });
  return res.data?.info || res.data?.data || res.data || null;
}

/**
 * Fetches configured marketing tracking scripts.
 * Endpoint: GET /api/shop/marketing-scripts
 */
export async function getMarketingScripts() {
  const res = await apiClient("/api/shop/marketing-scripts", { method: "GET", next: { revalidate: 300 } });
  return res.data?.scripts || res.data?.data || res.data || [];
}

/* =======================================================================
 * 2. PRODUCT BROWSING APIs
 * ======================================================================= */

/**
 * Retrieves product listing with optional search, collection, limit, offset.
 * Endpoint: GET /api/shop/products
 */
export async function getProducts({ search = "", collection_id = "", limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (search?.trim()) params.append("search", search.trim());
  if (collection_id) params.append("collection_id", collection_id);
  if (limit) params.append("limit", limit);
  if (offset) params.append("offset", offset);

  const queryString = params.toString();
  const endpoint = `/api/shop/products${queryString ? `?${queryString}` : ""}`;
  console.log("DEBUG getProducts: Fetching endpoint:", endpoint);

  const res = await apiClient(endpoint, { method: "GET", next: { revalidate: 60 } });
  const rawProducts = res.data?.products || res.data?.data || res.data?.items || res.data || [];

  console.log("DEBUG getProducts: Raw products count:", Array.isArray(rawProducts) ? rawProducts.length : "NOT AN ARRAY", rawProducts);

  if (Array.isArray(rawProducts)) {
    const mapped = rawProducts.map(mapProductToShopifyShape).filter(Boolean);
    console.log("DEBUG getProducts: After mapping count:", mapped.length);

    const filtered = mapped.filter(p => {
      const passAvailable = p.availableForSale !== false;
      const passStock = p.quantityAvailable > 0;
      const passes = passAvailable && passStock;

      if (!passes) {
        console.log(
          `DEBUG getProducts: FILTERED OUT — "${p.title}" | availableForSale: ${p.availableForSale} | quantityAvailable: ${p.quantityAvailable}`
        );
      } else {
        console.log(
          `DEBUG getProducts: KEPT — "${p.title}" | availableForSale: ${p.availableForSale} | quantityAvailable: ${p.quantityAvailable}`
        );
      }

      return passes;
    });

    console.log(`DEBUG getProducts: Final count after stock filter: ${filtered.length} / ${mapped.length}`);
    return filtered;
  }

  console.log("DEBUG getProducts: rawProducts is not an array, returning []");
  return [];
}

/**
 * Retrieves a single product detail by identifier (handle or ID).
 * Endpoint: GET /api/shop/products/:identifier
 */
export async function getProductByIdentifier(identifier) {
  if (!identifier) return null;
  const res = await apiClient(`/api/shop/products/${identifier}`, { method: "GET", next: { revalidate: 60 } });
  const rawProduct = res.data?.product || res.data?.data || res.data;
  return mapProductToShopifyShape(rawProduct);
}

/* =======================================================================
 * 3. COLLECTIONS APIs
 * ======================================================================= */

/**
 * Retrieves all collections.
 * Endpoint: GET /api/shop/collections
 */
export async function getCollections() {
  const res = await apiClient("/api/shop/collections", { method: "GET", next: { revalidate: 300 } });
  console.log("DEBUG: Raw Collections Response:", JSON.stringify(res, null, 2));
  const rawCollections = res.data?.collections || res.data?.data || res.data?.items || res.data || [];

  if (rawCollections.length > 0) {
    console.log("DEBUG: Raw Collection [0]:", JSON.stringify(rawCollections[0], null, 2));
  }

  if (Array.isArray(rawCollections)) {
    return rawCollections.map(mapCollectionToShopifyShape).filter(Boolean);
  }
  return [];
}

/**
 * Retrieves a single collection detail along with its scoped products if embedded.
 * Endpoint: GET /api/shop/collections/:identifier
 */
export async function getCollectionByIdentifier(identifier) {
  if (!identifier) return null;
  const res = await apiClient(`/api/shop/collections/${identifier}`, { method: "GET", next: { revalidate: 60 } });
  const rawCollection = res.data?.collection || res.data?.data || res.data;
  const mappedCollection = mapCollectionToShopifyShape(rawCollection);

  let scopedProducts = [];
  const rawProducts = res.data?.products || rawCollection?.products || [];
  if (Array.isArray(rawProducts)) {
    scopedProducts = rawProducts.map(mapProductToShopifyShape).filter(Boolean);
  }

  return {
    collection: mappedCollection,
    products: scopedProducts,
    title: mappedCollection?.title || "",
  };
}

/* =======================================================================
 * 4. CMS APIs
 * ======================================================================= */

/**
 * Retrieves CMS blogs listing.
 * Endpoint: GET /api/shop/cms/blogs
 */
export async function getCmsBlogs() {
  const res = await apiClient("/api/shop/cms/blogs", { method: "GET", next: { revalidate: 300 } });
  const raw = res.data?.data ?? res.data?.blogs ?? res.data;
  return Array.isArray(raw) ? raw : [];
}

/**
 * Retrieves scoped blog entries with pagination.
 * Endpoint: GET /api/shop/cms/blogs/:handle?page=1&limit=50
 */
export async function getCmsBlogPosts(handle = "news", page = 1, limit = 50) {
  const res = await apiClient(`/api/shop/cms/blogs/${handle}?page=${page}&limit=${limit}`, { method: "GET", next: { revalidate: 60 } });
  const raw = res.data?.data ?? res.data;
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.posts)) return raw.posts;
  return [];
}

/**
 * Retrieves a single CMS post detail.
 * Endpoint: GET /api/shop/cms/posts/:handle
 */
export async function getCmsPostDetail(handle) {
  const res = await apiClient(`/api/shop/cms/posts/${handle}`, { method: "GET", next: { revalidate: 60 } });
  return res.data?.data ?? res.data?.post ?? res.data;
}

/* =======================================================================
 * 9. ORDERS APIs
 * ======================================================================= */

/**
 * Submits an order payload to the backend.
 * Endpoint: POST /api/shop/orders
 */
export async function placeOrderBackend(orderPayload) {
  const res = await apiClient("/api/shop/orders", {
    method: "POST",
    body: JSON.stringify(orderPayload),
  });
  return res.data;
}
/**
 * Verifies a Razorpay payment on the backend.
 * Endpoint: POST /api/shop/orders/verify-payment
 */
export async function verifyPaymentBackend(verificationPayload) {
  const res = await apiClient("/api/shop/orders/verify-payment", {
    method: "POST",
    body: JSON.stringify(verificationPayload),
  });
  return res.data;
}

/**
 * Retrieves order details by order ID.
 * Endpoint: GET /api/shop/orders/:id
 */
export async function getOrderDetail(orderId) {
  const res = await apiClient(`/api/shop/orders/${orderId}`, { method: "GET" });
  return res.data?.order || res.data;
}

/* =======================================================================
 * 10. NEWSLETTER APIs
 * ======================================================================= */

/**
 * Checks newsletter subscription status for an email.
 * Endpoint: POST /api/shop/customer/subscription-status
 */
export async function getSubscriptionStatus(email) {
  const res = await apiClient("/api/shop/customer/subscription-status", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return res.data?.subscribed ?? false;
}

/**
 * Updates newsletter subscription status.
 * Endpoint: PATCH /api/shop/customer/subscription-status
 */
export async function updateSubscriptionStatus(email, subscribed = true) {
  const res = await apiClient("/api/shop/customer/subscription-status", {
    method: "PATCH",
    body: JSON.stringify({ email, subscribed }),
  });
  return res.data;
}

/* =======================================================================
 * 11. REVIEWS APIs
 * ======================================================================= */

/**
 * Retrieves product reviews list by product ID.
 * Endpoint: GET /api/shop/reviews/product/:productId
 */
export async function getProductReviews(productId) {
  if (!productId) return [];
  const res = await apiClient(`/api/shop/reviews/product/${productId}`, { method: "GET", next: { revalidate: 60 } });
  return res.data?.reviews || res.data?.data || res.data || [];
}

/**
 * Retrieves product reviews summary by product ID.
 * Endpoint: GET /api/shop/reviews/product/:productId/summary
 */
export async function getProductReviewsSummary(productId) {
  if (!productId) return null;
  const res = await apiClient(`/api/shop/reviews/product/${productId}/summary`, { method: "GET", next: { revalidate: 60 } });
  return res.data?.summary || res.data?.data || res.data || null;
}

/**
 * Submits a new product review.
 * Endpoint: POST /api/shop/reviews
 */
export async function submitProductReview(reviewData) {
  const res = await apiClient("/api/shop/reviews", {
    method: "POST",
    body: JSON.stringify(reviewData),
  });
  return res.data;
}

const shopServices = {
  getShopInfo,
  getMarketingScripts,
  getProducts,
  getProductByIdentifier,
  getCollections,
  getCollectionByIdentifier,
  getCmsBlogs,
  getCmsBlogPosts,
  getCmsPostDetail,
  placeOrderBackend,
  getOrderDetail,
  verifyPaymentBackend,
  getSubscriptionStatus,
  updateSubscriptionStatus,
  getProductReviews,
  getProductReviewsSummary,
  submitProductReview,
};

export default shopServices;
