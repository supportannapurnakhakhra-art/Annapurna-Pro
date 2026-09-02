import { apiClient } from "../client";
import safeStorage from "../../safeStorage";
import { mapProductToShopifyShape } from "../mappers";
import { getProducts } from "../services";

/**
 * Checks if the user is authenticated before attempting wishlist operations.
 */
function isAuthenticated() {
  return !!safeStorage.getItem("userToken");
}

/**
 * Retrieves the customer's wishlist items.
 * Endpoint: GET /api/shop/wishlist
 */
export async function getWishlist() {
  if (!isAuthenticated()) return [];

  const res = await apiClient("/api/shop/wishlist", { method: "GET" });
  if (res.ok && res.data) {
    const items = res.data.data || res.data.wishlist || res.data.items || res.data || [];
    if (Array.isArray(items)) {
      const needsHydration = items.some(
        (item) => !item.product && (item.product_id || item.productId)
      );

      if (needsHydration) {
        try {
          const allProducts = await getProducts();
          return items
            .map((item) => {
              const targetId = String(item.product_id).split("/").pop();
              const found = allProducts.find((p) => String(p.id).split("/").pop() === targetId);
              if (found) {
                return { ...found, wishlist_id: item.id };
              }
              return mapProductToShopifyShape(item);
            })
            .filter(Boolean);
        } catch (err) {
          console.error("Wishlist product hydration failed:", err);
        }
      }

      return items.map((item) => mapProductToShopifyShape(item.product || item)).filter(Boolean);
    }
  }
  return [];
}

/**
 * Toggles a product in the wishlist.
 * Endpoint: POST /api/shop/wishlist/toggle
 * Payload: { product_id }
 */
export async function toggleWishlistBackend(product_id) {
  if (!isAuthenticated()) return null;

  const rawProductId = String(product_id).split("/").pop();
  const res = await apiClient("/api/shop/wishlist/toggle", {
    method: "POST",
    body: JSON.stringify({ product_id: rawProductId }),
  });

  return res.data;
}

/**
 * Removes a product from the wishlist explicitly.
 * Endpoint: DELETE /api/shop/wishlist/:id
 */
export async function removeFromWishlistBackend(product_id) {
  if (!isAuthenticated()) return false;

  const rawProductId = String(product_id).split("/").pop();
  const res = await apiClient(`/api/shop/wishlist/${rawProductId}`, {
    method: "DELETE",
  });

  return res.ok;
}

const wishlistStore = {
  getWishlist,
  toggleWishlistBackend,
  removeFromWishlistBackend,
};

export default wishlistStore;
