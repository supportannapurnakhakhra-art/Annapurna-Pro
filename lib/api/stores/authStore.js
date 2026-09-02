import { apiClient } from "../client";
import safeStorage from "../../safeStorage";

function normalizeAddress(a) {
  if (!a) return a;
  return {
    ...a,
    address1: a.address1 || a.address_line1 || a.line1 || "",
    address2: a.address2 || a.address_line2 || a.line2 || "",
    province: a.province || a.state || "",
    state: a.state || a.province || "",
    zip: a.zip || a.pincode || a.postalCode || a.postal_code || "",
    pincode: a.pincode || a.zip || a.postalCode || a.postal_code || "",
    firstName: a.firstName || a.first_name || "",
    lastName: a.lastName || a.last_name || "",
    isDefault: a.isDefault || a.is_default || a.default || false,
    default: a.isDefault || a.is_default || a.default || false,
  };
}

// Helper function to stringify and sync customer addresses into embedded checkout storage
function syncCheckoutAddressesToStorage(addresses) {
  if (!addresses) return;
  let arr = [];
  if (Array.isArray(addresses)) {
    arr = addresses;
  } else if (addresses.edges && Array.isArray(addresses.edges)) {
    arr = addresses.edges.map(e => e.node);
  } else if (addresses.nodes && Array.isArray(addresses.nodes)) {
    arr = addresses.nodes;
  }
  
  const normalizedArr = arr.map(normalizeAddress);
  const jsonStr = JSON.stringify(normalizedArr);
  safeStorage.setItem("main-ui.checkout:addresses", jsonStr);
  safeStorage.setItem("userAddresses", jsonStr);

  if (typeof window !== "undefined" && window.CheckoutCurrenciesEmbed && typeof window.CheckoutCurrenciesEmbed.setAddresses === "function") {
    window.CheckoutCurrenciesEmbed.setAddresses(normalizedArr);
  }
}

/**
 * Sends an OTP to the given phone number.
 * Endpoint: POST /api/shop/auth/send-otp
 */
export async function sendOtp(phone) {
  const cleanPhone = String(phone).trim().replace(/\D/g, "").slice(-10);
  const res = await apiClient("/api/shop/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ phone: cleanPhone }),
  });
  return res.data || (res.ok ? { success: true } : { error: "Failed to send OTP" });
}

/**
 * Verifies the OTP and logs the user in. Automatically saves tokens and profile.
 * Endpoint: POST /api/shop/auth/verify-otp
 */
export async function verifyOtp({ phone, otp, cart_token }) {
  const cleanPhone = String(phone).trim().replace(/\D/g, "").slice(-10);
  const cleanOtp = String(otp).trim();
  const currentCartToken = cart_token || safeStorage.getItem("cart_token") || safeStorage.getItem("cartId") || (typeof window !== "undefined" ? localStorage.getItem("cart_token") || localStorage.getItem("cartId") : null);
  
  const payload = { phone: cleanPhone, otp: cleanOtp };
  if (currentCartToken) {
    payload.cart_token = currentCartToken;
  }

  const res = await apiClient("/api/shop/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (res.ok && res.data) {
    const data = res.data;
    const token = data.token || data.jwt || data.customer_jwt || data.userToken || data.accessToken || data.access_token || data.data?.token || data.data?.jwt;
    if (token) {
      safeStorage.setItem("userToken", token);
      if (typeof window !== "undefined") {
        localStorage.setItem("userToken", token);
      }
    }
    
    const customer = data.customer || data.user || data.data?.customer || data.data?.user || data.data;
    if (customer && (customer.id || customer._id)) {
      const cid = String(customer.id || customer._id);
      safeStorage.setItem("customerShopifyId", cid);
      if (typeof window !== "undefined") {
        localStorage.setItem("customerShopifyId", cid);
      }
    }

    if (customer?.addresses) {
      syncCheckoutAddressesToStorage(customer.addresses);
    }

    // Preserve cart token merging if backend returns updated token
    if (data.cart_token || data.cartId) {
      const cToken = data.cart_token || data.cartId;
      safeStorage.setItem("cart_token", cToken);
      safeStorage.setItem("cartId", cToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("cart_token", cToken);
        localStorage.setItem("cartId", cToken);
      }
    }

    // Trigger update events
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("customer-updated"));
      window.dispatchEvent(new Event("cart-updated"));
    }
  }

  return res.data || (res.ok ? { success: true } : { error: "Failed to verify OTP" });
}

/**
 * Retrieves the currently logged-in customer profile.
 * Endpoint: GET /api/shop/customer/me
 */
