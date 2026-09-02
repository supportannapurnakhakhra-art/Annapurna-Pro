import PaymentSession from "@/lib/models/PaymentSession";
import { connectDB } from "@/lib/db";
import { createRazorpayOrder } from "@/lib/razorpay";
import {
    createCustomerFromOrder,
    getCustomerByEmail,
    getCustomerByPhone,
} from "@/lib/shopify";
import crypto from "crypto";

const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const SHOPIFY_STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

const BOOKING_AMOUNT = 50; // Fixed booking amount for Partial COD

function generateOrderToken() {
    return crypto.randomBytes(32).toString("hex");
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
            totalAmount,
            discountAmount = 0,
        } = body;

        let customer = null;
        let finalCustomerId = customerId;

        // 1. Handle Customer
        if (customerId) {
            // Find customer in Shopify logic here or skip if already have ID
        } else if (email || phoneNumber) {
            try {
                if (email) {
                    customer = await getCustomerByEmail(email);
                    if (customer) finalCustomerId = customer.id;
                }
                if (!finalCustomerId && phoneNumber) {
                    customer = await getCustomerByPhone(phoneNumber);
                    if (customer) finalCustomerId = customer.id;
                }
                if (!finalCustomerId) {
                    customer = await createCustomerFromOrder({
                        firstName,
                        lastName,
                        email,
                        phoneNumber,
                    });
                    if (customer) finalCustomerId = customer.id;
                }
            } catch (error) {
                console.error("Customer handling error:", error.message);
            }
        }

        // 2. Calculate Shipping Rates (to get the handle)
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
                  availableShippingRates {
                    title
                    handle
                    price { amount }
                  }
                }
              }
            }
          `,
                    variables: {
                        input: {
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
                                    description: "Discount",
                                    valueType: "FIXED_AMOUNT",
                                    value: discountAmount,
                                    title: "Discount"
                                }
                            } : {}),
                        },
                    },
                }),
            }
        );

        const calcData = await calculateRes.json();
        const shippingRates = calcData.data?.draftOrderCalculate?.calculatedDraftOrder?.availableShippingRates;
        if (!shippingRates?.length) {
            throw new Error("No shipping rates found");
        }

        // ------------------------------------------------
        // SELECT SHIPPING (CHEAPEST / FREE >= 500)
        // ------------------------------------------------
        const subtotal = lineItems.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);

        // Sort rates by price ascending
        const sortedRates = [...shippingRates].sort(
            (a, b) => Number(a.price.amount) - Number(b.price.amount)
        );

        let selectedRate = sortedRates.find(r => Number(r.price.amount) > 0) || sortedRates[0];

        // Enforce business rule: Subtotal >= 599 gets Free Shipping
        if (subtotal >= 599) {
            console.log(`✅ Subtotal ₹${subtotal} >= 599. Enforcing Free Shipping (Partial COD).`);
            selectedRate = {
                title: "Free Shipping (Order over ₹599)",
                price: { amount: "0.00" },
                handle: null // Omit handle for custom free shipping to stick in Shopify
            };
        }

        // 3. Create Draft Order
        const draftOrderPayload = {
            draft_order: {
                ...(email ? { email } : {}),
                line_items: [
                    ...lineItems.map((item) => ({
                        variant_id: Number(item.variant_id.replace("gid://shopify/ProductVariant/", "")),
                        quantity: item.quantity,
                    })),
                    {
                        title: "COD Convenience Fee",
                        price: "100.00",
                        quantity: 1,
                    },
                ],
                shipping_address: shippingAddress,
                shipping_line: {
                    title: selectedRate.title,
                    price: selectedRate.price.amount,
                    handle: selectedRate.handle,
                },
                tags: "PARTIAL_COD_PENDING",
                note: `Partial COD Order. Booking amount ₹${BOOKING_AMOUNT} to be paid.`,
                use_customer_default_address: false,
                ...(discountAmount > 0 ? {
                    applied_discount: {
                        description: "Discount",
                        value_type: "fixed_amount",
                        value: discountAmount.toString(),
                        title: "Discount"
                    }
                } : {}),
            },
        };

        if (finalCustomerId) {
            const id = finalCustomerId.includes("gid://") ? finalCustomerId.split("/").pop() : finalCustomerId;
            draftOrderPayload.draft_order.customer = { id: Number(id) };
        } else if (email) {
            draftOrderPayload.draft_order.email = email;
        }

        const draftOrderRes = await fetch(
            `https://${SHOPIFY_STORE}/admin/api/2024-10/draft_orders.json`,
            {
                method: "POST",
                headers: {
                    "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(draftOrderPayload),
            }
        );

        const draftOrderData = await draftOrderRes.json();
        if (!draftOrderRes.ok) {
            throw new Error("Draft order creation failed: " + JSON.stringify(draftOrderData));
        }
        const draftOrderId = draftOrderData.draft_order.id;
        console.log("Draft Order ID:", draftOrderId);
        console.log("Draft Order Data:", draftOrderData);

        // 4. Create Razorpay Order
        const razorpayOrder = await createRazorpayOrder({
            amount: BOOKING_AMOUNT * 100, // in paise
            receipt: draftOrderId.toString(),
        });

        // 5. Save Session
        const orderToken = generateOrderToken();
        await PaymentSession.create({
            draftOrderId: draftOrderId.toString(),
            razorpayOrderId: razorpayOrder.id,
            amount: totalAmount,
            bookingAmount: BOOKING_AMOUNT,
            status: "PENDING",
            isCod: true,
            orderToken,
        });

        return Response.json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            token: orderToken,
        });

    } catch (error) {
        console.error("PARTIAL COD ERROR:", error);
        return Response.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
