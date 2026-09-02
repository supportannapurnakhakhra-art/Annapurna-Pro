// lib/checkout.js — SSR-safe Mega Checkout SDK config

export const CHECKOUT_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_CHECKOUT_PUBLIC_KEY || "mk_public_5354d3f5";

export const CHECKOUT_SECRET_KEY =
  process.env.NEXT_PUBLIC_CHECKOUT_SECRET_KEY ||
  process.env.CHECKOUT_SECRET_KEY ||
  "mk_secret_c45fd0fa";

export const CHECKOUT_STORE_ID =
  process.env.NEXT_PUBLIC_CHECKOUT_STORE_ID ||
  "0fe9c0cb-3981-435d-90da-56e5e31a3112";

export const CHECKOUT_API_BASE =
  process.env.NEXT_PUBLIC_CHECKOUT_API_BASE ||
  "https://api-checkout.bhagvatprasadam.com/api";

export const CHECKOUT_UI_URL =
  process.env.NEXT_PUBLIC_CHECKOUT_UI_URL ||
  "https://checkout.bhagvatprasadam.com";

export const CHECKOUT_PLATFORM_COOKIE_DOMAIN =
  process.env.NEXT_PUBLIC_CHECKOUT_PLATFORM_COOKIE_DOMAIN || "";

export function buildOrderSuccessUrl(sessionToken) {
  if (!sessionToken) return "/order-history";
  const params = new URLSearchParams({
    sessionId: sessionToken,
    publicKey: CHECKOUT_PUBLIC_KEY,
  });
  return `${CHECKOUT_UI_URL}/order-status?${params.toString()}`;
}

function sanitizeCheckoutCookie(storeId) {
  if (typeof document === "undefined") return;
  const cookieName = `checkout_cart_${storeId || "default"}`;
  try {
    const cookieString = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${cookieName}=`));
    if (!cookieString) return;

    const cookieValue = decodeURIComponent(cookieString.split("=")[1]);
    const parsed = JSON.parse(cookieValue);
    if (
      parsed.sessionToken === "undefined" ||
      parsed.sessionToken === "null" ||
      parsed.sessionToken === ""
    ) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  } catch (err) {
    console.error("Error sanitizing checkout cookie:", err);
  }
}

let checkoutSDKInstance = null;

/**
 * Lazy, SSR-safe getter for the Checkout SDK singleton.
 */
export function getCheckoutSDK() {
  if (typeof window === "undefined") return null;

  if (!window.CheckoutSDK) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "CheckoutSDK script not loaded. Add checkout.js to your root layout.",
      );
    }
    return null;
  }

  if (!checkoutSDKInstance) {
    sanitizeCheckoutCookie(CHECKOUT_STORE_ID);
    checkoutSDKInstance = window.CheckoutSDK.init({
      publicKey: CHECKOUT_PUBLIC_KEY,
      secretKey: CHECKOUT_SECRET_KEY,
      storeId: CHECKOUT_STORE_ID,
      baseUrl: CHECKOUT_API_BASE,
      checkoutUrl: CHECKOUT_UI_URL,
      platformCookieDomain: CHECKOUT_PLATFORM_COOKIE_DOMAIN || undefined,
    });
  }

  return checkoutSDKInstance;
}