export async function getCustomerProfile() {
  const token = safeStorage.getItem("userToken") || (typeof window !== "undefined" ? localStorage.getItem("userToken") : null);
  if (!token) {
    return null;
  }

  const res = await apiClient("/api/shop/customer/me", { method: "GET" });
  if (res.ok && res.data) {
    const rawCustomer = res.data.data?.customer || res.data.data?.user || res.data.customer || res.data.user || res.data.data || res.data;
    if (rawCustomer && (rawCustomer.id || rawCustomer._id || rawCustomer.phone || rawCustomer.email)) {
      // Map addresses and snake_case fields to standard UI shape
      const c = { ...rawCustomer };
      c.id = c.id || c._id;
      c.firstName = c.firstName || c.first_name || "";
      c.lastName = c.lastName || c.last_name || "";
      c.email = c.email || "";
      c.phone = c.phone || "";

      if (c.id) {
        safeStorage.setItem("customerShopifyId", String(c.id));
        if (typeof window !== "undefined") {
          localStorage.setItem("customerShopifyId", String(c.id));
        }
      }

      if (c.addresses) {
        if (Array.isArray(c.addresses)) {
          c.addresses = c.addresses.map(normalizeAddress);
        } else if (c.addresses.edges) {
          c.addresses.edges = c.addresses.edges.map(e => ({ ...e, node: normalizeAddress(e.node) }));
        }
        syncCheckoutAddressesToStorage(c.addresses);
      }

      if (c.addresses && !c.addresses.edges) {
        c.addresses = {
          edges: Array.isArray(c.addresses) ? c.addresses.map(a => ({ node: a })) : [],
        };
      }
      return c;
    }
  }
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      logoutCustomer();
    }
    return null;
  }
  return null;
}

/**
 * Updates the customer profile information.
 * Endpoint: PUT /api/shop/customer/profile
 */
export async function updateCustomerProfile(profileData) {
  const payload = {
    first_name: profileData.first_name || profileData.firstName || "",
    last_name: profileData.last_name || profileData.lastName || "",
    email: profileData.email || "",
  };
  if (profileData.phone) {
    payload.phone = profileData.phone;
  }

  const res = await apiClient("/api/shop/customer/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("customer-updated"));
    }
    return res.data || { success: true };
  }
  return res.data || { success: false, error: "Failed to update profile" };
}

/**
 * Retrieves all addresses for the logged-in customer.
 * Endpoint: GET /api/shop/customer/addresses
 */
export async function getCustomerAddresses() {
  const res = await apiClient("/api/shop/customer/addresses", { method: "GET" });
  if (res.ok && res.data) {
    const arr = res.data.data || res.data.addresses || res.data;
    const resolvedArr = (Array.isArray(arr) ? arr : []).map(normalizeAddress);
    syncCheckoutAddressesToStorage(resolvedArr);
    return resolvedArr;
  }
  return [];
}

/**
 * Creates a new address for the customer.
 * Endpoint: POST /api/shop/customer/addresses
 */
export async function createCustomerAddress(addressData) {
  const res = await apiClient("/api/shop/customer/addresses", {
    method: "POST",
    body: JSON.stringify(addressData),
  });
  getCustomerAddresses().catch(() => {});
  return res.data;
}

/**
 * Updates an existing address.
 * Endpoint: PUT /api/shop/customer/addresses/:id
 */
export async function updateCustomerAddress(id, addressData) {
  const res = await apiClient(`/api/shop/customer/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(addressData),
  });
  getCustomerAddresses().catch(() => {});
  return res.data;
}

/**
 * Deletes an address.
 * Endpoint: DELETE /api/shop/customer/addresses/:id
 */
export async function deleteCustomerAddress(id) {
  const res = await apiClient(`/api/shop/customer/addresses/${id}`, {
    method: "DELETE",
  });
  getCustomerAddresses().catch(() => {});
  return res.data;
}

/**
 * Sets an address as the default address.
 * Endpoint: PATCH /api/shop/customer/addresses/:id/default
 */
export async function setAddressAsDefault(id) {
  const res = await apiClient(`/api/shop/customer/addresses/${id}/default`, {
    method: "PATCH",
  });
  getCustomerAddresses().catch(() => {});
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("customer-updated"));
  }
  return res.data;
}

/**
 * Logs out the customer locally.
 */
export function logoutCustomer() {
  safeStorage.removeItem("userToken");
  safeStorage.removeItem("customerShopifyId");
  safeStorage.removeItem("main-ui.checkout:addresses");
  safeStorage.removeItem("userAddresses");
  if (typeof window !== "undefined") {
    if (window.CheckoutCurrenciesEmbed && typeof window.CheckoutCurrenciesEmbed.setAddresses === "function") {
      window.CheckoutCurrenciesEmbed.setAddresses([]);
    }
    window.dispatchEvent(new Event("customer-logout"));
    window.dispatchEvent(new Event("customer-updated"));
  }
}

const authStore = {
  sendOtp,
  verifyOtp,
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setAddressAsDefault,
  logoutCustomer,
};

export default authStore;
