// context/CartContext.jsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCheckoutSDK, buildOrderSuccessUrl } from "@/lib/checkout";

const CartContext = createContext();

function mapSdkItemsToShopifyCart(items) {
  const edges = (items || []).map((item) => ({
    node: {
      id: item.variantId || item.id,
      quantity: item.quantity,
      merchandise: {
        id: item.variantId || item.id,
        title: item.variantTitle || item.title,
        price: {
          amount: String(item.price || 0),
          currencyCode: "INR",
        },
        product: {
          id: item.productId,
          title: item.title,
          featuredImage: item.imageUrl ? { url: item.imageUrl } : null,
        },
      },
    },
  }));

  const totalQuantity = (items || []).reduce((sum, item) => sum + item.quantity, 0);

  return {
    lines: { edges },
    totalQuantity,
  };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ lines: { edges: [] }, totalQuantity: 0 });
  const [loading, setLoading] = useState(true);

  const refreshCartFromSDK = useCallback(() => {
    const sdk = getCheckoutSDK();
    if (!sdk) return;

    try {
      const items = sdk.getCartItems() || [];
      setCart(mapSdkItemsToShopifyCart(items));
    } catch (err) {
      console.error("Error syncing cart from SDK:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let intervalId;
    const initSdkSync = () => {
      const sdk = getCheckoutSDK();
      if (!sdk) return;

      refreshCartFromSDK();

      if (typeof sdk.on === "function") {
        sdk.on("cart_updated", refreshCartFromSDK);
      }

      clearInterval(intervalId);
    };

    intervalId = setInterval(initSdkSync, 100);
    const timeoutId = setTimeout(() => clearInterval(intervalId), 10000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      const sdk = getCheckoutSDK();
      if (sdk && typeof sdk.off === "function") {
        sdk.off("cart_updated", refreshCartFromSDK);
      }
    };
  }, [refreshCartFromSDK]);

  const addToCart = useCallback(async (item, quantity = 1) => {
    const sdk = getCheckoutSDK();
    if (!sdk) {
      console.error("Checkout SDK not loaded yet");
      return null;
    }

    try {
      return await sdk.addToCart(
        {
          id: String(item.variantId || item.id),
          productId: String(item.productId || item.id),
          variantId: String(item.variantId || item.id),
          title: item.title,
          variantTitle: item.variantTitle || item.title || "Standard",
          imageUrl: item.imageUrl || item.image || "",
          sku: item.sku || "",
          price: Number(item.price || 0),
          weight: item.weight || 0,
          weightUnit: item.weightUnit || "g",
        },
        quantity,
      );
    } catch (err) {
      console.error("Failed to add to cart:", err);
      return null;
    }
  }, []);

  const updateQuantity = useCallback((variantId, quantity) => {
    const sdk = getCheckoutSDK();
    if (!sdk) return;
    sdk.updateQuantity(variantId, quantity);
  }, []);

  const removeFromCart = useCallback((variantId) => {
    const sdk = getCheckoutSDK();
    if (!sdk) return;
    sdk.removeFromCart(variantId);
  }, []);

  const clearCart = useCallback(() => {
    const sdk = getCheckoutSDK();
    if (!sdk) return;
    sdk.clearCart();
  }, []);

  const openCart = useCallback(
    async (sessionToken) => {
      const sdk = getCheckoutSDK();
      if (!sdk) {
        console.error("Checkout SDK not loaded yet");
        return;
      }

      const callbacks = {
        onSuccess: (data) => {
          clearCart();
          const statusUrl =
            data?.statusUrl ||
            (data?.sessionId ? buildOrderSuccessUrl(data.sessionId) : null);
          if (statusUrl) {
            window.location.href = statusUrl;
          }
        },
        onFailure: (err) => {
          console.error("Checkout failed:", err);
        },
      };

      try {
        const token =
          sessionToken || (await sdk.syncCartWithBackend())?.token;
        if (!token) {
          console.error("No checkout session token available");
          return;
        }
        sdk.openCart(token, callbacks);
      } catch (err) {
        console.error("Failed to open cart:", err);
      }
    },
    [clearCart],
  );

  const openCheckout = useCallback(
    async (sessionToken) => {
      const sdk = getCheckoutSDK();
      if (!sdk) {
        console.error("Checkout SDK not loaded yet");
        return;
      }

      const callbacks = {
        onSuccess: (data) => {
          clearCart();
          const statusUrl =
            data?.statusUrl ||
            (data?.sessionId ? buildOrderSuccessUrl(data.sessionId) : null);
          if (statusUrl) {
            window.location.href = statusUrl;
          }
        },
        onFailure: (err) => {
          console.error("Checkout failed:", err);
        },
      };

      try {
        const token =
          sessionToken || (await sdk.syncCartWithBackend())?.token;
        if (!token) {
          console.error("No checkout session token available");
          return;
        }
        if (typeof sdk.openCheckout === "function") {
          sdk.openCheckout(token, callbacks);
        } else {
          sdk.openCart(token, callbacks);
        }
      } catch (err) {
        console.error("Failed to open checkout:", err);
      }
    },
    [clearCart],
  );

  const addToCartAndOpen = useCallback(
    async (item, quantity = 1) => {
      const session = await addToCart(item, quantity);
      await openCart(session?.token);
    },
    [addToCart, openCart],
  );

  const buyNow = useCallback(
    async (item, quantity = 1) => {
      const session = await addToCart(item, quantity);
      await openCheckout(session?.token);
    },
    [addToCart, openCheckout],
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        addToCartAndOpen,
        buyNow,
        openCheckout,
        updateQuantity,
        removeFromCart,
        clearCart,
        openCart,
        refreshCartFromSDK,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
