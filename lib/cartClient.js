/**
 * addToCartClient - Centralized add-to-cart handler
 * Handles variant cleanup, API call, storage, tracking, and event dispatch
 */
export default async function addToCartClient({
  variantId,
  quantity = 1,
  customerShopifyId = null,
  product = null,
}) {
  if (!variantId) {
    throw new Error("No variant ID provided");
  }

  const cleanVariantId = variantId.includes("gid://")
    ? variantId.split("/").pop()
    : variantId;

  try {
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variantId: cleanVariantId,
        quantity,
        customerShopifyId: customerShopifyId || null,
        cartId:
          localStorage.getItem("cartId") ||
          localStorage.getItem("guestCartId") ||
          null,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || "Add to cart failed");
    }

    // Store cart ID
    if (data.cart?.id) {
      localStorage.setItem("guestCartId", data.cart.id);
      localStorage.setItem("cartId", data.cart.id);
    }

    // TRACKING CODE START
    if (product) {
      // Find the price from various possible structures
      const priceVal = Number(
        product.selectedVariant?.price?.amount || 
        product.price?.amount || 
        product.priceRange?.minVariantPrice?.amount || 
        0
      );
      const currencyVal = 
        product.selectedVariant?.price?.currencyCode || 
        product.price?.currencyCode || 
        product.priceRange?.minVariantPrice?.currencyCode || 
        "INR";

      if (typeof window.gtag !== "undefined") {
        window.gtag("event", "add_to_cart", {
          currency: currencyVal,
          value: priceVal * quantity,
          items: [
            {
              item_id: cleanVariantId,
              item_name: product.title,
              price: priceVal,
              quantity,
            },
          ],
        });
      }

      if (typeof window.fbq !== "undefined") {
        window.fbq("track", "AddToCart", {
          content_ids: [cleanVariantId],
          content_name: product.title,
          currency: currencyVal,
          value: priceVal * quantity,
          content_type: "product",
        });
      }
    }
    // TRACKING CODE END

    // Dispatch events
    window.dispatchEvent(new Event("cart-updated"));
    window.dispatchEvent(new Event("open-cart-drawer"));

    return data;
  } catch (err) {
    throw err;
  }
}
