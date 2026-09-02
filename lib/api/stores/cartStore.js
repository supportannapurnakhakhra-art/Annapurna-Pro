import { apiClient } from "../client";
import safeStorage from "../../safeStorage";
import { mapCartToShopifyShape } from "../mappers";

/**
 * Helper to update local cart storage tokens safely.
 */
function persistCartToken(token, isGuest = true) {
  if (!token) return;
  safeStorage.setItem("cart_token", token);
  safeStorage.setItem("cartId", token);
  if (isGuest) {
    safeStorage.setItem("guestCartId", token);
  }
}

/**
 * Retrieves the current cart contents.
 * Endpoint: GET /api/shop/cart
 */
export async function getCart() {
  const res = await apiClient("/api/shop/cart", { method: "GET" });
  if (res.ok && res.data) {
    const data = res.data;
    const cartObj = data.cart || (data.data?.items ? data.data : data);
    
    // Save returned cart token if present
    if (cartObj?.cart_token || cartObj?.id) {
      const isGuest = !safeStorage.getItem("userToken");
      persistCartToken(cartObj.cart_token || cartObj.id, isGuest);
    }

    return mapCartToShopifyShape(cartObj);
  }
  return null;
}

/**
 * Adds an item to the cart.
 * Endpoint: POST /api/shop/cart/add
 * Payload typically: { variant_id, quantity }
 */
export async function addToCart({ variant_id, product_id, quantity = 1 }) {
  // Strip potential gid:// prefix and synthetic -default suffix if backend expects pure numeric ID
  const rawVariantId = String(variant_id).split("/").pop().replace("-default", "");
  // Derive product_id if omitted by call sites, as custom backend cart addition expects both fields
  const rawProductId = product_id ? String(product_id).split("/").pop() : rawVariantId;

  const res = await apiClient("/api/shop/cart/add", {
    method: "POST",
    body: JSON.stringify({
      product_id: Number(rawProductId) || rawProductId,
      variant_id: Number(rawVariantId) || rawVariantId,
      quantity: Number(quantity) || 1,
    }),
  });

  if (res.ok && res.data) {
    const data = res.data;
    const cartObj = data.cart || data;

    if (cartObj?.cart_token || cartObj?.id) {
      const isGuest = !safeStorage.getItem("userToken");
      persistCartToken(cartObj.cart_token || cartObj.id, isGuest);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cart-updated"));
      window.dispatchEvent(new Event("open-cart-drawer"));
    }

    return mapCartToShopifyShape(cartObj);
  }

  throw new Error(res.data?.message || "Failed to add item to cart");
}

/**
 * Updates the quantity of a cart line item.
 * Endpoint: POST /api/shop/cart/update
 * Payload: { line_id, quantity }
 */
export async function updateCartItem({ line_id, quantity }) {
  const res = await apiClient("/api/shop/cart/update", {
    method: "POST",
    body: JSON.stringify({ line_id, quantity }),
  });

  if (res.ok && res.data) {
    const data = res.data;
    const cartObj = data.cart || data;

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cart-updated"));
    }

    return mapCartToShopifyShape(cartObj);
  }

  throw new Error(res.data?.message || "Failed to update cart item");
}

/**
 * Removes an item from the cart.
 * Endpoint: POST /api/shop/cart/remove
 * Payload: { line_id }
 */
export async function removeCartItem(line_id) {
  const res = await apiClient("/api/shop/cart/remove", {
    method: "POST",
    body: JSON.stringify({ line_id }),
  });

  if (res.ok && res.data) {
    const data = res.data;
    const cartObj = data.cart || data;

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cart-updated"));
    }

    return mapCartToShopifyShape(cartObj);
  }

  throw new Error(res.data?.message || "Failed to remove item from cart");
}

/**
 * Clears the entire cart.
 * Endpoint: POST /api/shop/cart/clear
 */
export async function clearCart() {
  const res = await apiClient("/api/shop/cart/clear", {
    method: "POST",
  });

  if (res.ok) {
    safeStorage.removeItem("cart_token");
    safeStorage.removeItem("cartId");
    safeStorage.removeItem("guestCartId");

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cart-updated"));
    }

    return true;
  }

  return false;
}

const cartStore = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};

export default cartStore;
