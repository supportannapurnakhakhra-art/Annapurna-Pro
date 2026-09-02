import PaymentSession from "@/lib/models/PaymentSession";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import {
  createCustomerFromOrder,
  getCustomerByEmail,
  getCustomerByPhone,
} from "@/lib/shopify";
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const SHOPIFY_STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

const ALLOWED_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "proton.me",
];
function generateOrderToken() {
  return crypto.randomBytes(32).toString("hex");
}

function ensureGid(id, type) {
  if (!id) return null;
  const idStr = String(id);
  if (idStr.startsWith("gid://")) return idStr;
  return `gid://shopify/${type}/${idStr}`;
}

async function getCustomer(customerId) {
  console.log("FETCHING CUSTOMER WITH ID:", customerId);
  const res = await fetch(
    `https://${SHOPIFY_STORE}/admin/api/2025-01/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: `
          query ($id: ID!) {
            customer(id: $id) {
              id
              email
            }
          }
        `,
        variables: { id: ensureGid(customerId, "Customer") },
      }),
    },
  );
  const data = await res.json();
  if (data.errors) {
    console.error("GraphQL Errors in getCustomer:", data.errors);
    return null;
  }
  return data.data?.customer;
}

function isValidEmailDomain(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
}

async function updateCustomerEmail(customerId, email) {
  try {
    const res = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2025-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: `
          mutation customerUpdate($input: CustomerInput!) {
            customerUpdate(input: $input) {
              customer { id email }
              userErrors { message }
            }
          }
        `,
          variables: {
            input: { id: ensureGid(customerId, "Customer"), email },
          },
        }),
      },
    );
    const data = await res.json();
    if (data.errors) {
      console.error("GraphQL Errors in updateCustomerEmail:", data.errors);
      return { userErrors: [{ message: data.errors[0]?.message || "GraphQL error" }] };
    }

    if (!data || !data.data) {
      console.error("Invalid response from Shopify:", data);
      return { userErrors: [{ message: "Failed to update email" }] };
    }

    return (
      data.data.customerUpdate || {
        userErrors: [{ message: "No response from update" }],
      }
    );
  } catch (error) {
    console.error("Error updating customer email:", error);
    return { userErrors: [{ message: error.message }] };
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    await connectDB();
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      shippingAddress,
      lineItems,
      customerId,
      paymentMethod, // "COD" or "test-cod"
      discountAmount = 0,
    } = body;

    /* ---------------- VALIDATION ---------------- */

    const validMethods = ["COD", "cod", "test-cod"];
    if (!validMethods.includes(paymentMethod)) {
      return Response.json(
        { success: false, message: "Invalid payment method" },
        { status: 400 },
      );
    }

    let customer = null;
    let finalCustomerId = customerId;

    if (customerId) {
      customer = await getCustomer(customerId);
      if (!customer) {
        return Response.json(
          { success: false, message: "Customer not found" },
          { status: 404 },
        );
      }
    } else if (email || phoneNumber) {
      // Auto-create customer if not logged in
      console.log("🔄 AUTO-CREATE CUSTOMER FLOW STARTED");
      console.log("   Email:", email);
      console.log("   Phone:", phoneNumber);

      try {
        // Try to find by email first
        if (email) {
          console.log("📧 Checking if customer exists by email...");
          const existingCustomer = await getCustomerByEmail(email);
          if (existingCustomer) {
            console.log(
              "✅ EXISTING CUSTOMER FOUND BY EMAIL:",
              existingCustomer.id,
            );
            finalCustomerId = existingCustomer.id;
            customer = existingCustomer;
          }
        }

        // If not found by email, try by phone
        if (!finalCustomerId && phoneNumber) {
          console.log("📱 Checking if customer exists by phone...");
          const existingCustomer = await getCustomerByPhone(phoneNumber);
          if (existingCustomer) {
            console.log(
              "✅ EXISTING CUSTOMER FOUND BY PHONE:",
              existingCustomer.id,
            );
            finalCustomerId = existingCustomer.id;
            customer = existingCustomer;
          }
        }

        // If still not found, create new one
        if (!finalCustomerId) {
          console.log("📧 Customer doesn't exist, creating new one...");
          const newCustomer = await createCustomerFromOrder({
            firstName: firstName || shippingAddress?.firstName || "",
            lastName: lastName || shippingAddress?.lastName || "",
            email,
            phoneNumber,
          });

          if (newCustomer) {
            console.log("✅ NEW CUSTOMER CREATED:", newCustomer.id);
            finalCustomerId = newCustomer.id;
            customer = newCustomer;
          }
        }
      } catch (error) {
        console.error("⚠️  Error during customer creation:", error.message);
      }
    }

    console.log("📋 FINAL STATE BEFORE ORDER CREATION:");
    console.log("   finalCustomerId:", finalCustomerId);
    console.log("   email:", email);
    console.log("   hasCustomer:", !!customer);

    if (email && !isValidEmailDomain(email)) {
      return Response.json(
        {
          success: false,
          message: "Please use Gmail / Yahoo / Outlook / iCloud / Proton email",
        },
        { status: 400 },
      );
    }

    if (customer && email && customer.email !== email) {
      try {
        const update = await updateCustomerEmail(customerId, email);
        if (update && update.userErrors && update.userErrors.length) {
          console.warn("⚠️ Non-critical: Could not update customer email (likely already taken):", update.userErrors[0].message);
          // We don't block the order for this. The email will still be on the Draft Order.
        } else {
          console.log("✅ Customer email updated successfully");
        }
      } catch (err) {
        console.warn("⚠️ Non-critical: Error updating customer email:", err.message);
      }
    }

    if (!SHOPIFY_STORE || !SHOPIFY_ACCESS_TOKEN) {
      throw new Error("Shopify credentials missing");
    }

    /* ---------------- CALCULATE SHIPPING ---------------- */

    const gqlLineItems = lineItems.map((item) => ({
      variantId: item.variant_id.startsWith("gid://")
        ? item.variant_id
        : `gid://shopify/ProductVariant/${item.variant_id}`,
      quantity: Number(item.quantity),
      requiresShipping: true,
    }));

    const calculateRes = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2025-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation Calculate($input: DraftOrderInput!) {
              draftOrderCalculate(input: $input) {
                calculatedDraftOrder {
                  totalPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                  availableShippingRates {
                    title
                    handle
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
                userErrors {
                  message
                }
              }
            }
          `,
          variables: {
            input: {
              ...(email ? { email } : {}),
              lineItems: gqlLineItems,
              shippingAddress: {
                firstName: shippingAddress.firstName,
                lastName: shippingAddress.lastName,
                address1: shippingAddress.address1,
                city: shippingAddress.city,
                provinceCode: shippingAddress.provinceCode,
                countryCode: "IN",
                zip: shippingAddress.zip,
              },
              ...(discountAmount > 0 ? {
                appliedDiscount: {
                  description: "Prepaid Discount (10%)",
                  valueType: "FIXED_AMOUNT",
                  value: discountAmount,
                  title: "Discount"
                }
              } : {}),
            },
          },
        }),
      },
    );

    const calcData = await calculateRes.json();
    const calcResult = calcData.data?.draftOrderCalculate?.calculatedDraftOrder;
    if (!calcResult?.availableShippingRates?.length) {
      return Response.json(
        { success: false, message: "No shipping rates available" },
        { status: 400 },
      );
    }

    // ------------------------------------------------
    // STEP 2: SELECT SHIPPING (CHEAPEST / FREE >= 599)
    // ------------------------------------------------
    const subtotal = lineItems.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);

    // Sort rates by price ascending
    const sortedRates = [...calcResult.availableShippingRates].sort(
      (a, b) => Number(a.price.amount) - Number(b.price.amount)
    );

    let selectedRate = sortedRates.find(r => Number(r.price.amount) > 0) || sortedRates[0];

    // Enforce business rule: Subtotal >= 599 gets Free Shipping
    if (subtotal >= 599) {
      console.log(`✅ Subtotal ₹${subtotal} >= 599. Enforcing Free Shipping (COD).`);
      selectedRate = {
        title: "Free Shipping (Order over ₹599)",
        price: { amount: "0.00" },
        handle: null // Omit handle for custom free shipping to stick in Shopify
      };
    }

    // ------------------------------------------------
    // STEP 3: CREATE DRAFT ORDER (REST)
    // ------------------------------------------------
    const draftOrderPayload = {
      draft_order: {
        // If we have a finalCustomerId, we prefer linking by ID
        // Only include top-level email if we are 100% sure it belongs to this customer or if it's a guest
        ...(email ? { email } : {}),
        line_items: lineItems.map((item) => ({
          variant_id: Number(
            item.variant_id.replace("gid://shopify/ProductVariant/", ""),
          ),
          quantity: item.quantity,
        })),
        shipping_address: shippingAddress,
        shipping_line: {
          title: selectedRate.title,
          price: selectedRate.price.amount,
          handle: selectedRate.handle,
        },
        ...(discountAmount > 0 ? {
          applied_discount: {
            description: "Prepaid Discount (Applied for Test)",
            value_type: "fixed_amount",
            value: discountAmount.toString(),
            title: "Discount"
          }
        } : {}),
      },
    };

    if (finalCustomerId) {
      // Extract numeric ID if it's a Shopify GID
      let customerId = finalCustomerId;
      if (
        typeof finalCustomerId === "string" &&
        finalCustomerId.includes("gid://")
      ) {
        customerId = finalCustomerId.split("/").pop();
      }
      draftOrderPayload.draft_order.customer = { id: Number(customerId) };
      console.log(
        "   Setting customer ID:",
        draftOrderPayload.draft_order.customer,
      );
    }

    console.log("📦 DRAFT ORDER PAYLOAD:");
    console.log("   customer ID:", draftOrderPayload.draft_order.customer);
    console.log("   email:", draftOrderPayload.draft_order.email);
    console.log("   Full payload:", JSON.stringify(draftOrderPayload, null, 2));

    const draftOrderRes = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-10/draft_orders.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftOrderPayload),
      },
    );

    const draftOrderData = await draftOrderRes.json();
    if (!draftOrderRes.ok) {
      throw new Error("Draft order creation failed");
    }

    const draftOrderId = draftOrderData.draft_order.id;

    /* ---------------- COMPLETE DRAFT ORDER ---------------- */

    const completeRes = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2025-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation Complete($id: ID!) {
              draftOrderComplete(id: $id, paymentPending: true) {
                draftOrder {
                  order {
                    id
                    name
                  }
                }
                userErrors {
                  message
                }
              }
            }
          `,
          variables: {
            id: `gid://shopify/DraftOrder/${draftOrderId}`,
          },
        }),
      },
    );

    const orderData = await completeRes.json();
    const order = orderData.data?.draftOrderComplete?.draftOrder?.order;

    if (!order?.id) {
      throw new Error("Order completion failed");
    }

    /* ---------------- SAVE SESSION ---------------- */
    const calculatedTotalPrice =
      calcData.data?.draftOrderCalculate?.calculatedDraftOrder?.totalPriceSet
        ?.shopMoney?.amount;

    const orderToken = generateOrderToken();

    await PaymentSession.create({
      draftOrderId,
      shopifyOrderId: order.id,
      shopifyOrderName: order.name,
      amount: Number(calculatedTotalPrice),
      orderToken,
      isCod: true,
      status: "COD",
    });

    /* ---------------- RESPONSE ---------------- */

    return Response.json(
      {
        success: true,
        redirectUrl: `/thank-you?token=${orderToken}`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("COD CHECKOUT ERROR:", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
