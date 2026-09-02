import safeStorage from "../safeStorage";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const SHOPFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPFRONT_TOKEN;

/**
 * Centralized API Fetch utility for interacting with the custom E-commerce backend.
 * Handles automatic header injection, cross-environment token reads, and error handling.
 */
export async function apiClient(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  console.log('apiClient called with URL:', url, 'and options:', options);
  const headers = new Headers(options.headers || {});

  // 1. Always inject X-Shopfront-Token on all /api/shop/* requests
  if (!headers.has("X-Shopfront-Token") && !headers.has("x-shopfront-token")) {
    headers.set("X-Shopfront-Token", SHOPFRONT_TOKEN);
  }

  // Ensure JSON content type by default for requests with bodies or general API hits
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  // 2. Resolve authentication states on client side if not explicitly provided
  if (typeof window !== "undefined") {
    // Check logged-in customer state
    const customerJwt = safeStorage.getItem("userToken") || localStorage.getItem("userToken");
    if (customerJwt && !headers.has("Authorization") && !headers.has("authorization")) {
      headers.set("Authorization", `Bearer ${customerJwt}`);
    }

    // Check guest cart token state
    const cartToken = safeStorage.getItem("cart_token") || safeStorage.getItem("cartId") || localStorage.getItem("cart_token") || localStorage.getItem("cartId");
    if (cartToken && !headers.has("x-cart-token")) {
      headers.set("x-cart-token", cartToken);
    }
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Gracefully handle 401/403 errors
    if (response.status === 401 || response.status === 403) {
      console.warn(`apiClient: Unauthorized access to ${endpoint} (Status: ${response.status})`);
      if (typeof window !== "undefined") {
        // Dispatch custom event to notify stores/components to logout or reset auth state
        window.dispatchEvent(new CustomEvent("api-unauthorized", { detail: { status: response.status, endpoint } }));
      }
    }

    // Attempt to parse JSON response safely
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return {
        status: response.status,
        ok: response.ok,
        data,
        headers: response.headers,
      };
    }

    const textData = await response.text();
    return {
      status: response.status,
      ok: response.ok,
      data: textData,
      headers: response.headers,
    };
  } catch (error) {
    console.error(`apiClient Fetch Error for ${endpoint}:`, error);
    throw error;
  }
}
